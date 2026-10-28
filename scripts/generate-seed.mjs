/**
 * Generates db/migrations/0002_seed_from_content.sql from data/content.js
 * Media public_url points at local website assets until R2 migration.
 *
 * Usage: node scripts/generate-seed.mjs
 *        node scripts/generate-seed.mjs --cdn-base http://localhost:8787/media
 */

import fs from "fs";
import path from "path";
import {
  ROOT,
  loadContent,
  parsePriceRange,
  sqlEscape,
  sqlJson,
  mediaIdForPath,
  objectKeyForPath,
} from "./lib/parse-content.mjs";

const args = process.argv.slice(2);
const cdnIdx = args.indexOf("--cdn-base");
const CDN_BASE = cdnIdx >= 0 ? args[cdnIdx + 1].replace(/\/$/, "") : null;
const USE_LOCAL_ASSETS = !CDN_BASE;

const now = new Date().toISOString();
const c = loadContent();
const lines = [];
const report = { media: [], products: [], gallery: [], testimonials: [], settings: [], missingImages: [] };

function push(sql) {
  lines.push(sql);
}

function publicUrlFor(relImg) {
  const normalized = relImg.replace(/^\.\//, "");
  if (USE_LOCAL_ASSETS) {
    // Resolved by website origin (Pages / static server)
    return "/" + normalized.replace(/^\//, "");
  }
  return `${CDN_BASE}/${objectKeyForPath(normalized)}`;
}

function ensureMedia(relImg, alt) {
  const normalized = relImg.replace(/^\.\//, "");
  const abs = path.join(ROOT, normalized);
  if (!fs.existsSync(abs)) {
    report.missingImages.push(normalized);
  }
  const id = mediaIdForPath(normalized);
  const objectKey = objectKeyForPath(normalized);
  const publicUrl = publicUrlFor(normalized);
  let size = 0;
  try {
    size = fs.statSync(abs).size;
  } catch {
    /* missing */
  }
  push(
    `INSERT OR IGNORE INTO media (id, object_key, public_url, mime_type, alt_text, title, width, height, file_size, created_at) VALUES (${sqlEscape(id)}, ${sqlEscape(objectKey)}, ${sqlEscape(publicUrl)}, 'image/png', ${sqlEscape(alt || "")}, NULL, NULL, NULL, ${size}, ${sqlEscape(now)});`
  );
  report.media.push({ id, path: normalized, publicUrl });
  return id;
}

push("-- Auto-generated from data/content.js — do not edit by hand");
push(`-- Generated: ${now}`);
push("-- Re-run: node scripts/generate-seed.mjs");
push("PRAGMA foreign_keys = ON;");
push("");

// Categories from tags
const tags = new Set();
(c.collections?.items || []).forEach((i) => i.tag && tags.add(i.tag));
(c.featured?.items || []).forEach((i) => i.tag && tags.add(i.tag));
let catOrder = 0;
for (const tag of tags) {
  const id = `cat-${tag.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  push(
    `INSERT OR IGNORE INTO categories (id, name, description, display_order, created_at) VALUES (${sqlEscape(id)}, ${sqlEscape(tag)}, NULL, ${catOrder++}, ${sqlEscape(now)});`
  );
}

push("");

// Hero / about images as media (referenced in settings JSON with paths for now)
const heroImages = c.hero?.images || [];
heroImages.forEach((img) => ensureMedia(img.src, img.alt));
if (c.about?.portrait) ensureMedia(c.about.portrait, c.about.portraitAlt || "Artisan");

// Collections → products
let order = 0;
for (const item of c.collections?.items || []) {
  const mediaId = ensureMedia(item.img, item.alt);
  const catId = item.tag ? `cat-${item.tag.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : null;
  push(
    `INSERT OR IGNORE INTO products (id, title, description, price_min, price_max, tag, category_id, display_order, is_published, featured_image_id, created_at, updated_at) VALUES (${sqlEscape(item.id)}, ${sqlEscape(item.title)}, ${sqlEscape(item.desc || "")}, NULL, NULL, ${sqlEscape(item.tag || null)}, ${sqlEscape(catId)}, ${order++}, 1, ${sqlEscape(mediaId)}, ${sqlEscape(now)}, ${sqlEscape(now)});`
  );
  report.products.push(item.id);
}

// Featured → products with prices
order = 100;
for (const item of c.featured?.items || []) {
  const mediaId = ensureMedia(item.img, item.alt);
  const { min, max } = parsePriceRange(item.price);
  const catId = item.tag ? `cat-${item.tag.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : null;
  push(
    `INSERT OR IGNORE INTO products (id, title, description, price_min, price_max, tag, category_id, display_order, is_published, featured_image_id, created_at, updated_at) VALUES (${sqlEscape(item.id)}, ${sqlEscape(item.title)}, ${sqlEscape(item.desc || "")}, ${min ?? "NULL"}, ${max ?? "NULL"}, ${sqlEscape(item.tag || null)}, ${sqlEscape(catId)}, ${order++}, 1, ${sqlEscape(mediaId)}, ${sqlEscape(now)}, ${sqlEscape(now)});`
  );
  report.products.push(item.id);
}

// Gallery
order = 0;
for (const item of c.gallery?.items || []) {
  const mediaId = ensureMedia(item.img, item.alt);
  push(
    `INSERT OR IGNORE INTO gallery_items (id, media_id, filters, display_order, is_published, created_at) VALUES (${sqlEscape(item.id)}, ${sqlEscape(mediaId)}, ${sqlEscape(item.cat || "all")}, ${order++}, 1, ${sqlEscape(now)});`
  );
  report.gallery.push(item.id);
}

// Testimonials
order = 0;
for (const t of c.testimonials?.items || []) {
  push(
    `INSERT OR IGNORE INTO testimonials (id, quote, author_name, author_location, author_initial, author_color_hex, is_published, display_order, created_at) VALUES (${sqlEscape(t.id)}, ${sqlEscape(t.quote)}, ${sqlEscape(t.name)}, ${sqlEscape(t.location || "")}, ${sqlEscape(t.initial)}, ${sqlEscape(t.color)}, 1, ${order++}, ${sqlEscape(now)});`
  );
  report.testimonials.push(t.id);
}

// Site settings (JSON blobs — copy sections that are not relational)
const settings = {
  meta: c.meta,
  brand: c.brand,
  whatsapp: c.whatsapp,
  nav: c.nav,
  marquee: c.marquee,
  hero: c.hero,
  collections: {
    badge: c.collections?.badge,
    title: c.collections?.title,
    subtitle: c.collections?.subtitle,
    enquire: c.collections?.enquire,
  },
  featured: {
    badge: c.featured?.badge,
    title: c.featured?.title,
    subtitle: c.featured?.subtitle,
    cta: c.featured?.cta,
  },
  occasions: c.occasions,
  custom: c.custom,
  gallery: {
    badge: c.gallery?.badge,
    title: c.gallery?.title,
    subtitle: c.gallery?.subtitle,
    view: c.gallery?.view,
    tabs: c.gallery?.tabs,
  },
  about: c.about,
  testimonials: {
    badge: c.testimonials?.badge,
    title: c.testimonials?.title,
    subtitle: c.testimonials?.subtitle,
  },
  faq: c.faq,
  contact: c.contact,
  footer: c.footer,
};

for (const [key, value] of Object.entries(settings)) {
  push(
    `INSERT OR REPLACE INTO site_settings (id, key, value, updated_at) VALUES (${sqlEscape(key)}, ${sqlEscape(key)}, ${sqlJson(value)}, ${sqlEscape(now)});`
  );
  report.settings.push(key);
}

const outPath = path.join(ROOT, "db/seed/0002_seed_from_content.sql");
fs.writeFileSync(outPath, lines.join("\n") + "\n");
const reportPath = path.join(ROOT, "scripts/seed-report.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`Wrote ${outPath}`);
console.log(`Report ${reportPath}`);
console.log(
  JSON.stringify(
    {
      media: report.media.length,
      products: report.products.length,
      gallery: report.gallery.length,
      testimonials: report.testimonials.length,
      settings: report.settings.length,
      missingImages: report.missingImages,
    },
    null,
    2
  )
);
if (report.missingImages.length) {
  console.warn("WARNING: missing image files:", report.missingImages);
  process.exitCode = 1;
}
