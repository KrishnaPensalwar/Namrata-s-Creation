window.SECTIONS = window.SECTIONS || {};

window.SECTIONS.about = function about(c) {
  const s = c.about;
  const paras = s.paras.map(function (p) { return '<p class="about-para">' + esc(p) + "</p>"; }).join("");
  const pillars = s.pillars.map(function (p) {
    return '<div class="pillar" id="' + esc(p.id) + '"><div class="pillar-dot"></div><div><h4>' + esc(p.title) + "</h4><p>" + esc(p.desc) + "</p></div></div>";
  }).join("");

  return ''
    + '<section class="section section--muted" id="about"><div class="container about-grid"><div class="about-text">'
    + '<span class="section-badge">' + esc(s.badge) + "</span>"
    + '<h2 class="section-title section-title--left">' + esc(s.title) + "<br>" + esc(s.titleLine2) + "</h2>"
    + paras + '<div class="about-pillars">' + pillars + "</div>"
    + '<div class="about-stat"><div class="stat-number">' + esc(s.stat) + "</div><p>" + esc(s.statDesc) + "</p></div>"
    + '<a href="' + waLink(s.ctaText) + '" target="_blank" class="btn btn--primary" id="about-wa-btn">' + esc(s.cta) + "</a>"
    + '</div><div class="about-portrait"><img src="' + esc(s.portrait) + '" alt="' + esc(s.portraitAlt) + '" loading="lazy" /></div>'
    + "</div></section>";
};
