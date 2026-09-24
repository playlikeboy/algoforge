"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { SolutionFile } from "@/lib/schema/types";

import Prism from "prismjs";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-python";
import "prismjs/themes/prism-tomorrow.css";

function getPrismGrammar(langSlug: string) {
  const slug = langSlug.toLowerCase();
  if (slug === "cpp" || slug === "c++") return Prism.languages.cpp;
  if (slug === "python" || slug === "python3" || slug === "py") return Prism.languages.python;
  if (slug === "c") return Prism.languages.c;
  if (slug === "typescript" || slug === "ts") return Prism.languages.typescript;
  if (slug === "javascript" || slug === "js") return Prism.languages.javascript;
  return Prism.languages.clike;
}

export function CodeTabs({
  solutions,
  defaultLang,
}: {
  solutions: Record<string, SolutionFile>;
  defaultLang?: string;
}) {
  const langs = useMemo(() => Object.keys(solutions), [solutions]);
  const [active, setActive] = useState(
    defaultLang && solutions[defaultLang] ? defaultLang : langs[0] ?? ""
  );
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const activeLanguage =
    solutions[active] ? active : defaultLang && solutions[defaultLang] ? defaultLang : langs[0] ?? "";

  const sol = solutions[activeLanguage];

  const highlightedHtml = useMemo(() => {
    if (!sol) return "";
    const grammar = getPrismGrammar(activeLanguage);
    return grammar ? Prism.highlight(sol.code, grammar, active) : sol.code;
  }, [sol, activeLanguage]);

  if (langs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No multi-language solutions loaded for this problem yet.
      </p>
    );
  }

  async function copy() {
    if (!sol) return;
    setCopyError(false);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(sol.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy code:", error);
      setCopyError(true);
      window.setTimeout(() => setCopyError(false), 1800);
    }
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-code-bg text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/30 px-2 py-1.5">
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Language">
          {langs.map((lang) => (
            <button
              key={lang}
              type="button"
              role="tab"
              aria-selected={activeLanguage === lang}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                activeLanguage === lang
                  ? "bg-white/15 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
              onClick={() => setActive(lang)}
            >
              {solutions[lang].language}
            </button>
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="text-slate-300 hover:text-white hover:bg-white/10 h-8"
          onClick={copy}
          aria-label="Copy code"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : copyError ? "Copy failed" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed font-mono max-h-[32rem]">
        <code
          className={`language-${active}`}
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      </pre>
    </div>
  );
}
