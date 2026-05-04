import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardBody } from "@/components/ui/card";

export default function PlanLoading() {
  return (
    <div className="space-y-6 pt-2">
      <div>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-2 h-9 w-40" />
      </div>
      <Card className="bg-gradient-to-br from-brand-500 via-fuchsia-500 to-violet-500"><CardBody>
        <div className="flex flex-col items-center gap-3 py-8">
          <Skeleton className="h-14 w-14 rounded-full bg-white/30" />
          <Skeleton className="h-6 w-56 bg-white/30" />
          <Skeleton className="h-12 w-44 rounded-xl bg-white/40" />
        </div>
      </CardBody></Card>
    </div>
  );
}
