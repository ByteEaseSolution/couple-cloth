import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardBody } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 pt-2">
      <div>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-2 h-9 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}><CardBody><Skeleton className="h-20 w-full" /></CardBody></Card>
        ))}
      </div>
      <Card><CardBody><Skeleton className="h-72 w-full" /></CardBody></Card>
    </div>
  );
}
