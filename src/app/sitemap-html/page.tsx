import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  getTopicsIndex,
  getPatternsIndex,
  getCompaniesIndex,
  getRoadmapsIndex,
  getBlogIndex,
} from "@/lib/data/problems";

export const metadata: Metadata = buildMetadata({
  title: "HTML Sitemap | AlgoForge",
  description: "Human-readable sitemap of major AlgoForge sections.",
  keywords: ["sitemap"],
  canonicalPath: "/sitemap-html",
});

export default function HtmlSitemapPage() {
  const topics = getTopicsIndex();
  const patterns = getPatternsIndex();
  const companies = getCompaniesIndex();
  const roadmaps = getRoadmapsIndex();
  const blogs = getBlogIndex();

  return (
    <div className="container-af py-10">
      <h1 className="text-3xl font-bold">Sitemap</h1>
      <div className="mt-8 grid md:grid-cols-2 gap-8 text-sm">
        <section>
          <h2 className="font-bold mb-2">Core</h2>
          <ul className="space-y-1">
            {[
              "/",
              "/problems",
              "/search",
              "/blind-75",
              "/grind-169",
              "/neetcode-alternatives",
              "/practice",
              "/pricing",
              "/about",
            ].map((p) => (
              <li key={p}>
                <Link href={p} className="text-primary hover:underline">
                  {p}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-bold mb-2">Topics</h2>
          <ul className="space-y-1 max-h-64 overflow-auto">
            {topics.map((t) => (
              <li key={t.slug}>
                <Link href={`/topics/${t.slug}`} className="text-primary hover:underline">
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-bold mb-2">Patterns</h2>
          <ul className="space-y-1 max-h-64 overflow-auto">
            {patterns.map((t) => (
              <li key={t.slug}>
                <Link href={`/patterns/${t.slug}`} className="text-primary hover:underline">
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-bold mb-2">Companies & more</h2>
          <ul className="space-y-1">
            {companies.map((c) => (
              <li key={c.slug}>
                <Link href={`/companies/${c.slug}`} className="text-primary hover:underline">
                  {c.name}
                </Link>
              </li>
            ))}
            {roadmaps.map((r) => (
              <li key={r.slug}>
                <Link href={`/roadmaps/${r.slug}`} className="text-primary hover:underline">
                  {r.name}
                </Link>
              </li>
            ))}
            {blogs.map((b) => (
              <li key={b.slug}>
                <Link href={`/blog/${b.slug}`} className="text-primary hover:underline">
                  {b.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
