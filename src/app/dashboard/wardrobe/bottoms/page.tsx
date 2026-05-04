import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WardrobeSection } from "@/components/wardrobe/section";
import type { Garment } from "@/types/db";

export default async function BottomsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: items } = await supabase
    .from("garments")
    .select("*")
    .eq("owner_id", user.id)
    .eq("type", "bottom")
    .order("created_at", { ascending: false });

  return <WardrobeSection type="bottom" items={(items ?? []) as Garment[]} />;
}
