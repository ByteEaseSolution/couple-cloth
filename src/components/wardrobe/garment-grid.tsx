"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { Garment } from "@/types/db";
import { createClient } from "@/lib/supabase/client";

export function GarmentGrid({ title, items }: { title: string; items: Garment[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">{title} <span className="text-black/40">· {items.length}</span></h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((g) => <GarmentCard key={g.id} g={g} />)}
      </div>
    </div>
  );
}

function GarmentCard({ g }: { g: Garment }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!confirm("Remove this item?")) return;
    setBusy(true);
    const supabase = createClient();
    await supabase.storage.from("garments").remove([g.image_path]);
    await supabase.from("garments").delete().eq("id", g.id);
    router.refresh();
  }

  return (
    <div className="group overflow-hidden rounded-2xl border border-black/5 bg-white">
      <div className="relative aspect-[3/4]">
        <Image src={g.image_url} alt={g.description || ""} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
        <button onClick={remove} disabled={busy} className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 opacity-0 shadow transition hover:bg-white group-hover:opacity-100">
          <Trash2 className="h-3.5 w-3.5 text-red-600" />
        </button>
        {!g.analyzed && (
          <div className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-1 text-center text-xs text-white">Analyzing…</div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full ring-1 ring-black/10" style={{ background: g.color_hex || "#ccc" }} />
          <p className="truncate text-sm font-medium">{g.color_name || "Untagged"}</p>
        </div>
        <p className="mt-0.5 truncate text-xs text-black/50">{g.color_family || "—"}</p>
        {g.seasons?.length ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {g.seasons.slice(0, 3).map((s) => (
              <span key={s} className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-black/60">{s}</span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
