"use client";
import { useState } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Share2, Heart } from "lucide-react";

export function InviteCard({ inviteToken }: { inviteToken: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined"
    ? `${window.location.origin}/join/${inviteToken}`
    : `/join/${inviteToken}`;

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Join me on Duet", text: "Plan our outfits together ✨", url });
      } catch {}
    } else {
      copy();
    }
  }

  return (
    <Card className="border-brand-200 bg-gradient-to-br from-white to-brand-50">
      <CardBody>
        <div className="flex items-start gap-4">
          <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white shadow-md sm:flex pulse-ring">
            <Heart className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Invite your partner</h3>
            <p className="mt-1 text-sm text-black/60">Send them this link — they&apos;ll sign up and link to your closet automatically.</p>
            <div className="mt-3 flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg border border-black/5 bg-white px-3 py-2 text-xs text-black/70">{url}</code>
              <Button size="sm" variant="secondary" onClick={copy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button size="sm" onClick={share}><Share2 className="h-4 w-4" /> Share</Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
