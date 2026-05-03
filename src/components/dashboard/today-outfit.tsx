"use client";
import Image from "next/image";
import { Card, CardBody } from "@/components/ui/card";
import type { Garment, Outfit } from "@/types/db";
import { CheckCircle2, Clock } from "lucide-react";

export function TodayOutfit({
  outfit, garments, viewerIsA, partnerName, myName,
}: {
  outfit: Outfit;
  garments: Record<string, Garment>;
  viewerIsA: boolean;
  partnerName: string;
  myName: string;
}) {
  const myTop = viewerIsA ? outfit.partner_a_top : outfit.partner_b_top;
  const myBottom = viewerIsA ? outfit.partner_a_bottom : outfit.partner_b_bottom;
  const theirTop = viewerIsA ? outfit.partner_b_top : outfit.partner_a_top;
  const theirBottom = viewerIsA ? outfit.partner_b_bottom : outfit.partner_a_bottom;

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {outfit.confirmed ? "Today's plan" : "Latest suggestion"}
          </h2>
          <div className={"inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium " +
            (outfit.confirmed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
            {outfit.confirmed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
            {outfit.confirmed ? "Confirmed" : "Not confirmed"}
          </div>
        </div>

        {outfit.locked_color_name && (
          <p className="mt-1 text-sm text-black/60">
            Locked top color: <span className="font-medium">{outfit.locked_color_name}</span>
            {outfit.locked_color_hex && (
              <span className="ml-2 inline-block h-3 w-3 align-middle rounded-full ring-1 ring-black/10" style={{ background: outfit.locked_color_hex }} />
            )}
          </p>
        )}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Look label={myName} top={myTop ? garments[myTop] : undefined} bottom={myBottom ? garments[myBottom] : undefined} />
          <Look label={partnerName} top={theirTop ? garments[theirTop] : undefined} bottom={theirBottom ? garments[theirBottom] : undefined} />
        </div>

        {outfit.rationale && (
          <p className="mt-4 rounded-xl bg-brand-50 p-3 text-sm text-brand-900">{outfit.rationale}</p>
        )}
      </CardBody>
    </Card>
  );
}

function Look({ label, top, bottom }: { label: string; top?: Garment; bottom?: Garment }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4">
      <p className="mb-3 text-sm font-medium text-black/70">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        <Item garment={top} caption="Top" />
        <Item garment={bottom} caption="Bottom" />
      </div>
    </div>
  );
}

function Item({ garment, caption }: { garment?: Garment; caption: string }) {
  return (
    <div>
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-black/5">
        {garment?.image_url ? (
          <Image src={garment.image_url} alt={garment.description || caption} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-black/40">No {caption}</div>
        )}
      </div>
      {garment && (
        <p className="mt-2 truncate text-xs text-black/60">
          <span className="inline-block h-2 w-2 align-middle rounded-full ring-1 ring-black/10" style={{ background: garment.color_hex || "#ccc" }} />
          <span className="ml-1.5">{garment.color_name}</span>
        </p>
      )}
    </div>
  );
}
