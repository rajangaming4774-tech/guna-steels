# Guna Steels

Marketing website for **Guna Steels** — pharma-grade stainless steel fabrication, Thindivanam, Tamil Nadu.

A static, multi-page site: hand-written HTML, CSS, and vanilla JS. No build step.

## Pages

| Page | File |
|------|------|
| Home | `index.html` |
| About Us | `about.html` |
| Products | `products.html` |
| Services | `services.html` |
| Contact Us | `contact.html` |

Shared styles and script live in `assets/`. The home hero is a scroll-to-expand
steel panel over a full-width `STEEL` wordmark.

## Run locally

No dependencies. Serve the folder with any static server, e.g. the bundled one:

```bash
node serve.js
```

Then open http://localhost:4321

## Deploy (GitHub Pages)

Settings → Pages → Build from branch → `main` / root. The site is fully static,
so it serves as-is.

## To do before launch

- `brochure.pdf` — add the real brochure (all pages link to it).
- `tower.jpg` — hero photo is ~1.9 MB; convert to WebP/AVIF for mobile performance.
- Hero stats and any figures are placeholders until verified.
- Wire the contact form to a real handler / notification email.
