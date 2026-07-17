import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCompany,
  getCompaniesIndex,
  getProblemsBySlugs,
} from "@/lib/data/problems";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ProblemList } from "@/components/problem/problem-list";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCompaniesIndex().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = getCompany(slug);
  if (!company) return {};
  return buildMetadata(company.seo);
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = getCompany(slug);
  if (!company) notFound();
  const problems = getProblemsBySlugs(company.problemSlugs);

  return (
    <div className="container-af py-10">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Companies", path: "/companies" },
          { name: company.name, path: `/companies/${company.slug}` },
        ]}
      />
      <h1 className="mt-4 text-3xl font-bold">{company.name} Coding Interview Questions</h1>
      <p className="mt-2 text-muted-foreground max-w-2xl">{company.description}</p>
      <div className="mt-8">
        <ProblemList
          problems={problems}
          emptyMessage="Company tags are expanding — explore topics and Blind 75 meanwhile."
        />
      </div>
    </div>
  );
}
