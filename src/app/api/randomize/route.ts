import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCoupleContext } from "@/lib/couple";
import { pickSide, currentSeason } from "@/lib/randomizer";
import type { Garment } from "@/types/db";

type Mode = "full" | "partner_only";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const mode: Mode = body.mode === "partner_only" ? "partner_only" : "full";
  const previous: {
    locked_color_hex?: string | null;
    locked_color_name?: string | null;
    locked_color_family?: string | null;
    me_top?: string | null;
    me_bottom?: string | null;
    partner_top?: string | null;
    partner_bottom?: string | null;
  } | undefined = body.previous;

  const { couple, partnerId } = await getCoupleContext(user.id);
  if (!partnerId) return NextResponse.json({ error: "Link your partner first" }, { status: 400 });

  const [{ data: myItems }, { data: partnerItems }] = await Promise.all([
    supabase.from("garments").select("*").eq("owner_id", user.id).eq("analyzed", true),
    supabase.from("garments").select("*").eq("owner_id", partnerId).eq("analyzed", true),
  ]);

  const my = (myItems ?? []) as Garment[];
  const partner = (partnerItems ?? []) as Garment[];
  const myTops = my.filter((g) => g.type === "top");
  const myBottoms = my.filter((g) => g.type === "bottom");
  const partnerTops = partner.filter((g) => g.type === "top");
  const partnerBottoms = partner.filter((g) => g.type === "bottom");

  if (!myTops.length || !myBottoms.length) return NextResponse.json({ error: "Add at least one top and one bottom of yours." }, { status: 400 });
  if (!partnerTops.length || !partnerBottoms.length) return NextResponse.json({ error: "Your partner needs at least one top and one bottom." }, { status: 400 });

  const season = currentSeason();
  try {
    let mePick: { topId: string; bottomId: string; rationale: string };
    if (mode === "partner_only" && previous?.me_top && previous?.me_bottom) {
      mePick = { topId: previous.me_top, bottomId: previous.me_bottom, rationale: "" };
    } else {
      mePick = await pickSide({
        tops: myTops,
        bottoms: myBottoms,
        context: `Your outfit for a ${season} date with your partner. Pick something flattering and harmonious.`,
      });
    }

    const meTop = myTops.find((g) => g.id === mePick.topId)!;
    const lockHex = meTop.color_hex || undefined;
    const lockName = meTop.color_name || undefined;
    const lockFamily = meTop.color_family || undefined;

    const excludeTops = mode === "partner_only" && previous?.partner_top ? [previous.partner_top] : [];
    const excludeBottoms = mode === "partner_only" && previous?.partner_bottom ? [previous.partner_bottom] : [];

    const partnerPick = await pickSide({
      tops: partnerTops,
      bottoms: partnerBottoms,
      context: `Your partner's outfit for the same ${season} date. Their top MUST match your color "${lockName}" (family: ${lockFamily}). Pick a flattering bottom that pairs.`,
      excludeTopIds: excludeTops,
      excludeBottomIds: excludeBottoms,
      lockedTopHex: lockHex,
      lockedTopName: lockName,
      lockedTopFamily: lockFamily,
    });

    const isUserA = couple.partner_a === user.id;
    const payload = {
      partner_a_top: isUserA ? mePick.topId : partnerPick.topId,
      partner_a_bottom: isUserA ? mePick.bottomId : partnerPick.bottomId,
      partner_b_top: isUserA ? partnerPick.topId : mePick.topId,
      partner_b_bottom: isUserA ? partnerPick.bottomId : mePick.bottomId,
      locked_color_hex: lockHex,
      locked_color_name: lockName,
      rationale: [mePick.rationale, partnerPick.rationale].filter(Boolean).join(" · "),
      me_top: mePick.topId,
      me_bottom: mePick.bottomId,
      partner_top: partnerPick.topId,
      partner_bottom: partnerPick.bottomId,
      locked_color_family: lockFamily,
    };

    return NextResponse.json({ ok: true, ...payload });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "randomize failed" }, { status: 500 });
  }
}
