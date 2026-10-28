window.SECTIONS = window.SECTIONS || {};

window.SECTIONS.testimonials = function testimonials(c) {
  const s = c.testimonials;
  const cards = s.items.map(function (item) {
    return ''
      + '<div class="testimonial-card" id="' + esc(item.id) + '">'
      + '<div class="testimonial-quote">&ldquo;</div>'
      + '<p class="testimonial-text">' + esc(item.quote) + "</p>"
      + '<div class="testimonial-author"><div class="testimonial-avatar" style="background:' + esc(item.color) + ';">' + esc(item.initial) + "</div>"
      + "<div><strong>" + esc(item.name) + "</strong><span>" + esc(item.location) + "</span></div></div></div>";
  }).join("");

  return ''
    + '<section class="section section--light" id="testimonials"><div class="container">'
    + '<div class="section-header"><span class="section-badge">' + esc(s.badge) + "</span>"
    + '<h2 class="section-title">' + esc(s.title) + "</h2>"
    + '<p class="section-subtitle">' + esc(s.subtitle) + "</p></div>"
    + '<div class="testimonials-grid">' + cards + "</div></div></section>";
};
