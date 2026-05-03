"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutForm({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }
  return <form onSubmit={onSubmit}>{children}</form>;
}
