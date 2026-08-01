/* Crops the 96 product photos out of the rendered brochure pages.
   The PDF is a flat bitmap per page (no text layer, no embedded sub-images),
   so photos are located by detecting content bands rather than assuming a grid:
   pages carry 6/9/12 items and dark section-header bands between rows. */
const fs = require('fs');
const REPO = require('path').resolve(__dirname, '../../').replace(/\\/g, '/');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

const PAGES = `${REPO}/.tmp/pages`;
const OUT = `${REPO}/.tmp/crops`;
fs.mkdirSync(OUT, { recursive: true });

// verified page -> code sequence (read off the artwork, see notes)
const PAGE_CODES = {
  1: [1,2,3,4,5,6],
  2: [7,8,9,10,11,12,13,14,15,16,17,18],
  3: [19,20,21,22,23,24,25,26,27,28,29,30],
  4: [31,32,33,34,35,36,37,38,39,40,41,42],
  5: [43,44,45,46,47,48,49,50,51],
  6: [52,53,54,55,56,57,58,59,60,61,62,63],
  7: [64,65,66,67,68,69,70,71,72],
  8: [73,74,75,76,77,78,79,80,81,82,83,84],
  9: [85,86,87,88,89,90,91,92,93,94,95,96],
};

const code = n => 'RO-' + String(n).padStart(3, '0');

(async () => {
  const summary = [];

  for (const p of Object.keys(PAGE_CODES).map(Number)) {
    const img = await loadImage(`${PAGES}/page-${String(p).padStart(2,'0')}.png`);
    const W = img.width, H = img.height;
    const cv = createCanvas(W, H);
    const ctx = cv.getContext('2d');
    ctx.drawImage(img, 0, 0);
    /* Erase brand navy to white BEFORE detection, or the corner swoosh merges
       into the top-right photo's column run and lands inside that crop.
       Scoped deliberately: only the decorative corner arc and full-width bars.
       Erasing navy globally also wipes the blue handles/caps on the products
       themselves (RO-006, RO-049..052 etc). */
    const idat = ctx.getImageData(0, 0, W, H);
    const d = idat.data;
    const navyAt = i => {
      const r = d[i], g = d[i+1], b = d[i+2];
      return b > r + 25 && b > 60 && (r + g + b) / 3 < 130;
    };
    // rows that are mostly navy = section header / footer bar
    const barRow = new Array(H).fill(false);
    for (let y = 0; y < H; y++) {
      let n = 0;
      for (let x = 0; x < W; x += 4) if (navyAt((y * W + x) * 4)) n++;
      barRow[y] = n / (W / 4) > 0.45;
    }
    const CORNER_X = W * 0.70, CORNER_Y = H * 0.24;
    for (let y = 0; y < H; y++) {
      const inBar = barRow[y];
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        if (!navyAt(i)) continue;
        const inCorner = x > CORNER_X && y < CORNER_Y;
        if (inBar || inCorner) { d[i] = d[i+1] = d[i+2] = 255; }
      }
    }
    // the swoosh has a lighter anti-aliased edge that the navy test misses;
    // inside the corner region only, clear any bluish tint too
    for (let y = 0; y < CORNER_Y; y++) {
      for (let x = Math.floor(CORNER_X); x < W; x++) {
        const i = (y * W + x) * 4;
        const r = d[i], g = d[i+1], b = d[i+2];
        if (b > r + 8 && (r + g + b) / 3 < 225) { d[i] = d[i+1] = d[i+2] = 255; }
      }
    }
    ctx.putImageData(idat, 0, 0);
    const px = ctx.getImageData(0, 0, W, H).data;

    const at = (x, y) => { const i = (y * W + x) * 4; return [px[i], px[i+1], px[i+2]]; };
    // "content" = anything not near-white
    const isInk = (x, y) => { const [r,g,b] = at(x,y); return (r+g+b)/3 < 236; };
    // brand navy used by header bars / corner swoosh / footer
    const isNavy = (x, y) => { const [r,g,b] = at(x,y); return b > r + 25 && b > 60 && (r+g+b)/3 < 130; };

    // --- row bands of content
    const rowHas = new Array(H).fill(false);
    for (let y = 0; y < H; y++) {
      let n = 0;
      for (let x = 0; x < W; x += 2) if (isInk(x, y)) { n++; if (n > 3) break; }
      rowHas[y] = n > 3;
    }
    const bands = [];
    let s = null;
    for (let y = 0; y < H; y++) {
      if (rowHas[y] && s === null) s = y;
      else if (!rowHas[y] && s !== null) { if (y - s > 8) bands.push([s, y]); s = null; }
    }
    if (s !== null) bands.push([s, H]);

    // --- keep only photo bands: tall, and not a navy full-width bar
    const photoBands = bands.filter(([y0, y1]) => {
      const h = y1 - y0;
      if (h < 130) return false;                       // caption lines
      let navy = 0, ink = 0;
      for (let y = y0; y < y1; y += 4) for (let x = 0; x < W; x += 6) {
        if (isInk(x, y)) { ink++; if (isNavy(x, y)) navy++; }
      }
      if (ink === 0) return false;
      if (navy / ink > 0.45) return false;             // navy header / footer bar
      return true;
    });

    // --- within each band, cluster columns into up to 3 photo cells
    const cells = [];
    for (const [y0, y1] of photoBands) {
      const colHas = new Array(W).fill(false);
      for (let x = 0; x < W; x++) {
        let n = 0;
        for (let y = y0; y < y1; y += 2) {
          if (isInk(x, y) && !isNavy(x, y)) { n++; if (n > 2) break; }
        }
        colHas[x] = n > 2;
      }
      const runs = [];
      let cs = null;
      for (let x = 0; x < W; x++) {
        if (colHas[x] && cs === null) cs = x;
        else if (!colHas[x] && cs !== null) { if (x - cs > 25) runs.push([cs, x]); cs = null; }
      }
      if (cs !== null) runs.push([cs, W]);
      // merge runs closer than 60px (a photo can have gaps, e.g. two objects)
      const merged = [];
      for (const r of runs) {
        if (merged.length && r[0] - merged[merged.length-1][1] < 70) merged[merged.length-1][1] = r[1];
        else merged.push([...r]);
      }
      // drop the top-right corner swoosh: a run hugging the right edge on the first band
      const keep = merged.filter(([x0, x1]) => !(x1 > W - 12 && x0 > W * 0.82));
      for (const [x0, x1] of keep) cells.push({ x0, x1, y0, y1 });
    }

    /* Trim caption text off the bottom of a cell. On some pages the gap between
       photo and caption is under the band-split threshold, so they merge. Photo
       pixels are mid-grey; caption glyphs are near-black — so walk up from the
       bottom and drop rows that are text-like. */
    for (const c of cells) {
      for (let y = c.y1 - 1; y > c.y0 + 60; y--) {
        let ink = 0, mid = 0;
        for (let x = c.x0; x < c.x1; x += 2) {
          const [r, g, b] = at(x, y);
          const v = (r + g + b) / 3;
          if (v < 236) { ink++; if (v > 70) mid++; }
        }
        if (ink === 0) continue;
        const photoness = mid / ink;
        const coverage = ink / ((c.x1 - c.x0) / 2);
        // sparse + near-black => caption line, keep trimming
        if (photoness < 0.55 && coverage < 0.45) c.y1 = y; else break;
      }
    }

    // reading order: top-to-bottom, then left-to-right
    cells.sort((a, b) => (a.y0 - b.y0) || (a.x0 - b.x0));

    const codes = PAGE_CODES[p];
    summary.push({ page: p, cellsFound: cells.length, expected: codes.length });

    const n = Math.min(cells.length, codes.length);
    for (let i = 0; i < n; i++) {
      const c = cells[i];
      const pad = 16;
      const sx = Math.max(0, c.x0 - pad), sy = Math.max(0, c.y0 - pad);
      const sw = Math.min(W - sx, (c.x1 - c.x0) + pad*2);
      const sh = Math.min(H - sy, (c.y1 - c.y0) + pad*2);

      const S = 640;
      const out = createCanvas(S, S);
      const o = out.getContext('2d');
      o.fillStyle = '#fff'; o.fillRect(0, 0, S, S);
      const k = Math.min(S / sw, S / sh) * 0.9;
      const dw = sw * k, dh = sh * k;
      o.drawImage(cv, sx, sy, sw, sh, (S - dw) / 2, (S - dh) / 2, dw, dh);
      fs.writeFileSync(`${OUT}/${code(codes[i])}.png`, out.toBuffer('image/png'));
    }
  }

  console.log(JSON.stringify(summary, null, 1));
  const made = fs.readdirSync(OUT).filter(f => f.endsWith('.png'));
  console.log('crops:', made.length);
  const have = new Set(made.map(f => f.replace('.png','')));
  const missing = [];
  for (let i = 1; i <= 96; i++) if (!have.has(code(i))) missing.push(code(i));
  console.log('missing:', missing.join(', ') || '(none)');
})().catch(e => { console.error('ERR', e.stack); process.exit(1); });
