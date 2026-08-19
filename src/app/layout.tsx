import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { getCachedSettings } from "@/lib/settings";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSettings();
  return {
    title: {
      default: settings.general?.defaultSeoTitle || "DPM Custom Prints and Ink Supplies",
      template: `%s | ${settings.general?.shortName || "DPM Custom Prints"}`,
    },
    description:
      settings.general?.defaultSeoDescription ||
      "Custom printing on everyday items, meaningful gifts, apparel, drinkware, keepsakes, and more.",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen min-w-0 flex-col overflow-x-clip">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
