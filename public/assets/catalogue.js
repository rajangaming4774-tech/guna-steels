/* Catalogue search + filter.
   The full grid is server-rendered, so the catalogue is indexable and works
   with JS disabled — this only hides/shows what is already in the DOM. */
(function () {
  const q = document.getElementById('q');
  const fRange = document.getElementById('fRange');
  const fType = document.getElementById('fType');
  const grid = document.getElementById('grid');
  const count = document.getElementById('count');
  const empty = document.getElementById('empty');
  const clear = document.getElementById('clear');
  if (!grid || !q || !fRange || !fType) return;

  const cards = Array.from(grid.querySelectorAll('.pcard'));

  function apply() {
    const term = (q.value || '').trim().toLowerCase();
    const r = fRange.value;
    const t = fType.value;
    let shown = 0;

    cards.forEach((c) => {
      const hay = (c.dataset.code + ' ' + c.dataset.name).toLowerCase();
      const ok =
        (!term || hay.indexOf(term) !== -1) &&
        (!r || c.dataset.range === r) &&
        (!t || c.dataset.type === t);
      c.hidden = !ok;
      if (ok) shown++;
    });

    if (count) {
      count.textContent =
        shown === cards.length
          ? cards.length + ' products'
          : shown + ' of ' + cards.length + ' products';
    }
    if (empty) empty.hidden = shown !== 0;
  }

  // debounce typing so we don't thrash the DOM on every keystroke
  let t = null;
  const debounced = () => {
    clearTimeout(t);
    t = setTimeout(apply, 120);
  };

  q.addEventListener('input', debounced);
  fRange.addEventListener('change', apply);
  fType.addEventListener('change', apply);
  if (clear) {
    clear.addEventListener('click', () => {
      q.value = '';
      fRange.value = '';
      fType.value = '';
      apply();
      q.focus();
    });
  }

  // deep links: /catalogue?q=ball, ?range=dairy, ?type=Valve
  const params = new URLSearchParams(location.search);
  if (params.get('q')) q.value = params.get('q');
  if (params.get('range')) fRange.value = params.get('range');
  if (params.get('type')) fType.value = params.get('type');
  if (params.toString()) apply();
})();
