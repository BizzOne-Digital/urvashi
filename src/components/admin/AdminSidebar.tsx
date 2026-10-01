"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminNavItems } from "@/lib/admin-nav";
import { Logo } from "@/components/ui/Logo";

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-royal-blue text-pure-paper shadow-lg shadow-royal-blue/20"
                : "text-chrome-light hover:bg-white/5 hover:text-pure-paper"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-ink-black/60 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden
      />

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-ink-black transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <Logo href="/admin" variant="header" imageClassName="brightness-0 invert max-w-[120px]" />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-chrome-light hover:bg-white/10 hover:text-pure-paper"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {nav}
        <div className="border-t border-white/10 px-4 py-3 text-xs text-chrome-mid">
          DPM Admin Portal
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 bg-ink-black border-r border-white/10">
        <div className="flex items-center border-b border-white/10 px-5 py-5">
          <Logo href="/admin" variant="header" imageClassName="brightness-0 invert max-w-[120px]" />
        </div>
        {nav}
        <div className="mt-auto border-t border-white/10 px-4 py-3 text-xs text-chrome-mid">
          DPM Admin Portal
        </div>
      </aside>
    </>
  );
}
