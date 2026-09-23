"use client";

import { useSyncExternalStore } from "react";
import { getUserStore, type ProgressStatus, getServerUserStoreSnapshot, getUserStoreSnapshot, subscribeUserStore } from "@/lib/user/store";
import { cn } from "@/lib/utils/cn";

export function ConfidenceTracker({ slug }: { slug: string }) {
  const state = useSyncExternalStore(
    subscribeUserStore,
    getUserStoreSnapshot,
    getServerUserStoreSnapshot
  );

  const progress = state.progress[slug];
  const confidence = progress?.confidence ?? 0;
  const status: ProgressStatus = progress?.status ?? "todo";

  function update(confidenceValue: number) {
    const nextStatus: ProgressStatus =
      confidenceValue >= 4 ? "solved" : confidenceValue >= 1 ? "attempted" : "todo";

    getUserStore().setProgress(slug, {
      confidence: confidenceValue,
      status: nextStatus,
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div>
        <p className="text-sm font-semibold">Confidence</p>
        <p className="text-xs text-muted-foreground">Saved locally on this device</p>
      </div>
      <div className="flex gap-1" role="group" aria-label="Confidence rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => update(n)}
            className={cn(
              "h-8 w-8 rounded-md text-sm font-semibold border transition-colors",
              confidence >= n
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted border-border text-muted-foreground hover:border-primary/50"
            )}
            aria-label={`Set confidence ${n}`}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground capitalize">Status: {status}</p>
    </div>
  );
}
