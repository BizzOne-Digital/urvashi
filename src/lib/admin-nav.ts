import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Briefcase,
  DollarSign,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Admin portal: products, services, pricing, and orders only. */
export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Services", href: "/admin/services", icon: Briefcase },
  { label: "Pricing", href: "/admin/pricing", icon: DollarSign },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Custom orders", href: "/admin/custom-orders", icon: ClipboardList },
];
