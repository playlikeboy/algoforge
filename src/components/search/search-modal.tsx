"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const [loadError, setLoadError] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousBodyOverflowRef = useRef("");

  const closeModal = () => {
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(0);
  };

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
    if (!isOpen) return [];
    if (!query.trim()) {
      return documents.filter((doc) => doc.type === "problem").slice(0, 8);
    }
    if (!index) return [];
    return index.search(query, { combineWith: "OR" }).slice(0, 10) as unknown as SearchDocument[];
  }, [isOpen, query, documents, index]);

  const selectedResultIndex = Math.min(
    selectedIndex,
    Math.max(0, results.length - 1)
  );
  const isLoading = isOpen && documents.length === 0 && !loadError;

  useEffect(() => {
    if (!isOpen || documents.length > 0 || loadError) return;

    const controller = new AbortController();

    fetch(siteConfig.basePath + "/api/search-docs", {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Search index request failed");
        return response.json();
      })
      .then((data: unknown) => {
        if (!Array.isArray(data)) throw new Error("Invalid search index payload");
        setDocuments(data as SearchDocument[]);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Failed to load search index:", error);
        setLoadError(true);
      });

    return () => controller.abort();
  }, [isOpen, documents.length, loadError]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    previousBodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousBodyOverflowRef.current;
      previousBodyOverflowRef.current = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const active = document.activeElement;
      if (
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((open) => {
          if (open) {
            setQuery("");
            setSelectedIndex(0);
          } else {
            setLoadError(false);
          }
          return !open;
        });
      } else if (event.key === "/") {
        event.preventDefault();
        setLoadError(false);
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    const handleNavigation = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === "Escape") {
        closeModal();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((index) => (index + 1) % Math.max(1, results.length));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex(
          (index) => (index - 1 + results.length) % Math.max(1, results.length)
        );
      } else if (event.key === "Enter") {
        event.preventDefault();
        const result = results[selectedResultIndex];
        if (result) {
          router.push(result.path);
          closeModal();
        }
      }
    };

    window.addEventListener("keydown", handleNavigation);
    return () => window.removeEventListener("keydown", handleNavigation);
  }, [isOpen, results, selectedResultIndex, router]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-[15vh]"
      onClick={closeModal}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search AlgoForge"
        className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[60vh]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3 bg-muted/20">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedIndex(0);
            }}
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
            <div className="py-12 flex items-center justify-center text-sm text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Loading search index...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {loadError ? (
                <div className="flex flex-col items-center gap-2">
                  <span>Search is temporarily unavailable.</span>
                  <button
                    type="button"
                    onClick={() => setLoadError(false)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                  >
                    Retry
                  </button>
                </div>
              ) : query ? (
                "No results found for “" + query + "”"
              ) : (
                "No results yet."
              )}
            </div>
          ) : (
            results.map((result, index) => {
              const selected = index === selectedResultIndex;
              return (
                <button
                  type="button"
                  key={result.id}
                  className={cn(
                    "w-full flex items-center justify-between rounded-xl px-4 py-3 transition-colors text-left",
                    selected
                      ? "bg-primary/10 text-foreground border border-primary/30"
                      : "hover:bg-muted/40 text-foreground border border-transparent"
                  )}
                  onClick={() => {
                    router.push(result.path);
                    closeModal();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span className="flex flex-col gap-1 min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      {result.number && (
                        <span className="text-xs font-mono font-bold text-primary">
                          #{result.number}
                        </span>
                      )}
                      <span className="text-[9px] uppercase tracking-wider font-semibold opacity-75">
                        {result.type}
                      </span>
                      {result.difficulty && <DifficultyBadge difficulty={result.difficulty} />}
                    </span>
                    <span className="font-medium text-sm truncate">{result.title}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-lg">
                      {result.description}
                    </span>
                  </span>
                  {selected && (
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
