import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  image?: string;
  imageAlt?: string;
  dark?: boolean;
  className?: string;
}

export function PageHero({
  title,
  subtitle,
  eyebrow,
  image,
  imageAlt,
  dark = true,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-chrome-mid/30 py-14 sm:py-20 lg:py-24",
        dark
          ? "bg-gradient-to-br from-ink-black via-[#12121a] to-deep-blue text-pure-paper"
          : "bg-gradient-to-br from-pure-paper via-pure-paper to-chrome-light/20 text-ink-black",
        className
      )}
    >
      <div className="cmyk-line absolute left-0 top-0 z-20 w-full" aria-hidden />

      {image && (
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
          <Image src={image} alt="" fill className="object-cover" aria-hidden />
        </div>
      )}

      <div
        className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-cyan/25 blur-3xl hero-shimmer"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-magenta/20 blur-3xl hero-shimmer"
        style={{ animationDelay: "2s" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-royal-blue/10 blur-3xl"
        aria-hidden
      />

      <Container className="relative z-10 min-w-0">
        {eyebrow && (
          <p
            className={cn(
              "mb-3 text-xs font-bold uppercase tracking-[0.2em] sm:text-sm",
              dark ? "gradient-eyebrow" : "text-royal-blue"
            )}
            data-reveal
            data-reveal-y="20"
          >
            {eyebrow}
          </p>
        )}
        <h1
          className={cn(
            "heading-display text-balance max-w-4xl",
            dark ? "gradient-heading-light" : "gradient-heading"
          )}
          data-reveal
          data-reveal-delay="0.1"
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={cn(
              "mt-4 max-w-2xl break-words text-lg leading-relaxed sm:text-xl",
              dark ? "text-chrome-light" : "text-carbon"
            )}
            data-reveal
            data-reveal-delay="0.2"
          >
            {subtitle}
          </p>
        )}
      </Container>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-chrome-mid/50 to-transparent"
        aria-hidden
      />
    </section>
  );
}
