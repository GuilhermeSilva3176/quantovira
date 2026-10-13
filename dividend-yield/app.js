(function () {
  var KEY = 'quantovira:dividend-yield:v1';
  var FIELDS = {
    dividendoAnual: { min: 0, max: 1e6, def: 1.5 },
    preco: { min: 0.01, max: 1e6, def: 30 }
  };
  var P = QvToolParams.make(FIELDS);
  function el(id) { return document.getElementById(id); }
  function load() {
    var stored = null;
    try { stored = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    var p = P.merge(stored, P.decode(location.search));
    Object.keys(FIELDS).forEach(function (k) { el(k).value = p[k]; });
  }
  function read() {
    var p = {};
    Object.keys(FIELDS).forEach(function (k) { p[k] = parseFloat(el(k).value); });
    return p;
  }
  function persist(p) {
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {}
    history.replaceState(null, '', location.pathname + '?' + P.encode(p));
  }
  function run(e) {
    if (e) e.preventDefault();
    var p = read();
    persist(p);
    var dy = QvFerramentas.dividendYield(p.dividendoAnual, p.preco);
    el('kDy').textContent = dy != null ? dy.toFixed(2) + '%' : '—';
    el('explain').textContent =
      dy != null
        ? 'A cada R$ 100 na ação, os dividendos do ano equivalem a cerca de R$ ' + (dy).toFixed(2) + ' neste exemplo.'
        : 'Informe um preço maior que zero.';
  }
  function copyLink() {
    var url = location.origin + location.pathname + '?' + P.encode(read());
    var done = function () { el('copyMsg').textContent = 'Link copiado!'; setTimeout(function () { el('copyMsg').textContent = ''; }, 2500); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { prompt('Copie:', url); });
    else prompt('Copie:', url);
  }
  load();
  el('f').addEventListener('submit', run);
  el('copy').addEventListener('click', copyLink);
  Object.keys(FIELDS).forEach(function (k) { el(k).addEventListener('input', run); });
  run();
})();
