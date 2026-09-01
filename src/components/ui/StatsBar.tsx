import { TRUST_STATS } from "@/lib/site-highlights";
import { cn } from "@/lib/utils";

interface StatItem {
  value: string;
  label: string;
}

interface StatsBarProps {
  stats?: StatItem[];
  className?: string;
}

export function StatsBar({ stats = [...TRUST_STATS], className }: StatsBarProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 sm:grid-cols-4",
        className
      )}
      data-reveal-stagger
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="card-vibrant group relative overflow-hidden p-5 text-center"
          data-reveal-item
        >
          <div
            className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-cyan/10 blur-2xl transition-all group-hover:bg-cyan/20"
            aria-hidden
          />
          <p className="font-display text-3xl font-bold gradient-heading sm:text-4xl">{stat.value}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-chrome-mid">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
