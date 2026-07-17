import type { Metadata } from "next";
import { getSearchDocuments } from "@/lib/data/problems";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { SearchClient } from "@/components/search/search-client";

export const metadata: Metadata = buildMetadata({
  title: "Search Problems, Patterns & Guides | AlgoForge",
  description: "Instant search across problems, topics, patterns, companies, and guides.",
  keywords: ["leetcode search", "algorithm search"],
  canonicalPath: "/search",
});

export default function SearchPage() {
  const documents = getSearchDocuments();
  return (
    <div className="container-af py-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Search", path: "/search" }]} />
      <h1 className="mt-4 text-3xl font-bold">Search</h1>
      <p className="mt-2 text-muted-foreground mb-8">
        MiniSearch-powered client index — zero server round-trips.
      </p>
      <SearchClient documents={documents} />
    </div>
  );
}
