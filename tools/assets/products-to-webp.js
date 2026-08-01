const REPO = require('path').resolve(__dirname, '../../').replace(/\\/g, '/');
const fs = require('fs');
const sharp = require('sharp');

const SRC = `${REPO}/.tmp/crops`;
const DST = `${REPO}/public/assets/products`;
fs.mkdirSync(DST, { recursive: true });

(async () => {
  const files = fs.readdirSync(SRC).filter(f => f.endsWith('.png')).sort();
  let total = 0;
  for (const f of files) {
    const out = `${DST}/${f.replace('.png', '.webp')}`;
    await sharp(`${SRC}/${f}`).resize(560, 560, { fit: 'inside' }).webp({ quality: 78 }).toFile(out);
    total += fs.statSync(out).size;
  }
  console.log('written:', files.length, 'webp');
  console.log('total  :', Math.round(total / 1024), 'KB');
  console.log('avg    :', Math.round(total / files.length / 1024), 'KB each');
})().catch(e => { console.error(e.message); process.exit(1); });

