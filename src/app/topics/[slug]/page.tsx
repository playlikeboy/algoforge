import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getTopic,
  getTopicsIndex,
  getProblemsBySlugs,
} from "@/lib/data/problems";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ProblemList } from "@/components/problem/problem-list";
import { JsonLd } from "@/components/seo/json-ld";
import { articleJsonLd } from "@/lib/seo/jsonld";

export const dynamicParams = false;

export function generateStaticParams() {
  return getTopicsIndex().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) return {};
  return buildMetadata(topic.seo);
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();
  const problems = getProblemsBySlugs(topic.problemSlugs);

  return (
    <div className="container-af py-10">
      <JsonLd
        data={articleJsonLd({
          title: topic.name,
          description: topic.description,
          path: topic.seo.canonicalPath,
        })}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Topics", path: "/topics" },
          { name: topic.name, path: `/topics/${topic.slug}` },
        ]}
      />
      <h1 className="mt-4 text-3xl font-bold">{topic.name} Interview Questions</h1>
      <p className="mt-2 text-muted-foreground max-w-2xl">{topic.description}</p>
      <p className="mt-2 text-sm font-medium">{topic.problemCount} problems</p>
      <div className="mt-8">
        <ProblemList problems={problems} />
      </div>
    </div>
  );
}
