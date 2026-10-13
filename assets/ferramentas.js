/* Lógica das calculadoras de renda fixa e ações. Navegador e Node. */
(function (root) {
  var IR_FAIXAS = [
    { ateDias: 180, aliquota: 0.225 },
    { ateDias: 360, aliquota: 0.2 },
    { ateDias: 720, aliquota: 0.175 },
    { ateDias: null, aliquota: 0.15 }
  ];

  function aliquotaIrRendaFixa(dias) {
    var d = Math.max(0, Math.floor(dias));
    for (var i = 0; i < IR_FAIXAS.length; i++) {
      var f = IR_FAIXAS[i];
      if (f.ateDias === null || d <= f.ateDias) return f.aliquota;
    }
    return 0.15;
  }

  function taxaMensalDeAnual(taxaAnualPct) {
    var a = taxaAnualPct / 100;
    return Math.pow(1 + a, 1 / 12) - 1;
  }

  function taxaAnualDeMensal(taxaMensalPct) {
    var m = taxaMensalPct / 100;
    return (Math.pow(1 + m, 12) - 1) * 100;
  }

  function jurosCompostos(opts) {
    var P = opts.valorInicial || 0;
    var C = opts.aporteMensal || 0;
    var meses = Math.max(0, Math.floor(opts.meses || 0));
    var i = taxaMensalDeAnual(opts.taxaAnualPct || 0);
    var saldo = P;
    var totalAportes = P;
    for (var m = 0; m < meses; m++) {
      saldo = saldo * (1 + i) + C;
      totalAportes += C;
    }
    var rendimento = saldo - totalAportes;
    return {
      montante: saldo,
      totalAportes: totalAportes,
      rendimento: rendimento,
      taxaMensalPct: i * 100
    };
  }

  function poupancaTaxaMensalPct(selicAa, trMensalPct) {
    var selic = selicAa / 100;
    var tr = trMensalPct / 100;
    if (selic > 0.085) return (tr + 0.005) * 100;
    return (tr + (selic * 0.7) / 12) * 100;
  }

  function rendimentoPeriodo(valor, taxaAnualPct, dias) {
    var anos = dias / 365;
    var r = taxaAnualPct / 100;
    var bruto = valor * Math.pow(1 + r, anos);
    return { bruto: bruto, rendimento: bruto - valor };
  }

  function liquidoComIr(rendimento, dias) {
    var aliq = aliquotaIrRendaFixa(dias);
    var ir = rendimento * aliq;
    return { ir: ir, liquido: rendimento - ir, aliquota: aliq };
  }

  function rentabilidadeRealPeriodo(liquidoNominal, valorInicial, inflacaoAnualPct, dias) {
    var anos = dias / 365;
    var fatorNominal = (valorInicial + liquidoNominal) / valorInicial;
    var fatorReal = fatorNominal / Math.pow(1 + inflacaoAnualPct / 100, anos);
    return (fatorReal - 1) * 100;
  }

  function rentabilidadeRealFisher(nominalPct, inflacaoPct) {
    var n = nominalPct / 100;
    var i = inflacaoPct / 100;
    return ((1 + n) / (1 + i) - 1) * 100;
  }

  function compararRendaFixa(opts) {
    var valor = opts.valor || 0;
    var dias = Math.max(1, Math.floor(opts.dias || 1));
    var cdi = opts.cdiAa || 0;
    var ipca = opts.ipca12m || 0;
    var selic = opts.selicAa || 0;
    var trM = opts.trMensal || 0;

    function linha(nome, taxaAnualPct, tributavel) {
      var rend = rendimentoPeriodo(valor, taxaAnualPct, dias);
      var liq = tributavel ? liquidoComIr(rend.rendimento, dias) : { ir: 0, liquido: rend.rendimento, aliquota: 0 };
      var montante = valor + liq.liquido;
      var realPct = rentabilidadeRealPeriodo(liq.liquido, valor, ipca, dias);
      return {
        nome: nome,
        taxaAnualPct: taxaAnualPct,
        bruto: rend.bruto,
        ir: liq.ir,
        liquido: montante,
        ganhoLiquido: liq.liquido,
        aliquotaIr: liq.aliquota,
        rentabilidadeRealPct: realPct
      };
    }

    var taxaCdb = (opts.pctCdiCdb / 100) * cdi;
    var taxaLci = (opts.pctCdiLci / 100) * cdi;
    var taxaTesouro = opts.tesouroAa || 0;
    var meses = dias / 30.4375;
    var iPoup = poupancaTaxaMensalPct(selic, trM) / 100;
    var brutoPoup = valor * Math.pow(1 + iPoup, meses);
    var rendPoup = brutoPoup - valor;
    var poup = {
      nome: 'Poupança',
      taxaAnualPct: (Math.pow(1 + iPoup, 12) - 1) * 100,
      bruto: brutoPoup,
      ir: 0,
      liquido: brutoPoup,
      ganhoLiquido: rendPoup,
      aliquotaIr: 0,
      rentabilidadeRealPct: rentabilidadeRealPeriodo(rendPoup, valor, ipca, dias)
    };

    return {
      cdb: linha('CDB', taxaCdb, true),
      lci: linha('LCI/LCA', taxaLci, false),
      tesouro: linha('Tesouro', taxaTesouro, true),
      poupanca: poup,
      dias: dias
    };
  }

  function poupancaSimular(opts) {
    var valor = opts.valor || 0;
    var meses = Math.max(0, Math.floor(opts.meses || 0));
    var i = poupancaTaxaMensalPct(opts.selicAa || 0, opts.trMensal || 0) / 100;
    var saldo = valor;
    for (var m = 0; m < meses; m++) saldo *= 1 + i;
    return {
      montante: saldo,
      rendimento: saldo - valor,
      taxaMensalPct: i * 100,
      taxaAnualEquivalentePct: (Math.pow(1 + i, 12) - 1) * 100
    };
  }

  function precoTetoBazin(dpa, yieldPct) {
    var y = yieldPct / 100;
    if (y <= 0 || !isFinite(dpa)) return null;
    return dpa / y;
  }

  function precoTetoGraham(lpa, vpa) {
    if (lpa <= 0 || vpa <= 0) return null;
    return Math.sqrt(22.5 * lpa * vpa);
  }

  function precoMedio(linhas) {
    var qtd = 0;
    var custo = 0;
    (linhas || []).forEach(function (l) {
      var q = l.quantidade || 0;
      var p = l.preco || 0;
      if (q > 0 && p >= 0) {
        qtd += q;
        custo += q * p;
      }
    });
    return {
      quantidade: qtd,
      custoTotal: custo,
      precoMedio: qtd > 0 ? custo / qtd : null
    };
  }

  function dividendYield(dividendoAnual, preco) {
    if (!preco || preco <= 0) return null;
    return (dividendoAnual / preco) * 100;
  }

  function cdbTaxaEquivalenteIsento(pctCdiIsento, dias) {
    var aliq = aliquotaIrRendaFixa(dias);
    var fator = 1 - aliq;
    if (fator <= 0) return null;
    return (pctCdiIsento / fator);
  }

  var api = {
    IR_FAIXAS: IR_FAIXAS,
    aliquotaIrRendaFixa: aliquotaIrRendaFixa,
    taxaMensalDeAnual: taxaMensalDeAnual,
    taxaAnualDeMensal: taxaAnualDeMensal,
    jurosCompostos: jurosCompostos,
    poupancaTaxaMensalPct: poupancaTaxaMensalPct,
    rendimentoPeriodo: rendimentoPeriodo,
    liquidoComIr: liquidoComIr,
    rentabilidadeRealPeriodo: rentabilidadeRealPeriodo,
    rentabilidadeRealFisher: rentabilidadeRealFisher,
    compararRendaFixa: compararRendaFixa,
    poupancaSimular: poupancaSimular,
    precoTetoBazin: precoTetoBazin,
    precoTetoGraham: precoTetoGraham,
    precoMedio: precoMedio,
    dividendYield: dividendYield,
    cdbTaxaEquivalenteIsento: cdbTaxaEquivalenteIsento
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.QvFerramentas = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
