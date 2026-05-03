"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import { Logo } from "@/components/brand/logo";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });
    setLoading(false);
    if (error) return setError(error.message);
    if (!data.session) {
      setNeedsEmailConfirm(true);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center"><Logo /></Link>
        <Card>
          <CardBody>
            {needsEmailConfirm ? (
              <>
                <h1 className="text-2xl font-semibold">Check your inbox</h1>
                <p className="mt-2 text-sm text-black/60">
                  We sent a confirmation link to <span className="font-medium">{email}</span>. Click it, then come back and log in.
                </p>
                <Link href="/login" className="mt-6 block"><Button className="w-full" size="lg">Go to login</Button></Link>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-semibold">Create your account</h1>
                <p className="mt-1 text-sm text-black/60">Then invite your partner.</p>
                <form onSubmit={onSubmit} className="mt-6 space-y-3">
                  <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
                  <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                  <Input type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button type="submit" loading={loading} className="w-full" size="lg">Create account</Button>
                </form>
                <p className="mt-6 text-center text-sm text-black/60">
                  Have an account? <Link href="/login" className="font-medium text-brand-700">Log in</Link>
                </p>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
