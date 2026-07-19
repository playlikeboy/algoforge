"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MiniSearch from "minisearch";
import type { SearchDocument } from "@/lib/schema/types";
import { DifficultyBadge } from "@/components/ui/badge";

export function SearchClient({ documents }: { documents: SearchDocument[] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchDocument[]>([]);

  const index = useMemo(() => {
    const mini = new MiniSearch<SearchDocument>({
      idField: "id",
      fields: ["title", "description", "keywords", "slug"],
      storeFields: [
        "id",
        "type",
        "title",
        "slug",
        "path",
        "description",
        "difficulty",
        "topics",
        "patterns",
        "number",
      ],
      searchOptions: {
        boost: { title: 3, keywords: 2 },
        fuzzy: 0.2,
        prefix: true,
      },
    });
    // Guard against duplicate IDs from pipeline edge cases
    const seen = new Set<string>();
    const unique = documents.filter((d) => {
      if (seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    });
    mini.addAll(unique);
    return mini;
  }, [documents]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(documents.filter((d) => d.type === "problem").slice(0, 12));
      return;
    }
    const hits = index.search(query, { combineWith: "AND" }).slice(0, 30);
    setResults(hits as unknown as SearchDocument[]);
  }, [query, index, documents]);

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="search" className="sr-only">
          Search problems, topics, patterns
        </label>
        <input
          id="search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Two Sum, DP, Google, Blind 75…"
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          autoFocus
        />
      </div>
      <ul className="space-y-2">
        {results.map((r) => (
          <li key={r.id}>
            <Link
              href={r.path}
              className="block rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors"
            >
              <div className="flex flex-wrap items-center gap-2">
                {r.number && (
                  <span className="text-[11px] font-mono font-bold text-muted-foreground">
                    #{r.number}
                  </span>
                )}
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  {r.type}
                </span>
                {r.difficulty && <DifficultyBadge difficulty={r.difficulty} />}
              </div>
              <p className="mt-1 font-semibold">{r.title}</p>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{r.description}</p>
            </Link>
          </li>
        ))}
      </ul>
      {results.length === 0 && (
        <p className="text-sm text-muted-foreground">No results. Try another query.</p>
      )}
    </div>
  );
}
