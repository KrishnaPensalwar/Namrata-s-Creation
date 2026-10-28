/* ─────────────────────────────────
   app.js – Ratnāvali website interactions
   Called after API content is rendered.
   ───────────────────────────────── */

window.submitCustomForm = function submitCustomForm(e) {
  e.preventDefault();
  const f = e.target;
  const name = f.querySelector("#full-name").value.trim();
  const phone = f.querySelector("#whatsapp").value.trim();
  const occasion = f.querySelector("#occasion").value;
  const date = f.querySelector("#delivery-date").value;
  const palette = f.querySelector("#saree-palette").value.trim();
  const notes = f.querySelector("#notes").value.trim();
  const digits =
    (window.CONTENT && CONTENT.whatsapp && CONTENT.whatsapp.digits) || "";
  const intro =
    (window.CONTENT && CONTENT.custom && CONTENT.custom.formIntro) ||
    "Hello! I would like to place a custom order.";

  if (!digits) {
    alert("WhatsApp number is not configured yet.");
    return;
  }

  const msg = [
    intro,
    `*Name:* ${name}`,
    `*Phone:* ${phone}`,
    `*Occasion:* ${occasion}`,
    `*Date:* ${date}`,
    palette ? `*Saree Palette:* ${palette}` : "",
    notes ? `*Notes:* ${notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  window.open(
    `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
};

window.initSiteInteractions = function initSiteInteractions() {
  /* Sticky header */
  const header = document.getElementById("header");
  if (header) {
    window.addEventListener(
      "scroll",
      () => {
        header.classList.toggle("scrolled", window.scrollY > 20);
      },
      { passive: true }
    );
  }

  /* Hamburger */
  const btn = document.getElementById("hamburger");
  const nav = document.getElementById("nav");
  if (btn && nav) {
    btn.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", isOpen);
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
    nav.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        document.body.style.overflow = "";
      });
    });
  }

  /* FAQ */
  document.querySelectorAll(".faq-question").forEach((qbtn) => {
    qbtn.addEventListener("click", () => {
      const isOpen = qbtn.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".faq-question").forEach((q) => {
        q.setAttribute("aria-expanded", "false");
        const ans = q.nextElementSibling;
        if (ans) ans.hidden = true;
      });
      if (!isOpen) {
        qbtn.setAttribute("aria-expanded", "true");
        const ans = qbtn.nextElementSibling;
        if (ans) ans.hidden = false;
      }
    });
  });

  /* Gallery tabs */
  const tabs = document.querySelectorAll(".gallery-tab");
  const items = document.querySelectorAll(".gallery-item");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      const filter = tab.getAttribute("data-filter");
      items.forEach((item) => {
        const cats = item.getAttribute("data-cat") || "";
        if (filter === "all" || cats.includes(filter)) {
          item.classList.remove("hidden");
        } else {
          item.classList.add("hidden");
        }
      });
    });
  });

  /* Lightbox */
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-img");
  const closeBtn = document.getElementById("lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");
  if (lightbox && lbImg) {
    let images = [];
    let current = 0;
    function openLightbox(idx) {
      current = idx;
      lbImg.src = images[current].src;
      lbImg.alt = images[current].alt;
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function closeLightbox() {
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
    }
    function showPrev() {
      current = (current - 1 + images.length) % images.length;
      lbImg.src = images[current].src;
      lbImg.alt = images[current].alt;
    }
    function showNext() {
      current = (current + 1) % images.length;
      lbImg.src = images[current].src;
      lbImg.alt = images[current].alt;
    }
    document.querySelectorAll(".gallery-item").forEach((item) => {
      item.addEventListener("click", () => {
        const visible = [...document.querySelectorAll(".gallery-item:not(.hidden)")];
        images = visible.map((v) => {
          const img = v.querySelector("img");
          return { src: img.src, alt: img.alt };
        });
        openLightbox(Math.max(0, visible.indexOf(item)));
      });
    });
    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    if (prevBtn) prevBtn.addEventListener("click", showPrev);
    if (nextBtn) nextBtn.addEventListener("click", showNext);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    });
  }

  /* Scroll reveal */
  const els = document.querySelectorAll(
    ".collection-card, .featured-card, .occasion-card, .testimonial-card, .faq-item, .pillar, .gallery-item"
  );
  els.forEach((el) => el.classList.add("reveal"));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const siblings = [...entry.target.parentElement.children];
          const idx = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = `${Math.min(idx * 60, 300)}ms`;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  els.forEach((el) => observer.observe(el));

  /* Active nav */
  const sections = document.querySelectorAll('section[id], div[id="home"]');
  const navLinks = document.querySelectorAll(
    ".nav-link:not(.nav-link--cta):not(.nav-link--wa)"
  );
  window.addEventListener(
    "scroll",
    () => {
      let current = "";
      sections.forEach((sec) => {
        if (sec.getBoundingClientRect().top <= 120) current = sec.id;
      });
      navLinks.forEach((link) => {
        const href = link.getAttribute("href")?.replace("#", "");
        link.style.color = href === current ? "var(--c-crimson)" : "";
      });
    },
    { passive: true }
  );
};
