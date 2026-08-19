import {
  LayoutDashboard,
  FileText,
  Package,
  ShoppingCart,
  ClipboardList,
  Briefcase,
  DollarSign,
  Images,
  MessageSquareQuote,
  HelpCircle,
  Calendar,
  Newspaper,
  Mail,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Pages", href: "/admin/pages", icon: FileText },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Custom Orders", href: "/admin/custom-orders", icon: ClipboardList },
  { label: "Services", href: "/admin/services", icon: Briefcase },
  { label: "Pricing", href: "/admin/pricing", icon: DollarSign },
  { label: "Gallery", href: "/admin/gallery", icon: Images },
  { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
  { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
  { label: "Bookings", href: "/admin/bookings", icon: Calendar },
  { label: "Blogs", href: "/admin/blogs", icon: Newspaper },
  { label: "Messages", href: "/admin/messages", icon: Mail },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
