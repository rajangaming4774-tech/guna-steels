/* Crawls the running Express site from / and reports broken internal links,
   non-200 pages, and missing assets. Usage: node tools/check/crawl.js [origin] */

const ORIGIN = process.argv[2] || 'http://localhost:4321';

const seen = new Map(); // url -> status
const queue = ['/'];
const referrers = new Map(); // url -> first page that linked to it
const problems = [];

const isInternal = (href) =>
  href &&
  !/^(https?:|mailto:|tel:|#|javascript:|data:)/i.test(href) &&
  !href.startsWith('//');

function normalise(href, from) {
  const [path] = href.split('#');
  if (!path) return null;
  const url = new URL(path, ORIGIN + from);
  if (url.origin !== ORIGIN) return null;
  return url.pathname + url.search;
}

async function main() {
  while (queue.length) {
    const url = queue.shift();
    if (seen.has(url)) continue;

    let res;
    try {
      res = await fetch(ORIGIN + url, { redirect: 'manual' });
    } catch (e) {
      seen.set(url, 'ERR');
      problems.push(`${url} — fetch failed: ${e.message} (linked from ${referrers.get(url)})`);
      continue;
    }
    seen.set(url, res.status);

    if (res.status >= 400) {
      problems.push(`${res.status} ${url} (linked from ${referrers.get(url) || 'entry'})`);
      continue;
    }
    if (res.status >= 300) continue; // redirect, fine

    const type = res.headers.get('content-type') || '';
    if (!type.includes('text/html')) continue;

    const html = await res.text();

    // internal links to crawl
    for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const raw = m[1];
      if (!isInternal(raw)) continue;
      const next = normalise(raw, url);
      if (!next || seen.has(next) || queue.includes(next)) continue;
      referrers.set(next, url);
      queue.push(next);
    }

    // ---- SEO assertions on rendered HTML ----
    // Measure what a browser shows, not the escaped source: "&amp;" is one
    // character on screen but five in the markup.
    const decode = (s) =>
      s
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');

    const title = decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
    if (title.length < 10) problems.push(`${url} — missing/short <title>`);
    // Google truncates around 60 chars; over 62 gets cut mid-phrase in results
    if (title.length > 62) problems.push(`${url} — <title> ${title.length} chars (max 62): "${title}"`);

    const desc = decode((html.match(/name="description" content="([^"]*)"/) || [])[1] || '');
    if (desc.length < 70) problems.push(`${url} — meta description ${desc.length} chars (min 70)`);
    if (desc.length > 165) problems.push(`${url} — meta description ${desc.length} chars (max 165)`);

    const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) =>
      decode(m[1].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
    );
    if (h1s.length !== 1) problems.push(`${url} — expected exactly 1 <h1>, found ${h1s.length}`);
    // an h1 hidden from readers wastes the strongest on-page signal
    if (/<h1[^>]*class="[^"]*\bsr-only\b/.test(html))
      problems.push(`${url} — <h1> is visually hidden (sr-only)`);
    if (h1s[0] && h1s[0].length < 12) problems.push(`${url} — <h1> too short: "${h1s[0]}"`);

    if (!/rel="canonical"/.test(html)) problems.push(`${url} — missing canonical`);
    if (!/property="og:image"/.test(html)) problems.push(`${url} — missing og:image`);
    // every page except the homepage should carry a breadcrumb trail
    if (url !== '/' && !/"@type":"BreadcrumbList"/.test(html))
      problems.push(`${url} — missing BreadcrumbList structured data`);
    if (/<%/.test(html)) problems.push(`${url} — unrendered EJS tag left in output`);
    // mojibake: UTF-8 em-dashes/quotes decoded as Latin-1 somewhere in the chain
    const moji = (html.match(/â€|â†|Ã‚|Â[^\s;]/g) || []).length;
    if (moji) problems.push(`${url} — ${moji} mojibake sequence(s)`);
    if (/undefined/.test(html.replace(/[a-z-]+undefined|undefined[a-z-]+/gi, '')))
      problems.push(`${url} — literal "undefined" in output`);
  }

  const pages = [...seen.entries()].filter(([, s]) => s === 200).length;
  const redirects = [...seen.entries()].filter(([, s]) => s >= 300 && s < 400).length;

  console.log(`crawled ${seen.size} urls — ${pages} ok, ${redirects} redirects`);
  if (problems.length) {
    console.log(`\n${problems.length} problem(s):`);
    problems.forEach((p) => console.log('  ✗ ' + p));
    process.exit(1);
  }
  console.log('no problems found');
}

main();
