/* Guna Steels — Express + EJS.
   Replaces the old 103-file static build: every page is now a route rendering a
   template, and the 96 product pages are one route over assets/products.json. */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const express = require('express');
const compression = require('compression');
const data = require('./data/site');

const app = express();
const PORT = process.env.PORT || 4321;
const PUBLIC = path.join(__dirname, 'public');

/* Content-hash the assets that change, so a deploy is never served from a stale
   cache. Read once at boot: these are build outputs, not live-edited files. */
function assetVersion(rel) {
  try {
    const buf = fs.readFileSync(path.join(PUBLIC, rel));
    return crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8);
  } catch {
    return 'dev';
  }
}
const V = {
  css: assetVersion('assets/site.css'),
  app: assetVersion('assets/app.js'),
  catalogue: assetVersion('assets/catalogue.js'),
};

/* Trim to a whole word within a character budget — used to keep generated meta
   descriptions inside the ~160 chars a search result will actually show. */
function clampWords(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:—-]+$/, '') + '…';
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.disable('x-powered-by');

app.use(compression());
app.use(express.urlencoded({ extended: false }));

/* Static assets. The stylesheet and scripts are requested with a ?v=<hash>
   that changes whenever their bytes change, so they can be cached hard. */
app.use(
  express.static(PUBLIC, {
    maxAge: '30d',
    setHeaders(res, filePath) {
      if (/\.(css|js)$/.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  })
);

/* Every template gets the site chrome without each route repeating it. */
app.use((req, res, next) => {
  res.locals.site = data.site;
  res.locals.nav = data.nav;
  res.locals.cta = data.cta;
  res.locals.heroPhotos = data.heroPhotos;
  res.locals.current = '';
  res.locals.canonical = data.site.origin + req.path.replace(/\/$/, '');
  res.locals.ogImage = data.site.origin + '/assets/sections/workshop.webp';
  res.locals.bodyClass = '';
  res.locals.v = V;
  res.locals.breadcrumbs = buildCrumbs(req.path);
  next();
});

/* Breadcrumb trail, derived from the URL so it can never drift out of sync
   with the nav. Feeds both the visible .crumb line and the BreadcrumbList
   structured data that Google uses to show a path instead of a bare URL. */
function buildCrumbs(pathname) {
  const home = { name: 'Home', href: '/' };
  const product = pathname.match(/^\/product\/(RO-\d{3})$/i);
  if (product) {
    return [
      home,
      { name: 'Catalogue', href: '/catalogue' },
      { name: product[1].toUpperCase(), href: pathname },
    ];
  }
  const item = data.nav.find((n) => n.href === pathname && n.href !== '/');
  return item ? [home, { name: item.label, href: item.href }] : [home];
}

/* ---------- pages ---------- */

app.get('/', (req, res) => {
  res.render('home', {
    current: 'home',
    canonical: data.site.origin + '/',
    ...data.seo.home,
    values: data.values,
    trust: data.trust,
    whyUs: data.whyUs,
    categories: data.categories,
    services: data.services,
    gallery: data.gallery,
    faq: data.faq,
    total: data.products.length,
    teaserImages: [
      data.byCode.get('RO-051')?.image,
      data.byCode.get('RO-043')?.image,
    ].filter(Boolean),
  });
});

app.get('/about', (req, res) => {
  res.render('about', {
    current: 'about',
    ...data.seo.about,
    values: data.values,
    capability: data.capability,
    whyUs: data.whyUs,
  });
});

app.get('/products', (req, res) => {
  res.render('products', {
    current: 'products',
    ...data.seo.products,
    categories: data.categories,
    total: data.products.length,
  });
});

app.get('/catalogue', (req, res) => {
  res.render('catalogue', {
    current: 'catalogue',
    ...data.seo.catalogue,
    products: data.products,
    ranges: data.ranges,
    types: data.types,
  });
});

app.get('/services', (req, res) => {
  res.render('services', {
    current: 'services',
    ...data.seo.services,
    services: data.services,
  });
});

app.get('/technical', (req, res) => {
  res.render('technical', {
    current: 'technical',
    ...data.seo.technical,
    glossary: data.glossary,
  });
});

app.get('/contact', (req, res) => {
  res.render('contact', {
    current: 'contact',
    ...data.seo.contact,
    prefill: typeof req.query.product === 'string' ? req.query.product : '',
    sent: req.query.sent === '1',
  });
});

/* Product detail — one route for all 96. */
app.get('/product/:code', (req, res, next) => {
  const raw = String(req.params.code);
  const code = raw.replace(/\.html$/i, '').toUpperCase();
  const p = data.byCode.get(code);
  if (!p) return next();
  // One canonical URL per product: /product/ro-51.html and mixed case both
  // 301 to /product/RO-051 rather than serving duplicate content.
  if (raw !== code) return res.redirect(301, '/product/' + code);

  const all = data.products;
  const kind = p.type.toLowerCase();

  /* Product names vary a lot in length, so title and description are built and
     then bounded rather than assumed to fit. An over-long title gets truncated
     by Google mid-phrase; dropping the brand suffix loses the least. */
  const titleBase = `${p.name} (${p.code}) — SS 304/316L`;
  const titleFull = `${titleBase} | Guna Steels`;

  res.render('product', {
    current: 'catalogue',
    canonical: `${data.site.origin}/product/${p.code}`,
    ogImage: data.site.origin + p.image,
    title: titleFull.length <= 62 ? titleFull : titleBase,
    description: clampWords(
      `${p.name} (${p.code}) — sanitary stainless steel ${kind} in SS 304 / 316L with TC, SMS or DIN ends, for pharmaceutical and dairy process lines.`,
      160
    ),
    keywords: `${p.name}, ${p.code}, stainless steel ${kind}, sanitary ${kind}, SS 304, SS 316L, ${p.rangeLabel}, Tri-Clamp, SMS, DIN`,
    lede: `SS 304 / 316L sanitary ${kind} · Product code ${p.code} · ${p.rangeLabel}`,
    p,
    prev: all[p.index - 1] || null,
    next: all[p.index + 1] || null,
  });
});

/* ---------- enquiry form ----------
   No mail transport is wired up yet, so the submission is logged and the user
   gets a confirmation rather than a silent success. Point this at a real
   handler (SMTP / form service) before launch. */
app.post('/enquiry', (req, res) => {
  const b = req.body || {};
  if (b.company_website) return res.redirect(303, '/contact?sent=1'); // honeypot tripped
  console.log('[enquiry]', {
    name: b.name,
    company: b.company,
    email: b.email,
    phone: b.phone,
    product: b.product,
    message: b.message,
  });
  res.redirect(303, '/contact?sent=1');
});

/* ---------- sitemap + robots ---------- */

app.get('/sitemap.xml', (req, res) => {
  const urls = [
    { loc: '/', pri: '1.0' },
    { loc: '/about', pri: '0.8' },
    { loc: '/products', pri: '0.9' },
    { loc: '/catalogue', pri: '0.9' },
    { loc: '/services', pri: '0.8' },
    { loc: '/technical', pri: '0.7' },
    { loc: '/contact', pri: '0.8' },
    ...data.products.map((p) => ({ loc: p.href, pri: '0.6' })),
  ];
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls
        .map((u) => `  <url><loc>${data.site.origin}${u.loc}</loc><priority>${u.pri}</priority></url>`)
        .join('\n') +
      `\n</urlset>\n`
  );
});

/* ---------- legacy .html URLs ----------
   The previously deployed site exposed /about.html and /product/RO-001.html.
   Redirect rather than 404 so existing links and search results survive. */
app.get(/^\/(.+)\.html$/, (req, res, next) => {
  const slug = req.params[0];
  if (slug === 'index') return res.redirect(301, '/');
  const target = '/' + slug;
  const known =
    data.nav.some((n) => n.href === target) || /^\/product\/RO-\d{3}$/i.test(target);
  if (!known) return next();
  res.redirect(301, target);
});

/* ---------- 404 ---------- */
app.use((req, res) => {
  res.status(404).render('404', { current: '', ...data.seo.notFound });
});

/* Listen only when run directly. Exporting the app keeps it usable from a
   serverless host (Vercel et al.), which imports the handler instead. */
if (require.main === module) {
  app.listen(PORT, () => console.log(`Guna Steels running on http://localhost:${PORT}`));
}

module.exports = app;
