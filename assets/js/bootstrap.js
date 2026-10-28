/**
 * Loads site content from Worker API, then renders.
 * No hardcoded production content as silent fallback.
 * Shows loading / error / retry UI if API unavailable.
 */
(function () {
  const LOADING_HTML =
    '<div id="site-boot" style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#fff8f5;color:#564243;padding:2rem;text-align:center">' +
    '<div><p style="font-size:1.1rem;margin-bottom:0.5rem">Loading Ratnāvali…</p>' +
    '<p style="opacity:0.7;font-size:0.9rem">Fetching latest collections</p></div></div>';

  function showError(message) {
    const el = document.getElementById("site-boot") || document.body;
    const target = document.getElementById("site-boot") || document.createElement("div");
    if (!document.getElementById("site-boot")) {
      target.id = "site-boot";
      document.body.prepend(target);
    }
    target.innerHTML =
      '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#fff8f5;color:#564243;padding:2rem;text-align:center">' +
      "<div><p style=\"font-size:1.15rem;margin-bottom:0.75rem\">Could not load site content</p>" +
      '<p style="opacity:0.75;font-size:0.9rem;margin-bottom:1.25rem">' +
      escText(message) +
      "</p>" +
      '<button type="button" id="site-retry" style="background:#5b0218;color:#fff;border:0;padding:0.65rem 1.25rem;border-radius:8px;cursor:pointer;font-size:0.95rem">Retry</button>' +
      '<p style="margin-top:1rem;font-size:0.8rem;opacity:0.6">API: ' +
      escText((window.SITE_CONFIG && window.SITE_CONFIG.API_BASE_URL) || "") +
      "</p></div></div>";
    document.getElementById("site-retry").addEventListener("click", function () {
      boot();
    });
  }

  function escText(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normalizeImages(content) {
    const safe = window.ApiClient.safeUrl;
    function fixList(items, imgKey) {
      if (!Array.isArray(items)) return;
      items.forEach(function (item) {
        if (item[imgKey]) item[imgKey] = safe(item[imgKey]) || item[imgKey];
        if (item.src) item.src = safe(item.src) || item.src;
      });
    }
    if (content.collections) fixList(content.collections.items, "img");
    if (content.featured) fixList(content.featured.items, "img");
    if (content.gallery) fixList(content.gallery.items, "img");
    if (content.hero && content.hero.images) fixList(content.hero.images, "src");
    if (content.about && content.about.portrait) {
      content.about.portrait = safe(content.about.portrait) || content.about.portrait;
    }
    return content;
  }

  function renderFromContent(content) {
    window.CONTENT = normalizeImages(content);
    const boot = document.getElementById("site-boot");
    if (boot) boot.remove();
    if (typeof window.renderPage === "function") {
      window.renderPage();
    }
    if (typeof window.initSiteInteractions === "function") {
      window.initSiteInteractions();
    }
  }

  async function boot() {
    if (window.SITE_CONFIG && window.SITE_CONFIG.SHOW_LOADING !== false) {
      if (!document.getElementById("site-boot")) {
        document.body.insertAdjacentHTML("afterbegin", LOADING_HTML);
      } else {
        document.getElementById("site-boot").outerHTML = LOADING_HTML;
      }
    }

    try {
      const content = await window.ApiClient.getContent(true);
      if (!content || !content.brand) {
        throw new Error("API returned empty content. Run content migration first.");
      }
      renderFromContent(content);
    } catch (err) {
      console.error("Bootstrap failed:", err);
      showError(err.message || "Network error");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
