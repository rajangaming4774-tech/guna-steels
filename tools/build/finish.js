/* Syncs index.html to the new nav/footer, fixes PRD content issues site-wide,
   then re-stamps asset cache versions across every page (incl. product/). */
const fs = require('fs');
const REPO = require('path').resolve(__dirname, '../../').replace(/\\/g, '/');
const path = require('path');
const crypto = require('crypto');
const ROOT = REPO;

const NAV = [
  ['about.html', 'About Us'], ['products.html', 'Products'], ['catalogue.html', 'Catalogue'],
  ['technical.html', 'Technical'], ['services.html', 'Services'], ['contact.html', 'Contact'],
];

let h = fs.readFileSync(`${ROOT}/index.html`, 'utf8');
const orig = h;

// 1. nav — NOT rewritten here. add-home-nav.js owns the nav for all 103 pages;
//    rewriting it from this file's shorter NAV list silently dropped the Home
//    link from index.html every time this script re-ran for cache-stamping.

// 2. footer quick links
h = h.replace(/(<h4>Quick Links<\/h4>\s*<ul>)[\s\S]*?(<\/ul>)/,
  `$1\n          <li><a href="index.html">Home</a></li>\n${NAV.map(([f, l]) => `          <li><a href="${f}">${l}</a></li>`).join('\n')}\n        $2`);

// 3. PRD 8.1 content fixes
h = h.replace(/Thindivanam/g, 'Tindivanam');            // standardise spelling
h = h.replace(/\+91 73584 35969/g, '+91 73584 35969');  // already correct format
h = h.replace(/>WhatsApp<\/a>/g, '>WhatsApp</a>');

// 4. services footer links -> anchors on services page
h = h.replace(/href="services\.html"(>(?:Stainless Steel Fabrication|Purified Water Systems|Custom Engineering))/g,
  (m, g) => `href="services.html#${/Fabrication/.test(g) ? 'fabrication' : /Water/.test(g) ? 'water' : 'custom'}"${g}`);

if (h === orig) console.log('  !! index.html unchanged — check selectors');
fs.writeFileSync(`${ROOT}/index.html`, h);
console.log('index.html synced');

// 5. spelling sweep across every generated page
const pages = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
const prodPages = fs.readdirSync(`${ROOT}/product`).map(f => `product/${f}`);
let fixed = 0;
for (const f of [...pages, ...prodPages]) {
  const p = `${ROOT}/${f}`;
  let c = fs.readFileSync(p, 'utf8');
  const b = c;
  c = c.replace(/Thindivanam/g, 'Tindivanam');
  if (c !== b) { fs.writeFileSync(p, c); fixed++; }
}
console.log('spelling normalised in', fixed, 'files');

// 6. re-stamp asset versions everywhere
const hash = f => crypto.createHash('md5').update(fs.readFileSync(`${ROOT}/${f}`)).digest('hex').slice(0, 8);
const vCss = hash('assets/styles.css'), vJs = hash('assets/app.js'), vCat = hash('assets/catalogue.js');
let stamped = 0;
for (const f of [...pages, ...prodPages]) {
  const p = `${ROOT}/${f}`;
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/(assets\/styles\.css)(\?v=[a-f0-9]+)?/g, `$1?v=${vCss}`);
  c = c.replace(/(assets\/app\.js)(\?v=[a-f0-9]+)?/g, `$1?v=${vJs}`);
  c = c.replace(/(assets\/catalogue\.js)(\?v=[a-f0-9]+)?/g, `$1?v=${vCat}`);
  fs.writeFileSync(p, c);
  stamped++;
}
console.log('stamped', stamped, 'pages | css', vCss, '| app', vJs, '| cat', vCat);

// 7. sitemap
const urls = ['', ...NAV.map(n => n[0]), ...prodPages];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>https://gunasteels.in/${u}</loc></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(`${ROOT}/sitemap.xml`, sitemap);
console.log('sitemap.xml:', urls.length, 'urls');

fs.writeFileSync(`${ROOT}/robots.txt`, `User-agent: *\nAllow: /\nSitemap: https://gunasteels.in/sitemap.xml\n`);
console.log('robots.txt written');
