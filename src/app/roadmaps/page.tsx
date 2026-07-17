import type { Metadata } from "next";
import Link from "next/link";
import { getRoadmapsIndex } from "@/lib/data/problems";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";

export const metadata: Metadata = buildMetadata({
  title: "Coding Interview Roadmaps | AlgoForge",
  description: "Structured DSA roadmaps for DP, graphs, binary search, and fundamentals.",
  keywords: ["dsa roadmap", "leetcode roadmap", "interview roadmap"],
  canonicalPath: "/roadmaps",
});

export default function RoadmapsPage() {
  const roadmaps = getRoadmapsIndex();
  return (
    <div className="container-af py-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Roadmaps", path: "/roadmaps" }]} />
      <h1 className="mt-4 text-3xl font-bold">Roadmaps</h1>
      <p className="mt-2 text-muted-foreground">Follow ordered paths instead of random problem lists.</p>
      <div className="mt-8 grid md:grid-cols-2 gap-4">
        {roadmaps.map((r) => (
          <Link
            key={r.slug}
            href={`/roadmaps/${r.slug}`}
            className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40"
          >
            <h2 className="text-xl font-bold">{r.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>
            <p className="mt-3 text-xs text-primary font-medium">{r.steps.length} stages</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
