window.SECTIONS = window.SECTIONS || {};

window.SECTIONS.featured = function featured(c) {
  const s = c.featured;
  const cards = s.items.map(function (item) {
    return ''
      + '<div class="featured-card" id="' + esc(item.id) + '">'
      + '<div class="featured-img"><img src="' + esc(item.img) + '" alt="' + esc(item.alt) + '" loading="lazy" />'
      + '<span class="featured-tag">' + esc(item.tag) + "</span></div>"
      + '<div class="featured-body"><h3>' + esc(item.title) + "</h3>"
      + '<p class="featured-price">' + esc(item.price) + "</p><p>" + esc(item.desc) + "</p>"
      + '<a href="' + waLink(interestText(item.title)) + '" target="_blank" class="btn btn--primary btn--sm">' + esc(s.cta) + "</a>"
      + "</div></div>";
  }).join("");

  return ''
    + '<section class="section section--muted" id="featured"><div class="container">'
    + '<div class="section-header"><span class="section-badge">' + esc(s.badge) + "</span>"
    + '<h2 class="section-title">' + esc(s.title) + "</h2>"
    + '<p class="section-subtitle">' + esc(s.subtitle) + "</p></div>"
    + '<div class="featured-grid">' + cards + "</div></div></section>";
};
