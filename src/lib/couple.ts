import { createClient } from "@/lib/supabase/server";
import type { Couple, Profile } from "@/types/db";

export async function getOrCreateCouple(userId: string): Promise<Couple> {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("couples")
    .select("*")
    .or(`partner_a.eq.${userId},partner_b.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing) return existing as Couple;

  const { data: created, error } = await supabase
    .from("couples")
    .insert({ partner_a: userId })
    .select("*")
    .single();
  if (error) throw error;
  return created as Couple;
}

export async function getCoupleContext(userId: string) {
  const supabase = await createClient();
  const couple = await getOrCreateCouple(userId);
  const partnerId = couple.partner_a === userId ? couple.partner_b : couple.partner_a;
  let partner: Profile | null = null;
  if (partnerId) {
    const { data } = await supabase.from("profiles").select("*").eq("id", partnerId).maybeSingle();
    partner = (data as Profile) ?? null;
  }
  const { data: me } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return { couple, partner, me: (me as Profile) ?? null, partnerId };
}
