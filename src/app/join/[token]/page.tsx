import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { createClient } from "@/lib/supabase/server";
import { JoinAction } from "@/components/dashboard/join-action";
import { Heart } from "lucide-react";

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Look up couple to show inviter's name (anon select isn't allowed by RLS, so use service role only after sign-in flow).
  // For unauthenticated visitors we just show a generic invite card.
  let inviterName: string | null = null;
  if (user) {
    const { data: c } = await supabase.from("couples").select("partner_a").eq("invite_token", token).maybeSingle();
    if (c) {
      const { data: p } = await supabase.from("profiles").select("display_name").eq("id", c.partner_a).maybeSingle();
      inviterName = p?.display_name ?? null;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center"><Logo /></Link>
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-black/60">You&apos;re invited</p>
                <h1 className="text-xl font-semibold">
                  {inviterName ? `${inviterName} wants to plan outfits with you` : "Plan outfits with your partner"}
                </h1>
              </div>
            </div>

            {user ? (
              <div className="mt-6">
                <JoinAction token={token} />
              </div>
            ) : (
              <div className="mt-6 space-y-2">
                <Link href={`/signup?next=${encodeURIComponent(`/join/${token}`)}`}>
                  <Button className="w-full" size="lg">Create account &amp; join</Button>
                </Link>
                <Link href={`/login?next=${encodeURIComponent(`/join/${token}`)}`}>
                  <Button variant="outline" className="w-full" size="lg">I already have an account</Button>
                </Link>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
