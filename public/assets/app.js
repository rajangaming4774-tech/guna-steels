/* Guna Steels — site behaviour.
   Shared by every page; each block is gated on its own markup existing. */

/* ------------------------------------------------------- scroll reveal ---- */
(function () {
  const reveal = document.querySelectorAll('.rv');
  if (!reveal.length) return;
  const showAll = () => reveal.forEach((el) => el.classList.add('in'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px' }
    );
    reveal.forEach((el) => io.observe(el));
    // Safety net: never leave content stranded invisible if the observer never runs.
    setTimeout(showAll, 2500);
  } else {
    showAll();
  }
})();

/* ----------------------------------------------------------- counters ----- */
/* Count up once when the stat scrolls into view. Respects reduced motion and
   always ends on the true number, so no-JS / no-observer shows the target. */
(function () {
  const counters = document.querySelectorAll('.count[data-count]');
  if (!counters.length) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const run = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (calm || !('requestAnimationFrame' in window)) {
      el.textContent = target;
      return;
    }
    const dur = 1100;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target); // easeOutCubic
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            run(e.target);
            cio.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px' }
    );
    counters.forEach((c) => cio.observe(c));
    setTimeout(() => {
      counters.forEach((c) => {
        if (c.textContent === '0') c.textContent = c.dataset.count;
      });
    }, 2500);
  } else {
    counters.forEach((c) => (c.textContent = c.dataset.count));
  }
})();

/* ------------------------------------------------- catalogue stagger ------ */
/* 96 cards, so the stagger index is assigned as each card enters view rather
   than inlined 96 times in the template. Index resets per batch so a card
   scrolled to late still animates promptly instead of waiting on a long delay. */
(function () {
  const cards = document.querySelectorAll('.pgrid .pcard');
  if (!cards.length) return;
  if (!('IntersectionObserver' in window)) {
    cards.forEach((c) => c.classList.add('in'));
    return;
  }
  let batch = 0;
  let lastTick = 0;
  const io = new IntersectionObserver(
    (entries) => {
      const now = performance.now();
      if (now - lastTick > 220) batch = 0; // new scroll stop → restart the cascade
      lastTick = now;
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.style.setProperty('--i', String(Math.min(batch++, 10)));
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    },
    { rootMargin: '0px 0px -6% 0px' }
  );
  cards.forEach((c) => io.observe(c));
  // Safety net: 96 cards start at opacity 0, so if the observer never fires
  // (restored background tab, odd embedding) they must not stay blank for long.
  setTimeout(() => cards.forEach((c) => c.classList.add('in')), 1500);
})();

/* ----------------------------------------------------- scroll progress ---- */
(function () {
  const bar = document.querySelector('.progress');
  if (!bar) return;
  let frame = null;
  const paint = () => {
    frame = null;
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    bar.style.width = (max > 0 ? (doc.scrollTop / max) * 100 : 0) + '%';
  };
  addEventListener(
    'scroll',
    () => {
      if (!frame) frame = requestAnimationFrame(paint);
    },
    { passive: true }
  );
  addEventListener('resize', paint, { passive: true });
  paint();
})();

/* ------------------------------------------------------------ parallax ---- */
/* Small vertical offset on section imagery, driven by how far the element has
   travelled through the viewport. Only elements currently on screen are
   updated, so this stays cheap on the catalogue and the long home page. */
(function () {
  const targets = document.querySelectorAll('[data-parallax]');
  if (!targets.length) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const live = new Set();
  let frame = null;

  const paint = () => {
    frame = null;
    const vh = innerHeight;
    live.forEach((el) => {
      const b = el.getBoundingClientRect();
      // -1 above the viewport, +1 below it
      const t = (b.top + b.height / 2 - vh / 2) / (vh / 2 + b.height / 2);
      const range = Number(el.dataset.parallax) || 14;
      el.style.setProperty('--py', (t * range).toFixed(1) + 'px');
    });
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(paint);
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? live.add(e.target) : live.delete(e.target)));
        schedule();
      },
      { rootMargin: '15% 0px' }
    );
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => live.add(el));
  }

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  schedule();
})();

/* --------------------------------------------------- header elevation ----- */
(function () {
  const hdr = document.querySelector('.hdr');
  if (!hdr) return;
  const onScroll = () => hdr.classList.toggle('stuck', window.scrollY > 12);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ------------------------------------------------------- mobile nav ------- */
(function () {
  const toggle = document.querySelector('.navtoggle');
  const panel = document.getElementById('mobilenav');
  if (!toggle || !panel) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  // Escape closes, and returns focus to the button that opened it.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  // A resize up to the desktop nav must not leave the panel stuck open.
  addEventListener(
    'resize',
    () => {
      if (window.innerWidth > 960) setOpen(false);
    },
    { passive: true }
  );
})();

/* =========================================================================
   HERO — scroll-to-expand, two photo frames

   Scroll accumulates into a 0..1 progress value. Below 1 the page is pinned
   and the panel grows; at 1 the page releases. Scrolling back up while already
   at the top re-collapses it.

   JS owns only the panel's width, height and the --p custom property. Gap,
   radius, shadow and the brass overlay are all derived from --p in the
   stylesheet, so the two-frame treatment has one source of truth.

   Everything is gated on the hero existing — this file is shared by the inner
   pages, and ungated the wheel handler would preventDefault() on pages with no
   hero and leave them unscrollable.
   ========================================================================= */
(function () {
  const heroEl = document.querySelector('.hero');
  const media = document.querySelector('.hero-media');
  if (!heroEl || !media) return;

  const heroBg = document.querySelector('.hero-bg');
  const cue = document.querySelector('.hero-cue');
  const skipBtn = document.querySelector('.hero-skip');
  const statsEl = document.querySelector('.stats');
  const calm = matchMedia('(prefers-reduced-motion: reduce)');

  let progress = 0;
  let expanded = false;
  let touchStartY = 0;
  let frame = null;

  const isNarrow = () => window.innerWidth < 768;

  const frameCount = document.querySelectorAll('.hero-frame').length || 1;

  /* ---- collapsed panel size --------------------------------------------
     Fixed 1x1 px, identical at every viewport, as specified.

     This is no longer viewport-relative, so neither the per-breakpoint table
     nor the aspect ratio applies — at one pixel there is no proportion to
     preserve. Both are kept here, commented, so the previous behaviour is a
     one-line restore:

       const COLLAPSED = {
         desktop: { one: 0.004, two: 0.005 },   // fractions of viewport width
         mobile:  { one: 0.0065, two: 0.007 },
       };
       const ASPECT = 1.331;                    // height / width
       const key    = frameCount > 1 ? 'two' : 'one';
       const baseW  = innerWidth * COLLAPSED[m ? 'mobile' : 'desktop'][key];
       const baseH  = baseW * ASPECT;

     The panel still expands to full bleed on scroll — only the starting size
     is pinned. */
  const COLLAPSED_PX = 1;

  function paint() {
    frame = null;
    const m = isNarrow();

    const baseW = COLLAPSED_PX;
    const baseH = COLLAPSED_PX;
    const tgtW = m ? 950 : frameCount > 1 ? 1580 : 1550;
    const tgtH = m ? 600 : 800;

    media.style.width = baseW + progress * (tgtW - baseW) + 'px';
    media.style.height = baseH + progress * (tgtH - baseH) + 'px';
    media.style.setProperty('--p', String(progress));

    if (heroBg) heroBg.style.opacity = String(1 - progress);
    if (cue) cue.style.opacity = String(Math.max(0, 1 - progress * 2));
    // the stats ride the panel, so hold them back until there's something to sit on
    if (statsEl) statsEl.style.opacity = String(Math.max(0, (progress - 0.55) / 0.45));
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(paint);
  }

  function setProgress(p) {
    progress = Math.min(Math.max(p, 0), 1);
    if (progress >= 1) release();
    else lock();
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
     button and any keyboard interaction, so nobody is ever stuck in the hero. */
  function expandNow() {
    setProgress(1);
  }

  function onWheel(e) {
    if (expanded) {
      if (e.deltaY < 0 && window.scrollY <= 5) {
        e.preventDefault();
        setProgress(0.999);
      }
      return;
    }
    e.preventDefault();
    setProgress(progress + e.deltaY * 0.0009);
  }
  function onTouchStart(e) {
    touchStartY = e.touches[0].clientY;
  }
  function onTouchMove(e) {
    if (!touchStartY) return;
    const y = e.touches[0].clientY;
    const dy = touchStartY - y;
    if (expanded) {
      if (dy < -20 && window.scrollY <= 5) {
        e.preventDefault();
        setProgress(0.999);
      }
      return;
    }
    e.preventDefault();
    setProgress(progress + dy * (dy < 0 ? 0.008 : 0.005));
    touchStartY = y;
  }
  function onTouchEnd() {
    touchStartY = 0;
  }
  /* Keyboard users get no wheel events, so a scroll-jacked hero would trap
     them. Any scroll-intent key opens the panel immediately. */
  function onKey(e) {
    if (expanded) return;
    if (['ArrowDown', 'PageDown', ' ', 'Spacebar', 'End', 'Enter', 'Tab'].includes(e.key)) {
      expandNow();
    }
  }

  function enable() {
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKey);
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

  if (skipBtn) skipBtn.addEventListener('click', expandNow);

  if (calm.matches) {
    expandNow();
    disable();
  } else {
    enable();
    setProgress(0);
  }
  calm.addEventListener('change', (e) => {
    if (e.matches) {
      expandNow();
      disable();
    } else {
      enable();
    }
  });
  window.addEventListener('resize', schedule, { passive: true });
})();

/* ------------------------------------------------- conversion events ----- */
/* Swap console for the real analytics call at launch. */
document.querySelectorAll('[data-evt]').forEach((el) => {
  el.addEventListener('click', () => console.log('cta:', el.dataset.evt));
});
