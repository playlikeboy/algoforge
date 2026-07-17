import type { Metadata } from "next";
import { getCollection, getProblemsBySlugs } from "@/lib/data/problems";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ProblemList } from "@/components/problem/problem-list";

export const metadata: Metadata = buildMetadata({
  title: "Blind 75 Tracker & Solutions | AlgoForge",
  description:
    "Complete Blind 75 list with original explanations, patterns, and multi-language solutions. Free NeetCode-style alternative.",
  keywords: ["blind 75", "blind 75 leetcode", "blind 75 solutions"],
  canonicalPath: "/blind-75",
});

export default function Blind75Page() {
  const col = getCollection("blind-75");
  const problems = getProblemsBySlugs(col?.problemSlugs ?? []);

  return (
    <div className="container-af py-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Blind 75", path: "/blind-75" }]} />
      <h1 className="mt-4 text-3xl font-bold">Blind 75</h1>
      <p className="mt-2 text-muted-foreground max-w-2xl">
        {col?.description ??
          "The classic high-ROI interview set. Work pattern-by-pattern, not randomly."}
      </p>
      <p className="mt-2 text-sm font-medium">
        {problems.length} problems available in AlgoForge catalog
      </p>
      <div className="mt-8">
        <ProblemList problems={problems} />
      </div>
    </div>
  );
}
