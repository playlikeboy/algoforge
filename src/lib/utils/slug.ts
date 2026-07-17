/** Convert titles / filenames to URL-safe slugs. */
export function toSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

export function slugFromFilename(filename: string): string {
  return toSlug(filename.replace(/\.[^.]+$/, ""));
}

export function titleCaseFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
