/**
 * Database service layer - D1 query helpers
 */

import type {
  Env,
  Category,
  Product,
  Service,
  GalleryItem,
  Testimonial,
  MediaItem,
  CategoryRow,
  ProductRow,
  ServiceRow,
  GalleryItemRow,
  TestimonialRow,
  MediaRow,
} from "../types";
import { rowToCategory, rowToProduct, rowToGalleryItem, rowToMedia, rowToTestimonial, rowToService } from "../types";

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════

export async function getAllCategories(env: Env): Promise<Category[]> {
  const result = await env.DB.prepare("SELECT * FROM categories ORDER BY display_order ASC")
    .all<CategoryRow>();
  return (result.results || []).map(rowToCategory);
}

export async function getCategoryById(env: Env, id: string): Promise<Category | null> {
  const row = await env.DB.prepare("SELECT * FROM categories WHERE id = ? LIMIT 1")
    .bind(id)
    .first<CategoryRow>();
  return row ? rowToCategory(row) : null;
}

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════

export async function getAllProducts(
  env: Env,
  categoryId?: string,
  tag?: string,
  limit = 50,
  offset = 0
): Promise<{ items: Product[]; total: number }> {
  let query = "SELECT * FROM products WHERE is_published = 1";
  const binds: unknown[] = [];

  if (categoryId) {
    query += " AND category_id = ?";
    binds.push(categoryId);
  }

  if (tag) {
    query += " AND tag = ?";
    binds.push(tag);
  }

  query += " ORDER BY display_order ASC LIMIT ? OFFSET ?";
  binds.push(limit, offset);

  const result = await env.DB.prepare(query).bind(...binds).all<ProductRow>();
  const items = (result.results || []).map((row) => rowToProduct(row));

  // Get total count
  let countQuery = "SELECT COUNT(*) as count FROM products WHERE is_published = 1";
  const countBinds: unknown[] = [];

  if (categoryId) {
    countQuery += " AND category_id = ?";
    countBinds.push(categoryId);
  }

  if (tag) {
    countQuery += " AND tag = ?";
    countBinds.push(tag);
  }

  const countResult = await env.DB.prepare(countQuery).bind(...countBinds).first<{ count: number }>();
  const total = countResult?.count || 0;

  return { items, total };
}

export async function getProductById(
  env: Env,
  id: string,
  opts: { includeUnpublished?: boolean } = {}
): Promise<Product | null> {
  const row = await env.DB.prepare(
    opts.includeUnpublished
      ? "SELECT * FROM products WHERE id = ? LIMIT 1"
      : "SELECT * FROM products WHERE id = ? AND is_published = 1 LIMIT 1"
  )
    .bind(id)
    .first<ProductRow>();

  if (!row) return null;

  let featuredImage: MediaItem | undefined;
  if (row.featured_image_id) {
    const mediaRow = await env.DB.prepare("SELECT * FROM media WHERE id = ? LIMIT 1")
      .bind(row.featured_image_id)
      .first<MediaRow>();
    if (mediaRow) {
      featuredImage = rowToMedia(mediaRow);
    }
  }

  return rowToProduct(row, featuredImage);
}

export async function createProduct(env: Env, product: Omit<Product, "createdAt" | "updatedAt">): Promise<Product> {
  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO products (id, title, description, price_min, price_max, tag, category_id, display_order, is_published, featured_image_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      product.id,
      product.title,
      product.description || null,
      product.priceMin || null,
      product.priceMax || null,
      product.tag || null,
      product.categoryId || null,
      product.displayOrder,
      product.isPublished ? 1 : 0,
      product.featuredImageId || null,
      now,
      now
    )
    .run();

  return {
    ...product,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateProduct(
  env: Env,
  id: string,
  updates: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>
): Promise<Product | null> {
  const now = new Date().toISOString();
  const fields: string[] = [];
  const binds: unknown[] = [];

  if (updates.title !== undefined) {
    fields.push("title = ?");
    binds.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push("description = ?");
    binds.push(updates.description);
  }
  if (updates.priceMin !== undefined) {
    fields.push("price_min = ?");
    binds.push(updates.priceMin);
  }
  if (updates.priceMax !== undefined) {
    fields.push("price_max = ?");
    binds.push(updates.priceMax);
  }
  if (updates.tag !== undefined) {
    fields.push("tag = ?");
    binds.push(updates.tag);
  }
  if (updates.categoryId !== undefined) {
    fields.push("category_id = ?");
    binds.push(updates.categoryId);
  }
  if (updates.displayOrder !== undefined) {
    fields.push("display_order = ?");
    binds.push(updates.displayOrder);
  }
  if (updates.isPublished !== undefined) {
    fields.push("is_published = ?");
    binds.push(updates.isPublished ? 1 : 0);
  }
  if (updates.featuredImageId !== undefined) {
    fields.push("featured_image_id = ?");
    binds.push(updates.featuredImageId);
  }

  if (fields.length === 0) {
    return getProductById(env, id, { includeUnpublished: true });
  }

  fields.push("updated_at = ?");
  binds.push(now);
  binds.push(id);

  await env.DB.prepare(
    `UPDATE products SET ${fields.join(", ")} WHERE id = ?`
  )
    .bind(...binds)
    .run();

  return getProductById(env, id, { includeUnpublished: true });
}

export async function deleteProduct(env: Env, id: string): Promise<boolean> {
  const result = await env.DB.prepare("DELETE FROM products WHERE id = ?")
    .bind(id)
    .run();
  return (result.meta?.changes || 0) > 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICES
// ═══════════════════════════════════════════════════════════════════════════

export async function getAllServices(env: Env, categoryId?: string, limit = 50, offset = 0): Promise<{ items: Service[]; total: number }> {
  let query = "SELECT * FROM services WHERE is_published = 1";
  const binds: unknown[] = [];

  if (categoryId) {
    query += " AND category_id = ?";
    binds.push(categoryId);
  }

  query += " ORDER BY display_order ASC LIMIT ? OFFSET ?";
  binds.push(limit, offset);

  const result = await env.DB.prepare(query).bind(...binds).all<ServiceRow>();
  const items = (result.results || []).map(rowToService);

  const countResult = await env.DB.prepare("SELECT COUNT(*) as count FROM services WHERE is_published = 1")
    .first<{ count: number }>();
  const total = countResult?.count || 0;

  return { items, total };
}

export async function getServiceById(env: Env, id: string): Promise<Service | null> {
  const row = await env.DB.prepare(
    "SELECT * FROM services WHERE id = ? AND is_published = 1 LIMIT 1"
  )
    .bind(id)
    .first<ServiceRow>();
  return row ? rowToService(row) : null;
}

// ═══════════════════════════════════════════════════════════════════════════
// GALLERY
// ═══════════════════════════════════════════════════════════════════════════

export async function getGalleryItems(env: Env, filter = "all", limit = 100, offset = 0): Promise<{ items: GalleryItem[]; total: number }> {
  let query = "SELECT gi.* FROM gallery_items gi WHERE gi.is_published = 1";
  const binds: unknown[] = [];

  if (filter !== "all") {
    query += " AND gi.filters LIKE ?";
    binds.push(`%${filter}%`);
  }

  query += " ORDER BY gi.display_order ASC LIMIT ? OFFSET ?";
  binds.push(limit, offset);

  const result = await env.DB.prepare(query).bind(...binds).all<GalleryItemRow>();

  // Fetch media for each gallery item
  const items: GalleryItem[] = [];
  for (const row of result.results || []) {
    const mediaRow = await env.DB.prepare("SELECT * FROM media WHERE id = ? LIMIT 1")
      .bind(row.media_id)
      .first<MediaRow>();
    const media = mediaRow ? rowToMedia(mediaRow) : undefined;
    items.push(rowToGalleryItem(row, media));
  }

  const countResult = await env.DB.prepare("SELECT COUNT(*) as count FROM gallery_items WHERE is_published = 1")
    .first<{ count: number }>();
  const total = countResult?.count || 0;

  return { items, total };
}

export async function getGalleryItemById(env: Env, id: string): Promise<GalleryItem | null> {
  const row = await env.DB.prepare(
    "SELECT * FROM gallery_items WHERE id = ? AND is_published = 1 LIMIT 1"
  )
    .bind(id)
    .first<GalleryItemRow>();

  if (!row) return null;

  const mediaRow = await env.DB.prepare("SELECT * FROM media WHERE id = ? LIMIT 1")
    .bind(row.media_id)
    .first<MediaRow>();
  const media = mediaRow ? rowToMedia(mediaRow) : undefined;

  return rowToGalleryItem(row, media);
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTIMONIALS
// ═══════════════════════════════════════════════════════════════════════════

export async function getAllTestimonials(env: Env, limit = 10, offset = 0): Promise<{ items: Testimonial[]; total: number }> {
  const result = await env.DB.prepare(
    "SELECT * FROM testimonials WHERE is_published = 1 ORDER BY display_order ASC LIMIT ? OFFSET ?"
  )
    .bind(limit, offset)
    .all<TestimonialRow>();

  const items = (result.results || []).map(rowToTestimonial);

  const countResult = await env.DB.prepare("SELECT COUNT(*) as count FROM testimonials WHERE is_published = 1")
    .first<{ count: number }>();
  const total = countResult?.count || 0;

  return { items, total };
}

// ═══════════════════════════════════════════════════════════════════════════
// MEDIA
// ═══════════════════════════════════════════════════════════════════════════

export async function getMediaById(env: Env, id: string): Promise<MediaItem | null> {
  const row = await env.DB.prepare("SELECT * FROM media WHERE id = ? LIMIT 1")
    .bind(id)
    .first<MediaRow>();
  return row ? rowToMedia(row) : null;
}

export async function mediaIsReferenced(env: Env, mediaId: string): Promise<boolean> {
  const galleryResult = await env.DB.prepare(
    "SELECT COUNT(*) as count FROM gallery_items WHERE media_id = ?"
  )
    .bind(mediaId)
    .first<{ count: number }>();

  if (galleryResult && galleryResult.count > 0) {
    return true;
  }

  const productResult = await env.DB.prepare(
    "SELECT COUNT(*) as count FROM products WHERE featured_image_id = ?"
  )
    .bind(mediaId)
    .first<{ count: number }>();

  return productResult ? productResult.count > 0 : false;
}

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export async function getSiteSettings(env: Env): Promise<Record<string, unknown>> {
  const result = await env.DB.prepare("SELECT * FROM site_settings").all<{ key: string; value: string }>();

  const settings: Record<string, unknown> = {};
  for (const row of result.results || []) {
    try {
      settings[row.key] = JSON.parse(row.value);
    } catch {
      settings[row.key] = row.value;
    }
  }

  return settings;
}
