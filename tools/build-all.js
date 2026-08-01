#!/usr/bin/env node
/* Regenerate the whole site from source data.
 *
 *   node tools/build-all.js
 *
 * Runs the generators in the order they must run:
 *   1. build-site   – catalogue, 96 product pages, products/about/services/
 *                     technical/contact, from assets/products.json
 *   2. build-home   – the index.html body (hero is preserved, not regenerated)
 *   3. add-home-nav – the primary nav + aria-current on all 103 pages
 *   4. finish       – cache-bust asset versions, sitemap.xml, robots.txt
 *
 * Order matters: build-* rewrite whole pages, so the nav pass and the version
 * stamping have to come after them or their changes are overwritten.
 */
const { execFileSync } = require('child_process');
const path = require('path');

const steps = [
  ['build/build-site.js',   'pages + 96 product pages'],
  ['build/build-home.js',   'home page body'],
  ['build/add-home-nav.js', 'primary nav on every page'],
  ['build/finish.js',       'asset versions, sitemap, robots'],
];

let failed = 0;
for (const [rel, label] of steps) {
  const script = path.join(__dirname, rel);
  process.stdout.write(`\n▶ ${label}  (${rel})\n`);
  try {
    // inherit so each script's own output/verification is visible
    execFileSync(process.execPath, [script], { stdio: 'inherit' });
  } catch (e) {
    failed++;
    console.error(`✗ FAILED: ${rel}`);
  }
}

process.stdout.write('\n' + (failed ? `✗ ${failed} step(s) failed\n` : '✓ build complete\n'));
process.stdout.write('  verify with:  node tools/check/links.js && node tools/check/encoding.js\n');
process.exit(failed ? 1 : 0);
