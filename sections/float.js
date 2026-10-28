window.SECTIONS = window.SECTIONS || {};

window.SECTIONS.float = function float(c) {
  return '<a href="' + waLink(c.whatsapp.floatText) + '" target="_blank" class="wa-floating" id="wa-floating" aria-label="WhatsApp Chat">'
    + '<div class="wa-ring"></div>' + ICONS.wa22 + "<span>" + esc(c.whatsapp.floatLabel) + "</span></a>";
};
