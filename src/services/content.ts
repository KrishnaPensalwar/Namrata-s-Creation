/**
 * Assembles website-ready CONTENT payload from D1 (published only).
 * Shape mirrors legacy data/content.js so the static site can swap in place.
 */

import type { Env } from "../types";

function parsePriceToPaiseRange(priceStr: string | undefined): { min?: number; max?: number } {
  if (!priceStr) return {};
  const nums = [...priceStr.matchAll(/[\d,]+/g)].map((m) =>
    parseInt(m[0].replace(/,/g, ""), 10)
  );
  if (nums.length === 0) return {};
  if (nums.length === 1) return { min: nums[0] * 100, max: nums[0] * 100 };
  return { min: nums[0] * 100, max: nums[1] * 100 };
}

function formatPriceRange(min?: number | null, max?: number | null): string | undefined {
  if (min == null && max == null) return undefined;
  const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;
  if (min != null && max != null && min !== max) return `${fmt(min)} – ${fmt(max)}`;
  if (min != null) return fmt(min);
  if (max != null) return fmt(max);
  return undefined;
}

export async function assembleSiteContent(env: Env): Promise<Record<string, unknown>> {
  const settingsRows = await env.DB.prepare("SELECT key, value FROM site_settings").all<{
    key: string;
    value: string;
  }>();

  const settings: Record<string, unknown> = {};
  for (const row of settingsRows.results || []) {
    try {
      settings[row.key] = JSON.parse(row.value);
    } catch {
      settings[row.key] = row.value;
    }
  }

  const products = await env.DB.prepare(
    `SELECT p.*, m.public_url AS image_url, m.alt_text AS image_alt
     FROM products p
     LEFT JOIN media m ON m.id = p.featured_image_id
     WHERE p.is_published = 1
     ORDER BY p.display_order ASC`
  ).all<Record<string, unknown>>();

  const gallery = await env.DB.prepare(
    `SELECT g.*, m.public_url AS image_url, m.alt_text AS image_alt
     FROM gallery_items g
     LEFT JOIN media m ON m.id = g.media_id
     WHERE g.is_published = 1
     ORDER BY g.display_order ASC`
  ).all<Record<string, unknown>>();

  const testimonials = await env.DB.prepare(
    `SELECT * FROM testimonials WHERE is_published = 1 ORDER BY display_order ASC`
  ).all<Record<string, unknown>>();

  const collectionsItems = (products.results || [])
    .filter((p) => String(p.id).startsWith("coll-"))
    .map((p) => ({
      id: p.id,
      img: p.image_url || "",
      alt: p.image_alt || p.title,
      tag: p.tag || "",
      title: p.title,
      desc: p.description || "",
    }));

  const featuredItems = (products.results || [])
    .filter((p) => String(p.id).startsWith("feat-"))
    .map((p) => ({
      id: p.id,
      img: p.image_url || "",
      alt: p.image_alt || p.title,
      tag: p.tag || "",
      title: p.title,
      price: formatPriceRange(p.price_min as number | null, p.price_max as number | null) || "",
      desc: p.description || "",
    }));

  const galleryItems = (gallery.results || []).map((g) => ({
    id: g.id,
    img: g.image_url || "",
    alt: g.image_alt || "Gallery",
    cat: g.filters || "all",
  }));

  const testimonialItems = (testimonials.results || []).map((t) => ({
    id: t.id,
    quote: t.quote,
    initial: t.author_initial,
    color: t.author_color_hex,
    name: t.author_name,
    location: t.author_location || "",
  }));

  const brand = (settings.brand as Record<string, unknown>) || {};
  const whatsapp = (settings.whatsapp as Record<string, unknown>) || {};
  const hero = (settings.hero as Record<string, unknown>) || {};
  const about = (settings.about as Record<string, unknown>) || {};
  const contact = (settings.contact as Record<string, unknown>) || {};
  const footer = (settings.footer as Record<string, unknown>) || {};
  const meta = (settings.meta as Record<string, unknown>) || {};
  const nav = (settings.nav as unknown[]) || [];
  const marquee = (settings.marquee as string) || "";
  const collectionsMeta = (settings.collections as Record<string, unknown>) || {};
  const featuredMeta = (settings.featured as Record<string, unknown>) || {};
  const occasions = (settings.occasions as Record<string, unknown>) || {};
  const custom = (settings.custom as Record<string, unknown>) || {};
  const galleryMeta = (settings.gallery as Record<string, unknown>) || {};
  const testimonialsMeta = (settings.testimonials as Record<string, unknown>) || {};
  const faq = (settings.faq as Record<string, unknown>) || {};

  return {
    meta: {
      title: meta.title || "Ratnāvali",
      description: meta.description || "",
    },
    brand,
    whatsapp,
    nav,
    marquee,
    hero,
    collections: {
      ...collectionsMeta,
      items: collectionsItems.length ? collectionsItems : collectionsMeta.items || [],
    },
    featured: {
      ...featuredMeta,
      items: featuredItems.length ? featuredItems : featuredMeta.items || [],
    },
    occasions,
    custom,
    gallery: {
      ...galleryMeta,
      items: galleryItems.length ? galleryItems : galleryMeta.items || [],
    },
    about,
    testimonials: {
      ...testimonialsMeta,
      items: testimonialItems.length ? testimonialItems : testimonialsMeta.items || [],
    },
    faq,
    contact,
    footer,
  };
}

export { parsePriceToPaiseRange, formatPriceRange };
