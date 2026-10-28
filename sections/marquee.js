window.SECTIONS = window.SECTIONS || {};

window.SECTIONS.marquee = function marquee(c) {
  const line = esc(c.marquee);
  return '<div class="marquee-bar" id="home"><div class="marquee-track"><span>' + line + line + "</span></div></div>";
};
