import { redirect } from "next/navigation";
import Image from "next/image";
import { Card, CardBody } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getCoupleContext } from "@/lib/couple";
import { InviteCard } from "@/components/dashboard/invite-card";
import type { Garment } from "@/types/db";

export default async function PartnerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { couple, partner, partnerId } = await getCoupleContext(user.id);

  if (!partnerId) {
    return (
      <div className="space-y-6 pt-2">
        <h1 className="text-3xl font-semibold tracking-tight">Partner</h1>
        <InviteCard inviteToken={couple.invite_token} />
      </div>
    );
  }

  const { data: items } = await supabase
    .from("garments")
    .select("*")
    .eq("owner_id", partnerId)
    .eq("analyzed", true)
    .order("created_at", { ascending: false });

  const garments = (items ?? []) as Garment[];
  const tops = garments.filter((g) => g.type === "top");
  const bottoms = garments.filter((g) => g.type === "bottom");

  return (
    <div className="space-y-6 pt-2">
      <div>
        <p className="text-sm text-black/50">Linked with</p>
        <h1 className="text-3xl font-semibold tracking-tight">{partner?.display_name || "Your partner"}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardBody>
          <p className="text-sm text-black/60">Tops</p>
          <p className="mt-1 text-3xl font-semibold">{tops.length}</p>
        </CardBody></Card>
        <Card><CardBody>
          <p className="text-sm text-black/60">Bottoms</p>
          <p className="mt-1 text-3xl font-semibold">{bottoms.length}</p>
        </CardBody></Card>
      </div>

      <Section title="Their tops" items={tops} />
      <Section title="Their bottoms" items={bottoms} />
    </div>
  );
}

function Section({ title, items }: { title: string; items: Garment[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((g) => (
          <div key={g.id} className="overflow-hidden rounded-2xl border border-black/5 bg-white">
            <div className="relative aspect-[3/4]">
              <Image src={g.image_url} alt={g.description || ""} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-medium">{g.color_name}</p>
              <p className="truncate text-xs text-black/50">{g.color_family}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
