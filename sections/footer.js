window.SECTIONS = window.SECTIONS || {};

window.SECTIONS.footer = function footer(c) {
  const f = c.footer;
  const badges = f.badges.map(function (b) { return '<span class="footer-badge">' + esc(b) + "</span>"; }).join("");
  const curations = f.curations.map(function (item) { return "<li>" + esc(item) + "</li>"; }).join("");
  const hours = f.hours.map(function (row) {
    return "<p>" + esc(row.text) + "<br><strong>" + esc(row.strong) + "</strong></p>";
  }).join("");
  const phones = f.phones.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");

  return ''
    + '<footer class="footer" id="footer"><div class="container footer-grid">'
    + '<div class="footer-brand"><div class="footer-logo"><div class="logo-icon logo-icon--sm">' + ICONS.starSm + "</div>"
    + '<span class="logo-brand">' + esc(c.brand.name) + "</span></div>"
    + '<p class="footer-desc">' + esc(f.desc) + '</p><div class="footer-badges">' + badges + "</div></div>"
    + '<div class="footer-col"><h4>' + esc(f.curationsTitle) + "</h4><ul>" + curations + "</ul></div>"
    + '<div class="footer-col"><h4>' + esc(f.hoursTitle) + "</h4>" + hours
    + '<p class="footer-note">' + esc(f.hoursNote) + "</p></div>"
    + '<div class="footer-col footer-contact"><h4>' + esc(f.contactTitle) + "</h4>"
    + "<p>" + esc(f.address).replace(", ", ",<br>") + "</p>" + phones
    + '<a href="' + waLink() + '" target="_blank" class="btn btn--primary btn--sm footer-wa-btn" id="footer-wa-btn">' + esc(f.waCta) + "</a></div>"
    + '</div><div class="footer-bottom"><div class="container"><p>' + esc(f.copyright) + "</p></div></div></footer>";
};
