import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";

export const metadata: Metadata = buildMetadata({
  title: "System Design Interview Primer | AlgoForge",
  description: "A concise system design interview framework — requirements, capacity, components, trade-offs.",
  keywords: ["system design interview", "system design primer"],
  canonicalPath: "/system-design",
});

export default function SystemDesignPage() {
  return (
    <div className="container-af py-10 max-w-3xl">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "System design", path: "/system-design" },
        ]}
      />
      <h1 className="mt-4 text-3xl font-bold">System design primer</h1>
      <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
        <p>Use a repeatable loop in every system design interview:</p>
        <ol className="list-decimal ml-5 space-y-2">
          <li>Clarify functional & non-functional requirements.</li>
          <li>Estimate scale (QPS, storage, bandwidth).</li>
          <li>Propose a high-level diagram (clients, API, services, data stores).</li>
          <li>Deep-dive 1–2 components (sharding, caching, queues).</li>
          <li>Discuss failure modes, consistency, and cost trade-offs.</li>
        </ol>
        <p>
          Full interactive design drills are planned for a later AlgoForge release. For now, pair
          this primer with strong DSA via Blind 75 and company tracks.
        </p>
      </div>
    </div>
  );
}
