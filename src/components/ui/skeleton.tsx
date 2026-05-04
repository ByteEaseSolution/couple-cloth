import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-black/[0.06]", className)} />;
}

export function ScreenSpinner({ label }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-500 to-fuchsia-500 opacity-30 blur-md" />
        <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-brand-500 border-r-fuchsia-500" />
      </div>
      {label && <p className="text-sm text-black/60">{label}</p>}
    </div>
  );
}
