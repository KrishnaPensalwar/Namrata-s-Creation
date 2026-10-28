# D1 Database Schema – Ratnāvali Boutique

**Version:** 1.0  
**Database Name:** `namrata_boutique`  
**Engine:** SQLite (Cloudflare D1)  
**Last Updated:** 2025-01-15  

---

## Overview

This schema stores all content for the Ratnāvali boutique website and admin API. It is designed to support:
- Public read-only website access (products, gallery, testimonials)
- Admin write operations (create, update, delete products and media)
- Media storage metadata (R2 integration)
- Site settings and configuration
- Minimal single-user admin authentication

---

## Table Definitions

### 1. `categories`

Product and service categories (e.g., "Bridal", "Floral", "Festive").

```sql
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
```

**Columns:**
- `id` (TEXT, PK): Stable identifier (e.g., "cat-bridal", "cat-floral")
- `name` (TEXT, NOT NULL, UNIQUE): Category display name
- `description` (TEXT, optional): Longer description for filters/UI
- `display_order` (INTEGER): Sort position (0 = first)
- `created_at` (TEXT, ISO 8601): Creation timestamp

**Indexes:**
- `CREATE INDEX idx_categories_display_order ON categories(display_order);`

**Constraints:**
- No duplicate names
- `display_order` auto-ordered for UI rendering

---

### 2. `products`

Individual product/collection items (e.g., "Halvyache Dagine", "Mogra Floral Sets").

```sql
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price_min INTEGER,
  price_max INTEGER,
  tag TEXT,
  category_id TEXT REFERENCES categories(id),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  featured_image_id TEXT REFERENCES media(id),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

**Columns:**
- `id` (TEXT, PK): Stable identifier (e.g., "coll-01", "coll-12")
- `title` (TEXT, NOT NULL): Product name
- `description` (TEXT): Full description
- `price_min` (INTEGER, optional): Minimum price in paise (e.g., ₹2,000 = 200000)
- `price_max` (INTEGER, optional): Maximum price in paise
- `tag` (TEXT, optional): Product tag for filtering (e.g., "Bridal", "Floral", "Heritage")
- `category_id` (TEXT, FK): Reference to parent category
- `display_order` (INTEGER): Sort position for listing
- `is_published` (INTEGER, 0/1): Draft or published (public reads filter this = 1)
- `featured_image_id` (TEXT, FK): Reference to media record for cover image
- `created_at` (TEXT, ISO 8601): Creation timestamp
- `updated_at` (TEXT, ISO 8601): Last modification timestamp

**Indexes:**
```sql
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_published ON products(is_published);
CREATE INDEX idx_products_display_order ON products(display_order);
CREATE INDEX idx_products_featured_image_id ON products(featured_image_id);
```

**Constraints:**
- Foreign key: `category_id` → `categories(id)` (optional)
- Foreign key: `featured_image_id` → `media(id)` (optional)
- `title` required and non-empty
- `price_min` ≤ `price_max` (app-level validation)
- `is_published` always 0 or 1

---

### 3. `services`

Named services (e.g., custom orders, consultations).

```sql
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category_id TEXT REFERENCES categories(id),
  is_published INTEGER NOT NULL DEFAULT 1,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

**Columns:**
- `id` (TEXT, PK): Stable identifier (e.g., "svc-custom-order")
- `title` (TEXT, NOT NULL): Service name
- `description` (TEXT): Service details
- `category_id` (TEXT, FK): Optional grouping
- `is_published` (INTEGER, 0/1): Draft or public
- `display_order` (INTEGER): Sort position
- `created_at` (TEXT, ISO 8601): Creation timestamp
- `updated_at` (TEXT, ISO 8601): Last modification timestamp

**Indexes:**
```sql
CREATE INDEX idx_services_is_published ON services(is_published);
CREATE INDEX idx_services_display_order ON services(display_order);
```

---

### 4. `media`

Image and media file metadata (links to R2 storage).

```sql
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  object_key TEXT NOT NULL UNIQUE,
  public_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  alt_text TEXT,
  title TEXT,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  created_at TEXT NOT NULL
);
```

**Columns:**
- `id` (TEXT, PK): UUID, unique media identifier
- `object_key` (TEXT, NOT NULL, UNIQUE): R2 object key (e.g., "1705347600000-abc123xyz.png")
- `public_url` (TEXT, NOT NULL): Full public CDN URL (e.g., "https://cdn.namrata-boutique.com/...")
- `mime_type` (TEXT, NOT NULL): File type (e.g., "image/png", "image/jpeg")
- `alt_text` (TEXT, optional): Accessibility alt text
- `title` (TEXT, optional): Display title
- `width` (INTEGER, optional): Image width in pixels
- `height` (INTEGER, optional): Image height in pixels
- `file_size` (INTEGER, optional): File size in bytes
- `created_at` (TEXT, ISO 8601): Upload timestamp

**Indexes:**
```sql
CREATE INDEX idx_media_object_key ON media(object_key);
CREATE UNIQUE INDEX idx_media_public_url ON media(public_url);
```

**Constraints:**
- `object_key` unique (no duplicate R2 objects)
- `public_url` unique
- `mime_type` must be image type (app-level validation)

---

### 5. `gallery_items`

Gallery image entries with filtering metadata.

```sql
CREATE TABLE IF NOT EXISTS gallery_items (
  id TEXT PRIMARY KEY,
  media_id TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  filters TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
```

**Columns:**
- `id` (TEXT, PK): Stable identifier (e.g., "gal-01", "gal-08")
- `media_id` (TEXT, FK, NOT NULL): Reference to media record (cascades delete)
- `filters` (TEXT, optional): Space-separated filter tags (e.g., "all floral bridal")
- `display_order` (INTEGER): Sort position within gallery
- `is_published` (INTEGER, 0/1): Draft or public
- `created_at` (TEXT, ISO 8601): Creation timestamp

**Indexes:**
```sql
CREATE INDEX idx_gallery_items_media_id ON gallery_items(media_id);
CREATE INDEX idx_gallery_items_is_published ON gallery_items(is_published);
CREATE INDEX idx_gallery_items_display_order ON gallery_items(display_order);
```

**Constraints:**
- Foreign key: `media_id` → `media(id)` (ON DELETE CASCADE)
- Cascading delete ensures orphaned gallery items removed when media deleted

---

### 6. `testimonials`

Customer testimonials and reviews.

```sql
CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  quote TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_location TEXT,
  author_initial TEXT NOT NULL,
  author_color_hex TEXT NOT NULL,
  is_published INTEGER NOT NULL DEFAULT 1,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
```

**Columns:**
- `id` (TEXT, PK): Stable identifier (e.g., "test-01", "test-03")
- `quote` (TEXT, NOT NULL): Testimonial text
- `author_name` (TEXT, NOT NULL): Customer name
- `author_location` (TEXT, optional): City/region
- `author_initial` (TEXT, NOT NULL): First letter for avatar (single char)
- `author_color_hex` (TEXT, NOT NULL): Avatar background color (e.g., "#5b0218")
- `is_published` (INTEGER, 0/1): Draft or public
- `display_order` (INTEGER): Sort position for carousel
- `created_at` (TEXT, ISO 8601): Creation timestamp

**Indexes:**
```sql
CREATE INDEX idx_testimonials_is_published ON testimonials(is_published);
CREATE INDEX idx_testimonials_display_order ON testimonials(display_order);
```

---

### 7. `site_settings`

Global site configuration (contact, hours, social links, etc.).

```sql
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

**Columns:**
- `id` (TEXT, PK): Unique setting identifier (e.g., "contact", "hours", "brand")
- `key` (TEXT, NOT NULL, UNIQUE): Setting key for lookup
- `value` (TEXT, NOT NULL): JSON-serialized value (e.g., `{"phone": "+91...", "address": "..."}`)
- `updated_at` (TEXT, ISO 8601): Last modification

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_site_settings_key ON site_settings(key);
```

**Format:** All values stored as JSON strings. Example:
```json
{
  "id": "contact",
  "key": "contact",
  "value": "{\"phone\": \"+91 98230 45679\", \"address\": \"Mayur Colony, Kothrud, Pune\", \"whatsapp\": \"+919823045679\"}",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

---

### 8. `admin_users`

Authorized API key holders (minimal; single-user model).

```sql
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  api_key_hash TEXT NOT NULL UNIQUE,
  api_key_prefix TEXT NOT NULL,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  last_used_at TEXT,
  created_at TEXT NOT NULL,
  revoked_at TEXT
);
```

**Columns:**
- `id` (TEXT, PK): UUID, user identifier
- `api_key_hash` (TEXT, NOT NULL, UNIQUE): SHA-256 hash of plaintext API key (never store plaintext)
- `api_key_prefix` (TEXT, NOT NULL): First 8 characters of key for logging/debugging (safe to log)
- `description` (TEXT): Human-readable label (e.g., "Namrata Android App")
- `is_active` (INTEGER, 0/1): Active or revoked
- `last_used_at` (TEXT, optional): ISO 8601 timestamp of last request
- `created_at` (TEXT, ISO 8601): Provisioning timestamp
- `revoked_at` (TEXT, optional): ISO 8601 timestamp if revoked

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_admin_users_api_key_hash ON admin_users(api_key_hash);
CREATE INDEX idx_admin_users_is_active ON admin_users(is_active);
```

**Constraints:**
- `api_key_hash` unique (no duplicate keys)
- `is_active` must be 0 or 1
- Never expose plaintext key in logs; prefix only for debugging

**Single-User Model:** Only one active key expected for sister's Android app. Additional keys can be provisioned and revoked as needed (e.g., for testing).

---

## Data Types & Formats

### IDs
- **Text identifiers:** Use stable, human-readable values (e.g., "coll-01", "test-02")
- **UUIDs:** For auto-generated records (media, admin users)
- No auto-increment integers; rely on application to generate IDs

### Timestamps
- **Format:** ISO 8601 (UTC) strings (e.g., "2025-01-15T10:30:00Z")
- **Storage:** TEXT type in SQLite
- **Generation:** Server-side only; never trust client timestamps

### Prices
- **Storage:** Integers representing paise (₹1 = 100 paise)
- **Example:** ₹2,000 stored as `200000` (integer paise)
- **API Response:** Divide by 100 for display (e.g., `{priceMin: 200000, priceMax: 850000}` → ₹2,000–₹8,500)
- **Reason:** Avoids floating-point rounding errors

### Booleans
- **Storage:** INTEGER type (0 = false, 1 = true)
- **Columns:** `is_published`, `is_active`
- **Reason:** SQLite native boolean type is INTEGER

### JSON Fields
- **Storage:** TEXT type, JSON-serialized
- **Example:** `site_settings.value` = `"{\"phone\": \"...\", \"hours\": \"...\"}"`
- **Parsing:** App-level JSON deserialization
- **Reason:** Flexible schema for heterogeneous settings

---

## Foreign Keys & Cascading Deletes

```sql
PRAGMA foreign_keys = ON;
```

**Relationships:**
1. `products.category_id` → `categories.id` (optional)
2. `products.featured_image_id` → `media.id` (optional)
3. `services.category_id` → `categories.id` (optional)
4. `gallery_items.media_id` → `media.id` (ON DELETE CASCADE)

**Cascade Rules:**
- Deleting a media record cascades to gallery items (prevents orphaned gallery entries)
- Deleting a category does NOT cascade to products (app-level decision: products go to null/uncategorized)
- All cascades only on gallery items; others require app logic

---

## Query Performance Expectations

All indexes are designed for common operations:
- Listing published products (indexed by `is_published`, `display_order`)
- Filtering by category (indexed by `category_id`)
- Pagination (indexed by `display_order`)
- Authentication (indexed by `api_key_hash`)

Typical query times on D1: <50ms for small tables, <200ms for full scans (acceptable for admin operations).

---

## Constraints & Rules

### Required Fields
- `categories.name` — must be unique and non-empty
- `products.title` — required, non-empty
- `products.created_at`, `updated_at` — always set by server
- `media.object_key`, `public_url`, `mime_type` — required
- `testimonials.quote`, `author_name`, `author_initial`, `author_color_hex` — required
- `admin_users.api_key_hash` — must be unique

### Data Validation (App-Level)
- Prices: `price_min ≤ price_max` and non-negative
- Image MIME types: only PNG, JPEG, WebP allowed (media creation)
- File sizes: max 10 MB (media creation)
- API key hash: must be valid SHA-256 or bcrypt output

### Deletion Behavior
- **Media deletion:** Prevented if referenced by gallery items or products (app validation)
- **Product deletion:** Clean; no cascade
- **Category deletion:** Clean; products orphaned (nullable foreign key)
- **Testimonial deletion:** Clean
- **Admin user deletion/revocation:** Set `is_active = 0` (soft delete); do not hard-delete

---

## Initialization & Migrations

### Migration File
**Location:** `db/migrations/0001_init_schema.sql`

All tables created in single migration. Idempotent (uses `CREATE TABLE IF NOT EXISTS`).

### Seeding
Content seeded via `scripts/migrate-content.ts` from existing `data/content.js`.

No default seed data in schema; all content imported from migration script.

---

## Future Extensibility

This schema is designed to support:
- Additional metadata fields (custom attributes, SKUs)
- Multiple image support per product (future: `product_images` junction table)
- Order history (future: `orders`, `order_items` tables)
- Multi-language support (future: add `language` field to relevant tables)

Current scope: minimal, focused on single-language, single-admin website.

---

**Next Step:** Execute Task 3 – Initialize Wrangler project
