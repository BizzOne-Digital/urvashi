import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function EmptyState({ title, description, actionLabel, actionHref, className }: EmptyStateProps) {
  return (
    <div className={cn("rounded-sm border border-dashed border-chrome-light bg-chrome-light/10 px-6 py-12 text-center", className)}>
      <p className="font-display text-xl font-semibold text-ink-black">{title}</p>
      {description && <p className="mt-2 text-sm text-carbon">{description}</p>}
      {actionLabel && actionHref && (
        <Link href={actionHref} className={cn(buttonVariants("primary"), "mt-6 inline-flex")}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
