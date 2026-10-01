import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: SectionHeaderProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        centered && "text-center",
        className
      )}
      data-reveal
    >
      {eyebrow && (
        <p className="gradient-eyebrow text-xs font-bold uppercase tracking-[0.2em]">{eyebrow}</p>
      )}
      <h2
        className={cn(
          "heading-section mt-2 gradient-heading-light",
          centered && "mx-auto"
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-3 max-w-2xl text-chrome-light leading-relaxed",
            centered && "mx-auto"
          )}
        >
          {subtitle}
        </p>
      )}
      <div
        className={cn(
          "mt-5 h-1 w-24 rounded-full bg-gradient-to-r from-cyan via-magenta to-yellow opacity-80",
          centered && "mx-auto"
        )}
        aria-hidden
      />
    </div>
  );
}
