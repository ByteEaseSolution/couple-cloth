"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import { Logo } from "@/components/brand/logo";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    router.push(next);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center"><Logo /></Link>
        <Card>
          <CardBody>
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p className="mt-1 text-sm text-black/60">Log in to plan today&apos;s look.</p>
            <form onSubmit={onSubmit} className="mt-6 space-y-3">
              <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" loading={loading} className="w-full" size="lg">Log in</Button>
            </form>
            <p className="mt-6 text-center text-sm text-black/60">
              No account? <Link href="/signup" className="font-medium text-brand-700">Sign up</Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
