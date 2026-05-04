import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WardrobeSection } from "@/components/wardrobe/section";
import type { Garment } from "@/types/db";

export default async function TopsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: items } = await supabase
    .from("garments")
    .select("*")
    .eq("owner_id", user.id)
    .eq("type", "top")
    .order("created_at", { ascending: false });

  return <WardrobeSection type="top" items={(items ?? []) as Garment[]} />;
}
