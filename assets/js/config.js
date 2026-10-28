/**
 * Public website configuration — no secrets.
 * Preview API on Cloudflare Workers (no GitHub required).
 */
window.SITE_CONFIG = {
  API_BASE_URL: "https://namrata-boutique-api-preview.krishnapensalwar3.workers.dev/api/v1",
  CACHE_TTL_MS: 5 * 60 * 1000,
  SHOW_LOADING: true,
};
