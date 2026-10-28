window.SECTIONS = window.SECTIONS || {};

window.SECTIONS.custom = function custom(c) {
  const s = c.custom;
  const f = s.fields;
  const options = '<option value="" disabled selected>' + esc(f.occasion.placeholder) + "</option>"
    + s.occasions.map(function (name) { return "<option>" + esc(name) + "</option>"; }).join("");

  return ''
    + '<section class="section section--muted" id="custom"><div class="container">'
    + '<div class="section-header"><span class="section-badge">' + esc(s.badge) + "</span>"
    + '<h2 class="section-title">' + esc(s.title) + "</h2>"
    + '<p class="section-subtitle">' + esc(s.subtitle) + "</p></div>"
    + '<div class="form-wrapper"><form class="custom-form" id="custom-form" onsubmit="submitCustomForm(event)">'
    + '<div class="form-row"><div class="form-group"><label for="full-name">' + esc(f.name.label) + '</label>'
    + '<input type="text" id="full-name" name="name" placeholder="' + esc(f.name.placeholder) + '" required /></div>'
    + '<div class="form-group"><label for="whatsapp">' + esc(f.whatsapp.label) + '</label>'
    + '<input type="tel" id="whatsapp" name="whatsapp" placeholder="' + esc(f.whatsapp.placeholder) + '" required /></div></div>'
    + '<div class="form-row"><div class="form-group"><label for="email">' + esc(f.email.label) + '</label>'
    + '<input type="email" id="email" name="email" placeholder="' + esc(f.email.placeholder) + '" /></div>'
    + '<div class="form-group"><label for="occasion">' + esc(f.occasion.label) + '</label>'
    + '<select id="occasion" name="occasion" required>' + options + "</select></div></div>"
    + '<div class="form-group"><label for="delivery-date">' + esc(f.date.label) + '</label>'
    + '<input type="date" id="delivery-date" name="date" required /></div>'
    + '<div class="form-group"><label for="saree-palette">' + esc(f.palette.label) + '</label>'
    + '<input type="text" id="saree-palette" name="palette" placeholder="' + esc(f.palette.placeholder) + '" /></div>'
    + '<div class="form-group"><label for="notes">' + esc(f.notes.label) + '</label>'
    + '<textarea id="notes" name="notes" rows="4" placeholder="' + esc(f.notes.placeholder) + '"></textarea></div>'
    + '<button type="submit" class="btn btn--primary btn--full" id="custom-submit-btn">' + ICONS.wa18 + " " + esc(s.submit) + "</button>"
    + "</form></div></div></section>";
};
