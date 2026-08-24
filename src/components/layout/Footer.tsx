import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { ISocialLink } from "@/models/SiteSettings";

export interface FooterSettings {
  businessName: string;
  logoPath?: string;
  shortName?: string;
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

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Customize", href: "/customize" },
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "FAQs", href: "/faqs" },
  { label: "Contact", href: "/contact" },
] as const;

const POLICY_LINKS = [
  { label: "Shipping & Returns", href: "/shipping-returns" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
] as const;

function MailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 7 10-7" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.883 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 text-sm text-chrome-light transition-colors hover:text-cyan"
    >
      <span className="h-px w-0 bg-cyan transition-all group-hover:w-3" aria-hidden />
      {children}
    </Link>
  );
}

function ContactRow({
  href,
  label,
  external,
  icon,
}: {
  href: string;
  label: string;
  external?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <li>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="group flex items-start gap-3 rounded-sm border border-chrome-mid/20 bg-ink-black/40 p-3 transition-all hover:border-cyan/40 hover:bg-ink-black/70"
      >
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-royal-blue/30 to-cyan/20 text-cyan transition-colors group-hover:from-royal-blue/50 group-hover:to-cyan/30">
          {icon}
        </span>
        <span className="min-w-0 pt-1.5 text-sm leading-snug break-all text-pure-paper group-hover:text-cyan">{label}</span>
      </a>
    </li>
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
    <footer className="relative mt-auto min-w-0 overflow-x-clip bg-gradient-to-b from-ink-black via-carbon to-ink-black text-pure-paper">
      <div className="cmyk-line absolute inset-x-0 top-0 z-10" aria-hidden />
      <div className="pointer-events-none absolute left-0 top-20 h-48 w-48 rounded-full bg-cyan/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute bottom-20 right-0 h-56 w-56 rounded-full bg-magenta/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-royal-blue/10 blur-3xl" aria-hidden />

      <Container className="relative z-10 min-w-0 py-14 lg:py-16">
        <div className="grid min-w-0 gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Brand column */}
          <div className="lg:col-span-4">
            <Logo
              src={settings.logoPath}
              alt={settings.shortName || settings.businessName}
              variant="default"
              imageClassName="max-w-[150px]"
              plaqueClassName="p-2.5 shadow-md"
            />
            <p className="mt-5 font-display text-lg font-bold leading-tight sm:text-xl">
              {settings.businessName}
            </p>
            {settings.footer.description && (
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-chrome-light">
                {settings.footer.description}
              </p>
            )}
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-chrome-mid">
              Custom prints · Personalized gifts
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={ctaUrl} className={buttonVariants("primary")}>
                {ctaText}
              </Link>
              <Link
                href="/shop"
                className={cn(
                  buttonVariants("secondary"),
                  "border-chrome-mid/60 text-pure-paper hover:border-cyan hover:bg-cyan/10 hover:text-cyan"
                )}
              >
                Browse shop
              </Link>
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-2">
            <h2 className="gradient-eyebrow text-xs font-bold uppercase tracking-[0.2em]">Explore</h2>
            <ul className="mt-5 space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h2 className="gradient-eyebrow text-xs font-bold uppercase tracking-[0.2em]">Contact</h2>
            <ul className="mt-5 space-y-3">
              <ContactRow
                href={`mailto:${settings.email}`}
                label={settings.email}
                icon={<MailIcon className="h-4 w-4" />}
              />
              <ContactRow
                href={settings.phoneLink}
                label={settings.phone}
                icon={<PhoneIcon className="h-4 w-4" />}
              />
              {settings.whatsappLink && (
                <ContactRow
                  href={settings.whatsappLink}
                  label="Message us on WhatsApp"
                  external
                  icon={<WhatsAppIcon className="h-4 w-4" />}
                />
              )}
            </ul>
          </div>

          {/* Policies + Social */}
          <div className="lg:col-span-3">
            <h2 className="gradient-eyebrow text-xs font-bold uppercase tracking-[0.2em]">Policies</h2>
            <ul className="mt-5 space-y-2.5">
              {POLICY_LINKS.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>

            {activeSocialLinks.length > 0 && (
              <>
                <h2 className="gradient-eyebrow mt-8 text-xs font-bold uppercase tracking-[0.2em]">Follow</h2>
                <ul className="mt-4 flex flex-wrap gap-3">
                  {activeSocialLinks.map((link) => (
                    <li key={`${link.platform}-${link.url}`}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "inline-flex h-11 w-11 items-center justify-center rounded-sm",
                          "border border-chrome-mid/30 bg-ink-black/50 text-pure-paper",
                          "transition-all hover:-translate-y-0.5 hover:border-cyan/50 hover:bg-gradient-to-br hover:from-royal-blue hover:to-cyan hover:shadow-[0_0_20px_rgba(6,94,229,0.4)]"
                        )}
                        aria-label={`Follow us on ${link.platform}`}
                      >
                        <SocialIcon platform={link.platform!} />
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-chrome-mid/30 pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-chrome-light">{copyright}</p>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-chrome-mid">Ink lab</span>
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan shadow-[0_0_8px_rgba(13,151,252,0.6)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-magenta shadow-[0_0_8px_rgba(222,64,152,0.6)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow shadow-[0_0_8px_rgba(243,199,34,0.6)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-ink-black ring-1 ring-chrome-mid" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
