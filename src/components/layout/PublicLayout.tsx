import { getCachedSettings } from "@/lib/settings";
import { siteDefaults } from "@/lib/brand";
import { buildMarqueeItems } from "@/lib/promo";
import { getPromoMarqueeProducts } from "@/lib/public-data";
import { Header, type HeaderSettings } from "@/components/layout/Header";
import { Footer, type FooterSettings } from "@/components/layout/Footer";

function buildHeaderSettings(settings: Awaited<ReturnType<typeof getCachedSettings>>): HeaderSettings {
  return {
    announcement: settings.general?.announcement,
    announcementEnabled: settings.general?.announcementEnabled ?? false,
    logoPath: settings.general?.logoPath || siteDefaults.logoPath,
    shortName: settings.general?.shortName || siteDefaults.shortName,
    ctaText: settings.footer?.ctaText || "Start your custom order",
    ctaUrl: settings.footer?.ctaUrl || "/customize",
  };
}

function buildFooterSettings(settings: Awaited<ReturnType<typeof getCachedSettings>>): FooterSettings {
  return {
    businessName: settings.general?.businessName || siteDefaults.businessName,
    logoPath: settings.general?.logoPath || siteDefaults.logoPath,
    shortName: settings.general?.shortName || siteDefaults.shortName,
    email: settings.contact?.email || siteDefaults.email,
    phone: settings.contact?.phone || siteDefaults.phone,
    phoneLink: settings.contact?.phoneLink || siteDefaults.phoneLink,
    whatsappLink: settings.contact?.whatsappLink || siteDefaults.whatsappLink,
    social: settings.social || [],
    footer: {
      description: settings.footer?.description || settings.general?.tagline,
      ctaText: settings.footer?.ctaText,
      ctaUrl: settings.footer?.ctaUrl,
      copyright: settings.footer?.copyright,
    },
  };
}

export async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getCachedSettings();
  const promoProducts = await getPromoMarqueeProducts();
  const marqueeItems = buildMarqueeItems(
    promoProducts.map((p) => ({
      _id: String(p._id),
      name: p.name,
      slug: p.slug,
      onSale: p.onSale,
      featured: p.featured,
      createdAt: p.createdAt ? String(p.createdAt) : undefined,
    }))
  );
  const headerSettings = buildHeaderSettings(settings);
  const footerSettings = buildFooterSettings(settings);

  return (
    <>
      <Header settings={headerSettings} marqueeItems={marqueeItems} />
      <main id="main-content" className="flex-1 min-w-0 overflow-x-clip">
        {children}
      </main>
      <Footer settings={footerSettings} />
    </>
  );
}
