import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Uploader } from "@/components/wardrobe/uploader";
import { GarmentGrid } from "@/components/wardrobe/garment-grid";
import type { Garment } from "@/types/db";

export function WardrobeSection({
  type, items,
}: { type: "top" | "bottom"; items: Garment[] }) {
  const label = type === "top" ? "Tops" : "Bottoms";
  const single = type === "top" ? "top" : "bottom";

  return (
    <div className="space-y-6 pt-2">
      <Link href="/dashboard/wardrobe" className="inline-flex items-center gap-1 text-sm text-black/60 hover:text-black">
        <ArrowLeft className="h-4 w-4" /> Wardrobe
      </Link>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Your {label.toLowerCase()}</h1>
        <p className="text-sm text-black/60">
          {items.length} {items.length === 1 ? "item" : "items"} · Tap upload to take a photo or pick from your gallery.
        </p>
      </div>

      <Card>
        <CardBody>
          <h2 className="mb-3 text-base font-semibold">Add a {single}</h2>
          <Uploader type={type} />
        </CardBody>
      </Card>

      {items.length > 0 ? (
        <GarmentGrid title={`All ${label.toLowerCase()}`} items={items} />
      ) : (
        <p className="rounded-2xl border border-dashed border-black/10 p-6 text-center text-sm text-black/50">
          No {label.toLowerCase()} yet — upload one above to get started.
        </p>
      )}
    </div>
  );
}
