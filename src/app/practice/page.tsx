import type { Metadata } from "next";
import Link from "next/link";
import { getProblemsIndex } from "@/lib/data/problems";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";

export const metadata: Metadata = buildMetadata({
  title: "Practice Modes | AlgoForge",
  description: "Practice pick, daily challenge, and timed practice modes.",
  keywords: ["leetcode practice", "daily challenge"],
  canonicalPath: "/practice",
});

function seededIndex(seed: number, length: number): number {
  if (length === 0) return 0;
  return Math.abs(Math.imul(seed, 9301) + 49297) % length;
}

export default function PracticePage() {
  const problems = getProblemsIndex();
  const buildDate = process.env.NEXT_PUBLIC_BUILD_DATE ?? "2026-01-01";
  const buildDay = Math.floor(Date.parse(buildDate + "T00:00:00Z") / 86400000);
  const daily = problems[seededIndex(buildDay, problems.length)];
  const random = problems[seededIndex(buildDay * 31 + 17, problems.length)];

  return (
    <div className="container-af py-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Practice", path: "/practice" }]} />
      <h1 className="mt-4 text-3xl font-bold">Practice</h1>
      <p className="mt-2 text-muted-foreground">Local modes — no account required.</p>
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-bold text-lg">Daily challenge</h2>
          <p className="mt-2 text-sm text-muted-foreground">A deterministic pick for today.</p>
          {daily && (
            <Link href={`/problems/${daily.slug}`} className="mt-4 inline-block text-primary font-medium">
              {daily.title} →
            </Link>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-bold text-lg">Random problem</h2>
          <p className="mt-2 text-sm text-muted-foreground">A deterministic seeded pick that changes with each production build.</p>
          {random && (
            <Link href={`/problems/${random.slug}`} className="mt-4 inline-block text-primary font-medium">
              {random.title} →
            </Link>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-bold text-lg">Timed solving</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Shell ready — use estimated minutes on each problem page as a timer target.
          </p>
          <Link href="/blind-75" className="mt-4 inline-block text-primary font-medium">
            Start Blind 75 →
          </Link>
        </div>
      </div>
    </div>
  );
}
