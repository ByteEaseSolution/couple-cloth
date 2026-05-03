import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeGarment } from "@/lib/azure-openai";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const garmentId: string | undefined = body.garmentId;
  if (!garmentId) return NextResponse.json({ error: "garmentId required" }, { status: 400 });

  const { data: g, error } = await supabase
    .from("garments")
    .select("*")
    .eq("id", garmentId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (error || !g) return NextResponse.json({ error: "not found" }, { status: 404 });

  try {
    const analysis = await analyzeGarment(g.image_url, g.type);
    const { error: updErr } = await supabase
      .from("garments")
      .update({ ...analysis, analyzed: true })
      .eq("id", garmentId)
      .eq("owner_id", user.id);
    if (updErr) throw updErr;
    return NextResponse.json({ ok: true, analysis });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "analysis failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
