import type { Metadata } from "next";
import Link from "next/link";
import { getCompaniesIndex } from "@/lib/data/problems";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";

export const metadata: Metadata = buildMetadata({
  title: "Company Interview Questions — Google, Meta, Amazon | AlgoForge",
  description: "Company-focused coding interview problem sets for FAANG and more.",
  keywords: ["google interview questions", "amazon oa", "meta coding interview"],
  canonicalPath: "/companies",
});

export default function CompaniesPage() {
  const companies = getCompaniesIndex().sort((a, b) => b.problemCount - a.problemCount);
  return (
    <div className="container-af py-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Companies", path: "/companies" }]} />
      <h1 className="mt-4 text-3xl font-bold">Companies</h1>
      <p className="mt-2 text-muted-foreground">
        Practice by company with publicly curated high-frequency patterns.
      </p>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((c) => (
          <Link
            key={c.slug}
            href={`/companies/${c.slug}`}
            className="rounded-xl border border-border bg-card p-5 hover:border-primary/40"
          >
            <h2 className="font-semibold text-lg">{c.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.description}</p>
            <p className="mt-3 text-xs font-medium text-primary">{c.problemCount} tagged problems</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
