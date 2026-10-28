/**
 * Admin API routes — all require Bearer API key.
 */

import type {
  Env,
  CreateProductRequest,
  UpdateProductRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateGalleryItemRequest,
  UpdateGalleryItemRequest,
  CreateTestimonialRequest,
  UpdateTestimonialRequest,
  CreateServiceRequest,
  UpdateServiceRequest,
  ReorderRequest,
  SettingsUpdateRequest,
} from "../types";
import {
  notFound,
  badRequest,
  success,
  serverError,
  conflict,
} from "../utils/response";
import { requireAuth } from "../middleware/auth";
import {
  validateRequired,
  validateString,
  validatePriceRange,
  collectErrors,
  formatValidationErrors,
  validateHexColor,
} from "../utils/validation";
import { createProduct, updateProduct, deleteProduct } from "../services/db";
import { uploadMedia, deleteMediaSafe } from "../services/media";

function newId(prefix: string): string {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
  let suffix = "";
  for (let i = 0; i < 8; i++) suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${prefix}-${Date.now().toString(36)}-${suffix}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export async function handleAdminRoutes(request: Request, env: Env): Promise<Response> {
  const authError = await requireAuth(request, env);
  if (authError) return authError;

  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  try {
    // ── Products ──────────────────────────────────────────────────────────
    if (path === "/api/v1/admin/products" && method === "POST") {
      const body = (await request.json()) as CreateProductRequest;
      const errors = collectErrors(
        validateRequired(body.title, "title"),
        body.title ? validateString(body.title, "title", 1, 500) : null,
        body.description != null ? validateString(body.description, "description", 0, 5000) : null,
        validatePriceRange(body.priceMin, body.priceMax)
      );
      if (errors.length) return badRequest("Validation failed", formatValidationErrors(errors));

      const id = body.title ? `coll-${Date.now().toString(36)}` : newId("coll");
      const product = await createProduct(env, {
        id,
        title: body.title,
        description: body.description,
        priceMin: body.priceMin,
        priceMax: body.priceMax,
        tag: body.tag,
        categoryId: body.categoryId,
        displayOrder: body.displayOrder ?? 0,
        isPublished: body.isPublished ?? false,
        featuredImageId: body.featuredImageId,
      });
      return success(product, 201);
    }

    if (path.match(/^\/api\/v1\/admin\/products\/[^/]+$/) && method === "PUT") {
      const id = path.split("/").pop()!;
      const existing = await env.DB.prepare("SELECT id FROM products WHERE id = ?").bind(id).first();
      if (!existing) return notFound("Product not found");
      const body = (await request.json()) as UpdateProductRequest;
      const errors = collectErrors(
        body.title != null ? validateString(body.title, "title", 1, 500) : null,
        validatePriceRange(body.priceMin, body.priceMax)
      );
      if (errors.length) return badRequest("Validation failed", formatValidationErrors(errors));
      const updated = await updateProduct(env, id, body);
      return success(updated);
    }

    if (path.match(/^\/api\/v1\/admin\/products\/[^/]+$/) && method === "DELETE") {
      const id = path.split("/").pop()!;
      const deleted = await deleteProduct(env, id);
      if (!deleted) return notFound("Product not found");
      return success({ deleted: true });
    }

    // Admin can read drafts
    if (path === "/api/v1/admin/products" && method === "GET") {
      const result = await env.DB.prepare(
        "SELECT * FROM products ORDER BY display_order ASC"
      ).all();
      return success(result.results || []);
    }

    // ── Categories ────────────────────────────────────────────────────────
    if (path === "/api/v1/admin/categories" && method === "POST") {
      const body = (await request.json()) as CreateCategoryRequest;
      const err = validateRequired(body.name, "name");
      if (err) return badRequest(err.message);
      const id = newId("cat");
      const created = nowIso();
      await env.DB.prepare(
        `INSERT INTO categories (id, name, description, display_order, created_at) VALUES (?, ?, ?, ?, ?)`
      )
        .bind(id, body.name, body.description || null, body.displayOrder ?? 0, created)
        .run();
      return success({ id, name: body.name, description: body.description, displayOrder: body.displayOrder ?? 0, createdAt: created }, 201);
    }

    if (path.match(/^\/api\/v1\/admin\/categories\/[^/]+$/) && method === "PUT") {
      const id = path.split("/").pop()!;
      const body = (await request.json()) as UpdateCategoryRequest;
      const fields: string[] = [];
      const binds: unknown[] = [];
      if (body.name != null) { fields.push("name = ?"); binds.push(body.name); }
      if (body.description != null) { fields.push("description = ?"); binds.push(body.description); }
      if (body.displayOrder != null) { fields.push("display_order = ?"); binds.push(body.displayOrder); }
      if (!fields.length) return badRequest("No fields to update");
      binds.push(id);
      await env.DB.prepare(`UPDATE categories SET ${fields.join(", ")} WHERE id = ?`).bind(...binds).run();
      const row = await env.DB.prepare("SELECT * FROM categories WHERE id = ?").bind(id).first();
      if (!row) return notFound("Category not found");
      return success(row);
    }

    if (path.match(/^\/api\/v1\/admin\/categories\/[^/]+$/) && method === "DELETE") {
      const id = path.split("/").pop()!;
      const r = await env.DB.prepare("DELETE FROM categories WHERE id = ?").bind(id).run();
      if (!(r.meta?.changes || 0)) return notFound("Category not found");
      return success({ deleted: true });
    }

    // ── Services ──────────────────────────────────────────────────────────
    if (path === "/api/v1/admin/services" && method === "POST") {
      const body = (await request.json()) as CreateServiceRequest;
      const err = validateRequired(body.title, "title");
      if (err) return badRequest(err.message);
      const id = newId("svc");
      const t = nowIso();
      await env.DB.prepare(
        `INSERT INTO services (id, title, description, category_id, is_published, display_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(id, body.title, body.description || null, body.categoryId || null, body.isPublished ? 1 : 0, body.displayOrder ?? 0, t, t)
        .run();
      return success({ id, title: body.title, isPublished: !!body.isPublished }, 201);
    }

    if (path.match(/^\/api\/v1\/admin\/services\/[^/]+$/) && method === "PUT") {
      const id = path.split("/").pop()!;
      const body = (await request.json()) as UpdateServiceRequest;
      const fields: string[] = ["updated_at = ?"];
      const binds: unknown[] = [nowIso()];
      if (body.title != null) { fields.push("title = ?"); binds.push(body.title); }
      if (body.description != null) { fields.push("description = ?"); binds.push(body.description); }
      if (body.categoryId != null) { fields.push("category_id = ?"); binds.push(body.categoryId); }
      if (body.displayOrder != null) { fields.push("display_order = ?"); binds.push(body.displayOrder); }
      if (body.isPublished != null) { fields.push("is_published = ?"); binds.push(body.isPublished ? 1 : 0); }
      binds.push(id);
      await env.DB.prepare(`UPDATE services SET ${fields.join(", ")} WHERE id = ?`).bind(...binds).run();
      return success({ id, updated: true });
    }

    if (path.match(/^\/api\/v1\/admin\/services\/[^/]+$/) && method === "DELETE") {
      const id = path.split("/").pop()!;
      const r = await env.DB.prepare("DELETE FROM services WHERE id = ?").bind(id).run();
      if (!(r.meta?.changes || 0)) return notFound("Service not found");
      return success({ deleted: true });
    }

    // ── Gallery ───────────────────────────────────────────────────────────
    if (path === "/api/v1/admin/gallery" && method === "POST") {
      const body = (await request.json()) as CreateGalleryItemRequest;
      const err = validateRequired(body.mediaId, "mediaId");
      if (err) return badRequest(err.message);
      const media = await env.DB.prepare("SELECT id FROM media WHERE id = ?").bind(body.mediaId).first();
      if (!media) return badRequest("mediaId does not exist");
      const id = newId("gal");
      await env.DB.prepare(
        `INSERT INTO gallery_items (id, media_id, filters, display_order, is_published, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
        .bind(id, body.mediaId, body.filters || "all", body.displayOrder ?? 0, body.isPublished === false ? 0 : 1, nowIso())
        .run();
      return success({ id, mediaId: body.mediaId }, 201);
    }

    if (path.match(/^\/api\/v1\/admin\/gallery\/[^/]+$/) && method === "PUT") {
      const id = path.split("/").pop()!;
      const body = (await request.json()) as UpdateGalleryItemRequest;
      const fields: string[] = [];
      const binds: unknown[] = [];
      if (body.mediaId != null) { fields.push("media_id = ?"); binds.push(body.mediaId); }
      if (body.filters != null) { fields.push("filters = ?"); binds.push(body.filters); }
      if (body.displayOrder != null) { fields.push("display_order = ?"); binds.push(body.displayOrder); }
      if (body.isPublished != null) { fields.push("is_published = ?"); binds.push(body.isPublished ? 1 : 0); }
      if (!fields.length) return badRequest("No fields to update");
      binds.push(id);
      await env.DB.prepare(`UPDATE gallery_items SET ${fields.join(", ")} WHERE id = ?`).bind(...binds).run();
      return success({ id, updated: true });
    }

    if (path.match(/^\/api\/v1\/admin\/gallery\/[^/]+$/) && method === "DELETE") {
      const id = path.split("/").pop()!;
      const r = await env.DB.prepare("DELETE FROM gallery_items WHERE id = ?").bind(id).run();
      if (!(r.meta?.changes || 0)) return notFound("Gallery item not found");
      return success({ deleted: true });
    }

    // ── Testimonials ──────────────────────────────────────────────────────
    if (path === "/api/v1/admin/testimonials" && method === "POST") {
      const body = (await request.json()) as CreateTestimonialRequest;
      const errors = collectErrors(
        validateRequired(body.quote, "quote"),
        validateRequired(body.authorName, "authorName"),
        validateRequired(body.authorInitial, "authorInitial"),
        validateRequired(body.authorColorHex, "authorColorHex"),
        body.authorColorHex ? validateHexColor(body.authorColorHex) : null
      );
      if (errors.length) return badRequest("Validation failed", formatValidationErrors(errors));
      const id = newId("test");
      await env.DB.prepare(
        `INSERT INTO testimonials (id, quote, author_name, author_location, author_initial, author_color_hex, is_published, display_order, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          id,
          body.quote,
          body.authorName,
          body.authorLocation || null,
          body.authorInitial,
          body.authorColorHex,
          body.isPublished === false ? 0 : 1,
          body.displayOrder ?? 0,
          nowIso()
        )
        .run();
      return success({ id }, 201);
    }

    if (path.match(/^\/api\/v1\/admin\/testimonials\/[^/]+$/) && method === "PUT") {
      const id = path.split("/").pop()!;
      const body = (await request.json()) as UpdateTestimonialRequest;
      const fields: string[] = [];
      const binds: unknown[] = [];
      if (body.quote != null) { fields.push("quote = ?"); binds.push(body.quote); }
      if (body.authorName != null) { fields.push("author_name = ?"); binds.push(body.authorName); }
      if (body.authorLocation != null) { fields.push("author_location = ?"); binds.push(body.authorLocation); }
      if (body.authorInitial != null) { fields.push("author_initial = ?"); binds.push(body.authorInitial); }
      if (body.authorColorHex != null) { fields.push("author_color_hex = ?"); binds.push(body.authorColorHex); }
      if (body.displayOrder != null) { fields.push("display_order = ?"); binds.push(body.displayOrder); }
      if (body.isPublished != null) { fields.push("is_published = ?"); binds.push(body.isPublished ? 1 : 0); }
      if (!fields.length) return badRequest("No fields to update");
      binds.push(id);
      await env.DB.prepare(`UPDATE testimonials SET ${fields.join(", ")} WHERE id = ?`).bind(...binds).run();
      return success({ id, updated: true });
    }

    if (path.match(/^\/api\/v1\/admin\/testimonials\/[^/]+$/) && method === "DELETE") {
      const id = path.split("/").pop()!;
      const r = await env.DB.prepare("DELETE FROM testimonials WHERE id = ?").bind(id).run();
      if (!(r.meta?.changes || 0)) return notFound("Testimonial not found");
      return success({ deleted: true });
    }

    // ── Settings ──────────────────────────────────────────────────────────
    if (path === "/api/v1/admin/settings" && method === "PUT") {
      const body = (await request.json()) as SettingsUpdateRequest;
      const t = nowIso();
      for (const [key, value] of Object.entries(body)) {
        await env.DB.prepare(
          `INSERT INTO site_settings (id, key, value, updated_at) VALUES (?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
        )
          .bind(key, key, JSON.stringify(value), t)
          .run();
      }
      return success({ updated: Object.keys(body) });
    }

    // ── Reorder ───────────────────────────────────────────────────────────
    if (path === "/api/v1/admin/reorder" && method === "POST") {
      const body = (await request.json()) as ReorderRequest;
      const tableMap: Record<string, string> = {
        products: "products",
        services: "services",
        gallery: "gallery_items",
        testimonials: "testimonials",
        categories: "categories",
      };
      const table = tableMap[body.type];
      if (!table || !Array.isArray(body.order)) {
        return badRequest("Invalid reorder payload");
      }
      for (const item of body.order) {
        await env.DB.prepare(`UPDATE ${table} SET display_order = ? WHERE id = ?`)
          .bind(item.displayOrder, item.id)
          .run();
      }
      return success({ reordered: body.order.length });
    }

    // ── Media upload ──────────────────────────────────────────────────────
    if (path === "/api/v1/admin/media/upload" && method === "POST") {
      const contentType = request.headers.get("Content-Type") || "";
      if (!contentType.includes("multipart/form-data")) {
        return badRequest("Content-Type must be multipart/form-data");
      }
      const form = await request.formData();
      const file = form.get("file");
      const altText = String(form.get("altText") || "").trim();
      const title = form.get("title") ? String(form.get("title")).trim() : undefined;

      if (!altText) return badRequest("altText is required");
      if (!(file instanceof File)) return badRequest("file is required");

      try {
        const buffer = await file.arrayBuffer();
        const media = await uploadMedia(env, {
          bytes: buffer,
          claimedMimeType: file.type || "application/octet-stream",
          altText,
          title,
          requestUrl: request.url,
        });
        return success(media, 201);
      } catch (err) {
        return badRequest(err instanceof Error ? err.message : "Upload failed");
      }
    }

    if (path.match(/^\/api\/v1\/admin\/media\/[^/]+$/) && method === "DELETE") {
      const id = path.split("/").pop()!;
      const result = await deleteMediaSafe(env, id);
      if (result.reason === "not_found") return notFound("Media not found");
      if (result.reason === "referenced") {
        return conflict("Media still referenced by published content; cannot delete");
      }
      return success({ deleted: true });
    }

    return notFound("Admin endpoint not found");
  } catch (err) {
    console.error("Admin route error:", err);
    return serverError("Internal server error");
  }
}
