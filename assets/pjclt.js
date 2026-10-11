/* PJ vs CLT. Lê os números de data/regras-2026.json. Node e navegador. */
(function (root) {
  function round2(n) {
    var s = n < 0 ? -1 : 1;
    return s * Math.round((Math.abs(n) + 1e-8) * 100) / 100;
  }
  function faixaDe(tabela, valor) {
    for (var i = 0; i < tabela.length; i++) {
      if (tabela[i].ate == null || valor <= tabela[i].ate) return tabela[i];
    }
    return tabela[tabela.length - 1];
  }
  function impostoTabela(base, tabela) {
    if (!(base > 0)) return 0;
    var f = faixaDe(tabela, base);
    return Math.max(0, base * f.aliquota - f.deducao);
  }
  function inssProgressivo(base, faixas, teto) {
    if (!(base > 0)) return 0;
    var limitado = Math.min(base, teto);
    var total = 0;
    var anterior = 0;
    for (var i = 0; i < faixas.length; i++) {
      var parcela = Math.min(limitado, faixas[i].ate) - anterior;
      if (parcela > 0) total += parcela * faixas[i].aliquota;
      anterior = faixas[i].ate;
      if (limitado <= faixas[i].ate) break;
    }
    return round2(total);
  }
  function inssEmpregado(salario, regras) {
    var t = regras.inssEmpregado;
    return inssProgressivo(salario, t.faixas, t.teto);
  }
  function memoriaIrrf(rendimento, deducaoLegal, regras) {
    var ir = regras.irpf;
    var red = ir.reducaoMensal;
    var deducao = Math.max(deducaoLegal || 0, ir.descontoSimplificadoMensal);
    var base = Math.max(0, rendimento - deducao);
    var impostoTabelaValor = impostoTabela(base, ir.tabelaMensal);
    var reducao = 0;
    if (rendimento <= red.faixaZeraAte) reducao = Math.min(impostoTabelaValor, red.reducaoMaximaParaZerar);
    else if (rendimento <= red.faixaParcialAte) reducao = Math.min(impostoTabelaValor, Math.max(0, red.constante - red.coeficiente * rendimento));
    return {
      deducao: round2(deducao),
      base: round2(base),
      impostoTabela: round2(impostoTabelaValor),
      reducao: round2(reducao),
      devido: round2(Math.max(0, impostoTabelaValor - reducao))
    };
  }
  function irrfMensal(rendimento, deducaoLegal, regras) {
    return memoriaIrrf(rendimento, deducaoLegal, regras).devido;
  }
  function memoriaIrAnual(rendimento, inssDedutivel, regras) {
    var ir = regras.irpf;
    var red = ir.reducaoAnual;
    var bruto = Math.max(0, rendimento || 0);
    var simplificado = Math.min(bruto * ir.percentualDescontoSimplificadoAnual, ir.descontoSimplificadoAnual);
    var deducao = Math.max(inssDedutivel || 0, simplificado);
    var base = Math.max(0, bruto - deducao);
    var impostoTabelaValor = impostoTabela(base, ir.tabelaAnual);
    var reducao = 0;
    if (bruto <= red.faixaZeraAte) reducao = Math.min(impostoTabelaValor, red.reducaoMaximaParaZerar);
    else if (bruto <= red.faixaParcialAte) reducao = Math.min(impostoTabelaValor, Math.max(0, red.constante - red.coeficiente * bruto));
    return {
      simplificado: round2(simplificado),
      deducao: round2(deducao),
      base: round2(base),
      impostoTabela: round2(impostoTabelaValor),
      reducao: round2(reducao),
      devido: round2(Math.max(0, impostoTabelaValor - reducao))
    };
  }
  function irExclusivo(valor, tabela) {
    return round2(impostoTabela(valor, tabela));
  }
  function aliquotaEfetiva(rbt12, faixas) {
    if (!(rbt12 > 0)) return { aliquota: 0, nominal: 0, deducao: 0, dentro: true };
    var ultima = faixas[faixas.length - 1];
    if (rbt12 > ultima.ate) return { aliquota: null, nominal: null, deducao: null, dentro: false };
    var f = faixaDe(faixas, rbt12);
    var aliq = (rbt12 * f.aliquota - f.deducao) / rbt12;
    return { aliquota: aliq, nominal: f.aliquota, deducao: f.deducao, dentro: true };
  }
  function mesesReceita(dias) {
    var sem = Math.min(12, Math.max(0, (dias || 0) / 30));
    return 12 - sem;
  }
  function calcClt(input, regras) {
    var salario = Math.max(0, input.salarioClt || 0);
    var vr = Math.max(0, input.vrVa || 0);
    var saude = Math.max(0, input.planoSaude || 0);
    var plr = Math.max(0, input.plr || 0);
    var inssMes = inssEmpregado(salario, regras);
    var irMes = irrfMensal(salario, inssMes, regras);
    var liquidoMes = round2(salario - inssMes - irMes);
    var decimo = salario;
    var inss13 = inssEmpregado(decimo, regras);
    var ir13 = irrfMensal(decimo, inss13, regras);
    var terco = round2(salario / 3);
    var feriasBruto = round2(salario + terco);
    var inssFerias = inssEmpregado(feriasBruto, regras);
    var inssTerco = round2(Math.max(0, inssFerias - inssMes));
    var memoriaFerias = memoriaIrrf(feriasBruto, inssFerias, regras);
    var irFerias = memoriaFerias.devido;
    var plrIr = irExclusivo(plr, regras.plr.tabelaAnual);
    var beneficios = round2((vr + saude) * 12);
    var fgtsBase = round2(salario * 12 + decimo + terco);
    var fgts = round2(fgtsBase * regras.fgts.aliquota);
    var rendimentosAjuste = round2(salario * 12 + terco);
    var anual = memoriaIrAnual(rendimentosAjuste, round2(inssMes * 12 + inssTerco), regras);
    var irRetidoAjuste = round2(irMes * 11 + irFerias);
    var ajusteAnual = round2(anual.devido - irRetidoAjuste);
    var avisos = [];
    if (salario > 0) {
      var avisoFerias = 'O IR das férias incide sobre o salário de férias mais o terço, separado dos outros rendimentos do mês (RIR/2018, art. 682, § 1º). A redução mensal da Lei nº 15.270 nesse cálculo separado não foi confirmada.';
      avisoFerias += memoriaFerias.reducao > 0 ? ' A conta aplicou essa redução mesmo assim.' : ' Neste pagamento a redução é zero.';
      avisos.push(avisoFerias);
    }
    if (ajusteAnual < 0) avisos.push('No ajuste anual, o desconto simplificado devolve IR retido sobre os salários e sobre as férias com o terço. Essa restituição chega no ano seguinte. O 13º e a PLR ficam de fora dessa conta.');
    else if (ajusteAnual > 0) avisos.push('No ajuste anual, o IR dos salários e das férias com o terço fica maior que o retido no mês. O 13º e a PLR ficam de fora dessa conta.');
    var caixaNoAno = round2(liquidoMes * 11 + (feriasBruto - inssFerias - irFerias) + (decimo - inss13 - ir13) + beneficios + (plr - plrIr));
    var caixa = round2(caixaNoAno - ajusteAnual);
    return {
      salarioMensal: salario,
      inssMensal: inssMes,
      irMensal: irMes,
      liquidoMensal: liquidoMes,
      inssAnualSalarios: round2(inssMes * 12),
      irAnualSalarios: round2(irMes * 11),
      decimo: decimo,
      inss13: inss13,
      ir13: ir13,
      terco: terco,
      feriasBruto: feriasBruto,
      inssFerias: inssFerias,
      inssTerco: inssTerco,
      irFerias: irFerias,
      reducaoFerias: memoriaFerias.reducao,
      plr: plr,
      plrIr: plrIr,
      beneficios: beneficios,
      fgts: fgts,
      rendimentosAjuste: rendimentosAjuste,
      irAnualDevido: anual.devido,
      irRetidoAjuste: irRetidoAjuste,
      ajusteAnual: ajusteAnual,
      avisos: avisos,
      caixaNoAno: caixaNoAno,
      caixa: caixa,
      liquidoEquivalente: round2(caixa + fgts)
    };
  }
  function isencaoLucroSimples(receita, das, proAnual, contador, regras, contabilidadeCompleta) {
    var lucro = round2(receita - das - proAnual - contador);
    var limite = round2(Math.max(0, receita * regras.simples.isencaoLucros.percentualPresuncaoServicos - das));
    var isento = contabilidadeCompleta ? Math.max(0, lucro) : Math.min(Math.max(0, lucro), limite);
    return {
      lucro: lucro,
      limite: limite,
      isento: round2(isento),
      excedente: round2(Math.max(0, lucro - isento))
    };
  }
  function aplicarDividendos(out, lucro, regras, simples) {
    if (lucro > 0 && lucro / 12 > regras.dividendosPf.limiteMensal) {
      out.irDividendos = round2(lucro * regras.dividendosPf.aliquotaSobreOTotal);
      var base = 'Retenção de 10% sobre o lucro distribuído: a média mensal passa de R$ 50 mil. ';
      var simplesTxt = simples ? 'O perguntas e respostas da Receita, pergunta 10, aplica essa retenção também ao Simples. ' : '';
      out.avisos.push(base + simplesTxt + 'O crédito dela na tributação mínima anual não entra nesta conta.');
    }
  }
  function aplicarIsencaoSimples(out, dist, contabilidadeCompleta) {
    out.contabilidadeCompleta = !!contabilidadeCompleta;
    out.lucroDistribuido = dist.lucro;
    out.limiteIsencao = dist.limite;
    out.lucroIsento = dist.isento;
    out.excedenteTributavel = dist.excedente;
    if (contabilidadeCompleta) {
      out.avisos.push('Contabilidade completa marcada: o § 2º do art. 14 da LC nº 123/2006 afasta o limite de 32% da receita menos o DAS.');
    } else if (dist.excedente > 0) {
      out.avisos.push('Sem contabilidade completa, a isenção de lucro do Simples fica em 32% da receita menos o DAS (LC nº 123/2006, art. 14, § 1º). O que passa desse limite entra no ajuste anual.');
    }
  }
  function aplicarAjusteProLabore(out, rendimento, regras, incluiExcedente) {
    var anual = memoriaIrAnual(rendimento, out.inssSegurado, regras);
    out.irAnualDevido = anual.devido;
    out.ajusteAnual = round2(anual.devido - out.irProLabore);
    var assunto = incluiExcedente ? 'o IR do pró-labore e do lucro que passou do limite do Simples' : 'o IR do pró-labore';
    if (out.ajusteAnual < 0) out.avisos.push('No ajuste anual, ' + assunto + ' fica menor que o retido no mês.');
    else if (out.ajusteAnual > 0) out.avisos.push('No ajuste anual, ' + assunto + ' fica maior que o retido no mês.');
  }
  function calcPj(input, regras) {
    var regime = input.regime || 'simples-iii';
    var valorMensal = Math.max(0, input.valorPjMensal || 0);
    var proMensal = Math.max(0, input.proLabore || 0);
    var contadorMensal = Math.max(0, input.custoContador || 0);
    var meses = mesesReceita(input.feriasDias);
    var receita = round2(valorMensal * meses);
    var proAnual = round2(proMensal * 12);
    var contador = round2(contadorMensal * 12);
    var avisos = [];
    var teto = regras.inssEmpregado.teto;
    var piso = regras.salarioMinimo.valor;
    if (regime !== 'mei' && proMensal > 0 && proMensal < piso) {
      avisos.push('Pró-labore abaixo do salário mínimo de R$ ' + piso.toLocaleString('pt-BR') + '. O piso do salário de contribuição do contribuinte individual é um salário mínimo; a conta usa o valor digitado e não completa a diferença.');
    }
    var out = {
      regime: regime,
      mesesReceita: meses,
      receitaAnual: receita,
      proLaboreAnual: proAnual,
      contador: contador,
      das: 0,
      pis: 0,
      cofins: 0,
      iss: 0,
      irpj: 0,
      csll: 0,
      inssPatronal: 0,
      inssSegurado: 0,
      irProLabore: 0,
      irDividendos: 0,
      ajusteAnual: 0,
      irAnualDevido: 0,
      lucroDistribuido: 0,
      limiteIsencao: null,
      lucroIsento: null,
      excedenteTributavel: 0,
      contabilidadeCompleta: !!input.contabilidadeCompleta,
      fatorR: null,
      aliquotaEfetiva: null,
      valido: true,
      avisos: avisos,
      liquidoEquivalente: 0
    };
    if (regime === 'mei') {
      var dasMes = regras.mei.dasServicos;
      out.das = round2(dasMes * 12);
      if (receita > regras.mei.limiteReceitaAnual) {
        out.valido = false;
        avisos.push('Receita acima do limite do MEI (R$ 81.000 no ano). O DAS fixo deixa de ser a regra; o desenquadramento não foi recalculado.');
      }
      avisos.push('DAS de serviços: INSS de R$ 81,05 + ISS de R$ 5. ICMS de R$ 1 não entra. O pró-labore não gera outro INSS: o do titular já está no DAS.');
      var distMei = isencaoLucroSimples(receita, out.das, 0, contador, regras, input.contabilidadeCompleta);
      aplicarIsencaoSimples(out, distMei, input.contabilidadeCompleta);
      aplicarDividendos(out, distMei.lucro, regras, true);
      aplicarAjusteProLabore(out, distMei.excedente, regras, true);
      out.liquidoEquivalente = round2(receita - out.das - contador - out.irDividendos - out.ajusteAnual);
      return out;
    }
    var inssSegMensal = round2(Math.min(proMensal, teto) * regras.inssContribuinteIndividual.aliquotaDescontadaPelaEmpresa);
    out.inssSegurado = round2(inssSegMensal * 12);
    out.irProLabore = round2(irrfMensal(proMensal, inssSegMensal, regras) * 12);
    if (regime === 'simples-iii' || regime === 'simples-v') {
      var faixas = regime === 'simples-iii' ? regras.simples.anexoIII : regras.simples.anexoV;
      var ef = aliquotaEfetiva(receita, faixas);
      out.aliquotaEfetiva = ef.aliquota;
      if (!ef.dentro) {
        out.valido = false;
        avisos.push('Receita acima de R$ 4,8 milhões. O Simples Nacional não se aplica e a alíquota dos anexos não foi estendida.');
        out.liquidoEquivalente = null;
        return out;
      }
      out.das = round2(receita * ef.aliquota);
      var folha = proAnual;
      out.fatorR = receita > 0 ? folha / receita : null;
      if (out.fatorR != null && regime === 'simples-iii' && out.fatorR < regras.simples.fatorR) {
        avisos.push('Fator R de ' + (out.fatorR * 100).toFixed(1).replace('.', ',') + '% fica abaixo de 28%. Atividade sujeita ao fator não se enquadra no Anexo III.');
      }
      if (out.fatorR != null && regime === 'simples-v' && out.fatorR >= regras.simples.fatorR) {
        avisos.push('Fator R de ' + (out.fatorR * 100).toFixed(1).replace('.', ',') + '% alcança 28%. Atividade sujeita ao fator pode ir para o Anexo III.');
      }
      var dist = isencaoLucroSimples(receita, out.das, proAnual, contador, regras, input.contabilidadeCompleta);
      aplicarIsencaoSimples(out, dist, input.contabilidadeCompleta);
      aplicarDividendos(out, dist.lucro, regras, true);
      aplicarAjusteProLabore(out, round2(proAnual + dist.excedente), regras, true);
      out.liquidoEquivalente = round2(receita - out.das - contador - out.inssSegurado - out.irProLabore - out.irDividendos - out.ajusteAnual);
      return out;
    }
    var lp = regras.lucroPresumido;
    var issAliq = input.issAliquota == null ? regras.iss.padraoDaCalculadora : input.issAliquota;
    if (issAliq < regras.iss.min || issAliq > regras.iss.max) {
      avisos.push('Alíquota de ISS fora da faixa federal de 2% a 5%.');
    }
    out.pis = round2(receita * lp.pisCumulativo);
    out.cofins = round2(receita * lp.cofinsCumulativo);
    out.iss = round2(receita * issAliq);
    var base = receita * lp.percentualPresuncaoServicos;
    var baseTri = base / 4;
    var limiteTri = lp.limiteAdicionalPorMes * 3;
    var adicional = Math.max(0, baseTri - limiteTri) * lp.adicionalIrpj * 4;
    out.irpj = round2(base * lp.irpj + adicional);
    out.csll = round2(base * lp.csll);
    out.inssPatronal = round2(proAnual * regras.inssPatronal.aliquota);
    var lucro = receita - out.pis - out.cofins - out.iss - out.irpj - out.csll - out.inssPatronal - contador - proAnual;
    out.lucroDistribuido = round2(lucro);
    if (lucro > 0) aplicarDividendos(out, lucro, regras, false);
    else if (proAnual > 0) {
      avisos.push('O pró-labore e os tributos passam da receita. O líquido fica menor porque a empresa não cobre essa retirada.');
    }
    if ((input.feriasDias || 0) > 0) {
      avisos.push('Com férias sem faturar, o adicional de IRPJ ainda reparte a receita em quatro trimestres iguais.');
    }
    avisos.push('ISS de ' + (issAliq * 100).toFixed(2).replace('.', ',') + '% é a alíquota informada. O padrão de 5% é o teto da LC nº 116/2003, não a alíquota do município.');
    aplicarAjusteProLabore(out, proAnual, regras, false);
    out.liquidoEquivalente = round2(receita - out.pis - out.cofins - out.iss - out.irpj - out.csll - out.inssPatronal - contador - out.inssSegurado - out.irProLabore - out.irDividendos - out.ajusteAnual);
    return out;
  }
  function breakEven(input, regras, alvo) {
    var hi = 250000;
    var step = 200;
    var achou = null;
    for (var v = 0; v <= hi; v += step) {
      var pj = calcPj(Object.assign({}, input, { valorPjMensal: v }), regras);
      if (pj.liquidoEquivalente != null && pj.liquidoEquivalente >= alvo) { achou = v; break; }
    }
    if (achou == null) return null;
    var melhor = achou;
    for (var v2 = Math.max(0, achou - step); v2 <= achou; v2 += 1) {
      var pj2 = calcPj(Object.assign({}, input, { valorPjMensal: v2 }), regras);
      if (pj2.liquidoEquivalente != null && pj2.liquidoEquivalente >= alvo) { melhor = v2; break; }
    }
    return melhor;
  }
  function comparar(input, regras) {
    var clt = calcClt(input, regras);
    var pj = calcPj(input, regras);
    var equilibrio = pj.liquidoEquivalente == null ? null : breakEven(input, regras, clt.liquidoEquivalente);
    return {
      clt: clt,
      pj: pj,
      diferenca: pj.liquidoEquivalente == null ? null : round2(pj.liquidoEquivalente - clt.liquidoEquivalente),
      breakEvenMensal: equilibrio,
      naoModelados: regras.naoModelados
    };
  }
  var api = {
    round2: round2,
    inssEmpregado: inssEmpregado,
    memoriaIrrf: memoriaIrrf,
    memoriaIrAnual: memoriaIrAnual,
    irrfMensal: irrfMensal,
    irExclusivo: irExclusivo,
    aliquotaEfetiva: aliquotaEfetiva,
    calcClt: calcClt,
    calcPj: calcPj,
    comparar: comparar
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PjClt = api;
})(this);
