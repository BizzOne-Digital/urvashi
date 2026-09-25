import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { ContentPanel } from "@/components/ui/ContentPanel";
import { getCachedSettings } from "@/lib/settings";
import { siteDefaults } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for DPM Custom Prints and Ink Supplies.",
};

export default async function TermsPage() {
  const settings = await getCachedSettings();
  const businessName = settings.general?.businessName || siteDefaults.businessName;
  const email = settings.contact?.email || siteDefaults.email;

  return (
    <>
      <PageHero title="Terms of Service" subtitle={`Terms governing use of the ${businessName} website and services.`} />

      <VibrantSection variant="mesh">
        <Container className="max-w-3xl">
          <ContentPanel>
            <p><em>Last updated: {new Date().toLocaleDateString("en-CA")}</em></p>

            <h2>Agreement</h2>
            <p>
              By using this website and placing orders with {businessName}, you agree to these terms. If you do not
              agree, please do not use our services.
            </p>

            <h2>Orders & pricing</h2>
            <p>
              Listed prices are in CAD unless otherwise stated. Custom and quote-only products require confirmation
              before production. Final pricing including shipping and applicable taxes will be provided on your invoice
              before payment is required.
            </p>

            <h2>Artwork & content</h2>
            <p>
              You confirm that you have the right to use any artwork, logos, or content you submit for printing. You
              are responsible for ensuring your content does not infringe third-party rights.
            </p>

            <h2>Production & previews</h2>
            <p>
              On-screen previews are approximate. Final placement, colour, and sizing may vary from what is shown. We
              work with you to approve details before production when needed.
            </p>

            <h2>Limitation of liability</h2>
            <p>
              To the fullest extent permitted by law, {businessName} is not liable for indirect or consequential damages
              arising from use of our website or products.
            </p>

            <h2>Contact</h2>
            <p>
              Questions about these terms? Email <a href={`mailto:${email}`}>{email}</a>.
            </p>
          </ContentPanel>
        </Container>
      </VibrantSection>
    </>
  );
}
