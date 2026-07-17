const reveal = document.querySelectorAll('.rv');
const showAll = () => reveal.forEach(el => el.classList.add('in'));

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  reveal.forEach(el => io.observe(el));
  // Safety net: never leave content stranded invisible if the observer never runs.
  setTimeout(showAll, 2500);
} else {
  showAll();
}

/* ---------- header elevation (every page) ---------- */
const calm = matchMedia('(prefers-reduced-motion: reduce)');
const hdr = document.querySelector('.hdr');
if (hdr) {
  window.addEventListener('scroll', () => hdr.classList.toggle('stuck', window.scrollY > 12), { passive: true });
}

/* ---------- hero scroll-to-expand (home only) ----------
   Scroll accumulates into a 0..1 progress. Below 1 the page is pinned and the
   steel panel grows; at 1 the page releases. Scrolling back up while already at
   the top re-collapses it.

   Everything below is gated on the hero existing. This file is shared by the
   inner pages, which have no hero: ungated, paint() dereferences null and the
   wheel handler preventDefault()s, leaving those pages frozen and unscrollable. */
const heroEl = document.querySelector('.hero');
if (heroEl && document.querySelector('.hero-media')) {
const heroBg = document.querySelector('.hero-bg');
const media = document.querySelector('.hero-media');
const cue = document.querySelector('.hero-cue');
const skipBtn = document.querySelector('.hero-skip');
const slideL = document.querySelectorAll('.slide-l');
const slideR = document.querySelectorAll('.slide-r');
const statsEl = document.querySelector('.stats');

let progress = 0;
let expanded = false;
let touchStartY = 0;
let frame = null;

const isNarrow = () => window.innerWidth < 768;

function paint() {
  frame = null;
  const m = isNarrow();
  const w = 300 + progress * (m ? 650 : 1250);
  const h = 400 + progress * (m ? 200 : 400);
  const tx = progress * (m ? 180 : 150);

  media.style.width = w + 'px';
  media.style.height = h + 'px';
  heroBg.style.opacity = String(1 - progress);
  slideL.forEach(el => el.style.transform = `translateX(-${tx}vw)`);
  slideR.forEach(el => el.style.transform = `translateX(${tx}vw)`);
  cue.style.opacity = String(Math.max(0, 1 - progress * 2));
  // the stats ride the panel, so hold them back until there's steel to sit on
  statsEl.style.opacity = String(Math.max(0, (progress - 0.55) / 0.45));
}
function schedule() { if (!frame) frame = requestAnimationFrame(paint); }

function setProgress(p) {
  progress = Math.min(Math.max(p, 0), 1);
  if (progress >= 1) release(); else lock();
  schedule();
}
function lock() {
  if (!expanded) return;
  expanded = false;
  document.body.classList.add('hero-locked');
}
function release() {
  if (expanded) return;
  expanded = true;
  document.body.classList.remove('hero-locked');
}
/* Jump straight to the expanded state — used by reduced-motion, the skip
   button, and any keyboard interaction, so nobody is ever stuck in the hero. */
function expandNow() { setProgress(1); }

function onWheel(e) {
  if (expanded) {
    if (e.deltaY < 0 && window.scrollY <= 5) { e.preventDefault(); setProgress(0.999); }
    return;
  }
  e.preventDefault();
  setProgress(progress + e.deltaY * 0.0009);
}
function onTouchStart(e) { touchStartY = e.touches[0].clientY; }
function onTouchMove(e) {
  if (!touchStartY) return;
  const y = e.touches[0].clientY;
  const dy = touchStartY - y;
  if (expanded) {
    if (dy < -20 && window.scrollY <= 5) { e.preventDefault(); setProgress(0.999); }
    return;
  }
  e.preventDefault();
  setProgress(progress + dy * (dy < 0 ? 0.008 : 0.005));
  touchStartY = y;
}
function onTouchEnd() { touchStartY = 0; }

/* Keyboard users get no wheel events, so a scroll-jacked hero would trap them.
   Any scroll-intent key opens the panel immediately rather than nudging it. */
function onKey(e) {
  if (expanded) return;
  if (['ArrowDown','PageDown',' ','Spacebar','End','Enter','Tab'].includes(e.key)) expandNow();
}

function enable() {
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('keydown', onKey);
  skipBtn.addEventListener('click', expandNow);
  document.body.classList.add('hero-locked');
}
function disable() {
  window.removeEventListener('wheel', onWheel);
  window.removeEventListener('touchstart', onTouchStart);
  window.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('touchend', onTouchEnd);
  window.removeEventListener('keydown', onKey);
  document.body.classList.remove('hero-locked');
}

if (calm.matches) { expandNow(); disable(); } else { enable(); setProgress(0); }
calm.addEventListener('change', e => {
  if (e.matches) { expandNow(); disable(); } else { enable(); }
});
window.addEventListener('resize', schedule, { passive: true });

} // end hero gate

// Conversion events — swap console for the real analytics call at launch.
document.querySelectorAll('[data-evt]').forEach(el => {
  el.addEventListener('click', () => console.log('cta:', el.dataset.evt));
});
