(function () {
  var KEY = 'quantovira:juros-compostos:v1';
  var FIELDS = {
    valorInicial: { min: 0, max: 1e12, def: 10000 },
    aporteMensal: { min: 0, max: 1e10, def: 500 },
    taxaAnualPct: { min: 0, max: 100, def: 12 },
    meses: { min: 1, max: 600, def: 60 }
  };
  var P = QvToolParams.make(FIELDS);
  var brl = function (v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  };
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
    var r = QvFerramentas.jurosCompostos(p);
    el('kMontante').textContent = brl(r.montante);
    el('kAportes').textContent = brl(r.totalAportes);
    el('kRend').textContent = brl(r.rendimento);
    el('explain').textContent =
      'Em ' + p.meses + ' meses, com ' + p.taxaAnualPct + '% ao ano (cerca de ' + r.taxaMensalPct.toFixed(3) + '% ao mês), o total seria ' + brl(r.montante) + '.';
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
