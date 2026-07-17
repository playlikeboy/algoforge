export type Difficulty = "Easy" | "Medium" | "Hard";
export type ContentStatus = "ready" | "placeholder";

export interface ContentSection {
  id: string;
  title: string;
  bodyMarkdown: string;
  status: ContentStatus;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ParsedProblemLike {
  number: number;
  title: string;
  slug: string;
  difficulty: Difficulty;
  topics: string[];
  patterns: string[];
  timeComplexity: string;
  spaceComplexity: string;
  notes: string[];
  languages: string[];
  hasMultipleSolutions: boolean;
}
