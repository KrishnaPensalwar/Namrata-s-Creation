/* SOURCE OF TRUTH FOR SEED MIGRATION ONLY.
   Website no longer loads this file — it fetches GET /api/v1/content.
   Re-run: npm run seed:generate && npm run migrate:local
   Markup lives in sections/. Do not put HTML tags in these strings. */
window.CONTENT = {
  meta: {
    title: "Ananya Creations – Halvyache Dagine & Maharashtrian Handcrafted Jewellery | Pune",
    description: "Handcrafted Maharashtrian floral jewellery, Halvyache Dagine, Kolhapuri Saaj, and bridal ornaments from Ananya Creations, Pune. Custom orders. Worldwide shipping."
  },
  brand: {
    name: "RATNĀVALI",
    tagline: ["HAUTE", "MAHARASHTRIAN", "ATELIER"]
  },
  whatsapp: {
    digits: "919823045679",
    display: "+91 98230 45679",
    floatLabel: "WhatsApp Tai",
    floatText: "Hello Ananya Tai, I would like to enquire",
    navLabel: "WhatsApp Enquiry"
  },
  nav: [
    { label: "Home", href: "#home" },
    { label: "Collections", href: "#collections" },
    { label: "Featured", href: "#featured" },
    { label: "Occasions", href: "#occasions" },
    { label: "Custom Orders", href: "#custom" },
    { label: "Gallery", href: "#gallery" },
    { label: "About Us", href: "#about" },
    { label: "Contact", href: "#contact", cta: true }
  ],
  marquee: "CUSTOM HANDCRAFTED JEWELLERY, HALDI & BRIDAL SETS \u00a0✦\u00a0 WORLDWIDE SHIPPING & WHATSAPP ENQUIRIES WELCOME \u00a0✦\u00a0 SAREE-MATCHED FLORAL & GOLD ORNAMENTS \u00a0✦\u00a0",
  hero: {
    badge: "MAHARASHTRIAN HERITAGE CRAFTSMANSHIP",
    title: "Ananya",
    titleEm: "Creations",
    subtitle: "Halvyache Dagine & Floral Jewellery",
    desc: "Handcrafted Maharashtrian ornaments for weddings, Sankranti, Haldi & Dohale Jevan. Each piece individually made to match your Nauvari & Paithani.",
    ctaPrimary: "WhatsApp Custom Order",
    ctaPrimaryText: "Hello Ananya Tai, I would like to enquire about a custom order",
    ctaSecondary: "Explore Collections",
    ctaSecondaryHref: "#collections",
    images: [
      { src: "assets/images/img_01.png", alt: "Bridal Halvyache Dagine", cls: "hero-img--main" },
      { src: "assets/images/img_02.png", alt: "Mogra Floral Jewellery", cls: "hero-img--top" },
      { src: "assets/images/img_03.png", alt: "Kolhapuri Saaj", cls: "hero-img--bottom" }
    ],
    trust: ["12+ Years Artisan", "2,400+ Weddings", "Worldwide Shipping", "Custom Saree Match"]
  },
  collections: {
    badge: "संग्रह",
    title: "Authentic Traditional Creations",
    subtitle: "Explore our complete range of handcrafted Maharashtrian jewellery and ceremonial ornaments, each made with devotion.",
    enquire: "Enquire →",
    items: [
      { id: "coll-01", img: "assets/images/img_01.png", alt: "Halvyache Dagine", tag: "Bridal", title: "Halvyache Dagine", desc: "Traditional turmeric & sesame jewellery for Haldi ceremonies" },
      { id: "coll-02", img: "assets/images/img_02.png", alt: "Mogra Floral Sets", tag: "Floral", title: "Mogra Floral Sets", desc: "Fresh & artificial jasmine ornaments for Nauvari draping" },
      { id: "coll-03", img: "assets/images/img_03.png", alt: "Kolhapuri Saaj", tag: "Heritage", title: "Kolhapuri Saaj", desc: "Heirloom necklace sets in classic gold & enamel finish" },
      { id: "coll-04", img: "assets/images/img_04.png", alt: "Peshwai Tanmani", tag: "Bridal", title: "Peshwai Tanmani", desc: "Royal long necklaces for Maharashtrian bridal trousseau" },
      { id: "coll-05", img: "assets/images/img_05.png", alt: "Sakharpuda Suites", tag: "Occasion", title: "Sakharpuda Suites", desc: "Complete engagement jewellery sets for the engagement ceremony" },
      { id: "coll-06", img: "assets/images/img_06.png", alt: "Dohale Jevan Ornaments", tag: "Ceremony", title: "Dohale Jevan Ornaments", desc: "Ceremonial baby shower jewellery with floral pearl detailing" },
      { id: "coll-07", img: "assets/images/img_07.png", alt: "Sankranti Tilgul Sets", tag: "Festive", title: "Sankranti Tilgul Sets", desc: "Black & gold sesame harvest festival jewellery" },
      { id: "coll-08", img: "assets/images/img_08.png", alt: "Bridal Haathphool", tag: "Bridal", title: "Bridal Haathphool", desc: "Elaborate hand harnesses in fresh mogra and gold wire" },
      { id: "coll-09", img: "assets/images/img_09.png", alt: "Paithani Border Match", tag: "Custom", title: "Paithani Border Match", desc: "Custom colour-matched sets for Paithani and Nauvari sarees" },
      { id: "coll-10", img: "assets/images/img_10.png", alt: "Mundavalya", tag: "Groom", title: "Mundavalya", desc: "Groom's ceremonial garland with jasmine and marigold" },
      { id: "coll-11", img: "assets/images/img_11.png", alt: "Vedha Earrings", tag: "Bridal", title: "Vedha Earrings", desc: "Traditional banana-flower drop earrings for brides" },
      { id: "coll-12", img: "assets/images/img_12.png", alt: "Decor & Hampers", tag: "Gift", title: "Decor & Hampers", enquire: "Decor and Hampers", desc: "Curated wedding gift hampers with handcrafted keepsakes" }
    ]
  },
  featured: {
    badge: "विशेष निर्मिती",
    title: "Featured Creations",
    subtitle: "Handpicked best-sellers and seasonal specials — enquire via WhatsApp for live pricing and availability.",
    cta: "WhatsApp Enquiry",
    items: [
      { id: "feat-01", img: "assets/images/img_13.png", alt: "Bridal Halvyache Dagine Full Set", tag: "Best Seller", title: "Bridal Halvyache Dagine Full Set", price: "₹4,500 – ₹8,500", desc: "Complete haldi ornament suite including nath, necklace & haathphool." },
      { id: "feat-02", img: "assets/images/img_14.png", alt: "Mogra Floral Bridal Suite", tag: "Seasonal", title: "Mogra Floral Bridal Suite", price: "₹3,200 – ₹6,000", desc: "Fresh jasmine + pearls combination for the full bridal look." },
      { id: "feat-03", img: "assets/images/img_15.png", alt: "Kolhapuri Saaj Heritage Set", tag: "Heritage", title: "Kolhapuri Saaj Heritage Set", price: "₹6,000 – ₹12,000", desc: "Multi-strand gold-toned necklace with Lakshmi coin pendants." },
      { id: "feat-04", img: "assets/images/img_16.png", alt: "Haldi Floral Pearl Set", tag: "Popular", title: "Haldi Floral Pearl Set", price: "₹2,000 – ₹4,500", desc: "Turmeric-bright floral pearl set for mehndi and haldi ceremonies." }
    ]
  },
  occasions: {
    badge: "सण",
    title: "Special Occasions",
    subtitle: "Every Maharashtrian celebration deserves a perfectly curated jewellery set. We specialize in all sacred ceremonies.",
    items: [
      { id: "occ-01", icon: "🌸", title: "Bridal Wedding", desc: "Complete bridal suites for the Maharashtrian Saptapadi" },
      { id: "occ-02", icon: "🌼", title: "Haldi Ceremony", desc: "Turmeric-hued ornaments and fresh floral jewellery" },
      { id: "occ-03", icon: "🌺", title: "Dohale Jevan", desc: "Baby shower jewellery and ceremonial sets" },
      { id: "occ-04", icon: "⚫", title: "Makar Sankranti", desc: "Black & gold tilgul sets for the sesame harvest festival" },
      { id: "occ-05", icon: "💛", title: "Sakharpuda", desc: "Engagement jewellery in traditional Maharashtrian style" },
      { id: "occ-06", icon: "🌿", title: "Seemant / Godh Bharai", desc: "Auspicious baby shower ornaments and blessings" }
    ]
  },
  custom: {
    badge: "कस्टम ऑर्डर",
    title: "Custom Order Enquiry",
    subtitle: "Share your ceremony details and saree colour palette. We'll handcraft jewellery that matches perfectly.",
    submit: "Submit Custom Enquiry & Open WhatsApp Chat",
    fields: {
      name: { label: "Full Name *", placeholder: "Your full name" },
      whatsapp: { label: "Mobile / WhatsApp Number *", placeholder: "+91 98765 43210" },
      email: { label: "Email Address", placeholder: "you@email.com" },
      occasion: { label: "Occasion / Ceremony Type *", placeholder: "Select occasion" },
      date: { label: "Ceremony / Delivery Date *" },
      palette: { label: "Saree Color & Fabric Palette (Optional)", placeholder: "e.g. Peacock Blue Paithani with gold zari border, Rani Pink, Haldi Yellow" },
      notes: { label: "Specific Design Requests / Notes", placeholder: "Tell us if you prefer fresh Mogra or artificial preserved flowers, special pieces, references…" }
    },
    occasions: [
      "Bridal Wedding",
      "Haldi Ceremony",
      "Dohale Jevan",
      "Makar Sankranti",
      "Sakharpuda",
      "Seemant / Godh Bharai",
      "Other"
    ],
    formIntro: "Hello Ananya Tai! I would like to place a custom order."
  },
  gallery: {
    badge: "हस्तकलेचा अल्बम",
    title: "Atelier Craft Gallery",
    subtitle: "Explore authentic photographs of our past handcrafted sets worn by Maharashtrian brides and families.",
    view: "View",
    tabs: [
      { id: "tab-all", filter: "all", label: "All Works", active: true },
      { id: "tab-floral", filter: "floral", label: "Floral Jewellery" },
      { id: "tab-festive", filter: "festive", label: "Festive Ornaments" },
      { id: "tab-bridal", filter: "bridal", label: "Bridal Embroidery" },
      { id: "tab-decor", filter: "decor", label: "Decor & Hampers" }
    ],
    items: [
      { id: "gal-01", img: "assets/images/gallery_01.png", alt: "Gallery 1", cat: "all floral bridal" },
      { id: "gal-02", img: "assets/images/gallery_02.png", alt: "Gallery 2", cat: "all festive" },
      { id: "gal-03", img: "assets/images/gallery_03.png", alt: "Gallery 3", cat: "all bridal" },
      { id: "gal-04", img: "assets/images/gallery_04.png", alt: "Gallery 4", cat: "all floral" },
      { id: "gal-05", img: "assets/images/gallery_05.png", alt: "Gallery 5", cat: "all decor" },
      { id: "gal-06", img: "assets/images/gallery_06.png", alt: "Gallery 6", cat: "all festive bridal" },
      { id: "gal-07", img: "assets/images/gallery_07.png", alt: "Gallery 7", cat: "all floral decor" },
      { id: "gal-08", img: "assets/images/gallery_08.png", alt: "Gallery 8", cat: "all bridal festive" }
    ]
  },
  about: {
    badge: "THE ARTISAN BEHIND THE BRAND",
    title: "Where Maharashtrian Heritage",
    titleLine2: "Meets Heartfelt Craftsmanship.",
    paras: [
      "Ananya Creations began over a decade ago in the peaceful cultural heart of Pune.",
      "What began as handcrafted adornments for family weddings soon blossomed into a renowned atelier trusted by over 2,400 Maharashtrian families."
    ],
    pillars: [
      { id: "pillar-01", title: "Zero Mass Production", desc: "Every order is created singly by hand with dedicated artisanal focus." },
      { id: "pillar-02", title: "Exact Saree Pairing", desc: "Colours customized accurately to match your Nauvari and Paithani borders." },
      { id: "pillar-03", title: "Punctual Muhurat Delivery", desc: "Guaranteed delivery timed precisely to your ceremony schedule." }
    ],
    stat: "12+ Years",
    statDesc: "Crafting heirlooms for over 2,400 Maharashtrian weddings and celebrations.",
    cta: "Speak with Smt. Ananya",
    ctaText: "Hello Smt. Ananya, I'd like to speak with you",
    portrait: "assets/images/artisan_portrait.png",
    portraitAlt: "Smt. Ananya Kulkarni – Master Artisan"
  },
  testimonials: {
    badge: "आनंदी कुटुंबे",
    title: "Heartfelt Words from Our Brides & Families",
    subtitle: "Read genuine reviews from families who entrusted us with their sacred occasions.",
    items: [
      { id: "test-01", quote: "The Halvyache Dagine for my first Makar Sankranti after marriage were so incredibly beautiful. Every relative asked where we got them. Ananya Tai understood our family's traditional Pune style perfectly.", initial: "K", color: "#5b0218", name: "Ketaki Joshi", location: "Pune (Kothrud) • Sankranti Bride" },
      { id: "test-02", quote: "Ananya Tai created our Dohale Jevan floral jewellery matching my bottle green Paithani with gold zari. The mogra garland and haathphool were fresh until 9 PM. Absolutely magical.", initial: "S", color: "#261900", name: "Snehal Patil", location: "Thane, Mumbai • Dohale Jevan" },
      { id: "test-03", quote: "Booked bridal mehendi and fresh floral haathphool for my sister's Haldi. The WhatsApp communication was seamless and the pieces arrived two days before — perfectly packed. Will order again.", initial: "P", color: "#40000e", name: "Pooja Deshmukh", location: "Nashik • Wedding Sibling" }
    ]
  },
  faq: {
    badge: "नेहमी विचारले जाणारे प्रश्न",
    title: "Frequently Asked Questions",
    subtitle: "Everything you need to know about preservation, courier delivery, and custom matching.",
    items: [
      { id: "faq-01", q: "How do I preserve fresh floral jewellery before the event?", a: "Store in a cool, airtight container with a damp cloth. Keep refrigerated at 4°C. We send detailed preservation instructions with every fresh flower order." },
      { id: "faq-02", q: "Do you ship Halvyache Dagine outside Maharashtra & abroad?", a: "Yes, we ship pan-India and internationally. Artificial/preserved pieces ship worldwide via insured courier. Fresh flower sets are only available within 200km of Pune." },
      { id: "faq-03", q: "How much advance notice is required for custom orders?", a: "Standard custom orders require 15–21 days advance booking. Bridal suites require 30–45 days. For urgent orders, contact us on WhatsApp and we'll advise on availability." },
      { id: "faq-04", q: "Can you customize to match my specific Paithani saree blouse?", a: "Absolutely. Share clear photographs of your saree, especially the border, pallu and blouse fabric. We colour-match using natural dyes and gold wire to create a harmonious set." }
    ]
  },
  contact: {
    title: "Ananya Creations Boutique Atelier",
    tagline: "Handmade Maharashtrian Traditions",
    addressLabel: "Home Studio Location",
    address: "Mayur Colony, Kothrud, Pune, Maharashtra 411038",
    addressNote: "(In-person consultations available by prior WhatsApp appointment)",
    hoursLabel: "Atelier Hours",
    hours: "Monday – Saturday: 10:00 AM – 7:30 PM IST",
    hoursNote: "Sunday: Reserved for Bridal Deliveries & Trials",
    phoneLabel: "Direct Phone & Inquiry",
    phone: "+91 98230 45679 / +91 20 2544 1289",
    tel: "+919823045679",
    instagramLabel: "Instagram Community",
    instagram: "@ananyacreations.boutique",
    waCta: "Instant WhatsApp Chat",
    callCta: "Call Artisan"
  },
  footer: {
    desc: "Preserving timeless Marathi craftsmanship through handcrafted heirloom Kolhapuri Saaj, Paithani-matched ornaments and ceremonial floral jewellery.",
    badges: ["Authenticity Guarantee", "International Shipping", "Private Concierge"],
    curationsTitle: "Curations",
    curations: ["Heirloom Kolhapuri Saaj", "Peshwai & Tanmani Sets", "Haldi Floral & Pearl Ornaments", "Bridal Sakharpuda Suites", "Artisan Custom Atelier"],
    hoursTitle: "Boutique Hours",
    hours: [
      { text: "Tuesday – Sunday:", strong: "10:30 AM – 8:00 PM IST" },
      { text: "Monday Atelier Consultations:", strong: "Prior Appointment Only" }
    ],
    hoursNote: "Bridal trials require 48h advance reservation.",
    contactTitle: "Atelier Contact",
    address: "Laxmi Road Heritage Quarter, Pune, Maharashtra 411030",
    phones: ["+91 98230 45678 / +91 20 2445 8900", "+91 98230 45679 (Artisan WhatsApp)"],
    waCta: "WhatsApp Tai",
    copyright: "© 2025 Ratnāvali Maharashtrian Handcrafted Fine Atelier. All rights reserved."
  }
};
