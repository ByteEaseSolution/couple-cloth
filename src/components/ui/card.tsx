import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-black/5 bg-white/80 backdrop-blur shadow-sm",
        className,
      )}
      {...rest}
    />
  );
}
export function CardBody({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...rest} />;
}
export function CardHeader({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pt-6 pb-0", className)} {...rest} />;
}
