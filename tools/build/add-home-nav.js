/* Adds a Home link as the first primary-nav item on every page, and marks the
   current page with aria-current so the active item is announced + styled. */
const fs = require('fs');
const REPO = require('path').resolve(__dirname, '../../').replace(/\\/g, '/');
const ROOT = REPO;

const NAV = [
  ['index.html', 'Home'],
  ['about.html', 'About Us'],
  ['products.html', 'Products'],
  ['catalogue.html', 'Catalogue'],
  ['services.html', 'Services'],
  ['technical.html', 'Technical'],
  ['contact.html', 'Contact'],
];

const top = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
const prod = fs.readdirSync(`${ROOT}/product`).map(f => `product/${f}`);
let done = 0, missed = [];

for (const f of [...top, ...prod]) {
  const inProduct = f.startsWith('product/');
  const p = inProduct ? '../' : '';
  const self = inProduct ? null : f;   // product pages have no nav item of their own

  const nav = `<nav class="nav" aria-label="Primary">\n` +
    NAV.map(([href, label]) =>
      `      <a href="${p}${href}"${href === self ? ' aria-current="page"' : ''}>${label}</a>`
    ).join('\n') +
    `\n    </nav>`;

  const file = `${ROOT}/${f}`;
  let h = fs.readFileSync(file, 'utf8');
  const before = h;
  h = h.replace(/<nav class="nav" aria-label="Primary">[\s\S]*?<\/nav>/, nav);
  if (h === before) { missed.push(f); continue; }
  fs.writeFileSync(file, h);
  done++;
}

console.log('nav updated on', done, 'pages');
if (missed.length) console.log('  !! not matched:', missed.join(', '));

// sanity: Home present and exactly one aria-current on a sample inner page
const s = fs.readFileSync(`${ROOT}/about.html`, 'utf8');
console.log('about.html has Home  :', /<a href="index\.html">Home<\/a>/.test(s));
console.log('about.html aria-current count:', (s.match(/aria-current="page"/g) || []).length);
const pr = fs.readFileSync(`${ROOT}/product/RO-001.html`, 'utf8');
console.log('product page Home path:', (pr.match(/<a href="(\.\.\/index\.html)">Home/) || [])[1] || 'MISSING');
