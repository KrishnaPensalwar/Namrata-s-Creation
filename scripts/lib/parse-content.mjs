import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "../..");

export function loadContent() {
  const file = path.join(ROOT, "data/content.js");
  const src = fs.readFileSync(file, "utf8");
  const window = {};
  new Function("window", src)(window);
  if (!window.CONTENT) throw new Error("Failed to parse window.CONTENT from data/content.js");
  return window.CONTENT;
}

export function parsePriceRange(priceStr) {
  if (!priceStr) return { min: null, max: null };
  const nums = [...String(priceStr).matchAll(/[\d,]+/g)].map((m) =>
    parseInt(m[0].replace(/,/g, ""), 10)
  );
  if (!nums.length) return { min: null, max: null };
  if (nums.length === 1) return { min: nums[0] * 100, max: nums[0] * 100 };
  return { min: nums[0] * 100, max: nums[1] * 100 };
}

export function sqlEscape(value) {
  if (value == null) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

export function sqlJson(obj) {
  return sqlEscape(JSON.stringify(obj));
}

/** Deterministic media id from local path (stable across retries) */
export function mediaIdForPath(relPath) {
  let h = 0;
  const s = relPath.replace(/\\/g, "/");
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  const hex = Math.abs(h).toString(16).padStart(8, "0");
  return `00000000-0000-4000-8000-${hex.padStart(12, "0").slice(0, 12)}`;
}

export function objectKeyForPath(relPath) {
  const base = path.basename(relPath);
  const id = mediaIdForPath(relPath).replace(/-/g, "").slice(0, 12);
  return `seed/${id}-${base}`;
}
