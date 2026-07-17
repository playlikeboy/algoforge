import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogIndex, getBlogPost } from "@/lib/data/problems";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { MarkdownBody } from "@/components/markdown-body";
import { markdownToHtml } from "@/lib/markdown";
import { JsonLd } from "@/components/seo/json-ld";
import { articleJsonLd } from "@/lib/seo/jsonld";

export const dynamicParams = false;

export function generateStaticParams() {
  return getBlogIndex().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return buildMetadata(post.seo);
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();
  const html = await markdownToHtml(post.bodyMarkdown);

  return (
    <div className="container-af py-10">
      <JsonLd
        data={articleJsonLd({
          title: post.title,
          description: post.description,
          path: post.seo.canonicalPath,
          datePublished: post.date,
        })}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />
      <article className="mt-6 max-w-3xl">
        <p className="text-sm text-muted-foreground">
          {post.date} · {post.readingMinutes} min read
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{post.title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{post.description}</p>
        <div className="mt-8">
          <MarkdownBody html={html} />
        </div>
      </article>
    </div>
  );
}
