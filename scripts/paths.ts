import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "..");
export const DATA = path.join(ROOT, "data");
export const RAW = path.join(DATA, "raw", "LeetCode-Solutions");
export const CURATED = path.join(DATA, "curated");
export const GENERATED = path.join(DATA, "generated");
export const AI_QUEUE = path.join(DATA, "content", "ai-queue");
