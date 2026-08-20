import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type VibrantVariant = "light" | "dark" | "gradient" | "mesh";

interface VibrantSectionProps extends HTMLAttributes<HTMLElement> {
  variant?: VibrantVariant;
  reveal?: boolean;
  revealDelay?: number;
}

const variantClasses: Record<VibrantVariant, string> = {
  light: "page-section-light",
  dark: "page-section-dark",
  gradient: "page-section-gradient",
  mesh: "page-section-mesh",
};

export function VibrantSection({
  variant = "light",
  reveal = true,
  revealDelay,
  className,
  children,
  ...props
}: VibrantSectionProps) {
  return (
    <section
      className={cn("page-section overflow-hidden", variantClasses[variant], className)}
      data-reveal={reveal ? "" : undefined}
      data-reveal-delay={revealDelay}
      {...props}
    >
      <div className="cmyk-line pointer-events-none absolute inset-x-0 top-0 z-10" aria-hidden />
      {children}
    </section>
  );
}
