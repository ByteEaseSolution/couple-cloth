import { redirect } from "next/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { Uploader } from "@/components/wardrobe/uploader";
import { GarmentGrid } from "@/components/wardrobe/garment-grid";
import type { Garment } from "@/types/db";

export default async function WardrobePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: items } = await supabase
    .from("garments")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const garments = (items ?? []) as Garment[];
  const tops = garments.filter((g) => g.type === "top");
  const bottoms = garments.filter((g) => g.type === "bottom");

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Your wardrobe</h1>
        <p className="text-sm text-black/60">Upload tops and bottoms — we&apos;ll auto-tag color, season, and pairings.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardBody>
          <h2 className="mb-3 text-lg font-semibold">Add a top</h2>
          <Uploader type="top" />
        </CardBody></Card>
        <Card><CardBody>
          <h2 className="mb-3 text-lg font-semibold">Add a bottom</h2>
          <Uploader type="bottom" />
        </CardBody></Card>
      </div>

      <GarmentGrid title="Tops" items={tops} />
      <GarmentGrid title="Bottoms" items={bottoms} />
    </div>
  );
}
