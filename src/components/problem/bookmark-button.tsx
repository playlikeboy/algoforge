"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserStore } from "@/lib/user/store";
import { cn } from "@/lib/utils/cn";

export function BookmarkButton({ slug }: { slug: string }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const store = getUserStore();
    setActive(store.getState().bookmarks.includes(slug));
    store.recordActivity();
  }, [slug]);

  function toggle() {
    const state = getUserStore().toggleBookmark(slug);
    setActive(state.bookmarks.includes(slug));
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
