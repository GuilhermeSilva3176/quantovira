(function () {
  var KEY = 'quantovira:preco-medio:v1';
  var IDS = ['q1', 'p1', 'q2', 'p2', 'q3', 'p3', 'q4', 'p4'];
  var FIELDS = {};
  IDS.forEach(function (id) {
    FIELDS[id] = { min: 0, max: 1e12, def: id.charAt(0) === 'q' ? (id === 'q1' ? 100 : id === 'q2' ? 50 : 0) : (id === 'p1' ? 28.5 : id === 'p2' ? 32 : 0) };
  });
  var P = QvToolParams.make(FIELDS);
  function el(id) { return document.getElementById(id); }
  function brl(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }
  function load() {
    var stored = null;
    try { stored = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    var p = P.merge(stored, P.decode(location.search));
    IDS.forEach(function (k) { el(k).value = p[k]; });
  }
  function read() {
    var p = {};
    IDS.forEach(function (k) { p[k] = parseFloat(el(k).value) || 0; });
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
    var linhas = [
      { quantidade: p.q1, preco: p.p1 },
      { quantidade: p.q2, preco: p.p2 },
      { quantidade: p.q3, preco: p.p3 },
      { quantidade: p.q4, preco: p.p4 }
    ];
    var r = QvFerramentas.precoMedio(linhas);
    el('kMedio').textContent = r.precoMedio != null ? brl(r.precoMedio) : '—';
    el('kQtd').textContent = r.quantidade.toLocaleString('pt-BR');
    el('kCusto').textContent = brl(r.custoTotal);
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
  IDS.forEach(function (k) { el(k).addEventListener('input', run); });
  run();
})();
