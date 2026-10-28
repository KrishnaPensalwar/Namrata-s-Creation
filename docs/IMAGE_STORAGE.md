# Image Storage (R2)

## Model

| Field | Purpose |
|-------|---------|
| `id` | UUID / deterministic seed id |
| `objectKey` | R2 object key (generated, never trust upload filename) |
| `publicUrl` | Delivery URL |
| `mimeType` | image/png \| jpeg \| webp |
| `altText` | Accessibility |
| `fileSize` | Bytes |
| `createdAt` | ISO 8601 |

Binary files live in **R2**. D1 stores **metadata only** (never Base64).

## Delivery strategies

1. **Worker proxy (default local):** `CDN_URL=http://localhost:8787/media` → `GET /media/{objectKey}`
2. **Custom domain on R2 (production):** `https://cdn.example.com/{objectKey}` — set `CDN_URL` accordingly

Do **not** use the default R2 `r2.dev` URL as final production CDN without reviewing Cloudflare docs for your account.

## Upload (admin / Android)

1. `POST /api/v1/admin/media/upload` with `Authorization: Bearer <API_KEY>`
2. `multipart/form-data`: `file`, `altText` (required), `title` (optional)
3. Server sniffs magic bytes, validates MIME + size (max 10MB)
4. Generates object key, writes R2 + D1 in one flow (rolls back R2 if D1 fails)

## Delete

`DELETE /api/v1/admin/media/:id` — rejected if gallery/product still references media.

## Migration from local assets

```bash
npm run migrate:local          # D1 seed with /assets/images/... URLs
npm run migrate:local:r2       # Upload files to R2 + rewrite public_url
```

Original `assets/images/` files are **not deleted**.

## Android display

Use `publicUrl` from API responses. Never embed R2 credentials in the APK.
