import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getRoadmap,
  getRoadmapsIndex,
  getProblemsBySlugs,
} from "@/lib/data/problems";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ProblemList } from "@/components/problem/problem-list";

export const dynamicParams = false;

export function generateStaticParams() {
  return getRoadmapsIndex().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const roadmap = getRoadmap(slug);
  if (!roadmap) return {};
  return buildMetadata(roadmap.seo);
}

export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const roadmap = getRoadmap(slug);
  if (!roadmap) notFound();

  return (
    <div className="container-af py-10">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Roadmaps", path: "/roadmaps" },
          { name: roadmap.name, path: `/roadmaps/${roadmap.slug}` },
        ]}
      />
      <h1 className="mt-4 text-3xl font-bold">{roadmap.name}</h1>
      <p className="mt-2 text-muted-foreground max-w-2xl">{roadmap.description}</p>
      <ol className="mt-10 space-y-10">
        {roadmap.steps.map((step, i) => {
          const problems = getProblemsBySlugs(step.problemSlugs ?? []);
          return (
            <li key={step.title}>
              <h2 className="text-xl font-bold">
                <span className="text-primary mr-2">{i + 1}.</span>
                {step.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              {step.patternSlugs && step.patternSlugs.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {step.patternSlugs.map((p) => (
                    <Link key={p} href={`/patterns/${p}`} className="text-sm text-primary hover:underline">
                      {p.replace(/-/g, " ")}
                    </Link>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <ProblemList problems={problems} emptyMessage="Problems coming soon for this stage." />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
