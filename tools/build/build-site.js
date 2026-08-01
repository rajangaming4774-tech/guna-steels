const REPO = require('path').resolve(__dirname, '../../').replace(/\\/g, '/');
﻿/* Builds the full Guna Steels site from PRD v1.0.
   Everything below is generated from assets/products.json + one template, per
   PRD F-02 (catalogue must be data-driven, not hand-built page by page). */
const fs = require('fs');
const path = require('path');
const ROOT = REPO;

const TEL_RAW = '+917358435969';
const TEL_DISP = '+91 73584 35969';           // PRD 8.1: single phone format
const MAIL = 'info.gunasteels@gmail.com';
const ADDR_L1 = '19/36E, Sanjeevarayan Pettai, First Street';
const ADDR_L2 = 'Tindivanam, Tamil Nadu – 604001';   // PRD: standardise on Tindivanam
const WA = `https://wa.me/917358435969?text=Hi%20Guna%20Steels%2C%20I%27d%20like%20to%20request%20a%20quote.`;

const data = JSON.parse(fs.readFileSync(`${ROOT}/assets/products.json`, 'utf8'));
const ITEMS = data.items;
const RANGES = data.ranges;

/* Derive a filter "type" from the product name (PRD 6.3: filter by type).
   Keyword-derived, not invented — every bucket traces to words in the name. */
function typeOf(name) {
  const n = name.toLowerCase();
  if (/\bflange\b/.test(n)) return 'Flange';
  if (/valve|cock\b/.test(n)) return 'Valve';
  if (/union|elbow|tee\b|bend|reducer|nipple|connector|ferrule|coupling|bush|end cap|cross|pipe\b|manifold/.test(n)) return 'Fitting';
  return 'Accessory';
}
ITEMS.forEach(i => { i.type = typeOf(i.name); });

const TYPES = [...new Set(ITEMS.map(i => i.type))].sort();
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---------- shared chrome ---------- */
const NAV = [
  { href: 'about.html', label: 'About Us' },
  { href: 'products.html', label: 'Products' },
  { href: 'catalogue.html', label: 'Catalogue' },
  { href: 'services.html', label: 'Services' },
  { href: 'technical.html', label: 'Technical' },
  { href: 'contact.html', label: 'Contact' },
];

const head = (p, { title, desc, canonical, schema }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="https://gunasteels.in/${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Guna Steels">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="https://gunasteels.in/${canonical}">
<meta property="og:image" content="https://gunasteels.in/${p}assets/sections/workshop.webp">
<meta property="og:locale" content="en_IN">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="https://gunasteels.in/${p}assets/sections/workshop.webp">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600;800;900&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${p}assets/styles.css">
${schema ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>` : ''}
</head>
<script>document.documentElement.classList.add('js')</script>
<body>`;

const header = (p, active) => `<header class="hdr">
  <div class="shell hdr-in">
    <a class="logo" href="${p}index.html">GUNA<span>.</span>STEELS</a>
    <nav class="nav" aria-label="Primary">
${NAV.map(n => `      <a href="${p}${n.href}"${n.href === active ? ' aria-current="page"' : ''}>${n.label}</a>`).join('\n')}
    </nav>
    <div class="hdr-cta">
      <a class="btn btn-ghost" href="${p}brochure.pdf" download data-evt="brochure">Brochure</a>
      <a class="btn btn-primary" href="tel:${TEL_RAW}" data-evt="call">Call Now</a>
    </div>
  </div>
</header>`;

const ctaBand = (p) => `<section class="cta">
  <div class="shell cta-in rv">
    <div>
      <h2>Tell us what you need built</h2>
      <p>Send a product code, a drawing, or just the problem. We come back with what it takes to build it — grade, lead time and price.</p>
    </div>
    <div class="cta-btns">
      <a class="btn btn-white" href="${p}contact.html">Request a Quote</a>
      <a class="btn btn-ghost" href="tel:${TEL_RAW}" data-evt="call">Call ${TEL_DISP}</a>
    </div>
  </div>
</section>`;

const footer = (p) => `<footer class="ftr">
  <div class="shell">
    <div class="ftr-grid rv">
      <div class="cascade" style="--i:0">
        <a class="logo" href="${p}index.html" style="font-size:17px">GUNA<span>.</span>STEELS</a>
        <p style="margin-top:var(--space-2);max-width:38ch">At Guna Steels, we manufacture sanitary, precision-engineered stainless steel valves, fittings and equipment for the pharmaceutical and dairy industries.</p>
      </div>
      <div class="cascade" style="--i:1">
        <h4>Quick Links</h4>
        <ul>
          <li><a href="${p}index.html">Home</a></li>
${NAV.map(n => `          <li><a href="${p}${n.href}">${n.label}</a></li>`).join('\n')}
        </ul>
      </div>
      <div class="cascade" style="--i:2">
        <h4>Products</h4>
        <ul>
          <li><a href="${p}catalogue.html">Full Catalogue (${ITEMS.length})</a></li>
          <li><a href="${p}products.html">Valves &amp; Fittings</a></li>
          <li><a href="${p}products.html">Equipment &amp; Instruments</a></li>
          <li><a href="${p}products.html">Purified Water Systems</a></li>
        </ul>
      </div>
      <div class="cascade" style="--i:3">
        <h4>Services</h4>
        <ul>
          <li><a href="${p}services.html#fabrication">Stainless Steel Fabrication</a></li>
          <li><a href="${p}services.html#water">Purified Water Systems</a></li>
          <li><a href="${p}services.html#custom">Custom Engineering</a></li>
        </ul>
      </div>
      <div class="cascade" style="--i:4">
        <h4>Contact</h4>
        <ul>
          <li><a href="tel:${TEL_RAW}">${TEL_DISP}</a></li>
          <li><a href="mailto:${MAIL}">${MAIL}</a></li>
          <li>${ADDR_L1},<br>${ADDR_L2}</li>
        </ul>
        <div class="ftr-social">
          <a href="#" aria-label="LinkedIn" title="LinkedIn (add URL)"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 3.5A1.5 1.5 0 1 1 4 6.5 1.5 1.5 0 0 1 4 3.5zM3 8h2v13H3zM8 8h2v1.8h.03A2.2 2.2 0 0 1 12 8c2.4 0 3 1.6 3 3.7V21h-2v-4.9c0-1.2 0-2.7-1.6-2.7S9.5 14.6 9.5 16V21H8z"/></svg></a>
          <a href="https://wa.me/917358435969" aria-label="WhatsApp" title="WhatsApp"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 21l1.7-4.2A8.5 8.5 0 1 1 8 20.2L3 21z"/></svg></a>
          <a href="mailto:${MAIL}" aria-label="Email" title="Email"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg></a>
        </div>
      </div>
    </div>
    <div class="ftr-map rv">
      <iframe title="Guna Steels workshop location, Tindivanam, Tamil Nadu" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
        src="https://www.google.com/maps?q=Sanjeevarayan%20Pettai%20First%20Street%2C%20Tindivanam%2C%20Tamil%20Nadu%20604001&output=embed"></iframe>
    </div>
    <div class="ftr-btm">
      <span>© 2026 Guna Steels. All rights reserved.</span>
      <span class="ftr-cert">Certifications: <em>add ISO / GMP details</em></span>
      <span>Precision · Purity · Performance</span>
    </div>
  </div>
</footer>

<nav class="mbar" aria-label="Quick actions">
  <a href="tel:${TEL_RAW}" data-evt="call">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/></svg>
    Call
  </a>
  <a href="${WA}" target="_blank" rel="noopener" data-evt="whatsapp">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 21l1.7-4.2A8.5 8.5 0 1 1 8 20.2L3 21z"/></svg>
    WhatsApp
  </a>
  <a href="${p}contact.html">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
    Enquire
  </a>
</nav>`;

const pageHero = (ghost, crumb, h1, intro, p) => `  <section class="page-hero">
    <div class="ghost" aria-hidden="true">${ghost}</div>
    <div class="shell page-hero-in">
      <p class="crumb"><a href="${p}index.html">Home</a><span>/</span>${crumb}</p>
      <h1>${h1}</h1>
      <p>${intro}</p>
    </div>
  </section>`;

const shell = ({ file, p = '', title, desc, schema, ghost, crumb, h1, intro, body, extraJs = '' }) =>
`${head(p, { title, desc, canonical: file, schema })}

${header(p, file)}

<main id="top">
${pageHero(ghost, crumb, h1, intro, p)}

${body}

${ctaBand(p)}
</main>

${footer(p)}

<script src="${p}assets/app.js"></script>${extraJs}
</body>
</html>
`;

const LOCALBIZ = {
  '@context': 'https://schema.org', '@type': 'LocalBusiness',
  name: 'Guna Steels',
  description: 'Manufacturer and supplier of sanitary, pharma-grade stainless steel valves, fittings, equipment and purified water systems in SS 304 / 316L for the pharmaceutical, dairy and food-processing industries. Based in Tindivanam, Tamil Nadu, India.',
  telephone: TEL_DISP, email: MAIL,
  address: { '@type': 'PostalAddress', streetAddress: ADDR_L1, addressLocality: 'Tindivanam', addressRegion: 'Tamil Nadu', postalCode: '604001', addressCountry: 'IN' },
  founder: { '@type': 'Person', name: 'R. G. Gunaseelan' },
  areaServed: 'India',
  knowsAbout: ['Stainless steel fabrication','Sanitary valves and fittings','Pharma-grade equipment','SS 304','SS 316L','Purified water systems','Tri-Clamp fittings','Dairy valves'],
};

/* ---------- CATALOGUE ---------- */
const card = (i, p = '') => `      <a class="pcard" href="${p}product/${i.code}.html" data-code="${i.code}" data-name="${esc(i.name)}" data-range="${i.range}" data-type="${i.type}">
        <span class="pthumb"><img src="${p}${i.image}" alt="${esc(i.name)} — product code ${i.code}" loading="lazy" width="560" height="560"></span>
        <span class="pcode">${i.code}</span>
        <span class="pname">${esc(i.name)}${i.verify ? ' <em class="flag">verify</em>' : ''}</span>
        <span class="ptags"><span class="ptag">${esc(RANGES[i.range])}</span><span class="ptag">${i.type}</span></span>
      </a>`;

const catalogue = shell({
  file: 'catalogue.html',
  title: `Product Catalogue — ${ITEMS.length} Stainless Steel Valves & Fittings | Guna Steels`,
  desc: `Full catalogue of ${ITEMS.length} sanitary stainless steel valves and fittings in SS 304 / 316L — dairy and investment-casting ranges, Tri-Clamp (TC), SMS and DIN. Search by code or name and request a quote. Manufacturer & supplier, Tindivanam, Tamil Nadu, India.`,
  schema: LOCALBIZ,
  ghost: 'CATALOGUE',
  crumb: 'Catalogue',
  h1: 'Full product catalogue',
  intro: `All ${ITEMS.length} items, searchable by code or name. Every product is fabricated in SS 304 / 316L for pharmaceutical and dairy use.`,
  body: `  <section class="sec shell">
    <div class="cat-controls rv">
      <div class="field" style="margin:0;flex:1 1 280px">
        <label for="q">Search by code or name</label>
        <input id="q" type="search" placeholder="e.g. RO-051 or ball valve" autocomplete="off">
      </div>
      <div class="field" style="margin:0">
        <label for="fRange">Range</label>
        <select id="fRange">
          <option value="">All ranges</option>
${Object.entries(RANGES).map(([k, v]) => `          <option value="${k}">${esc(v)}</option>`).join('\n')}
        </select>
      </div>
      <div class="field" style="margin:0">
        <label for="fType">Type</label>
        <select id="fType">
          <option value="">All types</option>
${TYPES.map(t => `          <option value="${t}">${t}</option>`).join('\n')}
        </select>
      </div>
    </div>

    <p class="cat-count" id="count">${ITEMS.length} products</p>

    <div class="pgrid" id="grid">
${ITEMS.map(i => card(i)).join('\n')}
    </div>

    <p class="cat-empty" id="empty" hidden>No products match that search. <button type="button" class="linkbtn" id="clear">Clear filters</button></p>

    <p class="note" style="margin-top:var(--space-5)">Product names were captured from the printed brochure and should be proofread against the source artwork before publishing. Items marked <em class="flag">verify</em> could not be read from the source.</p>
  </section>`,
  extraJs: `\n<script src="assets/catalogue.js"></script>`,
});
fs.writeFileSync(`${ROOT}/catalogue.html`, catalogue);

/* ---------- 96 PRODUCT DETAIL PAGES ---------- */
fs.mkdirSync(`${ROOT}/product`, { recursive: true });
let n = 0;
for (const i of ITEMS) {
  const prodSchema = {
    '@context': 'https://schema.org', '@type': 'Product',
    sku: i.code, name: i.name,
    description: `${i.name} (${i.code}) — stainless steel ${i.type.toLowerCase()} in the ${RANGES[i.range]} range, fabricated in SS 304 / 316L by Guna Steels.`,
    material: 'Stainless Steel SS 304 / 316L',
    image: `https://gunasteels.in/${i.image}`,
    brand: { '@type': 'Brand', name: 'Guna Steels' },
    offers: { '@type': 'Offer', availability: 'https://schema.org/InStock', priceCurrency: 'INR', price: '0', description: 'Price on request' },
  };
  const idx = ITEMS.indexOf(i);
  const prev = ITEMS[idx - 1], next = ITEMS[idx + 1];
  const html = shell({
    file: `${i.code}.html`, p: '../',
    title: `${i.name} (${i.code}) — SS 304 / 316L | Guna Steels`,
    desc: `${i.name} (${i.code}) — sanitary stainless steel ${i.type.toLowerCase()} from the ${RANGES[i.range]} range, manufactured in SS 304 / 316L for pharmaceutical, dairy and food use. Request a quote from Guna Steels, manufacturer & supplier in Tindivanam, Tamil Nadu, India.`,
    schema: prodSchema,
    ghost: i.code.replace('RO-', ''),
    crumb: `<a href="../catalogue.html">Catalogue</a><span>/</span>${i.code}`,
    h1: esc(i.name),
    intro: `Product code ${i.code} · ${esc(RANGES[i.range])}`,
    body: `  <section class="sec shell">
    <div class="prow rv" style="border-top:0;padding-top:0">
      <div>
        <p class="eyebrow">Specification</p>
        <dl class="spec">
          <dt>Product code</dt><dd>${i.code}</dd>
          <dt>Product name</dt><dd>${esc(i.name)}${i.verify ? ' <em class="flag">to verify</em>' : ''}</dd>
          <dt>Range</dt><dd>${esc(RANGES[i.range])}</dd>
          <dt>Type</dt><dd>${i.type}</dd>
          <dt>Material</dt><dd>SS 304 / 316L</dd>
          <dt>Sizes &amp; ends</dt><dd class="muted">On request — TC, SMS, DIN and custom</dd>
          <dt>Applications</dt><dd>${({Valve:'Flow control and isolation in pharmaceutical and dairy process lines, including CIP/SIP systems.',Fitting:'Joining and routing sanitary pipework across process and utility lines.',Flange:'Bolted, dismantlable connection of sanitary pipework and equipment.',Accessory:'Supporting, clamping and completing sanitary pipework assemblies.'})[i.type]}</dd>
          <dt>Price</dt><dd class="muted">On request</dd>
        </dl>
        <div style="display:flex;gap:var(--space-1);flex-wrap:wrap;margin-top:var(--space-2)">
          <a class="btn btn-dark" href="../contact.html?product=${i.code}" data-evt="enquire">Enquire about ${i.code}</a>
          <a class="btn btn-line" href="../brochure.pdf" download data-evt="brochure">Download PDF</a>
        </div>
        <p class="note" style="margin-top:var(--space-3)">Your enquiry form will be pre-filled with this product code.</p>
      </div>
      <div class="pdetail-media"><img src="../${i.image}" alt="${esc(i.name)} (${i.code}) — stainless steel ${i.type.toLowerCase()} fabricated by Guna Steels" width="560" height="560"></div>
    </div>

    <nav class="pnav" aria-label="Catalogue navigation">
      ${prev ? `<a href="${prev.code}.html">← ${prev.code} ${esc(prev.name)}</a>` : '<span></span>'}
      <a href="../catalogue.html">All products</a>
      ${next ? `<a href="${next.code}.html">${next.code} ${esc(next.name)} →</a>` : '<span></span>'}
    </nav>
  </section>`,
  });
  fs.writeFileSync(`${ROOT}/product/${i.code}.html`, html);
  n++;
}
console.log('product pages :', n);

/* ---------- TECHNICAL RESOURCES ---------- */
const technical = shell({
  file: 'technical.html',
  title: 'SS 304 vs 316L, Tri-Clamp, SMS & Sanitary Standards Explained | Guna Steels Technical',
  desc: 'Plain-language guide to stainless steel grades (SS 304, SS 316L), sanitary connections (Tri-Clamp / TC, SMS, DIN), surface finish (Ra), purified water (PW/WFI) and pharma-grade construction — plus SS pipe dimension and weight charts. Guna Steels, Tamil Nadu, India.',
  schema: LOCALBIZ,
  ghost: 'TECHNICAL',
  crumb: 'Technical Resources',
  h1: 'Technical resources',
  intro: 'Materials, standards and connections explained in plain language — plus reference charts for specifying stainless steel pipe.',
  body: `  <section class="sec shell">
    <div class="sec-head rv">
      <p class="eyebrow">Materials &amp; Standards</p>
      <h2>The terms on this site, explained</h2>
      <p>The grades, connections and standards we build to — in plain language, so you can specify with confidence.</p>
    </div>
    <div class="glossary rv">
      <div class="gitem"><h3>SS 304</h3><p>Austenitic stainless steel, roughly 18% chromium and 8% nickel ("18/8"). Corrosion-resistant and food-grade — the workhorse grade for general sanitary fabrication.</p></div>
      <div class="gitem"><h3>SS 316L</h3><p>Like 304, but with about 2–3% added molybdenum for stronger resistance to corrosion and chlorides, and "L" for low carbon (≤0.03%), which improves weld quality. The grade usually specified for pharmaceutical product-contact surfaces.</p></div>
      <div class="gitem"><h3>Sanitary / hygienic</h3><p>Fittings and equipment with smooth, crevice-free surfaces that dismantle easily, so they can be cleaned thoroughly — including clean-in-place (CIP) — and won't harbour bacteria. Essential for pharma, dairy and food.</p></div>
      <div class="gitem"><h3>Tri-Clamp (TC)</h3><p>A quick-release clamp joint (also called tri-clover). A gasket sits between two flanged ferrules held by a clamp, so the joint opens by hand for cleaning and inspection — the most common sanitary connection.</p></div>
      <div class="gitem"><h3>SMS union</h3><p>A threaded union to the Swedish dairy standard (SMS 1145), widely used on dairy and food lines.</p></div>
      <div class="gitem"><h3>DIN union</h3><p>A sanitary union to the German DIN standard (e.g. DIN 11851) — another common way to join hygienic pipework.</p></div>
      <div class="gitem"><h3>Surface finish (Ra)</h3><p>"Ra" is the average roughness of a surface, measured in microns (µm). A lower Ra means a smoother surface with fewer places for residue to cling, which is why pharmaceutical contact surfaces are specified to a fine finish.</p></div>
      <div class="gitem"><h3>Purified Water &amp; WFI</h3><p>Purified Water (PW) and Water-for-Injection (WFI) are the treated-water grades pharmaceutical plants use. Generation-and-distribution systems produce this water and carry it around the plant through sanitary stainless pipework.</p></div>
      <div class="gitem"><h3>Pharma-grade</h3><p>Built to the hygiene and material expectations of pharmaceutical manufacturing: appropriate stainless grades, hygienic finishes and crevice-free construction suited to regulated (GMP) environments.</p></div>
    </div>
    <p class="note" style="margin-top:var(--space-4)">These definitions are general industry guidance. For the exact grade, finish and standard on a specific product, ask our team — we build to your specification.</p>
  </section>

  <section class="sec shell">
    <div class="callout rv">
      <p class="eyebrow">Data pending verification</p>
      <p>These two charts exist in the printed brochure as <strong>images only</strong>. The figures are engineering data that plant teams specify against, so they have not been transcribed from memory or estimated — they must be keyed in from the source artwork and checked before this page goes live. The table structure below is ready to receive them.</p>
    </div>

    <div class="rv" style="margin-top:var(--space-6)">
      <p class="eyebrow">Chart 1</p>
      <h2 style="font-size:clamp(1.4rem,2.6vw,2rem);font-weight:800;text-transform:uppercase;margin-top:var(--space-2)">Stainless Steel Pipe — Dimensions &amp; Weights</h2>
      <p style="margin-top:var(--space-2);color:var(--steel-600)">Per ASTM / ANSI B36.19.</p>
      <div class="twrap">
        <table class="dtable">
          <caption class="sr-only">Stainless steel pipe dimensions and weights per ASTM / ANSI B36.19</caption>
          <thead>
            <tr>
              <th scope="col">Nominal bore (mm)</th>
              <th scope="col">Nominal bore (inch)</th>
              <th scope="col">Outside diameter (mm)</th>
              <th scope="col">Schedule</th>
              <th scope="col">Wall thickness (mm)</th>
              <th scope="col">Weight (kg/m)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="6" class="tbd">Awaiting transcription from brochure page 10.</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="rv" style="margin-top:var(--space-6)">
      <p class="eyebrow">Chart 2</p>
      <h2 style="font-size:clamp(1.4rem,2.6vw,2rem);font-weight:800;text-transform:uppercase;margin-top:var(--space-2)">S.S. Gauge Pipe — Weight &amp; Thickness</h2>
      <p style="margin-top:var(--space-2);color:var(--steel-600)">Sizes 1/2&quot; to 4&quot; (OD 12.7–101.6 mm), weight per metre across gauges.</p>
      <div class="twrap">
        <table class="dtable">
          <caption class="sr-only">Stainless steel gauge pipe weight and thickness</caption>
          <thead>
            <tr>
              <th scope="col">Size (inch)</th>
              <th scope="col">Outside diameter (mm)</th>
              <th scope="col">Gauge</th>
              <th scope="col">Thickness (mm)</th>
              <th scope="col">Weight (kg/m)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="5" class="tbd">Awaiting transcription from brochure page 10.</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <p style="margin-top:var(--space-5)"><a class="btn btn-line" href="brochure.pdf" download data-evt="brochure">Download the brochure (PDF)</a></p>
  </section>`,
});
fs.writeFileSync(`${ROOT}/technical.html`, technical);

/* ---------- PRODUCTS LANDING (4 categories) ---------- */
const CATS = [
  { id: 'accessories', n: 'Stainless Steel Fabrication Accessories', d: 'Sanitary accessories — Tri-Clamp (TC) clamps, SMS and DIN unions, supports and hygienic connections built to integrate with your plant.' },
  { id: 'equipments', n: 'Stainless Steel Equipments', d: 'Process equipment engineered for hygiene, durability and daily production loads, in SS 304 and SS 316L.' },
  { id: 'instruments', n: 'Stainless Steel Instruments', d: 'Precision instruments finished to the tolerances regulated production demands.' },
  { id: 'water', n: 'Purified Water System — Generation & Distribution', d: 'Purified water generation and distribution systems, designed, fabricated and installed end to end.' },
];
const productsPage = shell({
  file: 'products.html',
  title: 'Stainless Steel Valves & Fittings Manufacturer | Sanitary, Pharma & Dairy | Guna Steels',
  desc: 'Manufacturer and supplier of sanitary stainless steel valves, fittings, equipment and instruments in SS 304 / 316L — Tri-Clamp (TC), SMS and DIN, for pharmaceutical, dairy and food plants. Browse the full 96-item catalogue and request a quote.',
  schema: LOCALBIZ,
  ghost: 'PRODUCTS',
  crumb: 'Products',
  h1: 'What we fabricate',
  intro: 'Sanitary, hygienic stainless steel valves, fittings, equipment and instruments in SS 304 / 316L — four categories, plus a searchable catalogue of all 96 products we manufacture.',
  body: `  <section class="sec shell">
    <div class="grid-4 rv">
${CATS.map((c, k) => `      <a class="card cascade" style="--i:${k}" href="catalogue.html">
        <h3>${esc(c.n)}</h3>
        <p>${esc(c.d)}</p>
        <span class="go">Browse the catalogue →</span>
      </a>`).join('\n')}
    </div>

    <div class="callout rv" style="margin-top:var(--space-6)">
      <p class="eyebrow">Full catalogue</p>
      <h2 style="font-size:clamp(1.4rem,2.6vw,2rem);font-weight:800;text-transform:uppercase;margin-top:var(--space-2)">${ITEMS.length} products, searchable by code</h2>
      <p style="margin-top:var(--space-2)">Every item from our brochure is now a real page you can search, link to and quote from — no PDF required.</p>
      <div style="display:flex;gap:var(--space-1);flex-wrap:wrap;margin-top:var(--space-4)">
        <a class="btn btn-dark" href="catalogue.html">Browse all ${ITEMS.length} products</a>
        <a class="btn btn-line" href="brochure.pdf" download data-evt="brochure">Download brochure (PDF)</a>
      </div>
    </div>
  </section>`,
});
fs.writeFileSync(`${ROOT}/products.html`, productsPage);

/* ---------- ABOUT ---------- */
const about = shell({
  file: 'about.html',
  title: 'Stainless Steel Valves & Fittings Manufacturer in Tamil Nadu | About Guna Steels',
  desc: 'Guna Steels is a manufacturer and supplier of sanitary, pharma-grade stainless steel valves, fittings, equipment and purified water systems in SS 304 / 316L, serving pharmaceutical and dairy plants from Tindivanam, Tamil Nadu, India.',
  schema: LOCALBIZ,
  ghost: 'ABOUT',
  crumb: 'About Us',
  h1: 'Pharma is not a<br>side business for us',
  intro: 'A stainless steel fabricator built around one industry, and one standard of hygiene.',
  body: `  <section class="sec shell">
    <div class="about rv">
      <div>
        <p class="eyebrow">Our Story</p>
        <h2 style="font-size:clamp(1.6rem,3vw,2.4rem);font-weight:800;text-transform:uppercase;margin-top:var(--space-2)">Built for regulated production</h2>
        <p style="margin-top:var(--space-3);color:var(--steel-600)">Established with a vision to serve the pharmaceutical sector with cutting-edge equipment, Guna Steels has emerged as a reliable manufacturer and fabricator of stainless steel pharma-grade machinery and components.</p>
        <p style="margin-top:var(--space-2);color:var(--steel-600)">Backed by years of hands-on experience and an expert technical team, we understand the critical hygiene and regulatory requirements of pharma facilities — and we deliver accordingly. Our workshop in Tindivanam, Tamil Nadu is equipped with modern fabrication tools and quality control processes to ensure each product meets strict standards.</p>
        <a class="btn btn-line" style="margin-top:var(--space-4)" href="contact.html">Start an enquiry</a>
      </div>
      <div class="about-media"><img src="assets/sections/workshop.webp" alt="Interior of a stainless steel fabrication workshop: a large polished steel pipe section suspended from an overhead gantry crane, with vessels and pipe sections along the floor" width="1400" height="1050" loading="lazy"></div>
    </div>
  </section>

  <section class="values">
    <div class="shell values-in rv">
      <div class="value cascade" style="--i:0"><b>Precision</b><i>Built to your drawings, to the micron that matters.</i></div>
      <div class="value cascade" style="--i:1"><b>Purity</b><i>Hygienic finishes for regulated environments.</i></div>
      <div class="value cascade" style="--i:2"><b>Performance</b><i>Equipment that runs, shift after shift.</i></div>
    </div>
  </section>

  <section class="sec shell">
    <div class="sec-head rv">
      <p class="eyebrow">Capability</p>
      <h2>What we bring to a plant</h2>
    </div>
    <div class="why-grid rv">
      <div class="why-item cascade" style="--i:0"><span class="why-num">01</span><b>Fabrication tooling</b><p>A workshop equipped with modern fabrication tools for cutting, forming, welding and finishing stainless steel.</p></div>
      <div class="why-item cascade" style="--i:1"><span class="why-num">02</span><b>Quality control</b><p>Quality control processes that check each product against strict standards before it leaves the workshop.</p></div>
      <div class="why-item cascade" style="--i:2"><span class="why-num">03</span><b>Hygiene standards</b><p>Finishes and construction suited to the hygiene and regulatory requirements of pharma facilities.</p></div>
      <div class="why-item cascade" style="--i:3"><span class="why-num">04</span><b>Materials assurance</b><p>SS 304 and SS 316L throughout, selected for hygiene, corrosion resistance and durability.</p></div>
    </div>
  </section>

  <section class="why">
    <div class="sec shell">
      <div class="sec-head rv">
        <p class="eyebrow">Why Choose Us</p>
        <h2>Why pharma buyers stay with us</h2>
      </div>
      <div class="why-grid rv">
        <div class="why-item cascade" style="--i:0"><span class="why-num">01</span><b>Pharma &amp; Dairy Specialists</b><p>Every product we fabricate is built to the hygiene and compliance standards of pharmaceutical and dairy production.</p></div>
        <div class="why-item cascade" style="--i:1"><span class="why-num">02</span><b>Custom Fabrication</b><p>We design and build to your specifications, ensuring seamless integration into your processes.</p></div>
        <div class="why-item cascade" style="--i:2"><span class="why-num">03</span><b>SS 304 / 316L Grade Assurance</b><p>Fabricated using top-grade stainless steel materials to ensure hygiene and durability.</p></div>
        <div class="why-item cascade" style="--i:3"><span class="why-num">04</span><b>Timely Delivery &amp; Installation</b><p>We value your time and ensure projects are completed on schedule.</p></div>
      </div>
    </div>
  </section>

  <section class="sec shell">
    <div class="callout rv">
      <p class="eyebrow">Promoter</p>
      <h2 style="font-size:clamp(1.3rem,2.4vw,1.8rem);font-weight:800;text-transform:uppercase;margin-top:var(--space-2)">R. G. Gunaseelan</h2>
      <p style="margin-top:var(--space-2)">Guna Steels serves the pharmaceutical and dairy sectors from its workshop at ${ADDR_L1}, ${ADDR_L2}.</p>
    </div>
  </section>`,
});
fs.writeFileSync(`${ROOT}/about.html`, about);

/* ---------- SERVICES ---------- */
const services = shell({
  file: 'services.html',
  title: 'Services — Fabrication, Purified Water Systems & Custom Engineering | Guna Steels',
  desc: 'Sanitary stainless steel fabrication, purified water generation and distribution, and custom engineering in SS 304 / 316L for pharmaceutical, dairy and food plants. Guna Steels, Tindivanam, Tamil Nadu, India.',
  schema: LOCALBIZ,
  ghost: 'SERVICES',
  crumb: 'Services',
  h1: 'What we build for you',
  intro: 'Three services, all pharma-grade, all engineered around your process and your compliance requirements.',
  body: `  <section class="sec shell">
    <div class="prow rv" id="fabrication">
      <div>
        <p class="eyebrow">01 — Fabrication</p>
        <h2>Stainless Steel Fabrication</h2>
        <p>Cut, formed, welded and finished in-house to your drawings, in SS 304 and SS 316L, with surface finishes appropriate to pharmaceutical hygiene requirements.</p>
        <ul class="applist">
          <li>Fabrication to your drawings and specifications</li>
          <li>Hygienic welding and finishing</li>
          <li>Quality control before dispatch</li>
        </ul>
        <a class="btn btn-line" href="contact.html">Get a fabrication quote</a>
      </div>
      <div class="prow-media"><img src="assets/sections/fabrication.webp" alt="Stainless steel fabricated parts by Guna Steels: concentric reducer, tee, bend, flange, reducing elbow and reducer" width="1200" height="900" loading="lazy"></div>
    </div>

    <div class="prow rv" id="water">
      <div>
        <p class="eyebrow">02 — Purified Water</p>
        <h2>Purified Water Systems</h2>
        <p>Generation and distribution systems designed for compliant plants — specified, fabricated, installed and commissioned.</p>
        <ul class="applist">
          <li>System design around your capacity requirements</li>
          <li>Generation and distribution fabrication</li>
          <li>On-site installation and commissioning</li>
        </ul>
        <a class="btn btn-line" href="contact.html">Get a water system quote</a>
      </div>
      <div class="prow-media"><img src="assets/sections/water.webp" alt="Purified water system components by Guna Steels: pipe, in-line filter, Y-type strainer, welded union, SMS union and spray ball" width="1200" height="900" loading="lazy"></div>
    </div>

    <div class="prow rv" id="custom">
      <div>
        <p class="eyebrow">03 — Custom Engineering</p>
        <h2>Custom Engineering Solutions</h2>
        <p>Solutions engineered around your process, not a catalogue. Bring us the constraint and we'll work out what it takes to build.</p>
        <ul class="applist">
          <li>Design support from concept to drawing</li>
          <li>One-off and bespoke builds</li>
          <li>Integration with existing plant</li>
        </ul>
        <a class="btn btn-line" href="contact.html">Get a custom build quote</a>
      </div>
      <div class="prow-media"><img src="assets/sections/engineering.webp" alt="Custom engineered assemblies by Guna Steels: three way manifold, pneumatic valve, pressure regulating valve, ferrule needle valve, 2 PC ball valve and sample cock valve" width="1200" height="900" loading="lazy"></div>
    </div>
  </section>`,
});
fs.writeFileSync(`${ROOT}/services.html`, services);

/* ---------- CONTACT (RFQ) ---------- */
const contact = shell({
  file: 'contact.html',
  title: 'Request a Quote — Guna Steels | Tindivanam, Tamil Nadu',
  desc: `Request a quote from Guna Steels — manufacturer & supplier of sanitary stainless steel valves, fittings and pharma-grade equipment in SS 304 / 316L. Call ${TEL_DISP}, WhatsApp, or send an enquiry. Tindivanam, Tamil Nadu, India.`,
  schema: LOCALBIZ,
  ghost: 'CONTACT',
  crumb: 'Contact',
  h1: 'Request a quote',
  intro: 'Send a product code, a drawing, or the problem. Call, WhatsApp, or use the form — whichever is quickest for you.',
  body: `  <section class="sec shell">
    <div class="contact-grid rv">
      <form method="post" action="/enquiry" id="rfq">
        <div class="field">
          <label for="name">Name <span class="req">*</span></label>
          <input id="name" name="name" required autocomplete="name">
        </div>
        <div class="field">
          <label for="company">Company</label>
          <input id="company" name="company" autocomplete="organization">
        </div>
        <div class="field">
          <label for="email">Email <span class="req">*</span></label>
          <input id="email" name="email" type="email" required autocomplete="email">
        </div>
        <div class="field">
          <label for="phone">Phone</label>
          <input id="phone" name="phone" type="tel" autocomplete="tel">
        </div>
        <div class="field">
          <label for="product">Product / Interest</label>
          <input id="product" name="product" placeholder="e.g. RO-051 Ball Valve, or describe your requirement">
          <p class="hint" id="prefillNote" hidden>Pre-filled from the product page you came from.</p>
        </div>
        <div class="field">
          <label for="msg">Message</label>
          <textarea id="msg" name="message"></textarea>
        </div>
        <input class="hp" type="text" name="company_website" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button class="btn btn-dark" type="submit" data-evt="form">Send my enquiry</button>
        <p class="note" style="margin-top:var(--space-2)">We'll reply to ${MAIL} enquiries within one working day.</p>
      </form>

      <div>
        <ul class="contact-list">
          <li><b>Phone</b><a href="tel:${TEL_RAW}" data-evt="call">${TEL_DISP}</a></li>
          <li><b>WhatsApp</b><a href="${WA}" target="_blank" rel="noopener" data-evt="whatsapp">Message us on WhatsApp</a></li>
          <li><b>Email</b><a href="mailto:${MAIL}">${MAIL}</a></li>
          <li><b>Workshop</b><p>${ADDR_L1},<br>${ADDR_L2}</p></li>
          <li><b>Promoter</b><p>R. G. Gunaseelan</p></li>
        </ul>
        <iframe class="map" title="Guna Steels workshop location, Tindivanam, Tamil Nadu"
          loading="lazy" referrerpolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps?q=Sanjeevarayan%20Pettai%20First%20Street%2C%20Tindivanam%2C%20Tamil%20Nadu%20604001&output=embed"></iframe>
      </div>
    </div>
  </section>`,
});
fs.writeFileSync(`${ROOT}/contact.html`, contact);

console.log('pages written : catalogue, technical, products, about, services, contact');
console.log('types derived :', TYPES.join(', '));
console.log('items         :', ITEMS.length, '| dairy:', ITEMS.filter(i=>i.range==='dairy').length, '| casting:', ITEMS.filter(i=>i.range==='casting').length);

