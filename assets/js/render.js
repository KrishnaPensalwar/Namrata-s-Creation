window.renderPage = function renderPage() {
  const c = window.CONTENT;
  const s = window.SECTIONS;
  if (!c || !s) {
    console.error("renderPage: CONTENT or SECTIONS missing");
    return;
  }

  // Clear previous render (retry-safe)
  const existingMain = document.querySelector("main");
  const existingHeader = document.getElementById("header");
  const existingFooter = document.querySelector(".footer");
  const existingFloat = document.querySelector(".float-wa");
  const existingMarquee = document.querySelector(".marquee");
  [existingHeader, existingMarquee, existingMain, existingFooter, existingFloat].forEach(function (el) {
    if (el) el.remove();
  });

  document.title = c.meta && c.meta.title ? c.meta.title : document.title;
  const meta = document.querySelector('meta[name="description"]');
  if (meta && c.meta && c.meta.description) {
    meta.setAttribute("content", c.meta.description);
  }

  document.body.insertAdjacentHTML(
    "afterbegin",
    [
      s.header(c),
      s.marquee(c),
      "<main>",
      s.hero(c),
      s.collections(c),
      s.featured(c),
      s.occasions(c),
      s.custom(c),
      s.gallery(c),
      s.about(c),
      s.testimonials(c),
      s.contact(c),
      "</main>",
      s.footer(c),
      s.float(c),
    ].join("")
  );
};
