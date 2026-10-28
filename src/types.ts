/**
 * Core TypeScript types and interfaces for Ratnāvali Boutique API
 */

// ═══════════════════════════════════════════════════════════════════════════
// CLOUDFLARE BINDINGS
// ═══════════════════════════════════════════════════════════════════════════

export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  API_KEY_HASH: string;
  ALLOWED_ORIGINS: string;
  LOG_LEVEL?: string;
  CDN_URL?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// API RESPONSE ENVELOPE
// ═══════════════════════════════════════════════════════════════════════════

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    version: string;
    total?: number;
    limit?: number;
    offset?: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN ENTITIES
// ═══════════════════════════════════════════════════════════════════════════

export interface Category {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  objectKey: string;
  publicUrl: string;
  mimeType: string;
  altText?: string;
  title?: string;
  width?: number;
  height?: number;
  fileSize: number;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  priceMin?: number; // integer paise
  priceMax?: number; // integer paise
  tag?: string;
  categoryId?: string;
  displayOrder: number;
  isPublished: boolean;
  featuredImageId?: string;
  createdAt: string;
  updatedAt: string;
  featuredImage?: MediaItem; // populated on reads
}

export interface Service {
  id: string;
  title: string;
  description?: string;
  categoryId?: string;
  isPublished: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItem {
  id: string;
  mediaId: string;
  filters?: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  media?: MediaItem; // populated on reads
}

export interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  authorLocation?: string;
  authorInitial: string;
  authorColorHex: string;
  isPublished: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  apiKeyHash: string;
  apiKeyPrefix: string;
  description?: string;
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
  revokedAt?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// REQUEST/RESPONSE PAYLOADS
// ═══════════════════════════════════════════════════════════════════════════

export interface CreateProductRequest {
  title: string;
  description?: string;
  priceMin?: number;
  priceMax?: number;
  tag?: string;
  categoryId?: string;
  displayOrder?: number;
  isPublished?: boolean;
  featuredImageId?: string;
}

export interface UpdateProductRequest {
  title?: string;
  description?: string;
  priceMin?: number;
  priceMax?: number;
  tag?: string;
  categoryId?: string;
  displayOrder?: number;
  isPublished?: boolean;
  featuredImageId?: string;
}

export interface CreateServiceRequest {
  title: string;
  description?: string;
  categoryId?: string;
  displayOrder?: number;
  isPublished?: boolean;
}

export interface UpdateServiceRequest {
  title?: string;
  description?: string;
  categoryId?: string;
  displayOrder?: number;
  isPublished?: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  displayOrder?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  displayOrder?: number;
}

export interface CreateGalleryItemRequest {
  mediaId: string;
  filters?: string;
  displayOrder?: number;
  isPublished?: boolean;
}

export interface UpdateGalleryItemRequest {
  mediaId?: string;
  filters?: string;
  displayOrder?: number;
  isPublished?: boolean;
}

export interface CreateTestimonialRequest {
  quote: string;
  authorName: string;
  authorLocation?: string;
  authorInitial: string;
  authorColorHex: string;
  displayOrder?: number;
  isPublished?: boolean;
}

export interface UpdateTestimonialRequest {
  quote?: string;
  authorName?: string;
  authorLocation?: string;
  authorInitial?: string;
  authorColorHex?: string;
  displayOrder?: number;
  isPublished?: boolean;
}

export interface ReorderRequest {
  type: "products" | "services" | "gallery" | "testimonials" | "categories";
  order: Array<{ id: string; displayOrder: number }>;
}

export interface SettingsUpdateRequest {
  [key: string]: Record<string, unknown>;
}

export interface MediaUploadResponse {
  id: string;
  objectKey: string;
  publicUrl: string;
  mimeType: string;
  altText?: string;
  title?: string;
  width?: number;
  height?: number;
  fileSize: number;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export interface ValidationError {
  field: string;
  message: string;
}

export interface AuthContext {
  valid: boolean;
  userId?: string;
  error?: string;
}

export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface QueryResult {
  results?: unknown[];
  success?: boolean;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE ROW TYPES (raw from D1)
// ═══════════════════════════════════════════════════════════════════════════

export interface CategoryRow {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  created_at: string;
}

export interface MediaRow {
  id: string;
  object_key: string;
  public_url: string;
  mime_type: string;
  alt_text?: string;
  title?: string;
  width?: number;
  height?: number;
  file_size: number;
  created_at: string;
}

export interface ProductRow {
  id: string;
  title: string;
  description?: string;
  price_min?: number;
  price_max?: number;
  tag?: string;
  category_id?: string;
  display_order: number;
  is_published: number;
  featured_image_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceRow {
  id: string;
  title: string;
  description?: string;
  category_id?: string;
  is_published: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryItemRow {
  id: string;
  media_id: string;
  filters?: string;
  display_order: number;
  is_published: number;
  created_at: string;
}

export interface TestimonialRow {
  id: string;
  quote: string;
  author_name: string;
  author_location?: string;
  author_initial: string;
  author_color_hex: string;
  is_published: number;
  display_order: number;
  created_at: string;
}

export interface AdminUserRow {
  id: string;
  api_key_hash: string;
  api_key_prefix: string;
  description?: string;
  is_active: number;
  last_used_at?: string;
  created_at: string;
  revoked_at?: string;
}

export interface SiteSettingsRow {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAPPER HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert database row to domain object
 */
export function rowToProduct(row: ProductRow, featuredImage?: MediaItem): Product {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priceMin: row.price_min,
    priceMax: row.price_max,
    tag: row.tag,
    categoryId: row.category_id,
    displayOrder: row.display_order,
    isPublished: row.is_published === 1,
    featuredImageId: row.featured_image_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(featuredImage && { featuredImage }),
  };
}

export function rowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    displayOrder: row.display_order,
    createdAt: row.created_at,
  };
}

export function rowToMedia(row: MediaRow): MediaItem {
  return {
    id: row.id,
    objectKey: row.object_key,
    publicUrl: row.public_url,
    mimeType: row.mime_type,
    altText: row.alt_text,
    title: row.title,
    width: row.width,
    height: row.height,
    fileSize: row.file_size,
    createdAt: row.created_at,
  };
}

export function rowToGalleryItem(row: GalleryItemRow, media?: MediaItem): GalleryItem {
  return {
    id: row.id,
    mediaId: row.media_id,
    filters: row.filters,
    displayOrder: row.display_order,
    isPublished: row.is_published === 1,
    createdAt: row.created_at,
    ...(media && { media }),
  };
}

export function rowToTestimonial(row: TestimonialRow): Testimonial {
  return {
    id: row.id,
    quote: row.quote,
    authorName: row.author_name,
    authorLocation: row.author_location,
    authorInitial: row.author_initial,
    authorColorHex: row.author_color_hex,
    isPublished: row.is_published === 1,
    displayOrder: row.display_order,
    createdAt: row.created_at,
  };
}

export function rowToService(row: ServiceRow): Service {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    categoryId: row.category_id,
    isPublished: row.is_published === 1,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
