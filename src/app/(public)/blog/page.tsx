import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { HighlightStrip } from "@/components/ui/HighlightStrip";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PageCtaBanner } from "@/components/ui/PageCtaBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPublishedBlogPosts } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Blog",
  description: "Tips, inspiration, and updates from DPM Custom Prints.",
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <>
      <PageHero
        eyebrow="Journal"
        title="Blog"
        subtitle="Gift ideas, artwork tips, and seasonal inspiration for your next custom print."
        image="/products/sublimation-desk-calendar/customized.png"
      />

      <HighlightStrip />

      <VibrantSection variant="mesh">
        <Container>
          <SectionHeader
            eyebrow="Latest"
            title="Tips & inspiration"
            subtitle="Ideas for gifts, events, branding, and getting the best results from your artwork."
          />

          {posts.length === 0 ? (
            <EmptyState
              className="mt-10"
              title="No posts yet"
              description="Blog posts will appear here once published. In the meantime, browse the shop or open the customizer."
              actionLabel="Browse shop"
              actionHref="/shop"
            />
          ) : (
            <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
              {posts.map((post) => (
                <article key={String(post._id)} className="card-vibrant group overflow-hidden" data-reveal-item>
                  {post.coverImage && (
                    <div className="relative aspect-[16/10] bg-[#0a0c14]">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                        sizes="33vw"
                      />
                    </div>
                  )}
                  <div className="border-t border-white/10 p-5">
                    {post.category && (
                      <p className="text-xs font-semibold uppercase tracking-wider text-cyan">{post.category}</p>
                    )}
                    <h2 className="mt-2 font-display text-xl font-semibold text-pure-paper group-hover:text-cyan">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    {post.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm text-chrome-light">{post.excerpt}</p>
                    )}
                    <Link
                      href={`/blog/${post.slug}`}
                      className="mt-4 inline-block text-sm font-semibold text-cyan hover:underline"
                    >
                      Read more →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Container>
      </VibrantSection>

      <PageCtaBanner
        title="Ready to print your idea?"
        description="Browse products or customize with live preview."
        primaryHref="/customize"
        primaryLabel="Open customizer"
        secondaryHref="/shop"
        secondaryLabel="Browse shop"
      />
    </>
  );
}
