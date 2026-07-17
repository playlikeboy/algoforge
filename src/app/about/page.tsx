import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = buildMetadata({
  title: "About AlgoForge",
  description: siteConfig.description,
  keywords: ["about algoforge"],
  canonicalPath: "/about",
});

export default function AboutPage() {
  return (
    <div className="container-af py-10 max-w-3xl">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }]} />
      <h1 className="mt-4 text-3xl font-bold">About {siteConfig.name}</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        AlgoForge is an educational platform for coding interview preparation. We organize public
        solution sources into a pattern-first learning product with original explanations, roadmaps,
        and SEO-friendly study pages.
      </p>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        We do not republish official LeetCode problem statements. Always use the official LeetCode
        site for constraints and examples. Reference solution code is attributed under MIT — see{" "}
        <Link href="/about/attribution" className="text-primary hover:underline">
          attribution
        </Link>
        .
      </p>
    </div>
  );
}
