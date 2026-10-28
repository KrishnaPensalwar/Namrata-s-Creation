# Ratnāvali Boutique API Contract v1.0

**Date:** 2025-01-15  
**Status:** Public Beta  
**Version:** 1.0  
**Base URL (Dev):** `http://localhost:8787/api/v1`  
**Base URL (Prod):** `https://api.namrata-boutique.com/api/v1` (TBD)

---

## Overview

RESTful JSON API for the Ratnāvali boutique website and Android admin application. All endpoints are versioned under `/api/v1/`.

### Principles

- **Consistent Format:** All responses follow standard envelope structure
- **Versioning:** API is versioned; breaking changes require new version
- **Authentication:** Admin operations use Bearer token (API key)
- **Caching:** Public endpoints are cacheable; responses include `Cache-Control` headers
- **Pagination:** Large datasets support limit/offset pagination
- **Price Format:** All prices in integer paise (₹1 = 100 paise)

---

## Authentication

### Public Endpoints

No authentication required. Open to all CORS-allowed origins.

### Admin Endpoints

All endpoints under `/api/v1/admin/*` require:

```
Authorization: Bearer <API_KEY>
```

**API Key Format:**
- Generated as 32-character URL-safe base64 string
- Stored securely on Android device (Android Keystore)
- Hashed (SHA-256) and stored in D1
- Plaintext never logged or exposed

**Failure Response:**
```
HTTP 401 Unauthorized
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid Authorization header"
  }
}
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { /* actual data */ },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "version": "1.0",
    "total": 12,
    "limit": 50,
    "offset": 0
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field_name": "Specific validation error"
    }
  },
  "meta": {
    "timestamp": "2025-01-15T...",
    "version": "1.0"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Successful GET/PUT/DELETE
- `201 Created` – Successful POST (resource created)
- `204 No Content` – Successful DELETE with no response body
- `400 Bad Request` – Validation failed or malformed request
- `401 Unauthorized` – Authentication failed or missing
- `403 Forbidden` – Access denied
- `404 Not Found` – Resource not found
- `409 Conflict` – Duplicate ID or foreign key violation
- `422 Unprocessable Entity` – Request valid but unprocessable
- `500 Internal Server Error` – Server error

---

## Public Endpoints

### GET /api/v1/content

**Description:** Full website payload (legacy `CONTENT`-shaped). Preferred for the static site bootstrap.

**Response `data`:** `{ meta, brand, whatsapp, nav, marquee, hero, collections, featured, occasions, custom, gallery, about, testimonials, faq, contact, footer }`

Product/gallery image fields use `img` / `src` URLs from media `publicUrl`.

---

### GET /api/v1/site

**Description:** Retrieve site metadata and settings (brand, contact, hours, social).

**Query Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "brand": {
      "name": "RATNĀVALI",
      "tagline": ["HAUTE", "MAHARASHTRIAN", "ATELIER"]
    },
    "contact": {
      "address": "Mayur Colony, Kothrud, Pune, Maharashtra 411038",
      "phone": "+91 98230 45679",
      "whatsapp": "+919823045679",
      "hours": "Monday – Saturday: 10 AM – 7:30 PM IST"
    },
    "social": {
      "instagram": "@ananyacreations.boutique"
    }
  }
}
```

**Cache:** `Cache-Control: public, max-age=3600` (1 hour)

---

### GET /api/v1/categories

**Description:** List all product categories.

**Query Parameters:**
- `limit` (integer, default: 100, max: 1000) – Items per page
- `offset` (integer, default: 0) – Pagination offset

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat-bridal",
      "name": "Bridal",
      "description": "Bridal jewellery and ornaments",
      "displayOrder": 1,
      "createdAt": "2025-01-10T12:00:00Z"
    }
  ],
  "meta": {
    "timestamp": "2025-01-15T...",
    "version": "1.0",
    "total": 5,
    "limit": 100,
    "offset": 0
  }
}
```

---

### GET /api/v1/products

**Description:** List all published products with optional filtering.

**Query Parameters:**
- `categoryId` (string, optional) – Filter by category
- `tag` (string, optional) – Filter by tag (e.g., "Bridal", "Floral")
- `limit` (integer, default: 50, max: 500)
- `offset` (integer, default: 0)
- `sort` (string, default: "displayOrder") – One of: displayOrder, createdAt, priceMin

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "coll-01",
      "title": "Halvyache Dagine",
      "description": "Traditional turmeric & sesame jewellery...",
      "priceMin": 200000,
      "priceMax": 850000,
      "tag": "Bridal",
      "categoryId": "cat-bridal",
      "displayOrder": 1,
      "isPublished": true,
      "featuredImageId": "uuid-...",
      "createdAt": "2025-01-10T12:00:00Z",
      "updatedAt": "2025-01-10T12:00:00Z"
    }
  ],
  "meta": {
    "timestamp": "2025-01-15T...",
    "version": "1.0",
    "total": 12,
    "limit": 50,
    "offset": 0
  }
}
```

**Price Format:** Integer paise (₹2,000 = 200000). Divide by 100 for display.

---

### GET /api/v1/products/:id

**Description:** Retrieve a single product by ID.

**Path Parameters:**
- `id` (string, required) – Product ID (e.g., "coll-01")

**Response:** Single product object (same structure as list).

**Errors:**
- `404 Not Found` – Product not found or not published

---

### GET /api/v1/services

**Description:** List all published services.

**Query Parameters:**
- `categoryId` (string, optional)
- `limit` (integer, default: 50, max: 500)
- `offset` (integer, default: 0)

**Response:** Array of service objects.

---

### GET /api/v1/services/:id

**Description:** Retrieve a single service by ID.

---

### GET /api/v1/gallery

**Description:** List gallery items with optional category filtering.

**Query Parameters:**
- `filter` (string, default: "all") – One of: all, floral, festive, bridal, decor
- `limit` (integer, default: 100, max: 1000)
- `offset` (integer, default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "gal-01",
      "mediaId": "uuid-...",
      "media": {
        "id": "uuid-...",
        "objectKey": "1705347600000-abc123.png",
        "publicUrl": "https://cdn.namrata-boutique.com/1705347600000-abc123.png",
        "mimeType": "image/png",
        "altText": "Gallery 1",
        "width": 1200,
        "height": 800,
        "fileSize": 245000,
        "createdAt": "2025-01-10T..."
      },
      "filters": "all floral bridal",
      "displayOrder": 1,
      "isPublished": true,
      "createdAt": "2025-01-10T..."
    }
  ],
  "meta": {
    "timestamp": "2025-01-15T...",
    "version": "1.0",
    "total": 8,
    "limit": 100,
    "offset": 0
  }
}
```

---

### GET /api/v1/gallery/:id

**Description:** Retrieve a single gallery item by ID.

---

### GET /api/v1/testimonials

**Description:** List all published testimonials.

**Query Parameters:**
- `limit` (integer, default: 10, max: 100)
- `offset` (integer, default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "test-01",
      "quote": "The Halvyache Dagine for my first Makar Sankranti...",
      "authorName": "Ketaki Joshi",
      "authorLocation": "Pune (Kothrud)",
      "authorInitial": "K",
      "authorColorHex": "#5b0218",
      "isPublished": true,
      "displayOrder": 1,
      "createdAt": "2025-01-10T..."
    }
  ],
  "meta": {
    "timestamp": "2025-01-15T...",
    "version": "1.0",
    "total": 3,
    "limit": 10,
    "offset": 0
  }
}
```

---

### GET /api/v1/media/:id

**Description:** Retrieve media metadata (for reference/debugging).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-...",
    "objectKey": "1705347600000-abc123.png",
    "publicUrl": "https://cdn.namrata-boutique.com/1705347600000-abc123.png",
    "mimeType": "image/png",
    "altText": "Bridal ornaments",
    "title": "Featured bridal collection",
    "width": 1200,
    "height": 800,
    "fileSize": 245000,
    "createdAt": "2025-01-10T12:00:00Z"
  }
}
```

---

## Admin Endpoints (Protected)

All require: `Authorization: Bearer <API_KEY>`

### POST /api/v1/admin/products

**Description:** Create a new product.

**Request Body:**
```json
{
  "title": "New Product",
  "description": "Product description",
  "priceMin": 100000,
  "priceMax": 500000,
  "tag": "Bridal",
  "categoryId": "cat-bridal",
  "displayOrder": 1,
  "isPublished": false,
  "featuredImageId": "uuid-..."
}
```

**Validation:**
- `title` (required, non-empty, max 500 chars)
- `priceMin` ≤ `priceMax` (both optional, non-negative)
- `displayOrder` (optional, default: 0)
- `isPublished` (optional, default: true)

**Response:** Created product (201 Created).

**Errors:**
- `400 Bad Request` – Validation failed
- `409 Conflict` – Duplicate product ID

---

### PUT /api/v1/admin/products/:id

**Description:** Update an existing product. All fields optional.

**Request Body:** Same as POST (all fields optional).

**Response:** Updated product (200 OK).

**Errors:**
- `404 Not Found` – Product not found
- `400 Bad Request` – Validation failed

---

### DELETE /api/v1/admin/products/:id

**Description:** Delete a product.

**Response:**
```json
{
  "success": true,
  "data": { "deleted": true }
}
```

**HTTP Status:** 200 OK or 204 No Content

---

### POST /api/v1/admin/media/upload

**Description:** Upload an image file.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `file` (File, required) – PNG/JPEG/WebP, max 10MB
- `altText` (string, required) – Alt text for accessibility
- `title` (string, optional) – Display title

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-...",
    "objectKey": "1705347600000-xyz789.png",
    "publicUrl": "https://cdn.namrata-boutique.com/1705347600000-xyz789.png",
    "mimeType": "image/png",
    "altText": "New image",
    "width": 1200,
    "height": 800,
    "fileSize": 245000,
    "createdAt": "2025-01-15T..."
  }
}
```

**Errors:**
- `400 Bad Request` – Invalid file type, too large, missing alt text
- `409 Conflict` – Duplicate image hash (optional, for idempotency)

---

### DELETE /api/v1/admin/media/:id

**Description:** Delete media. Fails if referenced by published content.

**Response:**
```json
{
  "success": true,
  "data": { "deleted": true }
}
```

**Errors:**
- `404 Not Found` – Media not found
- `409 Conflict` – Media still referenced by gallery items or products

---

## Error Codes Reference

| Code | HTTP | Meaning |
|------|------|---------|
| `BAD_REQUEST` | 400 | Validation failed or malformed input |
| `UNAUTHORIZED` | 401 | Missing or invalid API key |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate or foreign key constraint violation |
| `UNPROCESSABLE_ENTITY` | 422 | Request valid but cannot be processed |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Pagination Convention

All list endpoints support pagination:

```
GET /api/v1/products?limit=50&offset=0
```

**Response metadata:**
```json
"meta": {
  "total": 100,        // Total items in dataset
  "limit": 50,         // Items returned in this response
  "offset": 0,         // Starting position
  "timestamp": "...",
  "version": "1.0"
}
```

**Calculate next page:**
```
next_offset = offset + limit
has_next = (offset + limit) < total
```

---

## Rate Limiting (Future)

Currently no rate limiting. Will be added via Cloudflare Analytics Engine if needed.

---

## CORS Policy

Public endpoints allow CORS from:
- Website domains (production)
- Android app origin (if applicable)
- Local development domains

Configured in `ALLOWED_ORIGINS` environment variable.

**Preflight Response:**
```
OPTIONS /api/v1/...
Access-Control-Allow-Origin: <origin>
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Caching

**Public endpoints:**
- `Cache-Control: public, max-age=3600` (1 hour)
- Clients should respect these headers
- Clear cache after admin mutations (POST, PUT, DELETE)

**Admin endpoints:**
- `Cache-Control: no-cache, no-store` (never cached)

---

## Versioning Strategy

- **Current Version:** v1 (in /api/v1/)
- **Breaking Changes:** Increment to v2, v3, etc.
- **Backwards Compatibility:** Maintained within version
- **Deprecation:** Old versions supported for 6 months minimum
- **Migration Guide:** Provided when new versions released

---

## Examples

### Get All Products

```bash
curl https://api.namrata-boutique.com/api/v1/products?limit=10
```

### Get Single Product

```bash
curl https://api.namrata-boutique.com/api/v1/products/coll-01
```

### Filter by Category

```bash
curl "https://api.namrata-boutique.com/api/v1/products?categoryId=cat-bridal&limit=20"
```

### Create Product (Admin)

```bash
curl -X POST https://api.namrata-boutique.com/api/v1/admin/products \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Bridal Set",
    "description": "...",
    "priceMin": 300000,
    "priceMax": 700000,
    "tag": "Bridal"
  }'
```

### Upload Image (Admin)

```bash
curl -X POST https://api.namrata-boutique.com/api/v1/admin/media/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@image.png" \
  -F "altText=Product image" \
  -F "title=Featured photo"
```

---

**API Contract Version:** 1.0  
**Last Updated:** 2025-01-15  
**Status:** Ready for Android app development
