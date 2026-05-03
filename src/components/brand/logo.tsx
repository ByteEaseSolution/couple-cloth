import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 select-none", className)}>
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 rounded-full bg-brand-500" />
        <div className="absolute inset-0 translate-x-2 rounded-full bg-fuchsia-500 mix-blend-multiply" />
      </div>
      <span className="text-xl font-semibold tracking-tight">Duet</span>
    </div>
  );
}
