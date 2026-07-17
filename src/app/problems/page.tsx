import type { Metadata } from "next";
import { getProblemsIndex } from "@/lib/data/problems";
import { ProblemList } from "@/components/problem/problem-list";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "All LeetCode Problems — Solutions & Patterns | AlgoForge",
  description:
    "Browse thousands of coding interview problems with original explanations, multi-language solutions, and pattern tags.",
  keywords: ["leetcode problems", "coding interview problems", "dsa problems"],
  canonicalPath: "/problems",
});

export default function ProblemsPage() {
  const problems = getProblemsIndex();

  return (
    <div className="container-af py-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Problems", path: "/problems" }]} />
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Problems</h1>
      <p className="mt-2 text-muted-foreground max-w-2xl">
        {problems.length.toLocaleString()} problems with original AlgoForge explanations and
        reference solutions. Filter via topics, patterns, companies, or search.
      </p>
      <div className="mt-8">
        <ProblemList problems={problems} />
      </div>
    </div>
  );
}
