import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { getBlogPostBySlug, getPublishedBlogPosts } from "@/lib/public-data";
import { sanitizeHtml } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <article>
      {post.coverImage && (
        <div className="relative h-64 w-full bg-ink-black md:h-80">
          <Image src={post.coverImage} alt={post.title} fill className="object-contain p-8 opacity-90" priority sizes="100vw" />
        </div>
      )}

      <Container className="py-12">
        <nav className="mb-6 text-sm text-chrome-mid">
          <Link href="/blog" className="hover:text-royal-blue">Blog</Link>
          <span className="mx-2">/</span>
          <span>{post.title}</span>
        </nav>

        {post.category && (
          <p className="text-sm font-semibold uppercase tracking-wider text-royal-blue">{post.category}</p>
        )}
        <h1 className="heading-section mt-2 max-w-3xl">{post.title}</h1>
        {post.authorName && (
          <p className="mt-4 text-sm text-chrome-mid">By {post.authorName}</p>
        )}

        <div
          className="prose-dpm mt-10 max-w-3xl"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.body) }}
        />

        {post.inlineImages && post.inlineImages.length > 0 && (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {post.inlineImages.map((img, i) => (
              <figure key={i} className="relative aspect-square overflow-hidden rounded-sm border border-chrome-light/60">
                <Image src={img.url} alt={img.alt || ""} fill className="object-contain p-4" sizes="33vw" />
                {img.caption && <figcaption className="absolute bottom-0 left-0 right-0 bg-ink-black/70 p-2 text-xs text-pure-paper">{img.caption}</figcaption>}
              </figure>
            ))}
          </div>
        )}

        <Link href="/blog" className={`${buttonVariants("secondary")} mt-12 inline-flex`}>← Back to blog</Link>
      </Container>
    </article>
  );
}
