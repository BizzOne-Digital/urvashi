import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface PageCtaBannerProps {
  title: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
}

export function PageCtaBanner({
  title,
  description,
  primaryHref = "/customize",
  primaryLabel = "Start your custom order",
  secondaryHref = "/contact",
  secondaryLabel = "Contact us",
  className,
}: PageCtaBannerProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-t border-white/10 py-16 sm:py-20",
        "bg-gradient-to-br from-[#122a5c] via-[#1a1240] to-[#0f2848]",
        className
      )}
      data-reveal
    >
      <div className="hero-glow-orb hero-glow-orb-cyan -left-20 top-0 h-72 w-72 opacity-60" aria-hidden />
      <div className="hero-glow-orb hero-glow-orb-magenta -right-20 bottom-0 h-72 w-72 opacity-50" aria-hidden />
      <div className="cmyk-line absolute left-0 top-0 w-full" aria-hidden />

      <div className="container-wide relative z-10 text-center">
        <h2 className="heading-section gradient-heading-light mx-auto max-w-2xl">{title}</h2>
        {description && (
          <p className="mx-auto mt-4 max-w-xl text-chrome-light">{description}</p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href={primaryHref} className={buttonVariants("primary")}>
            {primaryLabel}
          </Link>
          {secondaryHref && (
            <Link href={secondaryHref} className={buttonVariants("secondary")}>
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
