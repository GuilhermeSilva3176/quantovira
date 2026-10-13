(function () {
  var KEY = 'quantovira:rentabilidade-real:v1';
  var FIELDS = {
    nominalPct: { min: -100, max: 500, def: 13.75 },
    inflacaoPct: { min: 0, max: 100, def: 4.58 }
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
    var real = QvFerramentas.rentabilidadeRealFisher(p.nominalPct, p.inflacaoPct);
    el('kReal').textContent = real.toFixed(2) + '%';
    el('explain').textContent =
      'Com ' + p.nominalPct + '% nominal e inflação de ' + p.inflacaoPct + '%, o ganho real é cerca de ' + real.toFixed(2) + '% ao ano.';
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
  fetch('/data/taxas-2026.json')
    .then(function (r) { return r.json(); })
    .then(function (d) {
      el('taxasHint').textContent = 'Sugestão: Selic ' + d.selic_aa + '% e IPCA 12m ' + d.ipca_12m + '% (ref. ' + d.dataReferencia + ').';
      if (!location.search && !localStorage.getItem(KEY)) {
        el('nominalPct').value = d.selic_aa;
        el('inflacaoPct').value = d.ipca_12m;
      }
      run();
    })
    .catch(function () {});
  run();
})();
