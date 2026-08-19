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
  dark = false,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-chrome-light/40 py-12 sm:py-16 lg:py-24",
        dark ? "section-dark" : "bg-gradient-to-br from-pure-paper via-pure-paper to-chrome-light/20",
        className
      )}
    >
      {image && (
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
          <Image src={image} alt="" fill className="object-cover" aria-hidden />
        </div>
      )}
      <div className="pointer-events-none absolute left-0 top-10 h-32 w-32 rounded-full bg-cyan/20 blur-3xl sm:h-40 sm:w-40" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 rounded-full bg-magenta/15 blur-3xl sm:h-48 sm:w-48" />
      <Container className="relative min-w-0">
        {eyebrow && (
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-royal-blue">{eyebrow}</p>
        )}
        <h1 className="heading-display text-balance max-w-4xl">{title}</h1>
        {subtitle && (
          <p className={cn("mt-4 max-w-2xl break-words text-lg leading-relaxed", dark ? "text-chrome-light" : "text-carbon")}>
            {subtitle}
          </p>
        )}
      </Container>
    </section>
  );
}
