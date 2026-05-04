import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardBody } from "@/components/ui/card";

export default function BottomsLoading() {
  return (
    <div className="space-y-6 pt-2">
      <Skeleton className="h-4 w-24" />
      <div>
        <Skeleton className="h-9 w-56" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <Card><CardBody><Skeleton className="h-56 w-full" /></CardBody></Card>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] w-full" />
        ))}
      </div>
    </div>
  );
}
