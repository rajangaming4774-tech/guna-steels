/* Catalogue search + filter (PRD F-03).
   The full grid is already in the HTML, so the catalogue is indexable and works
   with JS disabled — this only hides/shows what's already rendered. */
(function () {
  var q = document.getElementById('q');
  var fRange = document.getElementById('fRange');
  var fType = document.getElementById('fType');
  var grid = document.getElementById('grid');
  var count = document.getElementById('count');
  var empty = document.getElementById('empty');
  var clear = document.getElementById('clear');
  if (!grid) return;

  var cards = [].slice.call(grid.querySelectorAll('.pcard'));

  function apply() {
    var term = (q.value || '').trim().toLowerCase();
    var r = fRange.value, t = fType.value;
    var shown = 0;

    cards.forEach(function (c) {
      var hay = (c.dataset.code + ' ' + c.dataset.name).toLowerCase();
      var ok = (!term || hay.indexOf(term) !== -1) &&
               (!r || c.dataset.range === r) &&
               (!t || c.dataset.type === t);
      c.hidden = !ok;
      if (ok) shown++;
    });

    count.textContent = shown === cards.length
      ? cards.length + ' products'
      : shown + ' of ' + cards.length + ' products';
    empty.hidden = shown !== 0;
  }

  // debounce typing so we don't thrash on every keystroke
  var t = null;
  function debounced() { clearTimeout(t); t = setTimeout(apply, 120); }

  q.addEventListener('input', debounced);
  fRange.addEventListener('change', apply);
  fType.addEventListener('change', apply);
  if (clear) clear.addEventListener('click', function () {
    q.value = ''; fRange.value = ''; fType.value = ''; apply(); q.focus();
  });

  // deep-link support: catalogue.html?q=ball or ?range=dairy
  var params = new URLSearchParams(location.search);
  if (params.get('q')) q.value = params.get('q');
  if (params.get('range')) fRange.value = params.get('range');
  if (params.get('type')) fType.value = params.get('type');
  if (params.toString()) apply();
})();
