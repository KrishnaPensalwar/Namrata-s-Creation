window.SECTIONS = window.SECTIONS || {};

window.SECTIONS.hero = function hero(c) {
  const h = c.hero;
  const images = h.images.map(function (img) {
    return '<div class="hero-img ' + img.cls + '"><img src="' + esc(img.src) + '" alt="' + esc(img.alt) + '" loading="eager" /></div>';
  }).join("");
  const trust = h.trust.map(function (item) {
    return '<div class="trust-item"><span class="trust-icon">✦</span><span>' + esc(item) + "</span></div>";
  }).join("");

  return ''
    + '<section class="hero" id="hero-section">'
    + '<div class="hero-motif" aria-hidden="true"><svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.07">'
    + '<path d="M200 50 C250 100 280 200 200 250 C120 300 80 200 130 150 C160 120 190 140 200 160 C210 180 200 220 175 230 C150 240 130 215 140 195 C150 175 170 180 180 195" stroke="#5b0218" stroke-width="2" fill="none"/>'
    + '<circle cx="200" cy="200" r="150" stroke="#5b0218" stroke-width="1" stroke-dasharray="5 10"/>'
    + '<circle cx="200" cy="200" r="100" stroke="#5b0218" stroke-width="0.5" stroke-dasharray="3 6"/></svg></div>'
    + '<div class="hero-images"><div class="hero-img-grid">' + images + "</div></div>"
    + '<div class="hero-content container"><div class="hero-text-block">'
    + '<span class="section-badge hero-badge">' + esc(h.badge) + "</span>"
    + '<h1 class="hero-title">' + esc(h.title) + "<br><em>" + esc(h.titleEm) + "</em></h1>"
    + '<p class="hero-subtitle">' + esc(h.subtitle) + "</p>"
    + '<p class="hero-desc">' + esc(h.desc) + "</p>"
    + '<div class="hero-actions">'
    + '<a href="' + waLink(h.ctaPrimaryText) + '" target="_blank" class="btn btn--primary" id="hero-wa-btn">' + ICONS.wa18 + " " + esc(h.ctaPrimary) + "</a>"
    + '<a href="' + esc(h.ctaSecondaryHref) + '" class="btn btn--outline" id="hero-explore-btn">' + esc(h.ctaSecondary) + "</a>"
    + "</div><div class=\"hero-trust\">" + trust + "</div></div></div></section>";
};
