import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getLanding,
  getLandingsIndex,
  getProblemsBySlugs,
} from "@/lib/data/problems";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ProblemList } from "@/components/problem/problem-list";
import { JsonLd } from "@/components/seo/json-ld";
import { faqJsonLd } from "@/lib/seo/jsonld";

export const dynamicParams = false;

export function generateStaticParams() {
  return getLandingsIndex().map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const landing = getLanding(slug);
  if (!landing) return {};
  return buildMetadata(landing.seo);
}

export default async function ExploreLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const landing = getLanding(slug);
  if (!landing) notFound();
  const problems = getProblemsBySlugs(landing.problemSlugs);

  return (
    <div className="container-af py-10">
      <JsonLd data={faqJsonLd(landing.faqs)} />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Explore", path: "/problems" },
          { name: landing.h1, path: landing.path },
        ]}
      />
      <h1 className="mt-4 text-3xl font-bold tracking-tight">{landing.h1}</h1>
      <p className="mt-3 text-muted-foreground max-w-2xl">{landing.intro}</p>
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        {landing.relatedLinks.map((l) => (
          <Link key={l.href} href={l.href} className="text-primary hover:underline">
            {l.label}
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <ProblemList problems={problems} />
      </div>
      <section className="mt-12 max-w-2xl">
        <h2 className="text-xl font-bold mb-4">FAQs</h2>
        <div className="space-y-3">
          {landing.faqs.map((f) => (
            <details key={f.question} className="rounded-xl border border-border bg-card p-4">
              <summary className="font-medium cursor-pointer">{f.question}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
