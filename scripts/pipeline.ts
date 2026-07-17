/**
 * Full generate pipeline: parse → solutions → content → relations → entities → search → landings → manifest
 */
import fs from "node:fs";
import path from "node:path";
import { RAW, GENERATED, CURATED, AI_QUEUE } from "./paths";
import { parseAllIndexes } from "./parse-index";
import { generateContent } from "./generate-content";
import type { Problem, SolutionFile, SearchDocument, SiteManifest, LandingPage } from "../src/lib/schema/types";

const PRIMARY_LANGS = ["python", "cpp", "java", "typescript", "go", "javascript", "rust", "csharp"];

function readJson<T>(file: string, fallback: T): T {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file: string, data: unknown) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function loadSolutionCode(relativePath: string): string | null {
  const full = path.join(RAW, relativePath);
  if (!fs.existsSync(full)) return null;
  try {
    return fs.readFileSync(full, "utf8");
  } catch {
    return null;
  }
}

function detectMultipleMethods(code: string): boolean {
  // Heuristic: more than one def / method at class level beyond constructor
  const defs = code.match(/^\s+def\s+\w+/gm) ?? [];
  const methods = code.match(/^\s+(public|private|protected)?\s*\w+\s+\w+\s*\(/gm) ?? [];
  return defs.length > 1 || methods.length > 2;
}

function jaccard(a: string[], b: string[]): number {
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}

async function main() {
  console.log("=== AlgoForge pipeline ===");
  const t0 = Date.now();

  if (!fs.existsSync(RAW)) {
    console.error("Raw repo missing. Run: npm run fetch");
    process.exit(1);
  }

  // Clean generated problem outputs
  for (const sub of ["problems", "topics", "patterns", "companies", "collections", "roadmaps", "blog", "landings"]) {
    const d = path.join(GENERATED, sub);
    if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
    ensureDir(d);
  }
  ensureDir(AI_QUEUE);

  const companyTags = readJson<Record<string, string[]>>(path.join(CURATED, "company-tags.json"), {});
  const topicsMeta = readJson<{ slug: string; name: string; description: string }[]>(
    path.join(CURATED, "topics.json"),
    []
  );
  const patternsMeta = readJson<
    { slug: string; name: string; description: string; relatedTopics: string[] }[]
  >(path.join(CURATED, "patterns.json"), []);
  const companiesMeta = readJson<{ slug: string; name: string; description: string }[]>(
    path.join(CURATED, "companies.json"),
    []
  );

  console.log("Parsing indexes…");
  const parsed = parseAllIndexes();
  console.log(`  ${parsed.size} unique problems`);

  // Build problems
  const problems: Problem[] = [];
  const slugToProblem = new Map<string, Problem>();
  let aiPlaceholders = 0;

  for (const row of [...parsed.values()].sort((a, b) => a.number - b.number)) {
    const solutions: Record<string, SolutionFile> = {};
    let multi = false;

    for (const [langSlug, sol] of row.solutions) {
      // Prefer primary languages for code body; still list all
      const code =
        PRIMARY_LANGS.includes(langSlug) || row.solutions.size <= 3
          ? loadSolutionCode(sol.relativePath)
          : loadSolutionCode(sol.relativePath);

      if (code == null) continue;
      if (detectMultipleMethods(code)) multi = true;

      solutions[langSlug] = {
        language: sol.language,
        languageSlug: langSlug,
        filename: path.basename(sol.relativePath),
        code,
        sourcePath: sol.relativePath,
      };
    }

    // If no code loaded, still create page with empty solutions
    const languages = Object.keys(solutions);
    const topics = [...row.topics];
    const patterns = [...row.patterns];
    const companies = companyTags[row.slug] ?? [];

    const gen = generateContent({
      number: row.number,
      title: row.title,
      slug: row.slug,
      difficulty: row.difficulty,
      topics,
      patterns,
      timeComplexity: row.timeComplexity,
      spaceComplexity: row.spaceComplexity,
      notes: row.notes,
      languages,
      hasMultipleSolutions: multi,
    });

    for (const section of gen.content) {
      if (section.status === "placeholder") {
        aiPlaceholders++;
        writeJson(path.join(AI_QUEUE, `${row.slug}--${section.id}.json`), {
          slug: row.slug,
          sectionId: section.id,
          prompt: `Write an original educational section "${section.title}" for LeetCode problem ${row.title} (#${row.number}). Topics: ${topics.join(", ")}. Patterns: ${patterns.join(", ")}. Do not copy LeetCode statement.`,
        });
      }
    }

    const problem: Problem = {
      id: String(row.number),
      number: row.number,
      slug: row.slug,
      title: row.title,
      difficulty: row.difficulty,
      topics,
      patterns,
      companies,
      languages,
      timeComplexity: row.timeComplexity,
      spaceComplexity: row.spaceComplexity,
      premium: row.premium,
      leetcodeUrl: row.leetcodeUrl,
      notes: row.notes,
      relatedSlugs: [],
      prevSlug: null,
      nextSlug: null,
      estimatedMinutes: gen.estimatedMinutes,
      content: gen.content,
      solutions,
      seo: {
        title: `${row.title} Solution — ${row.difficulty} | AlgoForge`,
        description: `Original ${row.difficulty} explanation for ${row.title} (LeetCode #${row.number}). Pattern: ${patterns[0]?.replace(/-/g, " ") ?? "algorithms"}. Time ${row.timeComplexity}, space ${row.spaceComplexity}. Multi-language solutions and interview tips.`,
        keywords: [
          row.title,
          `${row.title} solution`,
          `${row.title} leetcode`,
          ...topics,
          ...patterns,
          row.difficulty.toLowerCase(),
        ],
        canonicalPath: `/problems/${row.slug}`,
      },
      faqs: gen.faqs,
      studyChecklist: gen.studyChecklist,
      revisionNotes: gen.revisionNotes,
      visualizationDescription: gen.visualizationDescription,
    };

    // Dedupe by slug (upstream can map multiple IDs to similar titles)
    if (slugToProblem.has(problem.slug)) {
      const existing = slugToProblem.get(problem.slug)!;
      // Prefer the lower problem number as canonical
      if (problem.number < existing.number) {
        const idx = problems.findIndex((x) => x.slug === problem.slug);
        if (idx >= 0) problems[idx] = problem;
        slugToProblem.set(problem.slug, problem);
      }
      continue;
    }
    problems.push(problem);
    slugToProblem.set(problem.slug, problem);
  }

  // Stable sort after potential replacements
  problems.sort((a, b) => a.number - b.number);

  // Related + prev/next
  console.log("Computing relations…");
  for (let i = 0; i < problems.length; i++) {
    const p = problems[i];
    p.prevSlug = i > 0 ? problems[i - 1].slug : null;
    p.nextSlug = i < problems.length - 1 ? problems[i + 1].slug : null;

    const scored = problems
      .filter((o) => o.slug !== p.slug)
      .map((o) => ({
        slug: o.slug,
        score:
          jaccard(p.topics, o.topics) * 2 +
          jaccard(p.patterns, o.patterns) * 3 +
          (p.difficulty === o.difficulty ? 0.2 : 0),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => x.slug);

    p.relatedSlugs = scored;
  }

  // Write problem files + index
  console.log("Writing problem JSON…");
  const index = problems.map((p) => ({
    number: p.number,
    slug: p.slug,
    title: p.title,
    difficulty: p.difficulty,
    topics: p.topics,
    patterns: p.patterns,
    companies: p.companies,
    languages: p.languages,
    premium: p.premium,
    timeComplexity: p.timeComplexity,
    spaceComplexity: p.spaceComplexity,
    estimatedMinutes: p.estimatedMinutes,
  }));
  writeJson(path.join(GENERATED, "problems-index.json"), index);

  for (const p of problems) {
    writeJson(path.join(GENERATED, "problems", `${p.slug}.json`), p);
  }

  // Topics
  console.log("Generating topic pages…");
  const topicMap = new Map<string, string[]>();
  for (const p of problems) {
    for (const t of p.topics) {
      if (!topicMap.has(t)) topicMap.set(t, []);
      topicMap.get(t)!.push(p.slug);
    }
  }
  const topicsOut = [];
  for (const [slug, slugs] of topicMap) {
    const meta = topicsMeta.find((t) => t.slug === slug);
    const name = meta?.name ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const entity = {
      type: "topic" as const,
      slug,
      name,
      description:
        meta?.description ??
        `Practice ${name} interview problems with patterns, complexity analysis, and multi-language solutions.`,
      problemCount: slugs.length,
      problemSlugs: slugs,
      seo: {
        title: `${name} Interview Questions & Solutions | AlgoForge`,
        description: `Study ${slugs.length} ${name} problems for coding interviews. Roadmaps, patterns, and original explanations on AlgoForge.`,
        keywords: [name, `${name} leetcode`, `${name} interview questions`, "dsa"],
        canonicalPath: `/topics/${slug}`,
      },
    };
    topicsOut.push(entity);
    writeJson(path.join(GENERATED, "topics", `${slug}.json`), entity);
  }
  writeJson(path.join(GENERATED, "topics-index.json"), topicsOut);

  // Patterns
  console.log("Generating pattern pages…");
  const patternMap = new Map<string, string[]>();
  for (const p of problems) {
    for (const pat of p.patterns) {
      if (!patternMap.has(pat)) patternMap.set(pat, []);
      patternMap.get(pat)!.push(p.slug);
    }
  }
  const patternsOut = [];
  for (const [slug, slugs] of patternMap) {
    const meta = patternsMeta.find((t) => t.slug === slug);
    const name = meta?.name ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const entity = {
      type: "pattern" as const,
      slug,
      name,
      description: meta?.description ?? `Master the ${name} coding pattern with curated problems.`,
      problemCount: slugs.length,
      problemSlugs: slugs,
      relatedTopics: meta?.relatedTopics ?? [],
      seo: {
        title: `${name} Pattern — Problems & Guide | AlgoForge`,
        description: `Learn the ${name} pattern with ${slugs.length} practice problems, interview tips, and visual intuition.`,
        keywords: [name, `${name} pattern`, `${name} leetcode`, "coding patterns"],
        canonicalPath: `/patterns/${slug}`,
      },
    };
    patternsOut.push(entity);
    writeJson(path.join(GENERATED, "patterns", `${slug}.json`), entity);
  }
  writeJson(path.join(GENERATED, "patterns-index.json"), patternsOut);

  // Companies
  console.log("Generating company pages…");
  const companyMap = new Map<string, string[]>();
  for (const p of problems) {
    for (const c of p.companies) {
      if (!companyMap.has(c)) companyMap.set(c, []);
      companyMap.get(c)!.push(p.slug);
    }
  }
  // Ensure curated companies exist even if empty
  for (const c of companiesMeta) {
    if (!companyMap.has(c.slug)) companyMap.set(c.slug, []);
  }
  const companiesOut = [];
  for (const [slug, slugs] of companyMap) {
    const meta = companiesMeta.find((t) => t.slug === slug);
    const name = meta?.name ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const entity = {
      type: "company" as const,
      slug,
      name,
      description:
        meta?.description ??
        `Coding interview preparation for ${name}: high-frequency patterns and problem sets.`,
      problemCount: slugs.length,
      problemSlugs: slugs,
      seo: {
        title: `${name} Coding Interview Questions | AlgoForge`,
        description: `Prepare for ${name} interviews with ${slugs.length || "curated"} problems, patterns, and roadmaps.`,
        keywords: [`${name} interview questions`, `${name} leetcode`, `${name} oa`],
        canonicalPath: `/companies/${slug}`,
      },
    };
    companiesOut.push(entity);
    writeJson(path.join(GENERATED, "companies", `${slug}.json`), entity);
  }
  writeJson(path.join(GENERATED, "companies-index.json"), companiesOut);

  // Collections
  console.log("Generating collections…");
  const collectionFiles = [
    path.join(CURATED, "collections", "blind-75.json"),
    path.join(CURATED, "collections", "grind-169.json"),
  ];
  const collectionsOut = [];
  for (const file of collectionFiles) {
    if (!fs.existsSync(file)) continue;
    const col = readJson<{
      slug: string;
      name: string;
      description: string;
      problemSlugs: string[];
    }>(file, { slug: "", name: "", description: "", problemSlugs: [] });
    const existing = col.problemSlugs.filter((s) => slugToProblem.has(s));
    const entity = {
      slug: col.slug,
      name: col.name,
      description: col.description,
      problemSlugs: existing,
      seo: {
        title: `${col.name} — Track & Solutions | AlgoForge`,
        description: col.description,
        keywords: [col.name, "leetcode list", "interview prep"],
        canonicalPath: `/${col.slug}`,
      },
    };
    collectionsOut.push(entity);
    writeJson(path.join(GENERATED, "collections", `${col.slug}.json`), entity);
  }
  // Neetcode alternatives collection (meta)
  const neet = {
    slug: "neetcode-alternatives",
    name: "NeetCode Alternatives",
    description:
      "A free AlgoForge path covering the same pattern curriculum as popular NeetCode lists — Blind 75 core plus expanded pattern drills.",
    problemSlugs: (collectionsOut.find((c) => c.slug === "blind-75")?.problemSlugs ?? []).slice(0, 75),
    seo: {
      title: "NeetCode Alternatives — Free Pattern Roadmap | AlgoForge",
      description:
        "Looking for NeetCode alternatives? AlgoForge offers free pattern roadmaps, Blind 75, Grind 169, and original explanations.",
      keywords: ["neetcode alternatives", "neetcode free", "blind 75", "pattern roadmap"],
      canonicalPath: "/neetcode-alternatives",
    },
  };
  collectionsOut.push(neet);
  writeJson(path.join(GENERATED, "collections", "neetcode-alternatives.json"), neet);
  writeJson(path.join(GENERATED, "collections-index.json"), collectionsOut);

  // Roadmaps
  console.log("Generating roadmaps…");
  const roadmaps = [
    {
      slug: "dynamic-programming",
      name: "Dynamic Programming Roadmap",
      description: "From 1D DP to grids, knapsacks, and LIS — a structured DP interview path.",
      steps: [
        {
          title: "1D foundations",
          description: "Climbing Stairs, House Robber, Coin Change",
          problemSlugs: ["climbing-stairs", "house-robber", "coin-change"].filter((s) =>
            slugToProblem.has(s)
          ),
          patternSlugs: ["dynamic-programming"],
        },
        {
          title: "Sequences & strings",
          description: "LIS, LCS, Word Break, Decode Ways",
          problemSlugs: [
            "longest-increasing-subsequence",
            "longest-common-subsequence",
            "word-break",
            "decode-ways",
          ].filter((s) => slugToProblem.has(s)),
        },
        {
          title: "Grids & paths",
          description: "Unique Paths, Maximal Square, Dungeon Game",
          problemSlugs: ["unique-paths", "maximal-square"].filter((s) => slugToProblem.has(s)),
        },
      ],
      seo: {
        title: "Dynamic Programming Roadmap for Interviews | AlgoForge",
        description:
          "A complete DP interview roadmap with ordered problems, patterns, and original explanations.",
        keywords: ["dynamic programming roadmap", "dp interview", "leetcode dp"],
        canonicalPath: "/roadmaps/dynamic-programming",
      },
    },
    {
      slug: "graph",
      name: "Graph Algorithms Roadmap",
      description: "BFS, DFS, Union-Find, topological sort, and shortest paths for interviews.",
      steps: [
        {
          title: "BFS & DFS",
          description: "Number of Islands, Clone Graph, Course Schedule",
          problemSlugs: ["number-of-islands", "clone-graph", "course-schedule"].filter((s) =>
            slugToProblem.has(s)
          ),
          patternSlugs: ["queue-bfs", "dfs-backtracking"],
        },
        {
          title: "Union-Find & connectivity",
          description: "Redundant Connection style connectivity problems",
          patternSlugs: ["union-find"],
          problemSlugs: (patternMap.get("union-find") ?? []).slice(0, 8),
        },
        {
          title: "Advanced",
          description: "Word Ladder, Cheapest Flights, critical edges",
          problemSlugs: ["word-ladder", "cheapest-flights-within-k-stops"].filter((s) =>
            slugToProblem.has(s)
          ),
        },
      ],
      seo: {
        title: "Graph Interview Roadmap | AlgoForge",
        description: "Master graph interview questions with a step-by-step AlgoForge roadmap.",
        keywords: ["graph roadmap", "graph interview questions", "bfs dfs leetcode"],
        canonicalPath: "/roadmaps/graph",
      },
    },
    {
      slug: "binary-search",
      name: "Binary Search Roadmap",
      description: "Classic search, rotated arrays, and answer-space binary search.",
      steps: [
        {
          title: "Basics",
          description: "Binary Search and boundary patterns",
          problemSlugs: ["binary-search", "first-bad-version"].filter((s) => slugToProblem.has(s)),
          patternSlugs: ["binary-search"],
        },
        {
          title: "Rotated & peaks",
          description: "Rotated sorted array family",
          problemSlugs: [
            "search-in-rotated-sorted-array",
            "find-minimum-in-rotated-sorted-array",
            "find-peak-element",
          ].filter((s) => slugToProblem.has(s)),
        },
      ],
      seo: {
        title: "Binary Search Roadmap | AlgoForge",
        description: "Learn binary search for coding interviews with curated problems.",
        keywords: ["binary search roadmap", "binary search leetcode"],
        canonicalPath: "/roadmaps/binary-search",
      },
    },
    {
      slug: "dsa-fundamentals",
      name: "DSA Fundamentals Roadmap",
      description: "A beginner-to-job path: arrays → hashing → trees → graphs → DP.",
      steps: [
        {
          title: "Arrays & hashing",
          description: "Two Sum, Contains Duplicate, Group Anagrams",
          problemSlugs: ["two-sum", "contains-duplicate", "group-anagrams"].filter((s) =>
            slugToProblem.has(s)
          ),
        },
        {
          title: "Two pointers & windows",
          description: "3Sum, Container With Most Water, Longest Substring",
          problemSlugs: [
            "3sum",
            "container-with-most-water",
            "longest-substring-without-repeating-characters",
          ].filter((s) => slugToProblem.has(s)),
        },
        {
          title: "Trees & graphs",
          description: "Traversals, BST, islands, courses",
          problemSlugs: [
            "invert-binary-tree",
            "validate-binary-search-tree",
            "number-of-islands",
            "course-schedule",
          ].filter((s) => slugToProblem.has(s)),
        },
        {
          title: "Dynamic programming",
          description: "Climbing Stairs through classic DP",
          problemSlugs: ["climbing-stairs", "house-robber", "coin-change"].filter((s) =>
            slugToProblem.has(s)
          ),
        },
      ],
      seo: {
        title: "DSA Roadmap for Coding Interviews | AlgoForge",
        description: "A complete data structures and algorithms roadmap for interview prep.",
        keywords: ["dsa roadmap", "coding interview roadmap", "leetcode roadmap"],
        canonicalPath: "/roadmaps/dsa-fundamentals",
      },
    },
  ];
  for (const r of roadmaps) {
    writeJson(path.join(GENERATED, "roadmaps", `${r.slug}.json`), r);
  }
  writeJson(path.join(GENERATED, "roadmaps-index.json"), roadmaps);

  // Blog seeds
  const blogs = [
    {
      slug: "how-to-master-dynamic-programming",
      title: "How to Master Dynamic Programming for Interviews",
      description: "A practical framework for DP: states, transitions, and problem selection.",
      date: "2026-01-15",
      tags: ["dynamic-programming", "roadmap"],
      readingMinutes: 12,
      bodyMarkdown: `# How to Master Dynamic Programming

Dynamic Programming is not about memorizing 100 problems. It is about **defining state**, **writing transitions**, and **proving complexity**.

## The AlgoForge DP loop

1. Can the problem be solved with recursion + memo?
2. What is the minimal state that captures subproblems?
3. What is the base case?
4. Bottom-up or top-down?

## Problem order

Start with Climbing Stairs → House Robber → Coin Change → LIS → grid paths.

See the [DP roadmap](/roadmaps/dynamic-programming) for a full path.
`,
      seo: {
        title: "How to Master Dynamic Programming | AlgoForge Blog",
        description: "Learn DP for coding interviews with a clear state/transition framework.",
        keywords: ["master dynamic programming", "dp interview guide"],
        canonicalPath: "/blog/how-to-master-dynamic-programming",
      },
    },
    {
      slug: "complete-dfs-guide",
      title: "Complete DFS Guide for Coding Interviews",
      description: "Depth-first search patterns: trees, graphs, backtracking, and pitfalls.",
      date: "2026-02-01",
      tags: ["dfs", "graphs"],
      readingMinutes: 10,
      bodyMarkdown: `# Complete DFS Guide

DFS is the workhorse for trees, graphs, and backtracking.

## Templates

- Recursive tree DFS
- Graph adjacency list DFS with visited set
- Backtracking with choose / explore / unchoose

Practice: [Number of Islands](/problems/number-of-islands), [Clone Graph](/problems/clone-graph).
`,
      seo: {
        title: "Complete DFS Guide | AlgoForge Blog",
        description: "DFS templates for trees, graphs, and backtracking interviews.",
        keywords: ["dfs guide", "depth first search interview"],
        canonicalPath: "/blog/complete-dfs-guide",
      },
    },
    {
      slug: "why-sliding-window-works",
      title: "Why Sliding Window Works",
      description: "The invariant that makes sliding window correct and O(n).",
      date: "2026-02-20",
      tags: ["sliding-window", "patterns"],
      readingMinutes: 8,
      bodyMarkdown: `# Why Sliding Window Works

A sliding window works when the feasibility of a range is **monotonic** as you expand or shrink.

## Template

Maintain left/right pointers and a structure that updates in O(1) or O(log n).

See [Longest Substring Without Repeating Characters](/problems/longest-substring-without-repeating-characters).
`,
      seo: {
        title: "Why Sliding Window Works | AlgoForge Blog",
        description: "Understand the sliding window invariant for interview problems.",
        keywords: ["sliding window", "sliding window pattern"],
        canonicalPath: "/blog/why-sliding-window-works",
      },
    },
  ];
  for (const b of blogs) {
    writeJson(path.join(GENERATED, "blog", `${b.slug}.json`), b);
  }
  writeJson(path.join(GENERATED, "blog-index.json"), blogs);

  // Long-tail landings
  console.log("Generating landings…");
  const landings: LandingPage[] = [];

  for (const company of companiesOut) {
    for (const topic of topicsOut) {
      const slugs = company.problemSlugs.filter((s) => {
        const p = slugToProblem.get(s);
        return p?.topics.includes(topic.slug);
      });
      if (slugs.length < 3) continue;
      const slug = `${company.slug}-${topic.slug}-questions`;
      landings.push({
        slug,
        path: `/explore/${slug}`,
        h1: `Best ${topic.name} Questions for ${company.name}`,
        intro: `A curated set of ${slugs.length} ${topic.name} problems frequently useful for ${company.name} interview prep. Focus on patterns, not brute memorization.`,
        problemSlugs: slugs.slice(0, 40),
        faqs: [
          {
            question: `How many ${topic.name} problems should I do for ${company.name}?`,
            answer: `Quality over quantity: master patterns with ${Math.min(15, slugs.length)} well-understood problems, then expand.`,
          },
          {
            question: `Where should I start?`,
            answer: `Start Easy/Medium in this list, then tackle Hard variants. Pair with the ${topic.name} topic page and related roadmaps.`,
          },
        ],
        relatedLinks: [
          { href: `/companies/${company.slug}`, label: `${company.name} interview hub` },
          { href: `/topics/${topic.slug}`, label: `${topic.name} problems` },
          { href: "/roadmaps", label: "All roadmaps" },
        ],
        seo: {
          title: `Best ${topic.name} Questions for ${company.name} | AlgoForge`,
          description: `Top ${topic.name} coding interview questions for ${company.name}. Practice list, FAQs, and pattern links.`,
          keywords: [
            `${company.name} ${topic.name} questions`,
            `${topic.name} interview`,
            `${company.name} leetcode`,
          ],
          canonicalPath: `/explore/${slug}`,
        },
        kind: "company-topic",
      });
    }
  }

  for (const difficulty of ["Easy", "Medium", "Hard"] as const) {
    for (const pattern of patternsOut) {
      const slugs = pattern.problemSlugs.filter(
        (s) => slugToProblem.get(s)?.difficulty === difficulty
      );
      if (slugs.length < 3) continue;
      const slug = `${difficulty.toLowerCase()}-${pattern.slug}-problems`;
      landings.push({
        slug,
        path: `/explore/${slug}`,
        h1: `${difficulty} ${pattern.name} Problems`,
        intro: `${slugs.length} ${difficulty.toLowerCase()} problems that drill the ${pattern.name} pattern — ideal for focused practice sessions.`,
        problemSlugs: slugs.slice(0, 50),
        faqs: [
          {
            question: `Why practice ${difficulty.toLowerCase()} ${pattern.name} problems?`,
            answer: `Difficulty-scoped drills lock the pattern before you mix constraints on harder variants.`,
          },
        ],
        relatedLinks: [
          { href: `/patterns/${pattern.slug}`, label: `${pattern.name} pattern` },
          { href: `/difficulty/${difficulty.toLowerCase()}`, label: `All ${difficulty} problems` },
        ],
        seo: {
          title: `${difficulty} ${pattern.name} Problems | AlgoForge`,
          description: `Practice ${difficulty.toLowerCase()} ${pattern.name} LeetCode-style problems with explanations and complexity notes.`,
          keywords: [
            `${difficulty.toLowerCase()} ${pattern.name}`,
            `${pattern.name} problems`,
            "leetcode patterns",
          ],
          canonicalPath: `/explore/${slug}`,
        },
        kind: "difficulty-pattern",
      });
    }
  }

  for (const l of landings) {
    writeJson(path.join(GENERATED, "landings", `${l.slug}.json`), l);
  }
  writeJson(path.join(GENERATED, "landings-index.json"), landings.map((l) => ({ slug: l.slug, path: l.path, h1: l.h1 })));

  // Search index
  console.log("Building search index…");
  const searchDocs: SearchDocument[] = [];
  const searchIds = new Set<string>();
  const pushDoc = (doc: SearchDocument) => {
    if (searchIds.has(doc.id)) return;
    searchIds.add(doc.id);
    searchDocs.push(doc);
  };
  for (const p of problems) {
    pushDoc({
      id: `problem:${p.slug}`,
      type: "problem",
      title: p.title,
      slug: p.slug,
      path: `/problems/${p.slug}`,
      description: p.seo.description,
      difficulty: p.difficulty,
      topics: p.topics,
      patterns: p.patterns,
      keywords: [p.title, String(p.number), ...p.topics, ...p.patterns, ...p.companies].join(" "),
    });
  }
  for (const t of topicsOut) {
    pushDoc({
      id: `topic:${t.slug}`,
      type: "topic",
      title: t.name,
      slug: t.slug,
      path: `/topics/${t.slug}`,
      description: t.description,
      keywords: `${t.name} topic`,
    });
  }
  for (const t of patternsOut) {
    pushDoc({
      id: `pattern:${t.slug}`,
      type: "pattern",
      title: t.name,
      slug: t.slug,
      path: `/patterns/${t.slug}`,
      description: t.description,
      keywords: `${t.name} pattern`,
    });
  }
  for (const t of companiesOut) {
    pushDoc({
      id: `company:${t.slug}`,
      type: "company",
      title: t.name,
      slug: t.slug,
      path: `/companies/${t.slug}`,
      description: t.description,
      keywords: `${t.name} interview`,
    });
  }
  for (const c of collectionsOut) {
    pushDoc({
      id: `collection:${c.slug}`,
      type: "collection",
      title: c.name,
      slug: c.slug,
      path: c.seo.canonicalPath,
      description: c.description,
      keywords: c.name,
    });
  }
  for (const b of blogs) {
    pushDoc({
      id: `blog:${b.slug}`,
      type: "blog",
      title: b.title,
      slug: b.slug,
      path: `/blog/${b.slug}`,
      description: b.description,
      keywords: b.tags.join(" "),
    });
  }
  for (const r of roadmaps) {
    pushDoc({
      id: `roadmap:${r.slug}`,
      type: "roadmap",
      title: r.name,
      slug: r.slug,
      path: `/roadmaps/${r.slug}`,
      description: r.description,
      keywords: r.name,
    });
  }
  writeJson(path.join(GENERATED, "search-index.json"), searchDocs);

  // Languages index
  const langMap = new Map<string, string[]>();
  for (const p of problems) {
    for (const lang of p.languages) {
      if (!langMap.has(lang)) langMap.set(lang, []);
      langMap.get(lang)!.push(p.slug);
    }
  }
  writeJson(
    path.join(GENERATED, "languages-index.json"),
    [...langMap.entries()].map(([slug, problemSlugs]) => ({
      slug,
      problemCount: problemSlugs.length,
      problemSlugs,
    }))
  );

  // Difficulty index
  for (const d of ["Easy", "Medium", "Hard"] as const) {
    const slugs = problems.filter((p) => p.difficulty === d).map((p) => p.slug);
    writeJson(path.join(GENERATED, `difficulty-${d.toLowerCase()}.json`), {
      level: d,
      problemSlugs: slugs,
      problemCount: slugs.length,
    });
  }

  // Sitemap entries
  const sitemapPaths = [
    "/",
    "/problems",
    "/topics",
    "/patterns",
    "/companies",
    "/roadmaps",
    "/blog",
    "/guides",
    "/interview-preparation",
    "/system-design",
    "/glossary",
    "/blind-75",
    "/grind-169",
    "/neetcode-alternatives",
    "/pricing",
    "/about",
    "/about/attribution",
    "/search",
    "/practice",
    "/dashboard",
    "/difficulty/easy",
    "/difficulty/medium",
    "/difficulty/hard",
    ...problems.map((p) => `/problems/${p.slug}`),
    ...problems.flatMap((p) => p.languages.map((l) => `/problems/${p.slug}/${l}`)),
    ...topicsOut.map((t) => `/topics/${t.slug}`),
    ...patternsOut.map((t) => `/patterns/${t.slug}`),
    ...companiesOut.map((t) => `/companies/${t.slug}`),
    ...roadmaps.map((r) => `/roadmaps/${r.slug}`),
    ...blogs.map((b) => `/blog/${b.slug}`),
    ...landings.map((l) => l.path),
    ...[...langMap.keys()].map((l) => `/languages/${l}`),
  ];
  writeJson(path.join(GENERATED, "sitemap-paths.json"), sitemapPaths);

  // RSS items
  writeJson(
    path.join(GENERATED, "rss-items.json"),
    blogs.map((b) => ({
      title: b.title,
      description: b.description,
      path: `/blog/${b.slug}`,
      date: b.date,
    }))
  );

  const manifest: SiteManifest = {
    generatedAt: new Date().toISOString(),
    problemCount: problems.length,
    topicCount: topicsOut.length,
    patternCount: patternsOut.length,
    companyCount: companiesOut.length,
    collectionCount: collectionsOut.length,
    landingCount: landings.length,
    languages: [...langMap.keys()],
    version: "0.1.0",
  };
  writeJson(path.join(GENERATED, "site-manifest.json"), manifest);

  const seconds = ((Date.now() - t0) / 1000).toFixed(1);
  console.log("=== Done ===");
  console.log(manifest);
  console.log(`AI placeholder sections queued: ${aiPlaceholders}`);
  console.log(`Sitemap URLs: ${sitemapPaths.length}`);
  console.log(`Elapsed: ${seconds}s`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
