"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Wand2, RefreshCw, Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { Garment } from "@/types/db";

type Result = {
  partner_a_top: string;
  partner_a_bottom: string;
  partner_b_top: string;
  partner_b_bottom: string;
  locked_color_hex: string | null;
  locked_color_name: string | null;
  locked_color_family: string | null;
  rationale: string;
  me_top: string;
  me_bottom: string;
  partner_top: string;
  partner_bottom: string;
};

export function Randomizer({
  coupleId, isUserA, myName, partnerName,
}: { coupleId: string; isUserA: boolean; myName: string; partnerName: string }) {
  const router = useRouter();
  const [stage, setStage] = useState<"idle" | "rolling" | "ready" | "saving" | "saved" | "error">("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [garments, setGarments] = useState<Record<string, Garment>>({});
  const [error, setError] = useState<string | null>(null);

  async function loadGarments(ids: string[]) {
    const supabase = createClient();
    const { data } = await supabase.from("garments").select("*").in("id", ids);
    const m: Record<string, Garment> = {};
    (data || []).forEach((g) => { m[g.id] = g as Garment; });
    setGarments((p) => ({ ...p, ...m }));
  }

  async function roll(mode: "full" | "partner_only") {
    setStage("rolling");
    setError(null);
    const res = await fetch("/api/randomize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode, previous: result }),
    });
    const json = await res.json();
    if (!res.ok) {
      setStage("error");
      setError(json.error || "Failed to randomize");
      return;
    }
    setResult(json);
    await loadGarments([json.partner_a_top, json.partner_a_bottom, json.partner_b_top, json.partner_b_bottom]);
    setStage("ready");
  }

  async function confirm() {
    if (!result) return;
    setStage("saving");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("outfits").insert({
      couple_id: coupleId,
      created_by: user.id,
      partner_a_top: result.partner_a_top,
      partner_a_bottom: result.partner_a_bottom,
      partner_b_top: result.partner_b_top,
      partner_b_bottom: result.partner_b_bottom,
      locked_color_hex: result.locked_color_hex,
      locked_color_name: result.locked_color_name,
      rationale: result.rationale,
      confirmed: true,
      confirmed_at: new Date().toISOString(),
    });
    if (error) {
      setStage("error");
      setError(error.message);
      return;
    }
    setStage("saved");
    setTimeout(() => router.push("/dashboard"), 800);
  }

  const meTop = result ? garments[result.me_top] : undefined;
  const meBottom = result ? garments[result.me_bottom] : undefined;
  const pTop = result ? garments[result.partner_top] : undefined;
  const pBottom = result ? garments[result.partner_bottom] : undefined;

  if (stage === "idle") {
    return (
      <Card className="overflow-hidden bg-gradient-to-br from-brand-500 via-fuchsia-500 to-violet-500 text-white">
        <CardBody className="text-center">
          <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <Wand2 className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-semibold">Ready when you are</h2>
          <p className="mt-1 text-sm opacity-90">We&apos;ll pick a look for you, then match {partnerName}&apos;s top to yours.</p>
          <Button onClick={() => roll("full")} size="xl" className="mt-6 bg-white text-brand-700 shadow-none hover:bg-white/90">
            <Sparkles className="h-5 w-5" /> Randomize
          </Button>
        </CardBody>
      </Card>
    );
  }

  if (stage === "rolling") {
    return (
      <Card>
        <CardBody className="flex flex-col items-center gap-3 py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="font-medium">Asking the stylist…</p>
          <p className="text-sm text-black/60">Picking colors that match.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {result?.locked_color_name && (
        <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1.5 text-sm shadow-sm">
          <span>Top color locked:</span>
          <span className="inline-block h-3 w-3 rounded-full ring-1 ring-black/10" style={{ background: result.locked_color_hex || "#ccc" }} />
          <span className="font-medium">{result.locked_color_name}</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Side label={myName} top={meTop} bottom={meBottom} />
        <Side label={partnerName} top={pTop} bottom={pBottom} />
      </div>

      {result?.rationale && (
        <Card><CardBody className="text-sm text-black/70">{result.rationale}</CardBody></Card>
      )}

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => roll("partner_only")} disabled={stage === "saving"}>
          <RefreshCw className="h-4 w-4" /> Re-roll {partnerName}&apos;s look
        </Button>
        <Button variant="outline" onClick={() => roll("full")} disabled={stage === "saving"}>
          <RefreshCw className="h-4 w-4" /> Re-roll both
        </Button>
        <Button onClick={confirm} loading={stage === "saving"} disabled={stage === "saved"}>
          <Check className="h-4 w-4" /> {stage === "saved" ? "Saved!" : "Confirm look"}
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function Side({ label, top, bottom }: { label: string; top?: Garment; bottom?: Garment }) {
  return (
    <Card>
      <CardBody>
        <p className="mb-3 text-sm font-medium text-black/70">{label}</p>
        <div className="grid grid-cols-2 gap-3">
          <Slot g={top} caption="Top" />
          <Slot g={bottom} caption="Bottom" />
        </div>
      </CardBody>
    </Card>
  );
}

function Slot({ g, caption }: { g?: Garment; caption: string }) {
  return (
    <div>
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-black/5">
        {g?.image_url ? (
          <Image src={g.image_url} alt={g.description || ""} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-black/40">{caption}</div>
        )}
      </div>
      {g && (
        <p className="mt-2 truncate text-xs text-black/60">
          <span className="inline-block h-2 w-2 align-middle rounded-full ring-1 ring-black/10" style={{ background: g.color_hex || "#ccc" }} />
          <span className="ml-1.5">{g.color_name}</span>
        </p>
      )}
    </div>
  );
}
