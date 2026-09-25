import { PageHero } from "@/components/ui/PageHero";
import type { IPageSection } from "@/models/Page";
import { sectionImage, sectionText } from "@/lib/page-content";

interface CmsPageHeroProps {
  section?: IPageSection;
  fallback: {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    image?: string;
  };
}

export function CmsPageHero({ section, fallback }: CmsPageHeroProps) {
  return (
    <PageHero
      eyebrow={sectionText(section, "eyebrow", fallback.eyebrow)}
      title={sectionText(section, "heading", fallback.title)}
      subtitle={sectionText(section, "subheading", fallback.subtitle)}
      image={sectionImage(section, fallback.image)}
    />
  );
}
