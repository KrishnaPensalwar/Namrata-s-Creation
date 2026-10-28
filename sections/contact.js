window.SECTIONS = window.SECTIONS || {};

window.SECTIONS.contact = function contact(c) {
  const faq = c.faq;
  const k = c.contact;
  const items = faq.items.map(function (item) {
    return '<div class="faq-item" id="' + esc(item.id) + '">'
      + '<button class="faq-question" aria-expanded="false">' + esc(item.q) + "</button>"
      + '<div class="faq-answer" hidden>' + esc(item.a) + "</div></div>";
  }).join("");

  return ''
    + '<section class="section section--muted" id="contact"><div class="container faq-contact-grid">'
    + '<div class="faq-col"><span class="section-badge">' + esc(faq.badge) + "</span>"
    + '<h2 class="section-title section-title--left">' + esc(faq.title) + "</h2>"
    + '<p class="section-subtitle section-subtitle--left">' + esc(faq.subtitle) + "</p>"
    + '<div class="faq-list" id="faq-list">' + items + "</div></div>"
    + '<div class="contact-col" id="contact-details"><div class="contact-card">'
    + "<h3>" + esc(k.title) + "</h3><p class=\"contact-tagline\">" + esc(k.tagline) + "</p>"
    + '<div class="contact-item" id="contact-address"><div class="contact-label">' + esc(k.addressLabel) + "</div>"
    + '<div class="contact-value">' + esc(k.address) + '</div><div class="contact-note">' + esc(k.addressNote) + "</div></div>"
    + '<div class="contact-item" id="contact-hours"><div class="contact-label">' + esc(k.hoursLabel) + "</div>"
    + '<div class="contact-value">' + esc(k.hours) + '</div><div class="contact-note">' + esc(k.hoursNote) + "</div></div>"
    + '<div class="contact-item" id="contact-phone"><div class="contact-label">' + esc(k.phoneLabel) + "</div>"
    + '<div class="contact-value">' + esc(k.phone) + "</div></div>"
    + '<div class="contact-item" id="contact-instagram"><div class="contact-label">' + esc(k.instagramLabel) + "</div>"
    + '<div class="contact-value contact-insta">' + esc(k.instagram) + "</div></div>"
    + '<div class="contact-actions">'
    + '<a href="' + waLink() + '" target="_blank" class="btn btn--primary" id="contact-wa-btn">' + ICONS.wa16 + " " + esc(k.waCta) + "</a>"
    + '<a href="tel:' + esc(k.tel) + '" class="btn btn--outline" id="contact-call-btn">' + esc(k.callCta) + "</a>"
    + "</div></div></div></div></section>";
};
