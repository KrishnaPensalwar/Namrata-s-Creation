# Cloudflare Setup (Manual — Do Not Auto-Deploy)

Fill credentials when ready. **Do not deploy until you explicitly approve.**

## Free vs paid notes

| Feature | Free tier notes |
|---------|-----------------|
| Workers | Free tier has request limits |
| D1 | Free tier size/query limits |
| R2 | Free egress within Cloudflare; storage billed beyond free allowance |
| Pages | Free for static sites |
| Custom domains | Usually included with domain on Cloudflare |

Always check current Cloudflare pricing — this doc does not promise permanent free usage.

---

## 1. Create / confirm Pages project (website)

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages**
2. Connect Git repo **or** upload static assets (`index.html`, `assets/`, `sections/`)
3. Build: none (static). Output: `/` (project root)
4. After deploy, set `assets/js/config.js` → `API_BASE_URL` to your Worker URL

## 2. Create D1 database

1. Dashboard → **D1** → **Create database** → name `namrata_boutique_prod`
2. Copy `database_id`
3. Put into `wrangler.toml` → `[env.production.d1_databases].database_id`

Local apply (no account needed for local):

```bash
npx wrangler d1 execute namrata_boutique --local --file db/migrations/0001_init_schema.sql
npx wrangler d1 execute namrata_boutique --local --file db/seed/0002_seed_from_content.sql
```

Remote apply (**only after approval**):

```bash
npx wrangler d1 execute namrata_boutique_prod --remote --file db/migrations/0001_init_schema.sql
npx wrangler d1 execute namrata_boutique_prod --remote --file db/seed/0002_seed_from_content.sql
```

## 3. Create R2 bucket

1. Dashboard → **R2** → **Create bucket** → `namrata-media-prod`
2. Bind in `wrangler.toml` as `MEDIA`
3. Optional: connect custom domain `cdn.your-domain.com` for public image URLs
4. Set Worker `CDN_URL` var to that domain **or** use `https://<worker>/media` (Worker serves R2)

## 4. Worker bindings & secrets

1. Set `account_id` in `wrangler.toml` (from `npx wrangler whoami`)
2. Production vars: `ALLOWED_ORIGINS`, `CDN_URL`, `LOG_LEVEL`
3. No API key plaintext in Worker secrets — keys live hashed in D1 `admin_users`

## 5. Migrations

Prefer `npm run migrate:local` during development.

Production:

```bash
# AFTER explicit approval
npm run seed:generate
npx wrangler d1 execute namrata_boutique_prod --remote --file db/migrations/0001_init_schema.sql
npx wrangler d1 execute namrata_boutique_prod --remote --file db/seed/0002_seed_from_content.sql
npx wrangler r2 object put ...   # or npm run migrate with --remote --upload-r2
```

## 6. First admin account

```bash
npm run provision:admin:dry-run
npm run provision:admin          # local
# After approval for remote:
node scripts/provision-admin.mjs --remote
```

Copy key from `scripts/generated-api-key.txt` (gitignored). Deliver to sister securely. Never commit.

## 7. Website API URL & CORS

- `assets/js/config.js` → `API_BASE_URL`
- Worker `ALLOWED_ORIGINS` → Pages URL(s)

## 8. Preview before production

1. `npx wrangler deploy --env preview` (**only when you approve**)
2. Smoke: `API_BASE=https://preview... npm run test:api`
3. Open website with preview API URL
4. Only then production deploy

## Checklist before you hand credentials

- [ ] Cloudflare account access
- [ ] Domain (optional for Workers.dev)
- [ ] D1 database ID
- [ ] R2 bucket name
- [ ] Account ID
- [ ] Pages project / custom domain
- [ ] Explicit “OK to deploy” message
