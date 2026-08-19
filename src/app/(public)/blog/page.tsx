import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
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
        image="/demo/calendar.svg"
      />

      <section className="py-16">
        <Container>
          {posts.length === 0 ? (
            <EmptyState title="No posts yet" description="Blog posts will appear here once published." />
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article key={String(post._id)} className="group overflow-hidden rounded-sm border border-chrome-light/60 transition-all hover:border-royal-blue hover:shadow-lg">
                  {post.coverImage && (
                    <div className="relative aspect-[16/10] bg-chrome-light/20">
                      <Image src={post.coverImage} alt={post.title} fill className="object-contain p-4" sizes="33vw" />
                    </div>
                  )}
                  <div className="p-5">
                    {post.category && (
                      <p className="text-xs font-semibold uppercase tracking-wider text-royal-blue">{post.category}</p>
                    )}
                    <h2 className="mt-2 font-display text-xl font-semibold group-hover:text-royal-blue">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    {post.excerpt && <p className="mt-2 line-clamp-3 text-sm text-carbon">{post.excerpt}</p>}
                    <Link href={`/blog/${post.slug}`} className="mt-4 inline-block text-sm font-semibold text-royal-blue hover:underline">
                      Read more →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
