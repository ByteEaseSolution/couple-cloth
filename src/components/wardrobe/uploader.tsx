"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Loader2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Stage = "idle" | "uploading" | "analyzing" | "done" | "error";

export function Uploader({ type }: { type: "top" | "bottom" }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || !files[0]) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      setStage("error");
      return;
    }
    setError(null);
    setPreview(URL.createObjectURL(file));
    setStage("uploading");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setStage("error");
      setError("Not signed in");
      return;
    }

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${type}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("garments")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upErr) {
      setStage("error");
      setError(upErr.message);
      return;
    }
    const { data: pub } = supabase.storage.from("garments").getPublicUrl(path);

    const { data: row, error: insErr } = await supabase
      .from("garments")
      .insert({ owner_id: user.id, type, image_path: path, image_url: pub.publicUrl })
      .select("*")
      .single();
    if (insErr || !row) {
      setStage("error");
      setError(insErr?.message || "insert failed");
      return;
    }

    setStage("analyzing");
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ garmentId: row.id }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setStage("error");
      setError(j.error || "Analysis failed");
      return;
    }
    setStage("done");
    router.refresh();
    setTimeout(() => {
      setStage("idle");
      setPreview(null);
    }, 1200);
  }

  const busy = stage === "uploading" || stage === "analyzing";

  return (
    <div>
      <div
        onClick={() => !busy && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        className={"relative flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition " +
          (dragOver ? "border-brand-400 bg-brand-50" : "border-black/15 bg-black/5") +
          (busy ? " pointer-events-none" : "")}
      >
        {preview ? (
          <>
            <Image src={preview} alt="preview" fill className="object-cover" />
            {busy && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 text-white">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-sm">{stage === "uploading" ? "Uploading…" : "Analyzing with AI…"}</p>
              </div>
            )}
            {stage === "done" && (
              <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/80 text-white">
                <p className="font-medium">Added ✓</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-black/50">
            <div className="rounded-full bg-white p-3 shadow-sm"><ImagePlus className="h-6 w-6" /></div>
            <p className="text-sm font-medium">Drop a photo or tap to upload</p>
            <p className="text-xs">JPG, PNG, HEIC</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="mt-3 flex items-center justify-between">
        <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()} disabled={busy}>
          <Upload className="h-4 w-4" /> Choose file
        </Button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
