window.SECTIONS = window.SECTIONS || {};

window.SECTIONS.occasions = function occasions(c) {
  const s = c.occasions;
  const cards = s.items.map(function (item) {
    return '<div class="occasion-card" id="' + esc(item.id) + '"><div class="occasion-icon">' + item.icon + "</div><h3>" + esc(item.title) + "</h3><p>" + esc(item.desc) + "</p></div>";
  }).join("");

  return ''
    + '<section class="section section--light" id="occasions"><div class="container">'
    + '<div class="section-header"><span class="section-badge">' + esc(s.badge) + "</span>"
    + '<h2 class="section-title">' + esc(s.title) + "</h2>"
    + '<p class="section-subtitle">' + esc(s.subtitle) + "</p></div>"
    + '<div class="occasions-grid">' + cards + "</div></div></section>";
};
