/**
 * Generate original educational content sections for a problem.
 * Never copies LeetCode statements — template-driven teaching content.
 */
import type {
  ContentSection,
  Difficulty,
  FaqItem,
  ParsedProblemLike,
} from "./content-types";

function humanList(items: string[]): string {
  if (items.length === 0) return "general problem-solving";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function estMinutes(difficulty: Difficulty, patterns: string[]): number {
  let base = difficulty === "Easy" ? 20 : difficulty === "Medium" ? 35 : 50;
  if (patterns.includes("dynamic-programming")) base += 10;
  if (patterns.includes("graph-algorithms")) base += 8;
  return base;
}

export function generateContent(p: ParsedProblemLike): {
  content: ContentSection[];
  faqs: FaqItem[];
  studyChecklist: string[];
  revisionNotes: string;
  visualizationDescription: string;
  estimatedMinutes: number;
} {
  const topicStr = humanList(p.topics.map((t) => t.replace(/-/g, " ")));
  const patternStr = humanList(p.patterns.map((t) => t.replace(/-/g, " ")));
  const notesHint = p.notes.length
    ? ` Official solution notes mention: ${p.notes.slice(0, 4).join(", ")}.`
    : "";

  const beginner: ContentSection = {
    id: "beginner",
    title: "Beginner Explanation",
    status: "ready",
    bodyMarkdown: `## What is ${p.title}?

**${p.title}** (LeetCode #${p.number}) is a **${p.difficulty}** problem that primarily trains **${topicStr}**.

### How to think about it

1. **Restate the goal** in your own words before coding.
2. Work a **tiny example** by hand so the invariant becomes obvious.
3. Identify the **pattern** — this problem aligns with **${patternStr}**.
4. Only then translate the idea into code.

### Why this problem matters

${p.difficulty === "Easy" ? "It builds core muscle memory you will reuse on harder variants." : p.difficulty === "Medium" ? "It sits in the sweet spot of interview difficulty: multiple valid approaches, clear trade-offs." : "Hard problems force you to combine patterns and prove complexity carefully — interview gold."}
${notesHint}

> AlgoForge explanations are original teaching notes. Always open the [official problem statement on LeetCode](https://leetcode.com/problems/${p.slug}/) for constraints and examples.
`,
  };

  const interview: ContentSection = {
    id: "interview",
    title: "Interview Walkthrough",
    status: "ready",
    bodyMarkdown: `## Interview approach for ${p.title}

### Opening (30–60 seconds)

- Clarify inputs/outputs and edge cases (empty input, single element, duplicates, overflow).
- State a **brute force** so the interviewer knows you can solve it naively.
- Propose the **optimal direction** tied to **${patternStr}**.

### Core solution narrative

1. Define the **state** you track (pointers, DP cell, set membership, stack top, etc.).
2. Explain the **transition** when you process the next element.
3. Call out **time** (${p.timeComplexity}) and **space** (${p.spaceComplexity}) before coding.
4. Code cleanly; narrate variable names.

### What interviewers listen for

- Correctness on edge cases
- Complexity honesty
- Ability to discuss **trade-offs** (e.g., hash map space vs. sort + two pointers)

### Follow-up questions they may ask

- Can you solve it with less memory?
- What if the input stream is infinite / doesn't fit in RAM?
- How would tests look for adversarial inputs?
`,
  };

  const optimized: ContentSection = {
    id: "optimized",
    title: "Optimized Approach",
    status: "ready",
    bodyMarkdown: `## Optimized solution notes

The reference solutions on AlgoForge target **${p.timeComplexity}** time and **${p.spaceComplexity}** space.

### Pattern focus: ${patternStr}

Use the pattern as a checklist:

${p.patterns.map((pat) => `- **${pat.replace(/-/g, " ")}** — confirm the invariant holds after each step`).join("\n") || "- Identify the dominant pattern and stick to one clear invariant"}

${
  p.hasMultipleSolutions
    ? "Multiple methods appear in the source solutions — compare them and explain when each is preferable."
    : "Start from the primary solution, then rewrite from memory to lock it in."
}

### Implementation tips

- Prefer readable names over micro-optimizations in interviews.
- Extract helpers only when they clarify (e.g., expand-around-center, DFS visit).
- After AC-level logic, re-scan for off-by-one and null checks.
`,
  };

  const complexity: ContentSection = {
    id: "complexity",
    title: "Complexity Analysis",
    status: "ready",
    bodyMarkdown: `## Complexity

| Measure | Bound |
|--------|-------|
| Time | **${p.timeComplexity}** |
| Space | **${p.spaceComplexity}** |

### How to justify this in an interview

- **Time:** count loops, map/set operations, and recursive branching; state average vs worst case if relevant.
- **Space:** include hash maps, recursion stack, and output allocation when the problem asks for it.

If your implementation differs from the reference, re-derive big-O from *your* code — never memorize a complexity you cannot defend.
`,
  };

  const mistakes: ContentSection = {
    id: "common-mistakes",
    title: "Common Mistakes",
    status: "ready",
    bodyMarkdown: `## Common mistakes on ${p.title}

1. **Skipping edge cases** — empty collections, single-element inputs, max constraints.
2. **Wrong invariant** for ${patternStr} — updating state too early or too late.
3. **Mutating input unexpectedly** when the problem forbids it.
4. **Off-by-one** in windows, ranges, or binary search bounds.
5. **Ignoring overflow / precision** for integer arithmetic problems.
6. **Overengineering** — jumping to an advanced structure when a simpler approach works.
`,
  };

  const alternatives: ContentSection = {
    id: "alternatives",
    title: "Alternative Approaches",
    status: p.hasMultipleSolutions ? "ready" : "placeholder",
    bodyMarkdown: p.hasMultipleSolutions
      ? `## Alternatives

The source file includes more than one method. Compare:

1. **Primary optimized path** — best complexity for typical interviews.
2. **Secondary approach** — often brute force, sorting-based, or space-optimized variant.

Practice articulating **when** you would pick each (constraints, readability, follow-ups).
`
      : `## Alternatives

Placeholder for multi-approach comparison. Future AI content generation can expand:

- Brute force baseline
- Optimal ${patternStr} solution
- Space-optimized rewrite

Prompt slot: expand alternatives for \`${p.slug}\`.
`,
  };

  const edge: ContentSection = {
    id: "edge-cases",
    title: "Edge Cases",
    status: "ready",
    bodyMarkdown: `## Edge cases checklist

- Minimum input size
- Maximum input size / time limits
- Duplicates and already-sorted input
- Negative numbers / zeros (if applicable)
- Disconnected structures (graphs/trees)
- Single path vs branching recursion depth
`,
  };

  const patternRec: ContentSection = {
    id: "pattern-recognition",
    title: "Pattern Recognition",
    status: "ready",
    bodyMarkdown: `## Spotting this pattern

Signal phrases that point to **${patternStr}**:

- Sorted input or ability to sort without changing the answer class
- Need for contiguous subarray / substring → consider sliding window
- Need for O(1) membership → hash set/map
- Optimal substructure + overlapping subproblems → DP
- Connectivity / components → graph DFS/BFS or Union-Find

Primary topics: **${topicStr}**.
`,
  };

  const followups: ContentSection = {
    id: "follow-ups",
    title: "Follow-up Interview Questions",
    status: "ready",
    bodyMarkdown: `## Follow-ups

1. How does the solution change if the input is a stream?
2. Can you solve it in-place?
3. What if duplicates must be handled differently?
4. How would you parallelize the approach?
5. Design tests that would break a buggy implementation.
`,
  };

  const practice: ContentSection = {
    id: "practice",
    title: "Practice Recommendations",
    status: "ready",
    bodyMarkdown: `## What to practice next

1. Re-solve **${p.title}** in a second language (${p.languages.slice(0, 3).join(", ") || "Python"}).
2. Drill 3–5 more problems tagged **${p.topics[0]?.replace(/-/g, " ") ?? "arrays"}**.
3. Teach the solution out loud in under 5 minutes.
4. Add this problem to your revision calendar in 3 days and 14 days.
`,
  };

  const faqs: FaqItem[] = [
    {
      question: `What is the time complexity of ${p.title}?`,
      answer: `The reference solutions aim for ${p.timeComplexity} time and ${p.spaceComplexity} space. Always re-derive complexity from the code you write in the interview.`,
    },
    {
      question: `What pattern does ${p.title} use?`,
      answer: `It primarily maps to ${patternStr}, within the broader topic of ${topicStr}.`,
    },
    {
      question: `Is ${p.title} good for interviews?`,
      answer: `Yes — as a ${p.difficulty} problem it is a solid practice target. Pair it with related problems in the same pattern family for spaced repetition.`,
    },
    {
      question: `Where can I read the official statement?`,
      answer: `Open the official LeetCode page for constraints and examples: https://leetcode.com/problems/${p.slug}/`,
    },
  ];

  const studyChecklist = [
    "Read the official problem statement on LeetCode",
    "Solve on paper / whiteboard first",
    `Implement the ${patternStr} approach`,
    "Verify edge cases from the checklist",
    "State time and space complexity aloud",
    "Compare with the AlgoForge reference solution",
    "Schedule a revision session",
  ];

  const revisionNotes = `${p.title} (#${p.number}) — ${p.difficulty}. Pattern: ${patternStr}. Complexity: ${p.timeComplexity} time / ${p.spaceComplexity} space. Re-derive the invariant before coding.`;

  const visualizationDescription = `Conceptual diagram for ${p.title}: show input structure (${topicStr}), highlight the moving parts of the ${patternStr} approach, and annotate each step with the maintained invariant and complexity.`;

  return {
    content: [
      beginner,
      interview,
      optimized,
      complexity,
      mistakes,
      alternatives,
      edge,
      patternRec,
      followups,
      practice,
    ],
    faqs,
    studyChecklist,
    revisionNotes,
    visualizationDescription,
    estimatedMinutes: estMinutes(p.difficulty, p.patterns),
  };
}
