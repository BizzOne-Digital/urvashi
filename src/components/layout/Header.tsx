"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

export interface HeaderSettings {
  announcement?: string;
  announcementEnabled: boolean;
  logoPath: string;
  shortName: string;
  ctaText: string;
  ctaUrl: string;
}

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Customize", href: "/customize" },
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
] as const;

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

interface CartResponse {
  itemCount?: number;
  count?: number;
  items?: unknown[];
}

export function Header({ settings }: { settings: HeaderSettings }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as CartResponse;
      setCartCount(data.itemCount ?? data.count ?? data.items?.length ?? 0);
    } catch {
      // Cart API may not be available during initial setup
    }
  }, []);

  useEffect(() => {
    fetchCartCount();
    window.addEventListener("cart-updated", fetchCartCount);
    return () => window.removeEventListener("cart-updated", fetchCartCount);
  }, [fetchCartCount]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    const firstLink = mobileMenuRef.current?.querySelector<HTMLElement>("a");
    firstLink?.focus();
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const showAnnouncement = settings.announcementEnabled && Boolean(settings.announcement?.trim());
  const ctaLabel = isHome ? "Start your design" : settings.ctaText;

  const navLinkClass = (isActive: boolean) =>
    cn(
      "px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors lg:px-3 lg:text-xs",
      isHome
        ? isActive
          ? "text-cyan"
          : "text-chrome-light hover:text-pure-paper"
        : isActive
          ? "text-royal-blue"
          : "text-carbon hover:text-royal-blue"
    );

  return (
    <div className={cn("min-w-0 overflow-x-clip", isHome ? "fixed inset-x-0 top-0 z-50" : "sticky top-0 z-50")}>
      {showAnnouncement && (
        <div className="bg-ink-black px-4 py-2 text-center text-sm text-pure-paper" role="region" aria-label="Site announcement">
          <Container className="break-words px-0">{settings.announcement}</Container>
        </div>
      )}

      <header
        className={cn(
          isHome
            ? "border-b border-chrome-mid/40 bg-gradient-to-b from-[#1a1a1c]/95 via-[#121214]/90 to-transparent backdrop-blur-sm"
            : "border-b border-chrome-light/60 bg-pure-paper/95 shadow-sm backdrop-blur-md"
        )}
      >
        {/* Metallic top accent line */}
        {isHome && (
          <div className="h-[2px] w-full bg-gradient-to-r from-chrome-mid via-chrome-light to-chrome-mid" aria-hidden="true" />
        )}

        <Container className={cn("min-w-0", isHome && "max-w-[1400px]")}>
          <div
            className={cn(
              "flex min-w-0 items-center justify-between gap-2 sm:gap-3",
              isHome ? "min-h-[64px] py-2 lg:min-h-[72px]" : "h-16 lg:h-[72px]"
            )}
          >
            {/* Logo */}
            <div className="flex shrink-0 items-center">
              <Link href="/" className="inline-flex md:hidden" aria-label={`${settings.shortName} home`}>
                <span className="logo-plaque inline-flex items-center justify-center px-3 py-1.5">
                  <span className="font-display text-lg font-bold italic tracking-tight text-ink-black">DPM</span>
                </span>
              </Link>
              <div className="hidden md:block">
                <Logo
                  src={settings.logoPath}
                  alt={settings.shortName}
                  variant={isHome ? "headerHome" : "header"}
                  priority
                />
              </div>
            </div>

            {/* Center nav — desktop */}
            <nav className="hidden flex-1 items-center justify-center xl:flex" aria-label="Main navigation">
              {NAV_LINKS.map((link) => {
                const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <Link key={link.href} href={link.href} className={navLinkClass(isActive)} aria-current={isActive ? "page" : undefined}>
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <Link
                href="/shop?search="
                className={cn("rounded-sm p-2 transition-colors", isHome ? "text-chrome-light hover:text-pure-paper" : "btn-ghost")}
                aria-label="Search products"
              >
                <SearchIcon className="h-5 w-5" />
              </Link>

              <Link
                href="/cart"
                className={cn("relative rounded-sm p-2 transition-colors", isHome ? "text-chrome-light hover:text-pure-paper" : "btn-ghost")}
                aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
              >
                <CartIcon className="h-5 w-5" />
                {cartCount > 0 && (
                  <span
                    className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-royal-blue px-1 text-[10px] font-bold text-pure-paper shadow-[0_0_8px_rgba(6,94,229,0.6)]"
                    aria-hidden="true"
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              <Link
                href={settings.ctaUrl}
                className={cn(
                  "hidden max-w-[calc(100vw-8rem)] items-center justify-center truncate rounded-sm px-3 py-2 text-[10px] font-bold uppercase tracking-wide transition-all sm:inline-flex sm:max-w-none sm:px-4 sm:py-2.5 sm:text-[11px] lg:px-5 lg:text-xs",
                  isHome
                    ? "bg-gradient-to-b from-[#1a7aff] to-royal-blue text-pure-paper shadow-[0_0_20px_rgba(6,94,229,0.45)] hover:brightness-110"
                    : "btn-primary"
                )}
              >
                {ctaLabel}
              </Link>

              <button
                ref={menuButtonRef}
                type="button"
                className={cn("rounded-sm p-2 xl:hidden", isHome ? "text-chrome-light hover:text-pure-paper" : "btn-ghost")}
                aria-expanded={menuOpen}
                aria-controls={menuId}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </Container>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            id={menuId}
            ref={mobileMenuRef}
            className={cn("border-t xl:hidden", isHome ? "border-chrome-mid/40 bg-ink-black/98" : "border-chrome-light/60 bg-pure-paper")}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <Container className="py-4">
              <nav aria-label="Mobile navigation">
                <ul className="flex flex-col gap-1">
                  {[...NAV_LINKS, { label: "About", href: "/about" }].map((link) => {
                    const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className={cn(
                            "block rounded-sm px-3 py-3 text-sm font-semibold uppercase tracking-wide transition-colors",
                            isHome
                              ? isActive
                                ? "text-cyan"
                                : "text-chrome-light hover:text-pure-paper"
                              : isActive
                                ? "bg-royal-blue/10 text-royal-blue"
                                : "text-carbon hover:bg-chrome-light/20"
                          )}
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => setMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              <div className="mt-4 border-t border-chrome-mid/30 pt-4">
                <Link
                  href={settings.ctaUrl}
                  className="inline-flex w-full items-center justify-center rounded-sm bg-gradient-to-b from-[#1a7aff] to-royal-blue px-5 py-3 text-xs font-bold uppercase tracking-wider text-pure-paper"
                  onClick={() => setMenuOpen(false)}
                >
                  {ctaLabel}
                </Link>
              </div>
            </Container>
          </div>
        )}
      </header>
    </div>
  );
}
