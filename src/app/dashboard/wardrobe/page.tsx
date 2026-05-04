import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, Shirt, Plus } from "lucide-react";
import type { Garment } from "@/types/db";

export default async function WardrobeHub() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: items } = await supabase
    .from("garments")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const all = (items ?? []) as Garment[];
  const tops = all.filter((g) => g.type === "top");
  const bottoms = all.filter((g) => g.type === "bottom");

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Your wardrobe</h1>
        <p className="text-sm text-black/60">Add your clothes — we&apos;ll auto-tag colors and pairings.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <CategoryTile
          href="/dashboard/wardrobe/tops"
          label="Tops"
          count={tops.length}
          previews={tops.slice(0, 4)}
        />
        <CategoryTile
          href="/dashboard/wardrobe/bottoms"
          label="Bottoms"
          count={bottoms.length}
          previews={bottoms.slice(0, 4)}
        />
      </div>
    </div>
  );
}

function CategoryTile({
  href, label, count, previews,
}: { href: string; label: string; count: number; previews: Garment[] }) {
  return (
    <Link href={href} className="group block">
      <Card className="overflow-hidden transition group-hover:shadow-lg group-active:scale-[0.99]">
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white">
                <Shirt className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold leading-tight">{label}</h2>
                <p className="text-sm text-black/50">{count} {count === 1 ? "item" : "items"}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-black/40 transition group-hover:translate-x-0.5 group-hover:text-black/70" />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {previews.length === 0 ? (
              <div className="col-span-4 flex h-28 items-center justify-center rounded-xl border border-dashed border-black/15 bg-black/[0.02] text-sm text-black/50">
                <Plus className="mr-1.5 h-4 w-4" /> Add your first {label.toLowerCase().slice(0, -1)}
              </div>
            ) : (
              <>
                {previews.map((g) => (
                  <div key={g.id} className="relative aspect-square overflow-hidden rounded-lg bg-black/5">
                    <Image src={g.image_url} alt="" fill className="object-cover" sizes="80px" />
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 4 - previews.length) }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-lg border border-dashed border-black/10 bg-black/[0.02]" />
                ))}
              </>
            )}
          </div>

          <Button variant="secondary" size="sm" className="w-full">
            <Plus className="h-4 w-4" /> Add a {label.toLowerCase().slice(0, -1)}
          </Button>
        </CardBody>
      </Card>
    </Link>
  );
}
