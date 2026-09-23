"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getServerUserStoreSnapshot,
  getUserStore,
  getUserStoreSnapshot,
  subscribeUserStore,
} from "@/lib/user/store";
import { cn } from "@/lib/utils/cn";

export function BookmarkButton({ slug }: { slug: string }) {
  const state = useSyncExternalStore(
    subscribeUserStore,
    getUserStoreSnapshot,
    getServerUserStoreSnapshot
  );
  const active = state.bookmarks.includes(slug);

  useEffect(() => {
    getUserStore().recordActivity();
  }, [slug]);

  function toggle() {
    getUserStore().toggleBookmark(slug);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggle}
      aria-pressed={active}
      className={cn(active && "border-primary text-primary")}
    >
      <Bookmark className={cn("h-4 w-4", active && "fill-current")} />
      {active ? "Bookmarked" : "Bookmark"}
    </Button>
  );
}
