/* Núcleo do simulador FIRE (Monte Carlo por bootstrap de anos históricos). Funciona no navegador e no Node. */
(function (root) {
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // retorno real da carteira num ano histórico (rebalanceamento anual)
  function portfolioReal(year, pctAcoes) {
    var w = pctAcoes / 100;
    return w * year.ibov_real + (1 - w) * year.cdi_real;
  }
  function percentile(sorted, p) {
    if (!sorted.length) return NaN;
    var idx = (sorted.length - 1) * p, lo = Math.floor(idx), hi = Math.ceil(idx);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  }
  /**
   * p: {idade, patrimonio, aporteMensal, gastoMensal, taxaRetirada (%), pctAcoes, idadeFinal, nSims, seed}
   * Tudo em reais de hoje (termos reais). Passo anual: aporte no início do ano, depois retorno.
   * FIRE é atingido quando patrimônio >= meta = gasto anual / taxa de retirada; daí em diante, saques anuais do gasto.
   */
  function simulate(p, anos) {
    var rnd = mulberry32(p.seed || 12345);
    var nYears = p.idadeFinal - p.idade;
    var meta = p.gastoMensal * 12 / (p.taxaRetirada / 100);
    var paths = [], fireAges = [], success = 0, reached = 0;
    for (var s = 0; s < p.nSims; s++) {
      var w = p.patrimonio, retired = w >= meta, fireAge = retired ? p.idade : null, broke = false;
      var path = [w];
      for (var y = 0; y < nYears; y++) {
        var yr = anos[Math.floor(rnd() * anos.length)];
        if (!retired) w += p.aporteMensal * 12; else w -= p.gastoMensal * 12;
        if (w <= 0) { w = 0; broke = true; }
        w *= 1 + portfolioReal(yr, p.pctAcoes);
        if (!retired && w >= meta) { retired = true; fireAge = p.idade + y + 1; }
        path.push(w);
      }
      if (fireAge !== null) { reached++; fireAges.push(fireAge); if (!broke) success++; }
      paths.push(path);
    }
    var bands = { p10: [], p50: [], p90: [] };
    for (var t = 0; t <= nYears; t++) {
      var col = paths.map(function (x) { return x[t]; }).sort(function (a, b) { return a - b; });
      bands.p10.push(percentile(col, 0.1)); bands.p50.push(percentile(col, 0.5)); bands.p90.push(percentile(col, 0.9));
    }
    fireAges.sort(function (a, b) { return a - b; });
    return {
      meta: meta,
      probSucesso: success / p.nSims,           // atingiu FIRE e não zerou até a idade final
      probAtingir: reached / p.nSims,            // atingiu FIRE em algum momento
      idadeFire: { p10: percentile(fireAges, 0.1), p50: percentile(fireAges, 0.5), p90: percentile(fireAges, 0.9) },
      idades: Array.from({ length: nYears + 1 }, function (_, i) { return p.idade + i; }),
      bands: bands
    };
  }
  var api = { simulate: simulate, portfolioReal: portfolioReal, percentile: percentile, mulberry32: mulberry32 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FireSim = api;
})(this);
