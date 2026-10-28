/**
 * Centralized API client for the public website.
 * No secrets. Read-only public endpoints only.
 */
(function () {
  const cfg = window.SITE_CONFIG || { API_BASE_URL: "/api/v1", CACHE_TTL_MS: 300000 };
  const cache = new Map();

  function getCached(key) {
    const hit = cache.get(key);
    if (!hit) return null;
    if (Date.now() - hit.at > (cfg.CACHE_TTL_MS || 300000)) {
      cache.delete(key);
      return null;
    }
    return hit.data;
  }

  function setCached(key, data) {
    cache.set(key, { data, at: Date.now() });
  }

  function safeUrl(url) {
    if (!url || typeof url !== "string") return "";
    try {
      if (url.startsWith("/") || url.startsWith("./") || url.startsWith("assets/")) return url;
      const u = new URL(url, window.location.origin);
      if (u.protocol === "http:" || u.protocol === "https:") return u.href;
    } catch {
      /* invalid */
    }
    return "";
  }

  async function request(endpoint, options) {
    const base = (cfg.API_BASE_URL || "/api/v1").replace(/\/$/, "");
    const res = await fetch(base + endpoint, {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json" },
      ...options,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.success === false) {
      const msg = (body.error && body.error.message) || "HTTP " + res.status;
      const err = new Error(msg);
      err.status = res.status;
      err.body = body;
      throw err;
    }
    return body.data;
  }

  window.ApiClient = {
    safeUrl,
    clearCache: function () {
      cache.clear();
    },
    getContent: async function (force) {
      if (!force) {
        const cached = getCached("content");
        if (cached) return cached;
      }
      const data = await request("/content");
      setCached("content", data);
      return data;
    },
    getSite: function () {
      return request("/site");
    },
    getProducts: function (params) {
      const q = new URLSearchParams(params || {}).toString();
      return request("/products" + (q ? "?" + q : ""));
    },
    getGallery: function (filter) {
      const q = filter ? "?filter=" + encodeURIComponent(filter) : "";
      return request("/gallery" + q);
    },
    getTestimonials: function () {
      return request("/testimonials");
    },
  };
})();
