"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { SolutionFile } from "@/lib/schema/types";

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

  if (langs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No multi-language solutions loaded for this problem yet.
      </p>
    );
  }

  const sol = solutions[active];

  async function copy() {
    if (!sol) return;
    await navigator.clipboard.writeText(sol.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-code-bg text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/30 px-2 py-1.5">
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Language">
          {langs.map((lang) => (
            <button
              key={lang}
              role="tab"
              aria-selected={active === lang}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                active === lang
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
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed font-mono max-h-[32rem]">
        <code>{sol?.code}</code>
      </pre>
    </div>
  );
}
