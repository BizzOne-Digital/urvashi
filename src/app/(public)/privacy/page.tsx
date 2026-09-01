import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { ContentPanel } from "@/components/ui/ContentPanel";
import { getCachedSettings } from "@/lib/settings";
import { siteDefaults } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for DPM Custom Prints and Ink Supplies.",
};

export default async function PrivacyPage() {
  const settings = await getCachedSettings();
  const businessName = settings.general?.businessName || siteDefaults.businessName;
  const email = settings.contact?.email || siteDefaults.email;

  return (
    <>
      <PageHero title="Privacy Policy" subtitle={`How ${businessName} collects and uses your information.`} />

      <VibrantSection variant="mesh">
        <Container className="max-w-3xl">
          <ContentPanel>
            <p><em>Last updated: {new Date().toLocaleDateString("en-CA")}</em></p>

            <h2>Information we collect</h2>
            <p>
              When you contact us, place an order, upload artwork, or book a consultation, we may collect your name,
              email address, phone number, shipping details, order information, and any messages or files you provide.
            </p>

            <h2>How we use your information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Process and fulfill orders</li>
              <li>Respond to inquiries and consultation requests</li>
              <li>Prepare invoices and communicate about your project</li>
              <li>Improve our products and services</li>
            </ul>

            <h2>Artwork and uploads</h2>
            <p>
              Artwork you upload is used solely to produce your order unless you give separate permission for
              promotional use. Private uploads are stored securely and linked to your order or inquiry.
            </p>

            <h2>Sharing</h2>
            <p>
              We do not sell your personal information. We may share data with service providers (such as email or
              payment processors) only as needed to operate our business.
            </p>

            <h2>Contact</h2>
            <p>
              For privacy questions, contact us at <a href={`mailto:${email}`}>{email}</a>.
            </p>
          </ContentPanel>
        </Container>
      </VibrantSection>
    </>
  );
}
