import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

interface HomeHeroProps {
  tagline?: string;
}

export function HomeHero({ tagline = "Your idea. Your style. Printed with purpose." }: HomeHeroProps) {
  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-ink-black text-pure-paper lg:min-h-[95vh]">
      {/* Background — SS2 product showcase */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-background.png"
          alt=""
          fill
          priority
          className="object-cover object-[65%_center] lg:object-[70%_center]"
          sizes="100vw"
          aria-hidden
        />
        {/* Left readability gradient */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-ink-black via-ink-black/85 to-transparent lg:via-ink-black/70"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink-black/60 via-transparent to-ink-black/30"
          aria-hidden
        />
      </div>

      {/* CMYK accent line */}
      <div className="absolute left-0 top-0 z-10 h-[3px] w-full bg-gradient-to-r from-cyan via-magenta to-yellow" aria-hidden />

      <Container className="relative z-10 flex min-h-[92vh] min-w-0 max-w-[1400px] items-center pb-16 pt-24 sm:pt-28 lg:min-h-[95vh] lg:pb-20 lg:pt-32">
        <div className="relative grid w-full items-center gap-8 lg:grid-cols-[auto_1fr] lg:gap-12">
          {/* Vertical brand ribbon */}
          <div
            className="hidden lg:flex lg:w-8 lg:flex-col lg:items-center lg:justify-center"
            aria-hidden
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.35em] text-chrome-mid [writing-mode:vertical-rl] rotate-180"
              style={{ textOrientation: "mixed" }}
            >
              Quality • Reliability • Innovation • Solutions
            </p>
          </div>

          {/* Hero copy */}
          <div className="min-w-0 max-w-2xl">
            <p className="bg-gradient-to-r from-cyan via-royal-blue to-magenta bg-clip-text text-[10px] font-bold uppercase tracking-[0.12em] text-transparent sm:text-xs sm:tracking-[0.2em]">
              Custom prints • Personalized gifts
            </p>

            <h1 className="mt-4 break-words font-display text-3xl font-bold italic leading-[1.05] tracking-tight text-pure-paper sm:text-5xl lg:text-6xl xl:text-7xl">
              Bring your ideas to life.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-chrome-light sm:text-lg">
              Custom products made personal—from everyday essentials to unforgettable gifts.
            </p>
            <p className="mt-2 max-w-lg text-sm text-chrome-mid">{tagline}</p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className={cn(
                  "inline-flex items-center justify-center rounded-sm px-6 py-3.5 text-xs font-bold uppercase tracking-wider",
                  "bg-gradient-to-b from-[#1a7aff] to-royal-blue text-pure-paper",
                  "shadow-[0_0_24px_rgba(6,94,229,0.5)] transition-all hover:brightness-110"
                )}
              >
                Shop custom products
              </Link>
              <Link
                href="/customize"
                className={cn(
                  "inline-flex items-center justify-center rounded-sm border border-chrome-light/60 px-6 py-3.5 text-xs font-bold uppercase tracking-wider",
                  "bg-transparent text-pure-paper backdrop-blur-sm transition-all",
                  "hover:border-cyan/60 hover:shadow-[0_0_16px_rgba(13,151,252,0.25)]"
                )}
              >
                Create your design
              </Link>
            </div>
          </div>
        </div>
      </Container>

      {/* Bottom metallic edge */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-chrome-mid/50 to-transparent"
        aria-hidden
      />
    </section>
  );
}
