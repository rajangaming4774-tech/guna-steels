/* Rebuilds the index.html body per PRD §6.1.
   The hero (STEEL wordmark + tower, scroll-to-expand) is kept exactly as-is —
   only everything from the value strip to </main> is replaced. The old body
   duplicated About/Products/Contact copy that now has real pages. */
const fs = require('fs');
const REPO = require('path').resolve(__dirname, '../../').replace(/\\/g, '/');
const ROOT = REPO;
const F = `${ROOT}/index.html`;
let h = fs.readFileSync(F, 'utf8');
fs.writeFileSync(F + '.bak-home', h);

const TEL = '+917358435969';
const TEL_DISP = '+91 73584 35969';
const MAIL = 'info.gunasteels@gmail.com';
const N = JSON.parse(fs.readFileSync(`${ROOT}/assets/products.json`, 'utf8')).items.length;

const CATS = [
  ['Stainless Steel Fabrication Accessories', 'Sanitary Tri-Clamp (TC) clamps, SMS and DIN unions, supports and hygienic connections.'],
  ['Stainless Steel Equipments', 'Process equipment engineered for hygiene, durability and daily production loads.'],
  ['Stainless Steel Instruments', 'Precision instruments finished to the tolerances regulated production demands.'],
  ['Purified Water System — Generation &amp; Distribution', 'Generation and distribution systems, designed, fabricated and installed end to end.'],
];

const body = `
  <!-- STATEMENT — brand line + primary/secondary CTA (PRD 6.1).
       Sits directly below the hero because the hero itself is kept wordless. -->
  <section class="statement">
    <div class="shell rv">
      <p class="eyebrow">Guna Steels · Tindivanam, Tamil Nadu</p>
      <h2 class="statement-h">Premium Stainless Steel<br><b>Pharma Equipment Manufacturer</b></h2>
      <p class="statement-tag">Precision Fabrication • SS 304 &amp; SS 316L • Custom Engineering</p>
      <p class="statement-p">Manufacturer and supplier of sanitary, pharma-grade stainless steel valves, fittings, equipment and purified water systems — Tri-Clamp (TC), SMS and DIN — for pharmaceutical, dairy and food-processing plants across India. Built to your drawings, to the hygiene and compliance standards your production demands.</p>
      <div class="statement-cta">
        <a class="btn btn-dark" href="contact.html">Get a Quote</a>
        <a class="btn btn-line" href="brochure.pdf" download data-evt="brochure">Download Brochure</a>
      </div>
    </div>
  </section>

  <!-- TRUST STATS (item 2) — animated counters.
       NUMBERS ARE PLACEHOLDERS supplied as examples; replace with verified
       figures before launch. ISO line shown only if a real certificate exists. -->
  <section class="values trust">
    <div class="shell trust-in rv">
      <div class="trust-item cascade" style="--i:0"><b><span class="count" data-count="10">0</span>+</b><span>Years of Experience</span></div>
      <div class="trust-item cascade" style="--i:1"><b><span class="count" data-count="500">0</span>+</b><span>Projects Delivered</span></div>
      <div class="trust-item cascade" style="--i:2"><b><span class="count" data-count="100">0</span>+</b><span>Clients Served</span></div>
      <div class="trust-item cascade" style="--i:3"><b><span class="count" data-count="96">0</span>+</b><span>Products &amp; Fittings</span></div>
    </div>
  </section>

  <!-- VALUE STRIP -->
  <section class="values">
    <div class="shell values-in rv">
      <div class="value cascade" style="--i:0"><b>Precision</b><i>Built to your drawings, to the micron that matters.</i></div>
      <div class="value cascade" style="--i:1"><b>Purity</b><i>Hygienic finishes for regulated environments.</i></div>
      <div class="value cascade" style="--i:2"><b>Performance</b><i>Equipment that runs, shift after shift.</i></div>
    </div>
  </section>

  <!-- ABOUT PREVIEW -->
  <section class="sec shell">
    <div class="about rv">
      <div>
        <p class="eyebrow">About Us</p>
        <h2 style="font-size:clamp(1.6rem,3vw,2.4rem);font-weight:800;text-transform:uppercase;margin-top:var(--space-2)">Pharma is not a<br>side business for us</h2>
        <p style="margin-top:var(--space-3);color:var(--steel-600)">Established with a vision to serve the pharmaceutical sector with cutting-edge equipment, Guna Steels has emerged as a reliable manufacturer and fabricator of stainless steel pharma-grade machinery and components.</p>
        <p style="margin-top:var(--space-2);color:var(--steel-600)">Our workshop in Tindivanam, Tamil Nadu is equipped with modern fabrication tools and quality control processes to ensure each product meets strict standards.</p>
        <a class="btn btn-line" style="margin-top:var(--space-4)" href="about.html">See how we work</a>
      </div>
      <div class="about-media"><img src="assets/sections/workshop.webp" alt="Interior of a stainless steel fabrication workshop: a large polished steel pipe section suspended from an overhead gantry crane, with vessels and pipe sections along the floor" width="1400" height="1050" loading="lazy"></div>
    </div>
  </section>

  <!-- PRODUCT CATEGORIES -->
  <section class="sec shell">
    <div class="sec-head rv">
      <p class="eyebrow">Products</p>
      <h2>What we fabricate</h2>
      <p>Four categories of pharma-grade stainless steel, each built to specification.</p>
    </div>
    <div class="grid-4 rv">
${CATS.map(([n, d], i) => `      <a class="card cascade" style="--i:${i}" href="products.html">
        <h3>${n}</h3>
        <p>${d}</p>
        <span class="go">See the range →</span>
      </a>`).join('\n')}
    </div>
  </section>

  <!-- CATALOGUE TEASER -->
  <section class="sec shell">
    <div class="callout callout-split rv">
      <div>
        <p class="eyebrow">Full Catalogue</p>
        <h2 style="font-size:clamp(1.5rem,3vw,2.2rem);font-weight:800;text-transform:uppercase;margin-top:var(--space-2)">${N} products, searchable by code</h2>
        <p style="margin-top:var(--space-2)">Every sanitary valve and fitting we manufacture is a searchable, indexable page — look up a product by code or name, view the SS 304 / 316L spec, and request a quote. From dairy valves and Tri-Clamp fittings to purified water components, the full range is a click away. No PDF required.</p>
        <div style="display:flex;gap:var(--space-1);flex-wrap:wrap;margin-top:var(--space-4)">
          <a class="btn btn-dark" href="catalogue.html">Browse all ${N} products</a>
          <a class="btn btn-line" href="technical.html">Technical resources</a>
        </div>
      </div>
      <div class="callout-media" aria-hidden="true">
        <img src="assets/products/RO-051.webp" alt="" width="560" height="560" loading="lazy">
        <img src="assets/products/RO-043.webp" alt="" width="560" height="560" loading="lazy">
      </div>
    </div>
  </section>

  <!-- WHY US -->
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

  <!-- TRUST BAND (PRD 6.1: material, focus, location) -->
  <section class="band">
    <div class="wordmark-sm" aria-hidden="true">316L</div>
    <div class="shell band-in rv">
      <div class="band-item cascade" style="--i:0"><b>SS 304 / 316L</b><span>Top-grade stainless throughout, for hygiene and durability.</span></div>
      <div class="band-item cascade" style="--i:1"><b>Pharma &amp; Dairy</b><span>Sanitary equipment for regulated production — that is the whole business.</span></div>
      <div class="band-item cascade" style="--i:2"><b>Tindivanam, Tamil Nadu</b><span>Our own workshop, with modern tooling and quality control.</span></div>
    </div>
  </section>

  <!-- SERVICES PREVIEW -->
  <section class="sec shell">
    <div class="sec-head rv">
      <p class="eyebrow">Services</p>
      <h2>How we work with you</h2>
    </div>
    <div class="grid-3 rv">
      <a class="card cascade" style="--i:0" href="services.html#fabrication">
        <h3>Stainless Steel Fabrication</h3>
        <p>Cut, formed, welded and finished in-house to your drawings.</p>
        <span class="go">See the service →</span>
      </a>
      <a class="card cascade" style="--i:1" href="services.html#water">
        <h3>Purified Water Systems</h3>
        <p>Generation and distribution, designed for compliant plants.</p>
        <span class="go">See the service →</span>
      </a>
      <a class="card cascade" style="--i:2" href="services.html#custom">
        <h3>Custom Engineering</h3>
        <p>Solutions engineered around your process, not a catalogue.</p>
        <span class="go">See the service →</span>
      </a>
    </div>
  </section>

  <!-- PROJECT GALLERY (item 5).
       Uses existing product/workshop imagery as a starter. Replace with REAL
       photos of the factory, machines, welding, fabrication and installations. -->
  <section class="sec shell">
    <div class="sec-head rv">
      <p class="eyebrow">Gallery</p>
      <h2>Inside the workshop</h2>
      <p>Fabrication, finishing and the range we build. Real project and facility photography drops in here.</p>
    </div>
    <div class="gallery rv">
      <figure class="gtile gtile-wide cascade" style="--i:0"><img src="assets/sections/workshop.webp" alt="Guna Steels stainless steel fabrication workshop" width="1400" height="1050" loading="lazy"><figcaption>Fabrication workshop</figcaption></figure>
      <figure class="gtile cascade" style="--i:1"><img src="assets/sections/fabrication.webp" alt="Stainless steel fabricated fittings" width="1200" height="900" loading="lazy"><figcaption>Fittings &amp; fabrication</figcaption></figure>
      <figure class="gtile cascade" style="--i:2"><img src="assets/sections/water.webp" alt="Purified water system components" width="1200" height="900" loading="lazy"><figcaption>Purified water components</figcaption></figure>
      <figure class="gtile cascade" style="--i:3"><img src="assets/sections/engineering.webp" alt="Custom engineered stainless steel assemblies" width="1200" height="900" loading="lazy"><figcaption>Custom engineering</figcaption></figure>
    </div>
  </section>

  <!-- TESTIMONIALS (item 4).
       PLACEHOLDER template — replace each with a REAL client quote, name and
       company. Do not ship fabricated testimonials. -->
  <section class="values">
    <div class="sec shell">
      <div class="sec-head rv" style="text-align:center;margin-left:auto;margin-right:auto">
        <p class="eyebrow" style="justify-content:center">What clients say</p>
        <h2>Trusted by pharma &amp; dairy plants</h2>
      </div>
      <div class="grid-3 rv">
        <blockquote class="tcard cascade" style="--i:0"><p>“Add a real client testimonial here — a sentence or two on quality, delivery or service.”</p><footer><b>Client name</b><span>Company · City</span></footer></blockquote>
        <blockquote class="tcard cascade" style="--i:1"><p>“Add a real client testimonial here — a sentence or two on quality, delivery or service.”</p><footer><b>Client name</b><span>Company · City</span></footer></blockquote>
        <blockquote class="tcard cascade" style="--i:2"><p>“Add a real client testimonial here — a sentence or two on quality, delivery or service.”</p><footer><b>Client name</b><span>Company · City</span></footer></blockquote>
      </div>
    </div>
  </section>

  <!-- FAQ (item 8) — accessible native accordion, no JS needed. -->
  <section class="sec shell">
    <div class="sec-head rv">
      <p class="eyebrow">FAQ</p>
      <h2>Common questions</h2>
    </div>
    <div class="faq rv">
      <details><summary>What steel grades do you use?</summary><p>We fabricate in SS 304 and SS 316L. SS 316L, with added molybdenum and low carbon, is typically specified for pharmaceutical product-contact surfaces; SS 304 covers general sanitary work. We build to the grade your specification calls for.</p></details>
      <details><summary>What is the delivery time?</summary><p>Lead time depends on the product, quantity and finish. We confirm a firm delivery date with every quote — send us your requirement and we'll come back with grade, lead time and price.</p></details>
      <details><summary>Do you provide installation?</summary><p>Yes. For purified water systems and larger equipment we handle installation and commissioning on site, alongside fabrication.</p></details>
      <details><summary>Do you manufacture custom equipment?</summary><p>Yes. Custom engineering is a core service — we design and build to your drawings and process, not just from a catalogue. Send a drawing or describe the problem and we'll work out what it takes to build it.</p></details>
      <details><summary>Which industries do you serve?</summary><p>Primarily the pharmaceutical and dairy industries, plus food-processing plants — anywhere sanitary, hygienic stainless steel is required.</p></details>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta">
    <div class="shell cta-in rv">
      <div>
        <h2>Tell us what you need built</h2>
        <p>Send a product code, a drawing, or just the problem. We come back with what it takes to build it — grade, lead time and price.</p>
      </div>
      <div class="cta-btns">
        <a class="btn btn-white" href="contact.html">Request a Quote</a>
        <a class="btn btn-ghost" href="tel:${TEL}" data-evt="call">Call ${TEL_DISP}</a>
      </div>
    </div>
  </section>

  <!-- CONTACT SUMMARY -->
  <section class="sec shell">
    <div class="contact-grid rv">
      <div>
        <p class="eyebrow">Get in touch</p>
        <h2 style="font-size:clamp(1.5rem,3vw,2.2rem);font-weight:800;text-transform:uppercase;margin-top:var(--space-2)">Talk to the people who build it</h2>
        <p style="margin-top:var(--space-3);color:var(--steel-600);max-width:52ch">Tell us the grade, the size and the application — or just send the drawing. We reply within one working day.</p>
        <a class="btn btn-dark" style="margin-top:var(--space-4)" href="contact.html">Get a quote</a>
      </div>
      <ul class="contact-list">
        <li><b>Phone</b><a href="tel:${TEL}" data-evt="call">${TEL_DISP}</a></li>
        <li><b>Email</b><a href="mailto:${MAIL}">${MAIL}</a></li>
        <li><b>Workshop</b><p>19/36E, Sanjeevarayan Pettai, First Street,<br>Tindivanam, Tamil Nadu – 604001</p></li>
      </ul>
    </div>
  </section>
</main>`;

/* Replace from the FIRST statement marker (or the value strip, on the very
   first build) greedily through </main>. Anchoring on VALUE STRIP was the bug:
   the injected body begins with the STATEMENT band, which sits above VALUE
   STRIP, so each rebuild kept the old statement and prepended a new one —
   the homepage accumulated duplicate statement bands. Matching from the first
   STATEMENT and swallowing everything to </main> collapses any duplicates. */
/* Test the match explicitly rather than comparing before/after. Comparing
   strings reported a false "markers not matched" whenever the regenerated body
   was byte-identical to what was already there — i.e. every re-run of an
   already-built site failed. The build must be idempotent. */
const BODY_RE = /\n  <!-- (?:STATEMENT|VALUE STRIP)[\s\S]*<\/main>/;
if (!BODY_RE.test(h)) { console.error('ABORT: body markers not matched'); process.exit(1); }
const before = h;
h = h.replace(BODY_RE, body);
if (h === before) console.log('(body already current — no change)');
const dupes = (h.match(/<section class="statement">/g) || []).length;
if (dupes !== 1) { console.error('ABORT: expected exactly 1 statement section, got', dupes); process.exit(1); }

fs.writeFileSync(F, h);
console.log('index.html rebuilt:', h.length, 'bytes');
console.log('has View Products CTA :', h.includes('>View Products<'));
console.log('has Request a Quote   :', h.includes('>Request a Quote<'));
console.log('has brand line        :', h.includes('Your Trusted Partner for'));
console.log('hero preserved        :', h.includes('hero-media') && h.includes('STEEL'));
