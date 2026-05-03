"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function JoinAction({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function join() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.rpc("join_couple", { p_token: token });
    setLoading(false);
    if (error) return setError(error.message);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" size="lg" loading={loading} onClick={join}>Join the duet</Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
