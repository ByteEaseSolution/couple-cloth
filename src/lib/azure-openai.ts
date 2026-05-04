import { AzureOpenAI } from "openai";

let _client: AzureOpenAI | null = null;

// Tolerate users pasting the Foundry "v1" path; AzureOpenAI client wants the bare resource URL.
function bareEndpoint(): string {
  const raw = (process.env.AZURE_OPENAI_ENDPOINT || "").trim();
  return raw.replace(/\/openai\/v1\/?$/, "").replace(/\/+$/, "");
}

export function azure() {
  if (_client) return _client;
  _client = new AzureOpenAI({
    endpoint: bareEndpoint(),
    apiKey: process.env.AZURE_OPENAI_API_KEY!,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-08-01-preview",
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT!,
  });
  return _client;
}

export const DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";

// Fetch an image and inline as a base64 data URL — avoids Azure trying to outbound-fetch
// a URL that may be blocked from its region or rate-limited.
async function toDataUrl(url: string): Promise<string> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`image fetch failed: ${r.status}`);
  const ct = r.headers.get("content-type") || "image/jpeg";
  const buf = Buffer.from(await r.arrayBuffer());
  return `data:${ct};base64,${buf.toString("base64")}`;
}

export type GarmentAnalysis = {
  description: string;
  color_name: string;
  color_hex: string;
  color_family: string;
  seasons: string[];
  formality: string;
  style_tags: string[];
  complements: string[];
};

export async function analyzeGarment(
  imageUrl: string,
  type: "top" | "bottom",
): Promise<GarmentAnalysis> {
  const client = azure();
  const sys = `You are a wardrobe stylist. Analyze a single ${type === "top" ? "TOP (shirt/tee/blouse/jacket)" : "BOTTOM (jeans/pants/skirt/shorts)"} garment image and return strict JSON. Be concise and factual.`;
  const userText = `Return JSON with these exact keys:
- description: 1-2 sentence visual description (fabric, cut, pattern).
- color_name: human friendly primary color name (e.g., "burnt orange").
- color_hex: 6-digit hex of dominant color, like "#a23f1c".
- color_family: a short descriptor of the color group ("warm reds", "cool blues", "earth neutrals", "pastel pinks", etc.).
- seasons: subset of ["spring","summer","autumn","winter"].
- formality: one of "casual","smart casual","business","formal","athletic","loungewear".
- style_tags: 3-6 short style descriptors (e.g., "minimalist", "preppy", "boho").
- complements: 3-6 free-text colors/styles that pair well with this item.
Output JSON only.`;

  const dataUrl = await toDataUrl(imageUrl);

  const r = await client.chat.completions.create({
    model: DEPLOYMENT,
    response_format: { type: "json_object" },
    temperature: 0.2,
    messages: [
      { role: "system", content: sys },
      {
        role: "user",
        content: [
          { type: "text", text: userText },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
  });

  const raw = r.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw) as Partial<GarmentAnalysis>;
  return {
    description: parsed.description || "",
    color_name: parsed.color_name || "unknown",
    color_hex: normalizeHex(parsed.color_hex || "#888888"),
    color_family: parsed.color_family || "neutral",
    seasons: arr(parsed.seasons),
    formality: parsed.formality || "casual",
    style_tags: arr(parsed.style_tags),
    complements: arr(parsed.complements),
  };
}

function arr(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string");
  return [];
}
function normalizeHex(h: string): string {
  const m = h.trim().match(/^#?([0-9a-fA-F]{6})$/);
  return m ? `#${m[1].toLowerCase()}` : "#888888";
}

export type OutfitChoice = {
  top_id: string;
  bottom_id: string;
  rationale: string;
};

const OUTFIT_JSON_SHAPE = `{ "top_id": "<uuid>", "bottom_id": "<uuid>", "rationale": "<one short sentence>" }`;

export async function pickOutfit(opts: {
  tops: Array<Pick<import("@/types/db").Garment, "id" | "color_name" | "color_family" | "seasons" | "formality" | "style_tags" | "description">>;
  bottoms: Array<Pick<import("@/types/db").Garment, "id" | "color_name" | "color_family" | "seasons" | "formality" | "style_tags" | "description" | "complements">>;
  context: string; // e.g., "user's outfit for a spring date night"
  excludeTopIds?: string[];
  excludeBottomIds?: string[];
  lockedTopColorName?: string;
  lockedTopColorFamily?: string;
}): Promise<OutfitChoice> {
  const client = azure();
  const sys = `You are a stylist. Choose the best top and bottom from the candidates. Respond ONLY with JSON of shape ${OUTFIT_JSON_SHAPE}. The chosen ids MUST be from the candidate lists.`;

  const lockNote = opts.lockedTopColorName
    ? `\nIMPORTANT: the chosen top MUST have a color in the family "${opts.lockedTopColorFamily}" close to "${opts.lockedTopColorName}".`
    : "";
  const excludeNote =
    (opts.excludeTopIds?.length ? `\nDo NOT pick these top ids: ${opts.excludeTopIds.join(", ")}.` : "") +
    (opts.excludeBottomIds?.length ? `\nDo NOT pick these bottom ids: ${opts.excludeBottomIds.join(", ")}.` : "");

  const userText = `Context: ${opts.context}.${lockNote}${excludeNote}

Tops:
${JSON.stringify(opts.tops, null, 2)}

Bottoms:
${JSON.stringify(opts.bottoms, null, 2)}

Pick the single best pairing. Prioritize harmony of color/style, season fit, formality match.`;

  const r = await client.chat.completions.create({
    model: DEPLOYMENT,
    response_format: { type: "json_object" },
    temperature: 0.7,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: userText },
    ],
  });

  const raw = r.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw) as Partial<OutfitChoice>;
  if (!parsed.top_id || !parsed.bottom_id) throw new Error("model did not return ids");
  return {
    top_id: parsed.top_id,
    bottom_id: parsed.bottom_id,
    rationale: parsed.rationale || "",
  };
}
