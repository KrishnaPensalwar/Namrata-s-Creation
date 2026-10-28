# Local Development Setup – Ratnāvali Boutique API

**Status:** All local infrastructure ready. No deployment to Cloudflare yet.  
**Last Updated:** 2025-01-15

---

## Prerequisites

- **Node.js:** 18+ (check: `node --version`)
- **npm:** 9+ (check: `npm --version`)
- **Wrangler CLI:** Already installed via `npm install`
- **Git:** For version control (optional for this setup phase)

---

## Project Structure

```
/Users/krishnapensalwar/Documents/Krishna/Namrata/
├── src/
│   ├── index.ts                 # Main Worker entry point
│   ├── types.ts                 # TypeScript interfaces & types
│   ├── routes/
│   │   ├── public.ts            # Public read-only endpoints
│   │   └── admin.ts             # Admin protected endpoints
│   ├── middleware/
│   │   └── auth.ts              # API key authentication
│   ├── services/
│   │   └── db.ts                # D1 database queries
│   └── utils/
│       ├── response.ts          # Response builders
│       └── validation.ts        # Input validators
├── db/
│   ├── migrations/
│   │   └── 0001_init_schema.sql # Initial D1 schema
│   └── schema.md                # Schema documentation
├── scripts/
│   ├── migrate-content.ts       # Content migration (TODO)
│   └── provision-admin.ts       # Admin key provisioning (TODO)
├── docs/
│   ├── CONTENT_INVENTORY.md     # Hardcoded content audit
│   ├── LOCAL_SETUP.md           # This file
│   ├── API_CONTRACT.md          # API specification (TODO)
│   └── CLOUDFLARE_SETUP.md      # Production setup (TODO)
├── wrangler.toml                # Wrangler configuration
├── tsconfig.json                # TypeScript config
├── package.json                 # Node dependencies
├── .dev.vars.example            # Environment template
└── .gitignore                   # Git exclusions
```

---

## Step 1: Install Dependencies

```bash
cd /Users/krishnapensalwar/Documents/Krishna/Namrata

# Install npm packages
npm install

# Verify Wrangler is installed
wrangler --version
# Output: wrangler 3.26.0 (or similar)
```

---

## Step 2: Create Local Development Environment

```bash
# Copy the environment template
cp .dev.vars.example .dev.vars

# Edit .dev.vars with your test settings
# (see below for example values)
```

### Example `.dev.vars` for Local Testing

```
API_KEY_HASH=dev_test_hash
ALLOWED_ORIGINS=http://localhost:*,http://127.0.0.1:*
LOG_LEVEL=debug
CDN_URL=http://localhost:8787/media
```

**Note:** The `API_KEY_HASH` is just a placeholder. We'll generate a real hash later during the admin provisioning phase.

---

## Step 3: Initialize D1 Database Locally

Wrangler automatically creates a local D1 preview database when you run `wrangler dev`.

But first, create the schema:

```bash
# Run migrations to set up the schema locally
# This creates all tables defined in 0001_init_schema.sql
wrangler d1 execute namrata_boutique --file db/migrations/0001_init_schema.sql --local
```

**Expected output:**
```
Executed successfully
```

**Verify the schema:**
```bash
wrangler d1 execute namrata_boutique "SELECT name FROM sqlite_master WHERE type='table';" --local
```

**Expected output:**
```
┌────────────────────┐
│ name               │
├────────────────────┤
│ categories         │
│ products           │
│ services           │
│ gallery_items      │
│ testimonials       │
│ media              │
│ site_settings      │
│ admin_users        │
└────────────────────┘
```

---

## Step 4: Start the Development Server

```bash
npm run dev

# Output will include:
# ⛅ wrangler (3.26.0)
# ⚡ Cloudflare Workers - local server
# Ready on http://localhost:8787
```

**The Worker is now running locally!**

---

## Step 5: Test Public Endpoints

In a new terminal (keep dev server running):

```bash
# Test GET /api/v1/site (should return empty for now)
curl http://localhost:8787/api/v1/site

# Expected response:
# {
#   "success": true,
#   "data": {},
#   "meta": {
#     "timestamp": "2025-01-15T...",
#     "version": "1.0"
#   }
# }

# Test GET /api/v1/categories (empty until migrated)
curl http://localhost:8787/api/v1/categories

# Test GET /api/v1/products
curl http://localhost:8787/api/v1/products

# All should return success: true with empty arrays
```

---

## Step 6: Test Admin Endpoints (Protected)

Admin endpoints require a valid API key. For now, they'll fail (which is correct):

```bash
# Try without auth (should get 401)
curl -X POST http://localhost:8787/api/v1/admin/products \
  -H "Content-Type: application/json" \
  -d '{"title": "Test"}'

# Expected: {"success": false, "error": {"code": "UNAUTHORIZED", ...}}

# Try with invalid key (should get 401)
curl -X POST http://localhost:8787/api/v1/admin/products \
  -H "Authorization: Bearer invalid_key" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test"}'

# Expected: same 401 response
```

---

## Step 7: Populate Content (Next Phase)

To actually get data in the API, run the content migration script (to be created):

```bash
# Dry run (see what would be imported, no changes)
npm run migrate:dry-run

# Actual migration (copies data from data/content.js → D1 + R2 local)
npm run migrate
```

**Note:** This step is **TODO** in the next implementation phase.

---

## Step 8: TypeScript Type Checking

Verify all code compiles without errors:

```bash
npm run type-check

# Output: (no output = success)
```

---

## Common Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start local dev server on port 8787 |
| `npm run type-check` | Check TypeScript for errors |
| `wrangler d1 execute namrata_boutique --local` | Run D1 queries against local DB |
| `wrangler d1 execute namrata_boutique --file db/migrations/0001_init_schema.sql --local` | Apply migrations locally |
| `npm run migrate:dry-run` | Preview content import (TODO) |
| `npm run migrate` | Import content from source (TODO) |

---

## Troubleshooting

### "Cannot find module" or TypeScript errors

```bash
npm install
npm run type-check
```

### D1 database not found

```bash
# Ensure wrangler.toml has correct binding name
wrangler d1 list  # List all databases

# Recreate schema if needed
wrangler d1 execute namrata_boutique --file db/migrations/0001_init_schema.sql --local
```

### API returns 500 errors

1. Check dev server terminal for error logs
2. Verify `.dev.vars` file exists and is not empty
3. Check request format matches API contract

### CORS errors in browser console

Add your local URL to `ALLOWED_ORIGINS` in `.dev.vars`:

```
ALLOWED_ORIGINS=http://localhost:*,http://127.0.0.1:*,http://localhost:3000
```

---

## Project Status

✅ **Complete:**
- TypeScript scaffolding
- D1 schema definition
- Public API endpoints (routes + services)
- Admin API endpoints (routes + auth)
- Validation & error handling
- Response formatting

⏳ **Next (In Progress):**
- Content migration script
- Admin key provisioning
- API contract documentation
- R2 integration
- Website refactoring to consume API

---

## Notes for Implementation

- **No external dependencies:** Using native Cloudflare Workers APIs (no npm packages for core features)
- **Local-first:** All development happens locally; no deployment yet
- **Type-safe:** Full TypeScript compilation; catches errors before runtime
- **Modular:** Easy to add new endpoints, services, middleware
- **Prepared for Android app:** API contract designed for Kotlin consumption

---

**Next Step:** Create content migration script (Task 8 in main plan)
