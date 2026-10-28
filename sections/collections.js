window.SECTIONS = window.SECTIONS || {};

window.SECTIONS.collections = function collections(c) {
  const s = c.collections;
  const cards = s.items.map(function (item) {
    return ''
      + '<div class="collection-card" id="' + esc(item.id) + '">'
      + '<div class="collection-img"><img src="' + esc(item.img) + '" alt="' + esc(item.alt) + '" loading="lazy" /></div>'
      + '<div class="collection-body"><span class="card-tag">' + esc(item.tag) + "</span>"
      + "<h3>" + esc(item.title) + "</h3><p>" + esc(item.desc) + "</p>"
      + '<a href="' + waLink(interestText(item.enquire || item.title)) + '" target="_blank" class="card-cta">' + esc(s.enquire) + "</a>"
      + "</div></div>";
  }).join("");

  return ''
    + '<section class="section section--light" id="collections"><div class="container">'
    + '<div class="section-header"><span class="section-badge">' + esc(s.badge) + "</span>"
    + '<h2 class="section-title">' + esc(s.title) + "</h2>"
    + '<p class="section-subtitle">' + esc(s.subtitle) + "</p></div>"
    + '<div class="collections-grid">' + cards + "</div></div></section>";
};
