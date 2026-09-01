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

function isPhotoBackground(src: string): boolean {
  return /\.(png|jpe?g|webp|gif)$/i.test(src);
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
  const showImage = image && isPhotoBackground(image);

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-white/10 py-14 sm:py-20 lg:py-24",
        dark ? "page-section-aurora text-pure-paper" : "bg-gradient-to-br from-pure-paper via-pure-paper to-chrome-light/20 text-ink-black",
        className
      )}
    >
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-[0.25]" aria-hidden />
      <div className="cmyk-line absolute left-0 top-0 z-20 w-full" aria-hidden />

      {showImage && (
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
          <Image
            src={image}
            alt={imageAlt || ""}
            fill
            className="object-cover object-center"
            aria-hidden
            sizes="100vw"
          />
        </div>
      )}

      <div
        className="hero-glow-orb hero-glow-orb-cyan -left-32 top-0 h-96 w-96"
        aria-hidden
      />
      <div
        className="hero-glow-orb hero-glow-orb-magenta -right-32 bottom-0 h-96 w-96"
        aria-hidden
      />
      <div
        className="hero-glow-orb hero-glow-orb-blue left-1/2 top-1/3 h-64 w-64 -translate-x-1/2"
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

        {dark && (
          <div className="mt-8 flex flex-wrap gap-3" data-reveal data-reveal-delay="0.3">
            {["Custom printing", "Live preview", "Canada shipping"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-chrome-light backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Container>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        aria-hidden
      />
    </section>
  );
}
