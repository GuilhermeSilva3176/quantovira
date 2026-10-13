(function () {
  var KEY = 'quantovira:renda-fixa:v1';
  var FIELDS = {
    valor: { min: 0, max: 1e12, def: 50000 },
    dias: { min: 1, max: 3650, def: 400 },
    pctCdiCdb: { min: 0, max: 200, def: 100 },
    pctCdiLci: { min: 0, max: 200, def: 90 },
    tesouroAa: { min: 0, max: 30, def: 11 }
  };
  var P = QvToolParams.make(FIELDS);
  var taxas = null;
  function el(id) { return document.getElementById(id); }
  function brl(n) {
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });
  }
  function pct(n) {
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
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
  function linha(row) {
    return '<tr><td>' + row.nome + '</td><td>' + brl(row.ganhoLiquido) + '</td><td>' + brl(row.liquido) + '</td><td>' + pct(row.rentabilidadeRealPct) + '</td></tr>';
  }
  function run(e) {
    if (e) e.preventDefault();
    if (!taxas) return;
    var p = read();
    persist(p);
    var c = QvFerramentas.compararRendaFixa({
      valor: p.valor,
      dias: p.dias,
      pctCdiCdb: p.pctCdiCdb,
      pctCdiLci: p.pctCdiLci,
      tesouroAa: p.tesouroAa,
      cdiAa: taxas.cdi_aa,
      ipca12m: taxas.ipca_12m,
      selicAa: taxas.selic_aa,
      trMensal: taxas.tr_mensal
    });
    el('linhas').innerHTML = [c.lci, c.cdb, c.tesouro, c.poupanca].map(linha).join('');
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
      el('taxasHint').textContent =
        'Referência de ' + d.dataReferencia + ': CDI ' + d.cdi_aa + '% a.a., Selic ' + d.selic_aa + '%, IPCA 12m ' + d.ipca_12m + '%. ' + d.fonte.split('.')[0] + '.';
      load();
      run();
    })
    .catch(function () { el('taxasHint').textContent = 'Não foi possível carregar as taxas de referência.'; });
  el('f').addEventListener('submit', run);
  el('copy').addEventListener('click', copyLink);
  Object.keys(FIELDS).forEach(function (k) { el(k).addEventListener('input', run); });
})();
