/* Rewrites products.json from the brochure artwork itself (all 10 pages read
   directly), replacing the PRD's OCR-assisted list.

   Corrections this makes to the PRD data:
   - RO-053 was "not legible" in the PRD. The artwork reads "Globe Valve".
   - Range split was assumed 001-048 dairy / 049-096 casting. The artwork's
     section headers actually alternate: dairy 001-048, casting 049-060,
     dairy 061-072, casting 073-096.
   - Obvious typos in the printed artwork are corrected here and recorded in
     `printed` so the original wording is not lost:
       RO-010 "Pressure Rgulating Valve", RO-024 "C-Spannner",
       RO-027 "Reducer Ecentric", RO-046 "Gas Kit", RO-081 "Ferrule Niddle Valve"
   - RO-035 is printed as "RO-034" on the artwork (duplicate code); the PRD's
     sequence is correct and is kept.
*/
const fs = require('fs');
const REPO = require('path').resolve(__dirname, '../../').replace(/\\/g, '/');
const P = `${REPO}/public/assets/products.json`;

const N = (code, name, extra = {}) => ({ code, name, ...extra });

const items = [
  // --- page 1 : Dairy Valves & Fittings
  N('RO-001','Three Way Valve (SMS)'), N('RO-002','Tanker Valve'), N('RO-003','Two Way Valve'),
  N('RO-004','Tanker Valve with SMS Union'), N('RO-005','Butterfly Valve Welded'), N('RO-006','Diaphragm Valve'),
  // --- page 2
  N('RO-007','Butterfly Valve with Union'), N('RO-008','TC Butterfly Valve'), N('RO-009','Micro Valve with Union'),
  N('RO-010','Pressure Regulating Valve',{printed:'Pressure Rgulating Valve'}), N('RO-011','Welded Union'), N('RO-012','Inline Slide Glass'),
  N('RO-013','In Line Filter with Union'), N('RO-014','Spray Ball Removing'), N('RO-015','Angular Valve'),
  N('RO-016','Disk Filter with Union'), N('RO-017','NRV with Union (SMS)'), N('RO-018','Side Glass'),
  // --- page 3
  N('RO-019','Din Union'), N('RO-020','SMS Union'), N('RO-021','Blind Nut'),
  N('RO-022','Boll Feet'), N('RO-023','NRV Welded'), N('RO-024','C-Spanner',{printed:'C-Spannner'}),
  N('RO-025','TC Clamp'), N('RO-026','Reducer Concentric'), N('RO-027','Reducer Eccentric',{printed:'Reducer Ecentric'}),
  N('RO-028','Pipe'), N('RO-029','Tee'), N('RO-030','Reducing Tee'),
  // --- page 4
  N('RO-031','Sampling Valve'), N('RO-032','Bend'), N('RO-033','Loop Valve'),
  N('RO-034','TC End NRV'), N('RO-035','Clamp',{printed:'Clamp (printed as RO-034)'}), N('RO-036','Centrifugal Pump'),
  N('RO-037','Man Hole'), N('RO-038','Man Hole'), N('RO-039','Man Hole'),
  N('RO-040','Man Hole'), N('RO-041','Man Hole'), N('RO-042','Man Hole'),
  // --- page 5
  N('RO-043','Mixing Proof Valve'), N('RO-044','TC Hose Nipple'), N('RO-045','Pneumatic Valve'),
  N('RO-046','Gasket',{printed:'Gas Kit'}), N('RO-047','TC End Cap'), N('RO-048','Pipe Clamp'),
  // Investment Casting starts here
  N('RO-049','Butterfly Handle Ball Valve'), N('RO-050','Three Way Valve'), N('RO-051','Ball Valve'),
  // --- page 6
  N('RO-052','Flange Type Ball Valve'), N('RO-053','Globe Valve'), N('RO-054','Gate Valve'),
  N('RO-055','2 PC Ball Valve'), N('RO-056','Three PC Ball Valve'), N('RO-057','T.C. Ball Valve'),
  N('RO-058','Y-Type Strainer'), N('RO-059','NRV Horizontal'), N('RO-060','NRV Vertical'),
  // Dairy resumes here
  N('RO-061','3 PC Ball Valve'), N('RO-062','Disk Check Valve'), N('RO-063','Water Check Valve'),
  // --- page 7
  N('RO-064','Bend'), N('RO-065','Tee'), N('RO-066','Elbow'),
  N('RO-067','Flange'), N('RO-068','Weld Neck Flange'), N('RO-069','Blind Flange'),
  N('RO-070','Sample Cock Valve'), N('RO-071','Dairy Clamp'), N('RO-072','Float Valve'),
  // --- page 8 : Investment Casting resumes
  N('RO-073','Union OD'), N('RO-074','Male Connector'), N('RO-075','Male Elbow'),
  N('RO-076','Union Elbow OD'), N('RO-077','Female Connector OD'), N('RO-078','Union Tee OD'),
  N('RO-079','Three Way Manifold'), N('RO-080','Two Way Manifold'), N('RO-081','Ferrule Needle Valve',{printed:'Ferrule Niddle Valve'}),
  N('RO-082','Spray Ball Welded'), N('RO-083','Camlock Coupling'), N('RO-084','TC Clamp'),
  // --- page 9
  N('RO-085','Reducing Elbow'), N('RO-086','Elbow'), N('RO-087','Tee'),
  N('RO-088','Cross Tee'), N('RO-089','Union'), N('RO-090','Male Female Bush'),
  N('RO-091','Reducer'), N('RO-092','Ferrule'), N('RO-093','Hex Nipple'),
  N('RO-094','Barrel Nipple'), N('RO-095','Check Nut'), N('RO-096','End Cap'),
];

// range assignment from the artwork's section-header bands
const rangeFor = n =>
  (n <= 48) ? 'dairy' :
  (n <= 60) ? 'casting' :
  (n <= 72) ? 'dairy' : 'casting';

for (const it of items) {
  const n = Number(it.code.slice(3));
  it.range = rangeFor(n);
  it.image = `assets/products/${it.code}.webp`;
}

const out = {
  _note: 'Captured directly from the Guna Steels brochure artwork (10 pages). Product names read from the printed captions; where the artwork contains an obvious typo the corrected spelling is used and the printed wording is kept in `printed`. Ranges follow the brochure section headers.',
  ranges: { dairy: 'Dairy Valves & Fittings', casting: 'Investment Casting Valves & Fittings' },
  items,
};

fs.writeFileSync(P, JSON.stringify(out, null, 2) + '\n');
console.log('items:', items.length);
console.log('dairy:', items.filter(i => i.range === 'dairy').length, '| casting:', items.filter(i => i.range === 'casting').length);
console.log('with printed-variant noted:', items.filter(i => i.printed).length);
console.log('all have images:', items.every(i => fs.existsSync(`${REPO}/` + i.image)));
