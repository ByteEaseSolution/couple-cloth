import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardBody } from "@/components/ui/card";

export default function WardrobeLoading() {
  return (
    <div className="space-y-6 pt-2">
      <div>
        <Skeleton className="h-9 w-56" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}><CardBody><Skeleton className="h-56 w-full" /></CardBody></Card>
        ))}
      </div>
    </div>
  );
}
