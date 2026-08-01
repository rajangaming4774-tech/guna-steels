const fs = require('fs');
const REPO = require('path').resolve(__dirname, '../../').replace(/\\/g, '/');
const path = require('path');
const { createCanvas } = require('@napi-rs/canvas');

(async () => {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  // the brochure now lives in the repo, so the pipeline is self-contained
  const data = new Uint8Array(fs.readFileSync(`${REPO}/public/brochure.pdf`));
  const doc = await pdfjs.getDocument({ data, disableWorker: true }).promise;
  console.log('pages:', doc.numPages);

  const OUT = `${REPO}/.tmp/pages`;
  fs.mkdirSync(OUT, { recursive: true });

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const vp = page.getViewport({ scale: 2.0 });
    const canvas = createCanvas(Math.ceil(vp.width), Math.ceil(vp.height));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    const buf = canvas.toBuffer('image/png');
    fs.writeFileSync(`${OUT}/page-${String(i).padStart(2, '0')}.png`, buf);
    console.log(`page ${i}: ${canvas.width}x${canvas.height}  ${Math.round(buf.length / 1024)}KB`);
  }
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
