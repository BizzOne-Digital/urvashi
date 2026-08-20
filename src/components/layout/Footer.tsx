import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { ISocialLink } from "@/models/SiteSettings";

export interface FooterSettings {
  businessName: string;
  email: string;
  phone: string;
  phoneLink: string;
  whatsappLink: string;
  social: ISocialLink[];
  footer: {
    description?: string;
    ctaText?: string;
    ctaUrl?: string;
    copyright?: string;
  };
}

const POLICY_LINKS = [
  { label: "Shipping & Returns", href: "/shipping-returns" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
] as const;

function SocialIcon({ platform }: { platform: string }) {
  const normalized = platform.toLowerCase();

  if (normalized.includes("instagram")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2z" />
      </svg>
    );
  }

  if (normalized.includes("facebook")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M13 10V7.5c0-.8.7-1.5 1.5-1.5H16V3h-2c-2.2 0-4 1.8-4 4v3H8v3.5h2V21h3v-7.5h2.5L16 10h-3z" />
      </svg>
    );
  }

  if (normalized.includes("tiktok")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M16.5 3c.5 2.2 1.8 4 4 4.5v3.4c-1.7 0-3.3-.5-4.7-1.4v7.5a6.5 6.5 0 1 1-6.5-6.5c.3 0 .7 0 1 .1v3.5a3 3 0 1 0 2.1 2.9V3h3.1z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export function Footer({ settings }: { settings: FooterSettings }) {
  const activeSocialLinks = (settings.social || []).filter(
    (link) => link.isActive && link.url && link.platform
  );

  const ctaText = settings.footer.ctaText || "Start your custom order";
  const ctaUrl = settings.footer.ctaUrl || "/customize";
  const copyright =
    settings.footer.copyright ||
    `© ${new Date().getFullYear()} ${settings.businessName}`;

  return (
    <footer className="relative mt-auto min-w-0 overflow-x-clip border-t border-chrome-light/60 bg-carbon text-pure-paper">
      <div className="cmyk-line absolute inset-x-0 top-0" aria-hidden />
      <Container className="min-w-0 py-12 lg:py-16">
        <div className="grid min-w-0 gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <p className="font-display text-xl font-bold tracking-tight break-words sm:text-2xl">{settings.businessName}</p>
            {settings.footer.description && (
              <p className="mt-3 max-w-md text-sm leading-relaxed text-chrome-light">
                {settings.footer.description}
              </p>
            )}

            <div className="mt-6">
              <Link href={ctaUrl} className={buttonVariants("primary")}>
                {ctaText}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-chrome-light">
              Contact
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="break-all transition-colors hover:text-cyan"
                >
                  {settings.email}
                </a>
              </li>
              <li>
                <a href={settings.phoneLink} className="transition-colors hover:text-cyan">
                  {settings.phone}
                </a>
              </li>
              {settings.whatsappLink && (
                <li>
                  <a
                    href={settings.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 transition-colors hover:text-cyan"
                  >
                    WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-chrome-light">
              Policies
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {POLICY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-cyan">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {activeSocialLinks.length > 0 && (
            <div className="lg:col-span-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-chrome-light">
                Follow
              </h2>
              <ul className="mt-4 flex flex-wrap gap-3">
                {activeSocialLinks.map((link) => (
                  <li key={`${link.platform}-${link.url}`}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex h-10 w-10 items-center justify-center rounded-sm",
                        "bg-ink-black/50 text-pure-paper transition-colors hover:bg-royal-blue"
                      )}
                      aria-label={`Follow us on ${link.platform}`}
                    >
                      <SocialIcon platform={link.platform!} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-chrome-mid/40 pt-6 text-sm text-chrome-light sm:flex-row sm:items-center sm:justify-between">
          <p>{copyright}</p>
          <p className="text-xs">
            <span className="inline-block h-2 w-2 rounded-full bg-cyan" aria-hidden="true" />{" "}
            <span className="inline-block h-2 w-2 rounded-full bg-magenta" aria-hidden="true" />{" "}
            <span className="inline-block h-2 w-2 rounded-full bg-yellow" aria-hidden="true" />
            <span className="sr-only">Brand accent colors</span>
          </p>
        </div>
      </Container>
    </footer>
  );
}
