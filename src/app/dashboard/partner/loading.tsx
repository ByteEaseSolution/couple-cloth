import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardBody } from "@/components/ui/card";

export default function PartnerLoading() {
  return (
    <div className="space-y-6 pt-2">
      <div>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-2 h-9 w-56" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}><CardBody><Skeleton className="h-16 w-full" /></CardBody></Card>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] w-full" />)}
      </div>
    </div>
  );
}
