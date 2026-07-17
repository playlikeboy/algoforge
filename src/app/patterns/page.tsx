import type { Metadata } from "next";
import Link from "next/link";
import { getPatternsIndex } from "@/lib/data/problems";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";

export const metadata: Metadata = buildMetadata({
  title: "Coding Patterns Explorer | AlgoForge",
  description: "Master sliding window, two pointers, DP, Union-Find, and more interview patterns.",
  keywords: ["coding patterns", "sliding window", "two pointers", "union find"],
  canonicalPath: "/patterns",
});

export default function PatternsPage() {
  const patterns = getPatternsIndex().sort((a, b) => b.problemCount - a.problemCount);
  return (
    <div className="container-af py-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Patterns", path: "/patterns" }]} />
      <h1 className="mt-4 text-3xl font-bold">Patterns</h1>
      <p className="mt-2 text-muted-foreground">
        Pattern recognition is the fastest path from random grinding to interview confidence.
      </p>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {patterns.map((p) => (
          <Link
            key={p.slug}
            href={`/patterns/${p.slug}`}
            className="rounded-xl border border-border bg-card p-5 hover:border-primary/40"
          >
            <h2 className="font-semibold text-lg">{p.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{p.description}</p>
            <p className="mt-3 text-xs font-medium text-primary">{p.problemCount} problems</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
