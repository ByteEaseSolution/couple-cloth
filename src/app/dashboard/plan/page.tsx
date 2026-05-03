import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCoupleContext } from "@/lib/couple";
import { Randomizer } from "@/components/plan/randomizer";

export default async function PlanPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { couple, partner, me, partnerId } = await getCoupleContext(user.id);
  const isUserA = couple.partner_a === user.id;

  return (
    <div className="space-y-6 pt-2">
      <div>
        <p className="text-sm text-black/50">Date night</p>
        <h1 className="text-3xl font-semibold tracking-tight">Style us</h1>
      </div>

      {!partnerId ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Invite your partner first — the randomizer pairs both of your closets.
        </p>
      ) : (
        <Randomizer
          coupleId={couple.id}
          isUserA={isUserA}
          myName={me?.display_name || "You"}
          partnerName={partner?.display_name || "Partner"}
        />
      )}
    </div>
  );
}
