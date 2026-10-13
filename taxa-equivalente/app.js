(function () {
  var KEY = 'quantovira:taxa-equiv:v1';
  var FIELDS = {
    taxaEntrada: { min: 0, max: 500, def: 12 },
    modo: { type: 'enum', valores: ['a2m', 'm2a'], def: 'a2m' }
  };
  var P = QvToolParams.make(FIELDS);
  function el(id) { return document.getElementById(id); }
  function load() {
    var stored = null;
    try { stored = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    var p = P.merge(stored, P.decode(location.search));
    el('taxaEntrada').value = p.taxaEntrada;
    el('modo').value = p.modo;
  }
  function read() {
    return {
      taxaEntrada: parseFloat(el('taxaEntrada').value),
      modo: el('modo').value
    };
  }
  function persist(p) {
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {}
    history.replaceState(null, '', location.pathname + '?' + P.encode(p));
  }
  function run(e) {
    if (e) e.preventDefault();
    var p = read();
    persist(p);
    var saida;
    if (p.modo === 'a2m') {
      saida = QvFerramentas.taxaMensalDeAnual(p.taxaEntrada) * 100;
      el('explain').textContent = p.taxaEntrada + '% ao ano equivale a cerca de ' + saida.toFixed(4) + '% ao mês.';
    } else {
      saida = QvFerramentas.taxaAnualDeMensal(p.taxaEntrada);
      el('explain').textContent = p.taxaEntrada + '% ao mês equivale a cerca de ' + saida.toFixed(4) + '% ao ano.';
    }
    el('kSaida').textContent = saida.toFixed(4) + '%';
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
  el('taxaEntrada').addEventListener('input', run);
  el('modo').addEventListener('change', run);
  run();
})();
