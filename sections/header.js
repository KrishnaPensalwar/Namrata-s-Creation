window.SECTIONS = window.SECTIONS || {};

window.SECTIONS.header = function header(c) {
  const links = c.nav.map(function (item) {
    const cls = item.cta ? "nav-link nav-link--cta" : "nav-link";
    const id = item.cta ? ' id="contact-nav-btn"' : "";
    return '<a href="' + esc(item.href) + '" class="' + cls + '"' + id + ">" + esc(item.label) + "</a>";
  }).join("");

  return ''
    + '<header class="header" id="header">'
    + '<div class="header-bg"></div>'
    + '<div class="header-inner container">'
    + '<div class="logo-group"><div class="logo-icon">' + ICONS.star + '</div>'
    + '<div class="logo-text"><span class="logo-brand">' + esc(c.brand.name) + '</span>'
    + '<span class="logo-sub">' + c.brand.tagline.map(esc).join("<br>") + "</span></div></div>"
    + '<nav class="nav" id="nav">' + links
    + '<a href="' + waLink() + '" target="_blank" class="nav-link nav-link--wa" id="wa-nav-btn">'
    + ICONS.wa + "<span>" + esc(c.whatsapp.navLabel).replace(" ", "<br>") + "</span></a></nav>"
    + '<button class="hamburger" id="hamburger" aria-label="Menu"><span></span><span></span><span></span></button>'
    + "</div></header>";
};
