"use client";

import { usePathname } from "next/navigation";
import { AdminShell } from "./AdminShell";
import { adminNavItems } from "@/lib/admin-nav";

function getPageTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  if (pathname === "/admin/login") return "Sign In";

  const match = adminNavItems.find((item) => {
    if (item.href === "/admin") return false;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  });

  if (match) return match.label;

  if (pathname.includes("/new")) return "Create New";
  return "Admin";
}

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-black p-4">
        {children}
      </div>
    );
  }

  return <AdminShell title={getPageTitle(pathname)}>{children}</AdminShell>;
}
