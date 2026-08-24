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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getCachedSettings();
  const introEnabled = settings.motion?.introEnabled !== false;

  return (
    <html lang="en" className={inter.variable}>
      <head>
        {introEnabled ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var p=location.pathname;if(p==="/"||p===""){if(sessionStorage.getItem("dpm_intro_seen")!=="1"){document.documentElement.classList.add("intro-pending");}}}catch(e){}})();`,
            }}
          />
        ) : null}
      </head>
      <body className="flex min-h-screen min-w-0 flex-col overflow-x-clip">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
