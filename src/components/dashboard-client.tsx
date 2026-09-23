"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import {
  getServerUserStoreSnapshot,
  getUserStoreSnapshot,
  subscribeUserStore,
} from "@/lib/user/store";

export function DashboardClient() {
  const state = useSyncExternalStore(
    subscribeUserStore,
    getUserStoreSnapshot,
    getServerUserStoreSnapshot
  );

  const solved = Object.values(state.progress).filter((p) => p.status === "solved").length;
  const attempted = Object.values(state.progress).filter((p) => p.status === "attempted").length;

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground uppercase">Streak</p>
          <p className="mt-1 text-3xl font-bold">{state.streak.current} days</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground uppercase">Solved</p>
          <p className="mt-1 text-3xl font-bold">{solved}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground uppercase">Attempted</p>
          <p className="mt-1 text-3xl font-bold">{attempted}</p>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-bold mb-3">Bookmarks ({state.bookmarks.length})</h2>
        {state.bookmarks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Bookmark problems from any solution page.{" "}
            <Link href="/problems" className="text-primary hover:underline">
              Browse problems
            </Link>
          </p>
        ) : (
          <ul className="space-y-2">
            {state.bookmarks.map((slug) => (
              <li key={slug}>
                <Link href={`/problems/${slug}`} className="text-primary hover:underline">
                  {slug}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
