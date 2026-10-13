(function () {
  var KEY = 'quantovira:poupanca:v1';
  var FIELDS = {
    valor: { min: 0, max: 1e12, def: 10000 },
    meses: { min: 1, max: 360, def: 12 }
  };
  var P = QvToolParams.make(FIELDS);
  var taxas = null;
  function el(id) { return document.getElementById(id); }
  function brl(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });
  }
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
    if (!taxas) return;
    var p = read();
    persist(p);
    var r = QvFerramentas.poupancaSimular({
      valor: p.valor,
      meses: p.meses,
      selicAa: taxas.selic_aa,
      trMensal: taxas.tr_mensal
    });
    el('kMontante').textContent = brl(r.montante);
    el('kRend').textContent = brl(r.rendimento);
    el('kTaxa').textContent = r.taxaMensalPct.toFixed(3) + '%';
    var regra = taxas.selic_aa > 8.5 ? '0,5% ao mês + TR' : '70% da Selic + TR';
    el('explain').textContent =
      'Com Selic de ' + taxas.selic_aa + '% e TR de ' + taxas.tr_mensal + '% ao mês, a regra usada é ' + regra + '. Equivale a cerca de ' + r.taxaAnualEquivalentePct.toFixed(2) + '% ao ano.';
  }
  function copyLink() {
    var url = location.origin + location.pathname + '?' + P.encode(read());
    var done = function () { el('copyMsg').textContent = 'Link copiado!'; setTimeout(function () { el('copyMsg').textContent = ''; }, 2500); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { prompt('Copie:', url); });
    else prompt('Copie:', url);
  }
  fetch('/data/taxas-2026.json')
    .then(function (r) { return r.json(); })
    .then(function (d) {
      taxas = d;
      el('taxasHint').textContent = 'Taxas de referência em ' + d.dataReferencia + ' (Selic ' + d.selic_aa + '%, TR ' + d.tr_mensal + '% ao mês).';
      load();
      run();
    })
    .catch(function () { el('taxasHint').textContent = 'Não foi possível carregar as taxas.'; });
  el('f').addEventListener('submit', run);
  el('copy').addEventListener('click', copyLink);
  Object.keys(FIELDS).forEach(function (k) { el(k).addEventListener('input', run); });
})();
