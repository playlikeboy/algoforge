/**
 * Parse kamyu104 index markdown tables into a normalized problem map.
 */
import fs from "node:fs";
import path from "node:path";
import { RAW, GENERATED, CURATED } from "./paths";
import { toSlug, slugFromFilename } from "../src/lib/utils/slug";
import type { Difficulty } from "../src/lib/schema/types";
import { LANGUAGE_MAP } from "../src/lib/schema/types";

export interface ParsedProblemRow {
  number: number;
  title: string;
  slug: string;
  difficulty: Difficulty;
  timeComplexity: string;
  spaceComplexity: string;
  premium: boolean;
  leetcodeUrl: string;
  topics: Set<string>;
  patterns: Set<string>;
  notes: string[];
  solutions: Map<string, { language: string; relativePath: string }>;
  tagRaw: string;
  noteRaw: string;
}

const INDEX_FILES = ["0001-1000.md", "1001-2000.md", "2001-3000.md", "README.md"];

function cleanComplexity(raw: string): string {
  return raw
    .replace(/_/g, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/\s+/g, " ")
    .trim() || "—";
}

function normalizeDifficulty(raw: string): Difficulty {
  const d = raw.trim().toLowerCase();
  if (d.startsWith("easy")) return "Easy";
  if (d.startsWith("hard")) return "Hard";
  return "Medium";
}

function topicSlugFromHeading(heading: string): string {
  return toSlug(heading);
}

function extractPatterns(note: string, topicSlug: string): string[] {
  const patterns = new Set<string>();
  const tokens = note
    .split(/[,;`]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const known: Record<string, string> = {
    "two pointers": "two-pointers",
    "sliding window": "sliding-window",
    "binary search": "binary-search",
    "union find": "union-find",
    "prefix sum": "prefix-sum",
    "hash table": "hash-map",
    "hash map": "hash-map",
    trie: "trie",
    heap: "heap",
    "priority queue": "heap",
    bfs: "queue-bfs",
    dfs: "dfs-backtracking",
    backtracking: "dfs-backtracking",
    dp: "dynamic-programming",
    "dynamic programming": "dynamic-programming",
    greedy: "greedy",
    stack: "stack",
    "mono stack": "stack",
    "monotonic stack": "stack",
    kadane: "kadane",
    "kadane's algorithm": "kadane",
    intervals: "intervals",
    "topological sort": "topological-sort",
    "linked list": "linked-list-pointers",
    "bit manipulation": "bit-manipulation",
    bitmasks: "bit-manipulation",
  };

  for (const t of tokens) {
    const lower = t.toLowerCase().replace(/`/g, "");
    if (known[lower]) patterns.add(known[lower]);
    else if (lower.length > 2 && lower.length < 40) {
      // keep notable algorithm names as patterns when useful
      if (
        lower.includes("algorithm") ||
        lower.includes("sort") ||
        lower.includes("search") ||
        lower.includes("tree") ||
        lower.includes("graph")
      ) {
        patterns.add(toSlug(lower.replace(/`/g, "")));
      }
    }
  }

  // Map topic → default pattern when notes empty
  const topicToPattern: Record<string, string> = {
    "two-pointers": "two-pointers",
    "binary-search": "binary-search",
    "dynamic-programming": "dynamic-programming",
    "breadth-first-search": "queue-bfs",
    "depth-first-search": "dfs-backtracking",
    backtracking: "dfs-backtracking",
    greedy: "greedy",
    stack: "stack",
    queue: "queue-bfs",
    "binary-heap": "heap",
    "hash-table": "hash-map",
    "linked-list": "linked-list-pointers",
    tree: "tree-traversal",
    "binary-search-tree": "tree-traversal",
    graph: "graph-algorithms",
    "bit-manipulation": "bit-manipulation",
  };
  if (patterns.size === 0 && topicToPattern[topicSlug]) {
    patterns.add(topicToPattern[topicSlug]);
  }

  return [...patterns];
}

function parseSolutionLinks(cell: string): Map<string, { language: string; relativePath: string }> {
  const map = new Map<string, { language: string; relativePath: string }>();
  const re = /\[([^\]]+)\]\(\.\/([^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cell))) {
    const language = m[1].trim();
    const relativePath = m[2].trim();
    const slug = LANGUAGE_MAP[language] ?? toSlug(language);
    map.set(slug, { language, relativePath });
  }
  return map;
}

function parseTableRow(line: string, topicSlug: string): ParsedProblemRow | null {
  // Rows look like: 0136 | [Title](url) | [C++](./..) [Python](./..) | _O(n)_ | _O(1)_ | Easy | tag | note
  if (!/^\d{1,4}\s*\|/.test(line.trim()) && !/^\|?\s*\d{1,4}\s*\|/.test(line.trim())) {
    return null;
  }
  const cleaned = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const parts = cleaned.split("|").map((p) => p.trim());
  if (parts.length < 6) return null;

  const num = parseInt(parts[0].replace(/\D/g, ""), 10);
  if (!Number.isFinite(num) || num <= 0) return null;

  const titleCell = parts[1];
  const titleMatch = titleCell.match(/\[([^\]]+)\]\(([^)]+)\)/);
  const title = titleMatch?.[1]?.trim() ?? titleCell.replace(/\[|\]/g, "").trim();
  const leetcodeUrl = titleMatch?.[2]?.trim() ?? `https://leetcode.com/problems/${toSlug(title)}/`;
  const slugFromUrl = leetcodeUrl.match(/problems\/([^/]+)/)?.[1] ?? toSlug(title);
  const slug = slugFromUrl.replace(/\/$/, "");

  const solutions = parseSolutionLinks(parts[2] ?? "");
  // Prefer slug from first solution filename if available
  let finalSlug = slug;
  const firstSol = [...solutions.values()][0];
  if (firstSol) {
    const base = path.basename(firstSol.relativePath);
    finalSlug = slugFromFilename(base) || slug;
  }

  const timeComplexity = cleanComplexity(parts[3] ?? "");
  const spaceComplexity = cleanComplexity(parts[4] ?? "");
  const difficulty = normalizeDifficulty(parts[5] ?? "Medium");
  const tagRaw = parts[6] ?? "";
  const noteRaw = parts[7] ?? "";
  const premium = tagRaw.includes("🔒") || noteRaw.includes("🔒") || titleCell.includes("🔒");

  const patterns = extractPatterns(noteRaw, topicSlug);
  const notes = noteRaw
    .split(/[,;]/)
    .map((n) => n.replace(/`/g, "").trim())
    .filter((n) => n && n !== "🔒");

  return {
    number: num,
    title,
    slug: finalSlug,
    difficulty,
    timeComplexity,
    spaceComplexity,
    premium,
    leetcodeUrl: leetcodeUrl.startsWith("http")
      ? leetcodeUrl
      : `https://leetcode.com/problems/${finalSlug}/`,
    topics: new Set([topicSlug]),
    patterns: new Set(patterns),
    notes,
    solutions,
    tagRaw,
    noteRaw,
  };
}

export function parseAllIndexes(): Map<number, ParsedProblemRow> {
  if (!fs.existsSync(RAW)) {
    throw new Error(`Raw repo not found at ${RAW}. Run npm run fetch first.`);
  }

  const problems = new Map<number, ParsedProblemRow>();
  let currentTopic = "misc";

  for (const file of INDEX_FILES) {
    const full = path.join(RAW, file);
    if (!fs.existsSync(full)) {
      console.warn("Missing index file:", file);
      continue;
    }
    const text = fs.readFileSync(full, "utf8");
    const lines = text.split(/\r?\n/);

    for (const line of lines) {
      const heading = line.match(/^##\s+(.+)/);
      if (heading) {
        const name = heading[1].trim();
        // skip meta headings
        if (
          /solutions|algorithms|database|shell|reference|javascript|pandas|js|pd/i.test(name) &&
          name.length < 20 &&
          !/array|string|tree|graph|search|programming|list|stack|queue|heap|math|sort|pointer|recursion|bit|greedy|design|simulation|geometry|concurrency|sql/i.test(
            name
          )
        ) {
          continue;
        }
        if (name.toLowerCase() === "solutions" || name.toLowerCase() === "reference") continue;
        currentTopic = topicSlugFromHeading(name);
        continue;
      }

      if (line.includes("---") && line.includes("|")) continue; // separator
      if (line.includes("Title") && line.includes("Difficulty")) continue; // header

      const row = parseTableRow(line, currentTopic);
      if (!row) continue;

      const existing = problems.get(row.number);
      if (existing) {
        row.topics.forEach((t) => existing.topics.add(t));
        row.patterns.forEach((p) => existing.patterns.add(p));
        for (const [k, v] of row.solutions) existing.solutions.set(k, v);
        if (row.notes.length) {
          existing.notes = [...new Set([...existing.notes, ...row.notes])];
        }
        // Prefer non-empty complexities
        if (existing.timeComplexity === "—" && row.timeComplexity !== "—") {
          existing.timeComplexity = row.timeComplexity;
        }
        if (existing.spaceComplexity === "—" && row.spaceComplexity !== "—") {
          existing.spaceComplexity = row.spaceComplexity;
        }
      } else {
        problems.set(row.number, row);
      }
    }
  }

  return problems;
}

function main() {
  const problems = parseAllIndexes();
  const outDir = path.join(GENERATED, "_meta");
  fs.mkdirSync(outDir, { recursive: true });

  const serializable = [...problems.values()]
    .sort((a, b) => a.number - b.number)
    .map((p) => ({
      ...p,
      topics: [...p.topics],
      patterns: [...p.patterns],
      solutions: Object.fromEntries(p.solutions),
    }));

  fs.writeFileSync(path.join(outDir, "parsed-index.json"), JSON.stringify(serializable, null, 2));
  console.log(`Parsed ${serializable.length} problems → data/generated/_meta/parsed-index.json`);
}

const isMain = process.argv[1]?.includes("parse-index");
if (isMain) main();
