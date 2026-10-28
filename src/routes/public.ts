/**
 * Public API routes (read-only, no authentication required)
 */

import type { Env } from "../types";
import { success, notFound, badRequest, corsHeaders, serverError } from "../utils/response";
import {
  validatePaginationParams,
  getStringParam,
  validateGalleryFilter,
  getNumberParam,
} from "../utils/validation";
import {
  getAllCategories,
  getAllProducts,
  getProductById,
  getAllServices,
  getServiceById,
  getGalleryItems,
  getGalleryItemById,
  getAllTestimonials,
  getSiteSettings,
  getMediaById,
} from "../services/db";
import { assembleSiteContent } from "../services/content";

/**
 * Route public requests
 */
export async function handlePublicRoutes(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  try {
    // GET /api/v1/content — full website payload (CONTENT-shaped)
    if (path === "/api/v1/content" && method === "GET") {
      const content = await assembleSiteContent(env);
      return success(content);
    }

    // GET /api/v1/site
    if (path === "/api/v1/site" && method === "GET") {
      const settings = await getSiteSettings(env);
      return success(settings);
    }

    // GET /api/v1/categories
    if (path === "/api/v1/categories" && method === "GET") {
      const { limit, offset, error: paginationError } = validatePaginationParams(
        url.searchParams.get("limit"),
        url.searchParams.get("offset")
      );

      if (paginationError) {
        return badRequest("Invalid pagination parameters", { limit, offset });
      }

      const categories = await getAllCategories(env);
      const paginated = categories.slice(offset, offset + limit);

      return success(paginated, 200, { total: categories.length, limit, offset });
    }

    // GET /api/v1/products
    if (path === "/api/v1/products" && method === "GET") {
      const { limit, offset, error: paginationError } = validatePaginationParams(
        url.searchParams.get("limit"),
        url.searchParams.get("offset")
      );

      if (paginationError) {
        return badRequest("Invalid pagination parameters");
      }

      const categoryId = getStringParam(url.searchParams, "categoryId");
      const tag = getStringParam(url.searchParams, "tag");

      const { items, total } = await getAllProducts(env, categoryId || undefined, tag || undefined, limit, offset);

      return success(items, 200, { total, limit, offset });
    }

    // GET /api/v1/products/:id
    if (path.match(/^\/api\/v1\/products\/[^/]+$/) && method === "GET") {
      const id = path.split("/").pop();
      if (!id) return notFound();

      const product = await getProductById(env, id);
      if (!product) {
        return notFound("Product not found");
      }

      return success(product);
    }

    // GET /api/v1/services
    if (path === "/api/v1/services" && method === "GET") {
      const { limit, offset, error: paginationError } = validatePaginationParams(
        url.searchParams.get("limit"),
        url.searchParams.get("offset")
      );

      if (paginationError) {
        return badRequest("Invalid pagination parameters");
      }

      const categoryId = getStringParam(url.searchParams, "categoryId");
      const { items, total } = await getAllServices(env, categoryId || undefined, limit, offset);

      return success(items, 200, { total, limit, offset });
    }

    // GET /api/v1/services/:id
    if (path.match(/^\/api\/v1\/services\/[^/]+$/) && method === "GET") {
      const id = path.split("/").pop();
      if (!id) return notFound();

      const service = await getServiceById(env, id);
      if (!service) {
        return notFound("Service not found");
      }

      return success(service);
    }

    // GET /api/v1/gallery
    if (path === "/api/v1/gallery" && method === "GET") {
      const { limit, offset, error: paginationError } = validatePaginationParams(
        url.searchParams.get("limit"),
        url.searchParams.get("offset")
      );

      if (paginationError) {
        return badRequest("Invalid pagination parameters");
      }

      const filter = getStringParam(url.searchParams, "filter") || "all";
      const filterError = validateGalleryFilter(filter);
      if (filterError) {
        return badRequest("Invalid filter", { filter });
      }

      const { items, total } = await getGalleryItems(env, filter, limit, offset);

      return success(items, 200, { total, limit, offset });
    }

    // GET /api/v1/gallery/:id
    if (path.match(/^\/api\/v1\/gallery\/[^/]+$/) && method === "GET") {
      const id = path.split("/").pop();
      if (!id) return notFound();

      const item = await getGalleryItemById(env, id);
      if (!item) {
        return notFound("Gallery item not found");
      }

      return success(item);
    }

    // GET /api/v1/testimonials
    if (path === "/api/v1/testimonials" && method === "GET") {
      const { limit, offset } = validatePaginationParams(
        url.searchParams.get("limit"),
        url.searchParams.get("offset")
      );

      const { items, total } = await getAllTestimonials(env, limit, offset);

      return success(items, 200, { total, limit, offset });
    }

    // GET /api/v1/media/:id (metadata only)
    if (path.match(/^\/api\/v1\/media\/[^/]+$/) && method === "GET") {
      const id = path.split("/").pop();
      if (!id) return notFound();

      const media = await getMediaById(env, id);
      if (!media) {
        return notFound("Media not found");
      }

      return success(media);
    }

    return notFound("Public endpoint not found");
  } catch (err) {
    console.error("Public route error:", err);
    return serverError("Internal server error");
  }
}
