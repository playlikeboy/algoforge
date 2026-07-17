import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPattern,
  getPatternsIndex,
  getProblemsBySlugs,
} from "@/lib/data/problems";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ProblemList } from "@/components/problem/problem-list";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPatternsIndex().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pattern = getPattern(slug);
  if (!pattern) return {};
  return buildMetadata(pattern.seo);
}

export default async function PatternPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pattern = getPattern(slug);
  if (!pattern) notFound();
  const problems = getProblemsBySlugs(pattern.problemSlugs);

  return (
    <div className="container-af py-10">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Patterns", path: "/patterns" },
          { name: pattern.name, path: `/patterns/${pattern.slug}` },
        ]}
      />
      <h1 className="mt-4 text-3xl font-bold">{pattern.name} Pattern</h1>
      <p className="mt-2 text-muted-foreground max-w-2xl">{pattern.description}</p>
      <div className="mt-8">
        <ProblemList problems={problems} />
      </div>
    </div>
  );
}
