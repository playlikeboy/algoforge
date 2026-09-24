"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import MiniSearch from "minisearch";
import type { SearchDocument } from "@/lib/schema/types";
import { DifficultyBadge } from "@/components/ui/badge";

export function SearchClient({ documents }: { documents: SearchDocument[] }) {
  const [query, setQuery] = useState("");

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

    const seen = new Set<string>();
    mini.addAll(
      documents.filter((doc) => {
        if (seen.has(doc.id)) return false;
        seen.add(doc.id);
        return true;
      })
    );

    return mini;
  }, [documents]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return documents.filter((doc) => doc.type === "problem").slice(0, 12);
    }
    return index.search(query, { combineWith: "OR" }).slice(0, 30) as unknown as SearchDocument[];
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
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Two Sum, DP, Google, Blind 75…"
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          autoFocus
        />
      </div>

      <ul className="space-y-2">
        {results.map((result) => (
          <li key={result.id}>
            <Link
              href={result.path}
              className="block rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors"
            >
              <div className="flex flex-wrap items-center gap-2">
                {result.number && (
                  <span className="text-[11px] font-mono font-bold text-muted-foreground">
                    #{result.number}
                  </span>
                )}
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  {result.type}
                </span>
                {result.difficulty && <DifficultyBadge difficulty={result.difficulty} />}
              </div>
              <p className="mt-1 font-semibold">{result.title}</p>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {result.description}
              </p>
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
