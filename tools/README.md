# tools/

> **The `build/` scripts are superseded.** The site is now an Express + EJS app
> (`server.js` + `views/`), so pages are rendered per request instead of being
> generated into 103 HTML files. Running `build-all.js` would write static HTML
> that nothing serves. They are kept because the **asset pipeline** below is
> still the only way to regenerate product imagery from `brochure.pdf`, and
> `build/build-site.js` documents how `products.json` maps to page content.
>
> For verification, use `node tools/check/crawl.js` against the running app.

Scripts that generate the Guna Steels site. They used to live in Windows temp,
which meant the site could not be rebuilt once temp was cleared — they are now
versioned here.

Requires **Node.js** only. No install step for the build scripts; the asset
scripts need two packages (see below).

---

## Rebuild the site

```bash
node tools/build-all.js
```

That runs the four generators in the required order:

| Step | Script | What it does |
|---|---|---|
| 1 | `build/build-site.js` | Catalogue, all 96 product pages, plus products / about / services / technical / contact — all generated from `assets/products.json` |
| 2 | `build/build-home.js` | The `index.html` body. **The hero is preserved, not regenerated** — it edits only from the statement band down to `</main>` |
| 3 | `build/add-home-nav.js` | Primary nav + `aria-current` on all 103 pages |
| 4 | `build/finish.js` | Content-hash cache-busting on assets, `sitemap.xml`, `robots.txt` |

**Order matters.** Steps 1–2 rewrite whole pages, so the nav pass and version
stamping must come after or their changes get overwritten.

---

## Verify

Start the app (`npm run dev`), then:

```bash
node tools/check/crawl.js
```

Crawls every internal link and asserts, per page: exactly one `<h1>`, a title,
a meta description, no unrendered template tags, no mojibake. Expect
`306 urls — 306 ok, no problems found`.

The old `links.js` and `encoding.js` scanned the generated HTML files at the
repo root, which no longer exist; both are folded into `crawl.js` and archived
in `legacy-static/`.

---

## Asset pipeline (only when the brochure changes)

These regenerate the product imagery from `brochure.pdf`. Run in order:

```bash
npm install pdfjs-dist @napi-rs/canvas sharp   # one-off

node tools/assets/render-brochure.js      # PDF pages -> .tmp/pages/*.png
node tools/assets/crop-products.js        # detect + crop 96 product photos
node tools/assets/products-to-webp.js     # crops -> assets/products/*.webp
node tools/assets/build-montages.js       # section montages
node tools/assets/workshop-to-webp.js     # hero/about workshop image
```

`build-products-json.js` rewrites `assets/products.json` (codes, names, ranges)
from the brochure artwork. It contains the corrections made after reading the
printed pages — including RO-053 "Globe Valve" (unreadable in the PRD) and the
alternating dairy/casting ranges. **Re-running it overwrites manual edits to
`products.json`**, so only use it if you are re-deriving from the brochure.

The brochure PDF pages are flat bitmaps with no text layer, so `crop-products.js`
locates photos by detecting content bands rather than assuming a fixed grid —
pages carry 6, 9 or 12 items with section-header bands between rows.

---

## Notes

- `.tmp/` is scratch space for the asset pipeline and is gitignored.
- The site is static: no build step is needed to *serve* it, only to *regenerate*
  it. `node serve.js` serves the folder on <http://localhost:4321>.
- One-off CSS patches used during development are **not** included here. They are
  already applied to `assets/styles.css`; re-running them would append duplicate
  rules.
