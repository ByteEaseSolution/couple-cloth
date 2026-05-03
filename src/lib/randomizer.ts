import type { Garment } from "@/types/db";
import { pickOutfit } from "@/lib/azure-openai";
import { colorFamilyMatch } from "@/lib/utils";

export function currentSeason(date = new Date()): "spring" | "summer" | "autumn" | "winter" {
  const m = date.getMonth();
  if (m <= 1 || m === 11) return "winter";
  if (m <= 4) return "spring";
  if (m <= 7) return "summer";
  return "autumn";
}

function pruneForModel(g: Garment) {
  return {
    id: g.id,
    description: g.description,
    color_name: g.color_name,
    color_family: g.color_family,
    seasons: g.seasons,
    formality: g.formality,
    style_tags: g.style_tags,
    complements: g.complements,
  };
}

export type SidePick = {
  topId: string;
  bottomId: string;
  rationale: string;
};

export async function pickSide(opts: {
  tops: Garment[];
  bottoms: Garment[];
  context: string;
  excludeTopIds?: string[];
  excludeBottomIds?: string[];
  lockedTopHex?: string;
  lockedTopName?: string;
  lockedTopFamily?: string;
}): Promise<SidePick> {
  const excludeTops = new Set(opts.excludeTopIds || []);
  const excludeBottoms = new Set(opts.excludeBottomIds || []);

  let topPool = opts.tops.filter((g) => !excludeTops.has(g.id));
  if (opts.lockedTopHex) {
    const tol = [25, 35, 50];
    for (const t of tol) {
      const filtered = topPool.filter((g) => g.color_hex && colorFamilyMatch(opts.lockedTopHex!, g.color_hex, t));
      if (filtered.length) { topPool = filtered; break; }
    }
    // If nothing matched even at tol=50, fall back to all (still excluding) so re-roll can produce something
    if (!topPool.length) topPool = opts.tops.filter((g) => !excludeTops.has(g.id));
  }

  let bottomPool = opts.bottoms.filter((g) => !excludeBottoms.has(g.id));
  if (!topPool.length) topPool = opts.tops; // last-resort fallback if everything was excluded
  if (!bottomPool.length) bottomPool = opts.bottoms;
  if (!topPool.length) throw new Error("no candidate tops");
  if (!bottomPool.length) throw new Error("no candidate bottoms");

  const choice = await pickOutfit({
    tops: topPool.map(pruneForModel),
    bottoms: bottomPool.map(pruneForModel),
    context: opts.context,
    excludeTopIds: opts.excludeTopIds,
    excludeBottomIds: opts.excludeBottomIds,
    lockedTopColorName: opts.lockedTopName,
    lockedTopColorFamily: opts.lockedTopFamily,
  });

  const top = topPool.find((g) => g.id === choice.top_id) || topPool[0];
  const bottom = bottomPool.find((g) => g.id === choice.bottom_id) || bottomPool[0];
  return { topId: top.id, bottomId: bottom.id, rationale: choice.rationale };
}
