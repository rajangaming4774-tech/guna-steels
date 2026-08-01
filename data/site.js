/* Single source of truth for site chrome, contact details and the repeated
   content blocks. Everything the old build scripts inlined into 103 HTML files
   now lives here once and is read by the EJS templates at request time. */

const path = require('path');
const fs = require('fs');

const ORIGIN = process.env.SITE_ORIGIN || 'https://gunasteels.in';

const site = {
  origin: ORIGIN,
  name: 'Guna Steels',
  tagline: 'Pharma-grade stainless steel fabrication',
  phone: '+91 73584 35969',
  phoneHref: 'tel:+917358435969',
  whatsapp: 'https://wa.me/917358435969',
  whatsappQuote:
    'https://wa.me/917358435969?text=Hi%20Guna%20Steels%2C%20I%27d%20like%20to%20request%20a%20quote.',
  email: 'info.gunasteels@gmail.com',
  addressLines: ['19/36E, Sanjeevarayan Pettai, First Street,', 'Tindivanam, Tamil Nadu – 604001'],
  promoter: 'R. G. Gunaseelan',
  mapEmbed:
    'https://www.google.com/maps?q=Sanjeevarayan%20Pettai%20First%20Street%2C%20Tindivanam%2C%20Tamil%20Nadu%20604001&output=embed',
  linkedin: '',
  blurb:
    'At Guna Steels, we manufacture sanitary, precision-engineered stainless steel valves, fittings and equipment for the pharmaceutical and dairy industries.',
};

const nav = [
  { href: '/', label: 'Home', key: 'home' },
  { href: '/about', label: 'About Us', key: 'about' },
  { href: '/products', label: 'Products', key: 'products' },
  { href: '/catalogue', label: 'Catalogue', key: 'catalogue' },
  { href: '/services', label: 'Services', key: 'services' },
  { href: '/technical', label: 'Technical', key: 'technical' },
  { href: '/contact', label: 'Contact', key: 'contact' },
];

/* ---------------------------------------------------------------------------
   HERO PHOTO — the frame inside the STEEL wordmark.

   >>> PLACEHOLDER. Drop your real photo into public/hero/ and point this at
   >>> it. Nothing else needs to change: the hero markup, the preload hint and
   >>> the panel sizing all read from here.

   The array drives the layout: one entry renders a single frame, two entries
   render a side-by-side pair (the panel widens automatically to suit). A
   portrait-ish crop works best — the frame is taller than it is wide when
   collapsed. `focus` is a CSS object-position, for steering the crop.
   --------------------------------------------------------------------------- */
const heroPhotos = [
  {
    src: '/tower.webp',
    alt: 'Steel-framed tower viewed from below, its bracing converging to a vanishing point',
    focus: 'center bottom',
  },
];

/* ---------------------------------------------------------------------------
   SEO COPY — every page's <title>, meta description, keywords and H1 in one
   place, so the wording search engines index is edited here rather than spread
   across routes and templates.

   Rules applied to each entry:
     title        <= 60 chars. Google truncates around 60; the old titles ran
                  to 97 and were being cut mid-phrase in results.
     description  140-160 chars. Leads with the primary keyword, ends with a
                  reason to click. Not a ranking factor directly, but it is the
                  copy a searcher actually reads.
     h1           Exactly one per page, carrying that page's primary keyword in
                  plain words. The previous H1s ("What we fabricate", "What we
                  build for you") were good brand voice but held no keyword, so
                  the strongest on-page signal was being spent on nothing.
     keywords     Google has ignored this tag since 2009; Bing treats stuffing
                  as a negative signal. Kept short and honest for the crawlers
                  that still read it — it will not move rankings on its own.

   Brand voice is not lost: the old headline lines were moved down into each
   page's lede, which still reads first on screen.
   --------------------------------------------------------------------------- */
const seo = {
  home: {
    title: 'Stainless Steel Valves & Fittings Manufacturer | Guna Steels',
    description:
      'Manufacturer of sanitary stainless steel valves, fittings, equipment and purified water systems in SS 304 / 316L for pharma and dairy plants, Tamil Nadu.',
    keywords:
      'stainless steel valves manufacturer, sanitary fittings, SS 304, SS 316L, pharma equipment manufacturer, dairy valves, Tri-Clamp fittings, purified water system, Tindivanam, Tamil Nadu',
    h1Light: 'Stainless Steel Valves &amp; Fittings',
    h1Bold: 'Pharma Equipment Manufacturer',
  },
  about: {
    title: 'About Guna Steels — Pharma Steel Fabricators, Tamil Nadu',
    description:
      'Guna Steels fabricates pharma-grade stainless steel in SS 304 and SS 316L for pharmaceutical and dairy plants, from its workshop in Tindivanam, Tamil Nadu.',
    keywords:
      'stainless steel fabricator, pharma grade fabrication, SS 316L fabrication, Tindivanam, Tamil Nadu, sanitary equipment manufacturer',
    h1: 'Stainless Steel Fabricators for Pharma &amp; Dairy',
    lede: 'Pharma is not a side business for us — one industry, and one standard of hygiene.',
  },
  products: {
    title: 'Stainless Steel Valves, Fittings & Equipment | Guna Steels',
    description:
      'Sanitary stainless steel valves, fittings, equipment and instruments in SS 304 / 316L — four product categories, plus a searchable catalogue of 96 items.',
    keywords:
      'stainless steel valves, sanitary fittings, Tri-Clamp clamps, SMS union, DIN union, stainless steel equipment, purified water system, SS 304, SS 316L',
    h1: 'Stainless Steel Valves, Fittings &amp; Equipment',
    lede: 'What we fabricate — four categories in SS 304 / 316L, plus a searchable catalogue of every product we make.',
  },
  catalogue: {
    title: 'Product Catalogue — 96 Valves & Fittings | Guna Steels',
    description:
      'Browse all 96 sanitary stainless steel valves and fittings by code or name. SS 304 and SS 316L with TC, SMS and DIN ends, for pharma and dairy lines.',
    keywords:
      'stainless steel valve catalogue, sanitary fittings list, ball valve, butterfly valve, tanker valve, SMS union, Tri-Clamp ferrule, SS 316L, product code',
    h1: 'Stainless Steel Valve &amp; Fitting Catalogue',
    lede: 'All 96 items, searchable by code or name. Every product is fabricated in SS 304 / 316L for pharmaceutical and dairy use.',
  },
  services: {
    title: 'Fabrication & Purified Water Systems | Guna Steels',
    description:
      'Stainless steel fabrication, purified water generation and distribution systems, and custom engineering for pharmaceutical and dairy plants across India.',
    keywords:
      'stainless steel fabrication service, purified water system manufacturer, PW distribution, custom engineering, sanitary welding, pharma plant installation',
    h1: 'Stainless Steel Fabrication &amp; Purified Water Systems',
    lede: 'What we build for you — three services, all pharma-grade, all engineered around your process and your compliance requirements.',
  },
  technical: {
    title: 'SS 304 vs 316L, Tri-Clamp & Pipe Charts | Guna Steels',
    description:
      'SS 304 and SS 316L compared, with Tri-Clamp, SMS, DIN and surface finish explained in plain language, plus reference charts for stainless steel pipe.',
    keywords:
      'SS 304 vs SS 316L, Tri-Clamp TC, SMS 1145, DIN 11851, surface finish Ra, purified water WFI, stainless steel pipe chart, ASTM B36.19',
    h1: 'Stainless Steel Grades, Standards &amp; Pipe Charts',
    lede: 'Technical resources — materials, standards and connections in plain language, so you can specify with confidence.',
  },
  contact: {
    title: 'Contact Guna Steels — Request a Quote, Tamil Nadu',
    description:
      'Request a quote for sanitary stainless steel valves, fittings, equipment or purified water systems. Call, WhatsApp or email — we reply within one working day.',
    keywords:
      'stainless steel valve quote, sanitary fittings supplier Tamil Nadu, Guna Steels contact, Tindivanam, request a quote, pharma equipment enquiry',
    h1: 'Request a Stainless Steel Quote',
    lede: 'Send a product code, a drawing, or the problem. Call, WhatsApp, or use the form — whichever is quickest for you.',
  },
  notFound: {
    title: 'Page Not Found | Guna Steels',
    description:
      'That page does not exist. Browse the stainless steel valve and fitting catalogue, or contact Guna Steels for a quote.',
    keywords: '',
    h1: 'That page does not exist',
    lede: 'The link may be out of date. Try the catalogue, or tell us what you are looking for.',
  },
};

const cta = {
  h: 'Tell us what you need built',
  p: 'Send a product code, a drawing, or just the problem. We come back with what it takes to build it — grade, lead time and price.',
};

const values = [
  { b: 'Precision', i: 'Built to your drawings, to the micron that matters.' },
  { b: 'Purity', i: 'Hygienic finishes for regulated environments.' },
  { b: 'Performance', i: 'Equipment that runs, shift after shift.' },
];

/* PLACEHOLDER FIGURES — supplied as examples in the original build.
   Replace with verified numbers before launch. */
const trust = [
  { n: 10, label: 'Years of Experience' },
  { n: 500, label: 'Projects Delivered' },
  { n: 100, label: 'Clients Served' },
  { n: 96, label: 'Products & Fittings' },
];

const whyUs = [
  {
    b: 'Pharma &amp; Dairy Specialists',
    p: 'Every product we fabricate is built to the hygiene and compliance standards of pharmaceutical and dairy production.',
  },
  {
    b: 'Custom Fabrication',
    p: 'We design and build to your specifications, ensuring seamless integration into your processes.',
  },
  {
    b: 'SS 304 / 316L Grade Assurance',
    p: 'Fabricated using top-grade stainless steel materials to ensure hygiene and durability.',
  },
  {
    b: 'Timely Delivery &amp; Installation',
    p: 'We value your time and ensure projects are completed on schedule.',
  },
];

const capability = [
  {
    b: 'Fabrication tooling',
    p: 'A workshop equipped with modern fabrication tools for cutting, forming, welding and finishing stainless steel.',
  },
  {
    b: 'Quality control',
    p: 'Quality control processes that check each product against strict standards before it leaves the workshop.',
  },
  {
    b: 'Hygiene standards',
    p: 'Finishes and construction suited to the hygiene and regulatory requirements of pharma facilities.',
  },
  {
    b: 'Materials assurance',
    p: 'SS 304 and SS 316L throughout, selected for hygiene, corrosion resistance and durability.',
  },
];

const categories = [
  {
    h: 'Stainless Steel Fabrication Accessories',
    p: 'Sanitary Tri-Clamp (TC) clamps, SMS and DIN unions, supports and hygienic connections.',
    pLong:
      'Sanitary accessories — Tri-Clamp (TC) clamps, SMS and DIN unions, supports and hygienic connections built to integrate with your plant.',
  },
  {
    h: 'Stainless Steel Equipments',
    p: 'Process equipment engineered for hygiene, durability and daily production loads.',
    pLong:
      'Process equipment engineered for hygiene, durability and daily production loads, in SS 304 and SS 316L.',
  },
  {
    h: 'Stainless Steel Instruments',
    p: 'Precision instruments finished to the tolerances regulated production demands.',
    pLong: 'Precision instruments finished to the tolerances regulated production demands.',
  },
  {
    h: 'Purified Water System — Generation &amp; Distribution',
    p: 'Generation and distribution systems, designed, fabricated and installed end to end.',
    pLong:
      'Purified water generation and distribution systems, designed, fabricated and installed end to end.',
  },
];

const services = [
  {
    id: 'fabrication',
    eyebrow: '01 — Fabrication',
    h: 'Stainless Steel Fabrication',
    teaser: 'Cut, formed, welded and finished in-house to your drawings.',
    p: 'Cut, formed, welded and finished in-house to your drawings, in SS 304 and SS 316L, with surface finishes appropriate to pharmaceutical hygiene requirements.',
    list: [
      'Fabrication to your drawings and specifications',
      'Hygienic welding and finishing',
      'Quality control before dispatch',
    ],
    btn: 'Get a fabrication quote',
    img: '/assets/sections/fabrication.webp',
    alt: 'Stainless steel fabricated parts by Guna Steels: concentric reducer, tee, bend, flange, reducing elbow and reducer',
  },
  {
    id: 'water',
    eyebrow: '02 — Purified Water',
    h: 'Purified Water Systems',
    teaser: 'Generation and distribution, designed for compliant plants.',
    p: 'Generation and distribution systems designed for compliant plants — specified, fabricated, installed and commissioned.',
    list: [
      'System design around your capacity requirements',
      'Generation and distribution fabrication',
      'On-site installation and commissioning',
    ],
    btn: 'Get a water system quote',
    img: '/assets/sections/water.webp',
    alt: 'Purified water system components by Guna Steels: pipe, in-line filter, Y-type strainer, welded union, SMS union and spray ball',
  },
  {
    id: 'custom',
    eyebrow: '03 — Custom Engineering',
    h: 'Custom Engineering Solutions',
    teaser: 'Solutions engineered around your process, not a catalogue.',
    p: "Solutions engineered around your process, not a catalogue. Bring us the constraint and we'll work out what it takes to build.",
    list: [
      'Design support from concept to drawing',
      'One-off and bespoke builds',
      'Integration with existing plant',
    ],
    btn: 'Get a custom build quote',
    img: '/assets/sections/engineering.webp',
    alt: 'Custom engineered assemblies by Guna Steels: three way manifold, pneumatic valve, pressure regulating valve, ferrule needle valve, 2 PC ball valve and sample cock valve',
  },
];

const gallery = [
  {
    img: '/assets/sections/workshop.webp',
    alt: 'Guna Steels stainless steel fabrication workshop',
    cap: 'Fabrication workshop',
    wide: true,
  },
  {
    img: '/assets/sections/fabrication.webp',
    alt: 'Stainless steel fabricated fittings',
    cap: 'Fittings &amp; fabrication',
  },
  {
    img: '/assets/sections/water.webp',
    alt: 'Purified water system components',
    cap: 'Purified water components',
  },
  {
    img: '/assets/sections/engineering.webp',
    alt: 'Custom engineered stainless steel assemblies',
    cap: 'Custom engineering',
  },
];

const faq = [
  {
    q: 'What steel grades do you use?',
    a: 'We fabricate in SS 304 and SS 316L. SS 316L, with added molybdenum and low carbon, is typically specified for pharmaceutical product-contact surfaces; SS 304 covers general sanitary work. We build to the grade your specification calls for.',
  },
  {
    q: 'What is the delivery time?',
    a: "Lead time depends on the product, quantity and finish. We confirm a firm delivery date with every quote — send us your requirement and we'll come back with grade, lead time and price.",
  },
  {
    q: 'Do you provide installation?',
    a: 'Yes. For purified water systems and larger equipment we handle installation and commissioning on site, alongside fabrication.',
  },
  {
    q: 'Do you manufacture custom equipment?',
    a: "Yes. Custom engineering is a core service — we design and build to your drawings and process, not just from a catalogue. Send a drawing or describe the problem and we'll work out what it takes to build it.",
  },
  {
    q: 'Which industries do you serve?',
    a: 'Primarily the pharmaceutical and dairy industries, plus food-processing plants — anywhere sanitary, hygienic stainless steel is required.',
  },
];

const glossary = [
  {
    t: 'SS 304',
    d: 'Austenitic stainless steel, roughly 18% chromium and 8% nickel ("18/8"). Corrosion-resistant and food-grade — the workhorse grade for general sanitary fabrication.',
  },
  {
    t: 'SS 316L',
    d: 'Like 304, but with about 2–3% added molybdenum for stronger resistance to corrosion and chlorides, and "L" for low carbon (≤0.03%), which improves weld quality. The grade usually specified for pharmaceutical product-contact surfaces.',
  },
  {
    t: 'Sanitary / hygienic',
    d: "Fittings and equipment with smooth, crevice-free surfaces that dismantle easily, so they can be cleaned thoroughly — including clean-in-place (CIP) — and won't harbour bacteria. Essential for pharma, dairy and food.",
  },
  {
    t: 'Tri-Clamp (TC)',
    d: 'A quick-release clamp joint (also called tri-clover). A gasket sits between two flanged ferrules held by a clamp, so the joint opens by hand for cleaning and inspection — the most common sanitary connection.',
  },
  {
    t: 'SMS union',
    d: 'A threaded union to the Swedish dairy standard (SMS 1145), widely used on dairy and food lines.',
  },
  {
    t: 'DIN union',
    d: 'A sanitary union to the German DIN standard (e.g. DIN 11851) — another common way to join hygienic pipework.',
  },
  {
    t: 'Surface finish (Ra)',
    d: '"Ra" is the average roughness of a surface, measured in microns (µm). A lower Ra means a smoother surface with fewer places for residue to cling, which is why pharmaceutical contact surfaces are specified to a fine finish.',
  },
  {
    t: 'Purified Water &amp; WFI',
    d: 'Purified Water (PW) and Water-for-Injection (WFI) are the treated-water grades pharmaceutical plants use. Generation-and-distribution systems produce this water and carry it around the plant through sanitary stainless pipework.',
  },
  {
    t: 'Pharma-grade',
    d: 'Built to the hygiene and material expectations of pharmaceutical manufacturing: appropriate stainless grades, hygienic finishes and crevice-free construction suited to regulated (GMP) environments.',
  },
];

/* ---------------------------------------------------------------------------
   Catalogue data. products.json carries code / name / range / image; the
   filter "type" is derived from keywords in the name — every bucket traces to
   words that are actually printed on the product, nothing is invented.
   --------------------------------------------------------------------------- */
function typeOf(name) {
  const n = name.toLowerCase();
  if (/\bflange\b/.test(n)) return 'Flange';
  if (/valve|cock\b/.test(n)) return 'Valve';
  if (
    /union|elbow|tee\b|bend|reducer|nipple|connector|ferrule|coupling|bush|end cap|cross|pipe\b|manifold/.test(
      n
    )
  )
    return 'Fitting';
  return 'Accessory';
}

const APPLICATIONS = {
  Valve:
    'Flow control and isolation in pharmaceutical and dairy process lines, including CIP/SIP systems.',
  Fitting: 'Joining and routing sanitary pipework across process and utility lines.',
  Flange: 'Bolted, dismantlable connection of sanitary pipework and equipment.',
  Accessory: 'Supporting, clamping and completing sanitary pipework assemblies.',
};

const raw = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'public', 'assets', 'products.json'), 'utf8')
);

const ranges = raw.ranges;

/* How many products share each printed name — "Man Hole" appears six times. */
const nameCounts = raw.items.reduce((acc, i) => {
  acc[i.name] = (acc[i.name] || 0) + 1;
  return acc;
}, {});

/* Product H1s.

   The brochure names are what the printed artwork says, and several are single
   generic words: "Tee", "Pipe", "Bend", "Gasket", "Clamp". As an H1 — the
   strongest on-page signal — "Tee" ranks for nothing and tells a searcher
   nothing. Worse, "Man Hole" is the H1 on six different products, which reads
   to a crawler as six near-duplicate pages.

   So the heading qualifies the name with the material it is actually made of,
   and disambiguates repeats with the product code. `name` is left untouched
   for the catalogue card, the spec table and the image alt text, where the
   short form is correct. */
function headingFor(item) {
  const qualified = /stainless|steel/i.test(item.name)
    ? item.name
    : `Stainless Steel ${item.name}`;
  return nameCounts[item.name] > 1 ? `${qualified} (${item.code})` : qualified;
}

const products = raw.items.map((i, idx) => {
  const type = typeOf(i.name);
  return {
    ...i,
    type,
    heading: headingFor(i),
    rangeLabel: ranges[i.range],
    application: APPLICATIONS[type],
    image: '/' + String(i.image).replace(/^\/+/, ''),
    href: '/product/' + i.code,
    index: idx,
  };
});

const byCode = new Map(products.map((p) => [p.code, p]));
const types = [...new Set(products.map((p) => p.type))].sort();

module.exports = {
  site,
  nav,
  seo,
  heroPhotos,
  cta,
  values,
  trust,
  whyUs,
  capability,
  categories,
  services,
  gallery,
  faq,
  glossary,
  products,
  byCode,
  ranges,
  types,
};
