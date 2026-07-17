import fs from "node:fs";
import path from "node:path";

export const GENERATED_DIR = path.join(process.cwd(), "data", "generated");

export function readGeneratedJson<T>(relativePath: string): T | null {
  const full = path.join(GENERATED_DIR, relativePath);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, "utf8")) as T;
}

export function readGeneratedJsonOrThrow<T>(relativePath: string): T {
  const data = readGeneratedJson<T>(relativePath);
  if (data == null) {
    throw new Error(
      `Missing generated data: ${relativePath}. Run npm run fetch && npm run generate`
    );
  }
  return data;
}

export function listGeneratedSlugs(subdir: string): string[] {
  const dir = path.join(GENERATED_DIR, subdir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}

export function hasGeneratedData(): boolean {
  return fs.existsSync(path.join(GENERATED_DIR, "problems-index.json"));
}
