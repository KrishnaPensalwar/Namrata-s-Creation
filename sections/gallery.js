window.SECTIONS = window.SECTIONS || {};

window.SECTIONS.gallery = function gallery(c) {
  const s = c.gallery;
  const tabs = s.tabs.map(function (tab) {
    const active = tab.active ? " active" : "";
    const selected = tab.active ? "true" : "false";
    return '<button class="gallery-tab' + active + '" data-filter="' + esc(tab.filter) + '" id="' + esc(tab.id) + '" role="tab" aria-selected="' + selected + '">' + esc(tab.label) + "</button>";
  }).join("");
  const items = s.items.map(function (item) {
    return '<div class="gallery-item" data-cat="' + esc(item.cat) + '" id="' + esc(item.id) + '"><img src="' + esc(item.img) + '" alt="' + esc(item.alt) + '" loading="lazy" /><div class="gallery-overlay"><span>' + esc(s.view) + "</span></div></div>";
  }).join("");

  return ''
    + '<section class="section section--light" id="gallery"><div class="container">'
    + '<div class="section-header"><span class="section-badge">' + esc(s.badge) + "</span>"
    + '<h2 class="section-title">' + esc(s.title) + "</h2>"
    + '<p class="section-subtitle">' + esc(s.subtitle) + "</p></div>"
    + '<div class="gallery-tabs" role="tablist">' + tabs + "</div>"
    + '<div class="gallery-grid" id="gallery-grid">' + items + "</div></div></section>"
    + '<div class="lightbox" id="lightbox" aria-modal="true" role="dialog" aria-label="Image preview">'
    + '<button class="lightbox-close" id="lightbox-close" aria-label="Close">&times;</button>'
    + '<button class="lightbox-prev" id="lightbox-prev" aria-label="Previous">&#8249;</button>'
    + '<img src="" alt="" id="lightbox-img" />'
    + '<button class="lightbox-next" id="lightbox-next" aria-label="Next">&#8250;</button></div>';
};
