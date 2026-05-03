import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getCoupleContext } from "@/lib/couple";
import { InviteCard } from "@/components/dashboard/invite-card";
import { TodayOutfit } from "@/components/dashboard/today-outfit";
import { Wand2, Shirt } from "lucide-react";
import type { Garment, Outfit } from "@/types/db";

export default async function DashboardHome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { couple, partner, me, partnerId } = await getCoupleContext(user.id);

  const { count: garmentCount } = await supabase
    .from("garments")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user.id);

  const { data: latestOutfit } = await supabase
    .from("outfits")
    .select("*")
    .eq("couple_id", couple.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let garments: Record<string, Garment> = {};
  if (latestOutfit) {
    const ids = [
      latestOutfit.partner_a_top, latestOutfit.partner_a_bottom,
      latestOutfit.partner_b_top, latestOutfit.partner_b_bottom,
    ].filter(Boolean) as string[];
    if (ids.length) {
      const { data } = await supabase.from("garments").select("*").in("id", ids);
      garments = Object.fromEntries((data || []).map((g) => [g.id, g as Garment]));
    }
  }

  const isCoupleA = couple.partner_a === user.id;

  return (
    <div className="space-y-6 pt-2">
      <div>
        <p className="text-sm text-black/50">Hi {me?.display_name || "there"} 👋</p>
        <h1 className="text-3xl font-semibold tracking-tight">Plan today&apos;s look</h1>
      </div>

      {!partnerId && <InviteCard inviteToken={couple.invite_token} />}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-sm text-black/60">Your wardrobe</p>
            <p className="mt-1 text-3xl font-semibold">{garmentCount ?? 0}</p>
            <Link href="/dashboard/wardrobe"><Button size="sm" variant="secondary" className="mt-3"><Shirt className="h-4 w-4" /> Manage</Button></Link>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-black/60">Partner</p>
            <p className="mt-1 text-lg font-medium">
              {partner?.display_name || (partnerId ? "Linked" : "Not linked yet")}
            </p>
            <Link href="/dashboard/partner"><Button size="sm" variant="secondary" className="mt-3">Details</Button></Link>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white">
          <CardBody>
            <p className="text-sm/none opacity-80">Ready?</p>
            <p className="mt-1 text-lg font-medium">Style us a date</p>
            <Link href="/dashboard/plan">
              <Button size="sm" className="mt-3 bg-white text-brand-700 shadow-none hover:bg-white/90"><Wand2 className="h-4 w-4" /> Randomizer</Button>
            </Link>
          </CardBody>
        </Card>
      </div>

      {latestOutfit && (
        <TodayOutfit
          outfit={latestOutfit as Outfit}
          garments={garments}
          viewerIsA={isCoupleA}
          partnerName={partner?.display_name || "Partner"}
          myName={me?.display_name || "You"}
        />
      )}
    </div>
  );
}
