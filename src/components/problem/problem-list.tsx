import Link from "next/link";
import { DifficultyBadge } from "@/components/ui/badge";
import type { ProblemIndexEntry } from "@/lib/schema/types";

export function ProblemList({
  problems,
  emptyMessage = "No problems found.",
}: {
  problems: ProblemIndexEntry[];
  emptyMessage?: string;
}) {
  if (problems.length === 0) {
    return <p className="text-muted-foreground text-sm">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/60 text-left">
          <tr>
            <th className="px-3 py-2.5 font-semibold w-16">#</th>
            <th className="px-3 py-2.5 font-semibold">Title</th>
            <th className="px-3 py-2.5 font-semibold hidden sm:table-cell">Difficulty</th>
            <th className="px-3 py-2.5 font-semibold hidden md:table-cell">Topics</th>
          </tr>
        </thead>
        <tbody>
          {problems.map((p) => (
            <tr key={p.slug} className="border-t border-border hover:bg-muted/40">
              <td className="px-3 py-2.5 text-muted-foreground tabular-nums">{p.number}</td>
              <td className="px-3 py-2.5">
                <Link href={`/problems/${p.slug}`} className="font-medium hover:text-primary">
                  {p.title}
                </Link>
              </td>
              <td className="px-3 py-2.5 hidden sm:table-cell">
                <DifficultyBadge difficulty={p.difficulty} />
              </td>
              <td className="px-3 py-2.5 hidden md:table-cell text-muted-foreground">
                {p.topics.slice(0, 3).map((t) => t.replace(/-/g, " ")).join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
