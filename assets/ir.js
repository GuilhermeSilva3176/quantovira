/* IR de investimentos. Lê os números de data/regras-ir-2026.json. Node e navegador. */
(function (root) {
  function round2(n) {
    var s = n < 0 ? -1 : 1;
    return s * Math.round((Math.abs(n) + 1e-8) * 100) / 100;
  }
  function n0(v) {
    var x = typeof v === 'number' ? v : parseFloat(v);
    return isFinite(x) ? x : 0;
  }
  function dinheiro(v) {
    return round2(n0(v));
  }
  function ganhoProgressivo(ganho, faixas) {
    if (!(ganho > 0)) return 0;
    var total = 0;
    var anterior = 0;
    for (var i = 0; i < faixas.length; i++) {
      var teto = faixas[i].ate == null ? ganho : faixas[i].ate;
      var parcela = Math.min(ganho, teto) - anterior;
      if (parcela > 0) total += parcela * faixas[i].aliquota;
      anterior = teto;
      if (ganho <= teto) break;
    }
    return round2(total);
  }
  function ultimoDiaUtil(ano, mes, feriados) {
    var d = new Date(Date.UTC(ano, mes, 0));
    var dias = feriados || [];
    while (true) {
      var dow = d.getUTCDay();
      var m = d.getUTCMonth() + 1;
      var dia = d.getUTCDate();
      var feriado = false;
      for (var i = 0; i < dias.length; i++) {
        if (dias[i].mes === m && dias[i].dia === dia) feriado = true;
      }
      if (dow !== 0 && dow !== 6 && !feriado) {
        return { ano: d.getUTCFullYear(), mes: m, dia: dia };
      }
      d = new Date(d.getTime() - 86400000);
    }
  }
  function vencimentoDoMesSeguinte(ano, mes, feriados) {
    var y = ano;
    var m = mes + 1;
    if (m > 12) { m = 1; y += 1; }
    return ultimoDiaUtil(y, m, feriados);
  }
  function grupoSeparado(resultado, prejuizo, aliquota) {
    var ganho = resultado > 0 ? resultado : 0;
    var perdaMes = resultado < 0 ? -resultado : 0;
    var pool = round2(prejuizo + perdaMes);
    var compensado = Math.min(pool, ganho);
    var base = round2(ganho - compensado);
    return {
      ganho: round2(ganho),
      compensado: round2(compensado),
      base: base,
      aliquota: aliquota,
      imposto: round2(base * aliquota),
      prejuizoRestante: round2(pool - compensado)
    };
  }
  function abaixoDoMinimo(valor, minimo) {
    return valor > 0 && valor < minimo;
  }
  function multaDe(principal, dias, regras) {
    if (!(principal > 0) || !(dias > 0)) return 0;
    var a = regras.atraso;
    var taxa = Math.min(a.multaTeto, dias * a.multaPorDia);
    return round2(principal * taxa);
  }
  function jurosDe(principal, selicPercentual, mesPosterior, regras) {
    if (!(principal > 0) || !mesPosterior) return 0;
    if (selicPercentual == null || !isFinite(selicPercentual)) return null;
    return round2(principal * (selicPercentual / 100 + regras.atraso.jurosUmPorCentoNoMesDoPagamento));
  }
  function calcular(entrada, regras) {
    var e = entrada || {};
    var avisos = [];
    var acoes = e.acoes || {};
    var etf = e.etfAcoes || {};
    var day = e.dayTrade || {};
    var fii = e.fiiVenda || {};
    var vendasAcoes = Math.max(0, dinheiro(acoes.vendas));
    var resAcoes = dinheiro(acoes.resultado);
    var prevAcoes = Math.max(0, dinheiro(acoes.prejuizoAcumulado));
    var isentoAcoes = vendasAcoes <= regras.acoesComuns.isencaoVendasMensais;
    var ganhoAcoes = 0;
    var perdaAcoes = 0;
    if (isentoAcoes) {
      if (resAcoes > 0) avisos.push('O lucro das ações está isento: as vendas do mês não passam de R$ 20 mil. Esse lucro não abate o prejuízo acumulado.');
      if (resAcoes < 0) avisos.push('O prejuízo das ações neste mês de vendas até R$ 20 mil não foi somado ao saldo. A página de compensações da Receita permite compensar perda de operação comum em meses seguintes, mas não diz se a perda de um mês com vendas de até R$ 20 mil entra nesse saldo. Essa compensação não foi confirmada.');
    } else {
      ganhoAcoes = resAcoes > 0 ? resAcoes : 0;
      perdaAcoes = resAcoes < 0 ? -resAcoes : 0;
    }
    var resEtf = dinheiro(etf.resultado);
    var ganhoEtf = resEtf > 0 ? resEtf : 0;
    var perdaEtf = resEtf < 0 ? -resEtf : 0;
    var poolComum = round2(prevAcoes + Math.max(0, dinheiro(etf.prejuizoAcumulado)) + perdaAcoes + perdaEtf);
    var ganhoComum = round2(ganhoAcoes + ganhoEtf);
    var compensadoComum = Math.min(poolComum, ganhoComum);
    var baseComum = round2(ganhoComum - compensadoComum);
    var comum = {
      isentoAcoes: isentoAcoes,
      ganhoAcoes: round2(ganhoAcoes),
      ganhoEtf: round2(ganhoEtf),
      compensado: round2(compensadoComum),
      base: baseComum,
      aliquota: regras.acoesComuns.aliquota,
      imposto: round2(baseComum * regras.acoesComuns.aliquota),
      prejuizoRestante: round2(poolComum - compensadoComum)
    };
    var dayTrade = grupoSeparado(dinheiro(day.resultado), Math.max(0, dinheiro(day.prejuizoAcumulado)), regras.dayTrade.aliquota);
    if (Math.max(0, dinheiro(day.vendas)) <= regras.acoesComuns.isencaoVendasMensais && dinheiro(day.resultado) > 0) {
      avisos.push('Day trade não usa a isenção de R$ 20 mil, mesmo com pouca venda.');
    }
    var fiiVenda = grupoSeparado(dinheiro(fii.resultado), Math.max(0, dinheiro(fii.prejuizoAcumulado)), regras.fiiVenda.aliquota);
    var irrfBolsa = round2(
      Math.max(0, dinheiro(acoes.irrf)) +
      Math.max(0, dinheiro(etf.irrf)) +
      Math.max(0, dinheiro(day.irrf)) +
      Math.max(0, dinheiro(fii.irrf))
    );
    var impostoBolsa = round2(comum.imposto + dayTrade.imposto + fiiVenda.imposto);
    var devidoBolsa = round2(Math.max(0, impostoBolsa - irrfBolsa));
    var irrfSobra = round2(Math.max(0, irrfBolsa - impostoBolsa));
    var minimo = regras.darfBolsa.valorMinimo;
    var bolsaAbaixo = abaixoDoMinimo(devidoBolsa, minimo);
    var ano = parseInt(e.ano, 10);
    var mes = parseInt(e.mes, 10);
    var venc = (ano >= 2000 && mes >= 1 && mes <= 12)
      ? vencimentoDoMesSeguinte(ano, mes, regras.feriadosNacionais.dias)
      : null;
    if (!venc) avisos.push('Informe o mês do ganho para ver o vencimento.');

    var rend = e.fiiRendimentos || {};
    var enq = rend.enquadramento || 'nao-sei';
    var fiiRend = { enquadramento: enq, valor: Math.max(0, dinheiro(rend.valor)), imposto: null, retidoNaFonte: false, isento: false };
    if (enq === 'isento') {
      fiiRend.imposto = 0;
      fiiRend.isento = true;
    } else if (enq === 'tributado') {
      fiiRend.imposto = round2(fiiRend.valor * regras.fiiRendimentos.aliquotaSemIsencao);
      fiiRend.retidoNaFonte = true;
      avisos.push('Sem a isenção, os 20% dos rendimentos do FII são retidos pelo administrador. Esse valor não entra no DARF mensal de bolsa.');
    } else if (fiiRend.valor > 0) {
      avisos.push('Sem saber se o FII cumpre a isenção, o rendimento não entra no imposto.');
    }

    var rf = e.etfRendaFixa || {};
    var prazo = rf.prazo || '';
    var etfRf = { prazo: prazo, imposto: null, aliquota: null, retidoNaFonte: false };
    if (prazo) {
      var faixa = null;
      for (var i = 0; i < regras.etfRendaFixa.faixas.length; i++) {
        if (regras.etfRendaFixa.faixas[i].id === prazo) faixa = regras.etfRendaFixa.faixas[i];
      }
      if (faixa && dinheiro(rf.resultado) > 0) {
        etfRf.aliquota = faixa.aliquota;
        etfRf.imposto = round2(dinheiro(rf.resultado) * faixa.aliquota);
        etfRf.retidoNaFonte = true;
      } else if (faixa) {
        etfRf.aliquota = faixa.aliquota;
        etfRf.imposto = 0;
        etfRf.retidoNaFonte = true;
      }
    } else if (dinheiro(rf.resultado) > 0) {
      avisos.push('ETF de renda fixa ficou sem alíquota porque o prazo do índice não foi escolhido.');
    }

    var cr = e.cripto || {};
    var local = cr.local === 'exterior' ? 'exterior' : 'brasil';
    var vendasCripto = Math.max(0, dinheiro(cr.vendas));
    var resCripto = dinheiro(cr.resultado);
    var cripto = {
      local: local,
      isento: false,
      imposto: 0,
      base: 0,
      abaixoDoMinimo: false,
      aRecolher: 0,
      acumulado: 0,
      prejuizoNaoUsado: Math.max(0, dinheiro(cr.prejuizoAcumulado))
    };
    var ext = e.exterior || {};
    var rendExt = Math.max(0, dinheiro(ext.rendimento));
    var perdaExt = Math.max(0, dinheiro(ext.prejuizo));
    if (local === 'exterior') {
      if (resCripto > 0) rendExt = round2(rendExt + resCripto);
      if (resCripto < 0) perdaExt = round2(perdaExt + -resCripto);
      if (vendasCripto > 0 && vendasCripto <= regras.criptoBrasil.isencaoAlienacoesMensais && resCripto > 0) {
        avisos.push('Cripto em corretora no exterior não usa a isenção de R$ 35 mil. Ele entra na declaração anual, a 15%.');
      }
      cripto.imposto = null;
    } else {
      cripto.isento = vendasCripto <= regras.criptoBrasil.isencaoAlienacoesMensais;
      if (cripto.isento) {
        cripto.base = 0;
        cripto.imposto = 0;
        if (resCripto > 0) avisos.push('O ganho de cripto no Brasil está isento: as alienações do mês não passam de R$ 35 mil.');
      } else if (resCripto > 0) {
        cripto.base = resCripto;
        cripto.imposto = ganhoProgressivo(resCripto, regras.criptoBrasil.faixas);
      }
      if (cripto.prejuizoNaoUsado > 0) {
        avisos.push('O prejuízo acumulado de cripto no Brasil não foi abatido. A compensação entre meses não foi confirmada.');
      }
      var criptoAbaixo = abaixoDoMinimo(cripto.imposto, minimo);
      cripto.abaixoDoMinimo = criptoAbaixo;
      cripto.aRecolher = criptoAbaixo ? 0 : cripto.imposto;
      cripto.acumulado = criptoAbaixo ? cripto.imposto : 0;
    }

    var baseExt = round2(Math.max(0, rendExt - perdaExt));
    var impostoExt = round2(baseExt * regras.exterior.aliquota);
    var creditoExt = 0;
    var pagoFora = Math.max(0, dinheiro(ext.impostoPagoExterior));
    if (pagoFora > 0 && ext.temAcordo) {
      creditoExt = Math.min(pagoFora, impostoExt);
    } else if (pagoFora > 0) {
      avisos.push('O imposto pago no exterior não foi descontado. A lei só permite isso com acordo contra bitributação ou reciprocidade.');
    }
    var devidoExt = round2(impostoExt - creditoExt);

    var dias = Math.max(0, Math.floor(n0(e.atraso && e.atraso.dias)));
    var selic = e.atraso && e.atraso.selicAcumulada;
    var selicNum = selic === '' || selic == null ? null : n0(selic);
    var mesPosterior = !(e.atraso && e.atraso.mesPosterior === false);
    if (dias > 0 && !mesPosterior) {
      avisos.push('Atraso no mesmo mês do vencimento: só a multa de mora. A Selic e o 1% são do mês seguinte.');
    }
    if (dias > 0 && mesPosterior && selicNum == null) {
      avisos.push('Juros não calculados: informe a Selic acumulada do mês seguinte ao vencimento até o mês anterior ao pagamento.');
    }
    function atrasoDe(principal) {
      var base = dias > 0 ? principal : 0;
      return {
        multa: multaDe(base, dias, regras),
        juros: dias > 0 ? jurosDe(base, selicNum, mesPosterior, regras) : 0
      };
    }

    return {
      comum: comum,
      dayTrade: dayTrade,
      fiiVenda: fiiVenda,
      irrfBolsa: irrfBolsa,
      irrfSobra: irrfSobra,
      impostoBolsa: impostoBolsa,
      darfBolsa: {
        devido: devidoBolsa,
        abaixoDoMinimo: bolsaAbaixo,
        aRecolher: bolsaAbaixo ? 0 : devidoBolsa,
        acumulado: bolsaAbaixo ? devidoBolsa : 0,
        vencimento: venc
      },
      fiiRendimentos: fiiRend,
      etfRendaFixa: etfRf,
      cripto: cripto,
      exterior: {
        base: baseExt,
        aliquota: regras.exterior.aliquota,
        imposto: impostoExt,
        credito: round2(creditoExt),
        devido: devidoExt,
        prejuizoRestante: round2(Math.max(0, perdaExt - rendExt)),
        anual: true
      },
      atraso: {
        bolsa: atrasoDe(bolsaAbaixo ? 0 : devidoBolsa),
        cripto: atrasoDe(local === 'brasil' ? cripto.aRecolher : 0),
        dias: dias
      },
      avisos: avisos
    };
  }

  var api = {
    round2: round2,
    ganhoProgressivo: ganhoProgressivo,
    ultimoDiaUtil: ultimoDiaUtil,
    vencimentoDoMesSeguinte: vencimentoDoMesSeguinte,
    calcular: calcular
  };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.IrInv = api;
})(typeof window === 'object' ? window : global);
