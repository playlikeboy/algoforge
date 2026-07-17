import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { DashboardClient } from "@/components/dashboard-client";

export const metadata: Metadata = buildMetadata({
  title: "Progress Dashboard | AlgoForge",
  description: "Local progress, bookmarks, streaks, and confidence tracking.",
  keywords: ["leetcode progress", "study streak"],
  canonicalPath: "/dashboard",
});

export default function DashboardPage() {
  return (
    <div className="container-af py-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Dashboard", path: "/dashboard" }]} />
      <h1 className="mt-4 text-3xl font-bold">Progress</h1>
      <p className="mt-2 text-muted-foreground">
        Stored in your browser. Cloud sync lands with premium later.
      </p>
      <div className="mt-8">
        <DashboardClient />
      </div>
    </div>
  );
}
