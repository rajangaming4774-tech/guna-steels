/* Builds section imagery for the empty slots from Guna Steels' OWN product
   photographs (extracted from their brochure). Nothing here is generated or
   sourced elsewhere â€” these slots sit under headings about the company's work,
   so inventing facility imagery would misrepresent the business. */
const fs = require('fs');
const REPO = require('path').resolve(__dirname, '../../').replace(/\\/g, '/');
const sharp = require('sharp');

const SRC = `${REPO}/public/assets/products`;
const DST = `${REPO}/public/assets/sections`;
fs.mkdirSync(DST, { recursive: true });

const W = 1200, H = 900;          // 4:3, matches the slots' aspect-ratio
const COLS = 3, ROWS = 2;
const GAP = 14;
const PAD = 18;

const SETS = {
  // broad range â€” used for the About blocks
  'range': ['RO-001','RO-043','RO-036','RO-052','RO-068','RO-037'],
  // cut / formed / welded parts
  'fabrication': ['RO-026','RO-029','RO-064','RO-067','RO-085','RO-091'],
  // pipework, filtration, distribution
  'water': ['RO-028','RO-013','RO-058','RO-011','RO-020','RO-014'],
  // instrumentation and bespoke assemblies
  'engineering': ['RO-079','RO-045','RO-010','RO-081','RO-055','RO-070'],
};

(async () => {
  const cellW = Math.floor((W - PAD * 2 - GAP * (COLS - 1)) / COLS);
  const cellH = Math.floor((H - PAD * 2 - GAP * (ROWS - 1)) / ROWS);

  for (const [name, codes] of Object.entries(SETS)) {
    const layers = [];
    for (let i = 0; i < codes.length; i++) {
      const f = `${SRC}/${codes[i]}.webp`;
      if (!fs.existsSync(f)) { console.log('  missing', codes[i]); continue; }
      const col = i % COLS, row = Math.floor(i / COLS);
      const tile = await sharp(f)
        .resize(cellW, cellH, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
        .flatten({ background: '#ffffff' })
        .toBuffer();
      layers.push({
        input: tile,
        left: PAD + col * (cellW + GAP),
        top: PAD + row * (cellH + GAP),
      });
    }

    await sharp({ create: { width: W, height: H, channels: 3, background: '#EDEFF2' } })
      .composite(layers)
      .webp({ quality: 80 })
      .toFile(`${DST}/${name}.webp`);

    const kb = Math.round(fs.statSync(`${DST}/${name}.webp`).size / 1024);
    console.log(`${name}.webp  ${W}x${H}  ${kb}KB  (${codes.join(', ')})`);
  }
})().catch(e => { console.error(e.message); process.exit(1); });
