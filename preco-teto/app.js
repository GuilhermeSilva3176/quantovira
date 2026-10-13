(function () {
  var KEY = 'quantovira:preco-teto:v1';
  var FIELDS = {
    dpa: { min: 0, max: 1e6, def: 1.2 },
    yieldPct: { min: 0.1, max: 50, def: 6 },
    lpa: { min: 0, max: 1e6, def: 2 },
    vpa: { min: 0, max: 1e6, def: 10 },
    precoAtual: { min: 0, max: 1e6, def: 0 }
  };
  var P = QvToolParams.make(FIELDS);
  function el(id) { return document.getElementById(id); }
  function brl(v) {
    if (v == null || !isFinite(v)) return '—';
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
  }
  function load() {
    var stored = null;
    try { stored = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    var p = P.merge(stored, P.decode(location.search));
    Object.keys(FIELDS).forEach(function (k) {
      if (p[k] || k === 'precoAtual') el(k).value = p[k] || '';
    });
  }
  function read() {
    var p = {};
    Object.keys(FIELDS).forEach(function (k) {
      var v = parseFloat(el(k).value);
      p[k] = isFinite(v) ? v : 0;
    });
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
    var bazin = QvFerramentas.precoTetoBazin(p.dpa, p.yieldPct);
    var graham = QvFerramentas.precoTetoGraham(p.lpa, p.vpa);
    el('kBazin').textContent = brl(bazin);
    el('kGraham').textContent = brl(graham);
    el('kCmp').textContent = p.precoAtual > 0 ? brl(p.precoAtual) : '—';
    var msg = '';
    if (p.precoAtual > 0 && bazin) {
      msg += p.precoAtual <= bazin ? 'Pelo Bazin, o preço está no teto ou abaixo. ' : 'Pelo Bazin, o preço está acima do teto. ';
    }
    if (p.precoAtual > 0 && graham) {
      msg += p.precoAtual <= graham ? 'Pelo Graham, está no teto ou abaixo.' : 'Pelo Graham, está acima do teto.';
    }
    el('explain').textContent = msg || 'Preencha o preço atual para comparar com os tetos.';
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
