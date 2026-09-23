"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import MiniSearch from "minisearch";
import { Search, Loader2, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { DifficultyBadge } from "@/components/ui/badge";
import { siteConfig } from "@/lib/config";
import type { SearchDocument } from "@/lib/schema/types";

export function SearchModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [documents, setDocuments] = useState<SearchDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchDocument[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen || documents.length > 0) return;

    const controller = new AbortController();
    setIsLoading(true);

    fetch(siteConfig.basePath + "/api/search-docs", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Search index request failed");
        return res.json();
      })
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          setDocuments(data as SearchDocument[]);
        } else {
          throw new Error("Invalid search index payload");
        }
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Failed to load search index:", err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [isOpen, documents.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      if (e.key === "/") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const index = useMemo(() => {
    if (documents.length === 0) return null;
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
    const unique = documents.filter((d) => {
      if (seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    });
    mini.addAll(unique);
    return mini;
  }, [documents]);

  useEffect(() => {
    if (!isOpen) return;

    if (!query.trim()) {
      setResults(documents.filter((d) => d.type === "problem").slice(0, 8));
      setSelectedIndex(0);
      return;
    }

    if (!index) return;

    const hits = index.search(query, { combineWith: "OR" }).slice(0, 10);
    setResults(hits as unknown as SearchDocument[]);
    setSelectedIndex(0);
  }, [query, index, documents, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      setQuery("");
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleNav = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (results[selectedIndex]) {
          router.push(results[selectedIndex].path);
          setIsOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleNav);
    return () => window.removeEventListener("keydown", handleNav);
  }, [isOpen, results, selectedIndex, router]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-[15vh]"
      onClick={() => setIsOpen(false)}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search AlgoForge"
        className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[60vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3 bg-muted/20">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search problems, topics, companies..."
            aria-label="Search problems, topics, and companies"
            className="w-full text-base bg-transparent border-0 focus:outline-none focus:ring-0 text-foreground"
          />
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-sm text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Indexing problems...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.map((r, i) => {
              const isSelected = i === selectedIndex;
              return (
                <button
                  type="button"
                  key={r.id}
                  className={cn(
                    "w-full flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer transition-colors text-left",
                    isSelected
                      ? "bg-primary/10 text-foreground border border-primary/30"
                      : "hover:bg-muted/40 text-foreground border border-transparent"
                  )}
                  onClick={() => {
                    router.push(r.path);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <span className="flex flex-col gap-1 min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      {r.number && (
                        <span className="text-xs font-mono font-bold text-primary">
                          #{r.number}
                        </span>
                      )}
                      <span className="text-[9px] uppercase tracking-wider font-semibold opacity-75">
                        {r.type}
                      </span>
                      {r.difficulty && (
                        <span className="text-[10px]">
                          <DifficultyBadge difficulty={r.difficulty} />
                        </span>
                      )}
                    </span>
                    <span className="font-medium text-sm truncate">{r.title}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-lg">
                      {r.description}
                    </span>
                  </span>
                  {isSelected && (
                    <span className="text-[10px] flex items-center gap-1 text-primary font-mono select-none">
                      Navigate <CornerDownLeft className="h-3 w-3" />
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2 bg-muted/30 text-[10px] text-muted-foreground font-mono">
          <div className="flex gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <span>AlgoForge Cmd+K Palette</span>
        </div>
      </div>
    </div>
  );
}
