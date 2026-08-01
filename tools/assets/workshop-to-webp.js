const fs = require('fs');
const REPO = require('path').resolve(__dirname, '../../').replace(/\\/g, '/');
const sharp = require('sharp');

const SRC = `${REPO}/.tmp/workshop-raw.png`;
const DST = `${REPO}/public/assets/sections/workshop.webp`;

(async () => {
  await sharp(SRC).resize(1400, 1050, { fit: 'cover' }).webp({ quality: 80 }).toFile(DST);
  console.log('workshop.webp:', Math.round(fs.statSync(DST).size / 1024), 'KB');
})().catch(e => { console.error(e.message); process.exit(1); });
