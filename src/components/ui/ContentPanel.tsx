import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ContentPanelProps {
  children: ReactNode;
  className?: string;
}

export function ContentPanel({ children, className }: ContentPanelProps) {
  return (
    <div
      className={cn(
        "card-vibrant relative overflow-hidden p-6 sm:p-8 lg:p-10",
        className
      )}
      data-reveal
    >
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-magenta/10 blur-3xl"
        aria-hidden
      />
      <div className="relative z-10 prose-dpm">{children}</div>
    </div>
  );
}
