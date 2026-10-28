# Credentials you will provide later

When ready to connect real Cloudflare + test end-to-end, send (in chat or password manager — **not** committed to git):

## Cloudflare

1. **Account ID** — Dashboard → Workers → Overview (or `npx wrangler whoami`)
2. **API token** (optional if using `wrangler login`) — Workers edit + D1 + R2 + Pages
3. **D1 database_id** for production (after creating DB)
4. **R2 bucket name** (confirm `namrata-media-prod` or your name)
5. **Zone ID** (if custom domain routes)
6. **Custom domains** (optional):
   - API: `api.…`
   - CDN: `cdn.…`
   - Site: `www.…` / Pages URL

## Website config (you edit locally)

- `assets/js/config.js` → `API_BASE_URL`

## Already generated locally (do not commit)

- `scripts/generated-api-key.txt` — local admin Bearer key
- `scripts/generated-admin-user.json` — hash metadata

Re-provision for production DB after remote D1 is created:

```bash
node scripts/provision-admin.mjs --remote
```

## Explicit approval phrases

Say one of these when ready:

- “OK to deploy preview”
- “OK to deploy production”
- “OK to run remote migrate”

Until then: **local only**.
