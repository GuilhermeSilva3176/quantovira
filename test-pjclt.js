const assert = require('assert');
const regras = require('./data/regras-2026.json');
const P = require('./assets/pjclt.js');
let ok = 0;
const t = (n, f) => { f(); ok++; console.log('ok -', n); };

t('INSS 2026: piso, meio da tabela e teto', () => {
  assert.strictEqual(P.inssEmpregado(1621, regras), 121.58);
  assert.strictEqual(P.inssEmpregado(5000, regras), 501.51);
  assert.strictEqual(P.inssEmpregado(8475.55, regras), 988.09);
  assert.strictEqual(P.inssEmpregado(20000, regras), 988.09);
});

t('IRRF exemplo Receita: R$ 5.000 com desconto simplificado zera', () => {
  const m = P.memoriaIrrf(5000, 0, regras);
  assert.strictEqual(m.base, 4392.8);
  assert.strictEqual(m.impostoTabela, 312.89);
  assert.strictEqual(m.devido, 0);
});

t('IRRF exemplo Receita: R$ 6.000 usa o bruto na redução', () => {
  const m = P.memoriaIrrf(6000, 649.6, regras);
  assert.strictEqual(m.base, 5350.4);
  assert.strictEqual(m.impostoTabela, 562.63);
  assert.strictEqual(m.reducao, 179.75);
  assert.strictEqual(m.devido, 382.88);
});

t('IRRF exemplo Receita: acima de R$ 7.350 não reduz', () => {
  const m = P.memoriaIrrf(7607.2, 0, regras);
  assert.strictEqual(m.base, 7000);
  assert.strictEqual(m.devido, 1016.27);
});

t('Anexo III: efetiva da 2ª faixa', () => {
  const ef = P.aliquotaEfetiva(240000, regras.simples.anexoIII);
  assert.ok(Math.abs(ef.aliquota - 0.073) < 1e-12);
  assert.strictEqual(P.round2(240000 * ef.aliquota), 17520);
});

t('Anexo V: efetiva da 2ª faixa', () => {
  const ef = P.aliquotaEfetiva(240000, regras.simples.anexoV);
  assert.ok(Math.abs(ef.aliquota - 0.16125) < 1e-12);
});

t('MEI serviços: DAS anual de 12 x 86,05', () => {
  const pj = P.calcPj({ regime: 'mei', valorPjMensal: 5000, proLabore: 2000, custoContador: 0, feriasDias: 0 }, regras);
  assert.strictEqual(pj.das, 1032.6);
  assert.strictEqual(pj.inssSegurado, 0);
  assert.strictEqual(pj.liquidoEquivalente, 60000 - 1032.6);
  assert.strictEqual(pj.valido, true);
});

t('MEI acima de 81 mil é marcado como inválido', () => {
  const pj = P.calcPj({ regime: 'mei', valorPjMensal: 8000, proLabore: 0, custoContador: 0, feriasDias: 0 }, regras);
  assert.strictEqual(pj.valido, false);
});

t('Fator R abaixo de 28% avisa no Anexo III', () => {
  const pj = P.calcPj({ regime: 'simples-iii', valorPjMensal: 20000, proLabore: 2000, custoContador: 0, feriasDias: 0 }, regras);
  assert.ok(pj.fatorR < 0.28);
  assert.ok(pj.avisos.some((a) => a.indexOf('Anexo III') >= 0));
});

t('Lucro Presumido de serviços, sem adicional', () => {
  const pj = P.calcPj({
    regime: 'lucro-presumido', valorPjMensal: 10000, proLabore: 1621,
    custoContador: 0, feriasDias: 0, issAliquota: 0.02
  }, regras);
  assert.strictEqual(pj.pis, 780);
  assert.strictEqual(pj.cofins, 3600);
  assert.strictEqual(pj.iss, 2400);
  assert.strictEqual(pj.irpj, 5760);
  assert.strictEqual(pj.csll, 3456);
  assert.strictEqual(pj.inssPatronal, 3890.4);
  assert.strictEqual(pj.inssSegurado, 2139.72);
  assert.strictEqual(pj.irProLabore, 0);
  assert.strictEqual(pj.irDividendos, 0);
  assert.strictEqual(pj.liquidoEquivalente, 97973.88);
});

t('adicional de 10% do IRPJ quando o trimestre passa de R$ 60 mil de base', () => {
  const pj = P.calcPj({
    regime: 'lucro-presumido', valorPjMensal: 70000, proLabore: 0,
    custoContador: 0, feriasDias: 0, issAliquota: 0
  }, regras);
  assert.strictEqual(pj.irpj, 43200);
});

t('CLT de R$ 5.000: IR zerado pela Lei 15.270 e FGTS de 8%', () => {
  const c = P.calcClt({ salarioClt: 5000, vrVa: 0, planoSaude: 0, plr: 0 }, regras);
  assert.strictEqual(c.inssMensal, 501.51);
  assert.strictEqual(c.irMensal, 0);
  assert.strictEqual(c.terco, 1666.67);
  assert.strictEqual(c.fgts, 5333.33);
  assert.strictEqual(c.liquidoEquivalente, P.round2(c.caixa + c.fgts));
});

t('PLR usa a tabela exclusiva e não a redução mensal', () => {
  assert.strictEqual(P.irExclusivo(8214.4, regras.plr.tabelaAnual), 0);
  assert.strictEqual(P.irExclusivo(9000, regras.plr.tabelaAnual), 58.92);
  assert.strictEqual(P.irExclusivo(10000, regras.plr.tabelaAnual), 139.75);
});

t('ponto de equilíbrio iguala o equivalente anual', () => {
  const input = {
    salarioClt: 8000, vrVa: 800, planoSaude: 400, plr: 10000,
    valorPjMensal: 12000, regime: 'simples-iii', proLabore: 4000,
    custoContador: 350, feriasDias: 20, issAliquota: 0.05
  };
  const r = P.comparar(input, regras);
  assert.ok(r.breakEvenMensal > 0);
  const noPonto = P.calcPj(Object.assign({}, input, { valorPjMensal: r.breakEvenMensal }), regras);
  const umAbaixo = P.calcPj(Object.assign({}, input, { valorPjMensal: r.breakEvenMensal - 1 }), regras);
  assert.ok(noPonto.liquidoEquivalente >= r.clt.liquidoEquivalente);
  assert.ok(umAbaixo.liquidoEquivalente < r.clt.liquidoEquivalente);
});

t('ajuste anual: desconto é 20% limitado a R$ 17.640', () => {
  const baixo = P.memoriaIrAnual(50400, 0, regras);
  assert.strictEqual(baixo.simplificado, 10080);
  assert.strictEqual(baixo.base, 40320);
  assert.strictEqual(baixo.impostoTabela, 1318.09);
  assert.strictEqual(baixo.devido, 0);
  const noTeto = P.memoriaIrAnual(123333.33, 11857.08, regras);
  assert.strictEqual(noTeto.simplificado, 17640);
  assert.strictEqual(noTeto.devido, 18161.01);
});

t('CLT de R$ 10 mil: férias com terço num só pagamento e restituição no ano seguinte', () => {
  const c = P.calcClt({ salarioClt: 10000, vrVa: 0, planoSaude: 0, plr: 0 }, regras);
  assert.strictEqual(c.inssMensal, 988.09);
  assert.strictEqual(c.irMensal, 1569.55);
  assert.strictEqual(c.inssTerco, 0);
  assert.strictEqual(c.feriasBruto, 13333.33);
  assert.strictEqual(c.irFerias, 2486.21);
  assert.strictEqual(c.reducaoFerias, 0);
  assert.strictEqual(c.irRetidoAjuste, 19751.26);
  assert.strictEqual(c.rendimentosAjuste, 123333.33);
  assert.strictEqual(c.irAnualDevido, 18161.01);
  assert.strictEqual(c.ajusteAnual, -1590.25);
  assert.strictEqual(c.caixaNoAno, 99167.35);
  assert.strictEqual(c.caixa, 100757.6);
  assert.strictEqual(c.fgts, 10666.67);
  assert.strictEqual(c.liquidoEquivalente, 111424.27);
  assert.ok(c.avisos.some((a) => a.indexOf('não foi confirmada') >= 0));
});

t('CLT de R$ 8 mil: INSS do terço só até o teto e restituição das férias', () => {
  const c = P.calcClt({ salarioClt: 8000, vrVa: 0, planoSaude: 0, plr: 0 }, regras);
  assert.strictEqual(c.inssMensal, 921.51);
  assert.strictEqual(c.inssTerco, 66.58);
  assert.strictEqual(c.feriasBruto, 10666.67);
  assert.strictEqual(c.irFerias, 1752.88);
  assert.strictEqual(c.reducaoFerias, 0);
  assert.strictEqual(c.irAnualDevido, 11377.67);
  assert.strictEqual(c.ajusteAnual, -1791.56);
  assert.strictEqual(c.caixaNoAno, 80413.38);
  assert.strictEqual(c.caixa, 82204.94);
  assert.strictEqual(c.liquidoEquivalente, 90738.27);
});

t('Simples sem contabilidade limita a isenção a 32% da receita menos o DAS', () => {
  const pj = P.calcPj({
    regime: 'simples-iii', valorPjMensal: 10000, proLabore: 2800,
    custoContador: 0, feriasDias: 0
  }, regras);
  assert.strictEqual(pj.das, 7200);
  assert.strictEqual(pj.limiteIsencao, 31200);
  assert.strictEqual(pj.lucroDistribuido, 79200);
  assert.strictEqual(pj.excedenteTributavel, 48000);
  assert.strictEqual(pj.irDividendos, 0);
  assert.strictEqual(pj.irAnualDevido, 6416.53);
  assert.strictEqual(pj.liquidoEquivalente, 102687.47);
  const livros = P.calcPj({
    regime: 'simples-iii', valorPjMensal: 10000, proLabore: 2800,
    custoContador: 0, feriasDias: 0, contabilidadeCompleta: true
  }, regras);
  assert.strictEqual(livros.excedenteTributavel, 0);
  assert.strictEqual(livros.irAnualDevido, 0);
  assert.strictEqual(livros.liquidoEquivalente, 109104);
});

t('Fator R: pró-labore de R$ 5.600 tem restituição anual de R$ 763,26', () => {
  const anual = P.memoriaIrAnual(67200, 7392, regras);
  assert.strictEqual(anual.simplificado, 13440);
  assert.strictEqual(anual.reducao, 2007.09);
  assert.strictEqual(anual.devido, 1983.06);
  const pj = P.calcPj({
    regime: 'simples-iii', valorPjMensal: 20000, proLabore: 5600,
    custoContador: 0, feriasDias: 0, contabilidadeCompleta: true
  }, regras);
  assert.strictEqual(pj.irProLabore, 2746.32);
  assert.strictEqual(pj.ajusteAnual, -763.26);
  assert.strictEqual(pj.liquidoEquivalente, 213104.94);
});

t('Simples com lucro mensal acima de R$ 50 mil retém 10%', () => {
  const pj = P.calcPj({
    regime: 'simples-iii', valorPjMensal: 80000, proLabore: 1621,
    custoContador: 0, feriasDias: 0, contabilidadeCompleta: true
  }, regras);
  assert.strictEqual(pj.irDividendos, P.round2(pj.lucroDistribuido * 0.1));
  assert.ok(pj.lucroDistribuido / 12 > 50000);
  assert.ok(pj.avisos.some((a) => a.indexOf('pergunta 10') >= 0));
  assert.ok(regras.dividendosPf.aplicaEm.indexOf('simples-iii') >= 0);
  assert.ok(regras.dividendosPf.fontePerguntas.indexOf('manual_padrao_rfb_per_tributacao_sutri_v2.pdf') >= 0);
});

t('JSON traz fonte e ano, e lista o que não foi verificado', () => {
  ['inssEmpregado', 'irpf', 'mei', 'simples', 'lucroPresumido', 'fgts', 'iss'].forEach((k) => {
    assert.ok(regras[k].fonte || regras[k].fonteDas || regras[k].fonteIrpj, k);
    assert.strictEqual(regras[k].anoReferencia, 2026);
  });
  assert.ok(regras.naoModelados.length >= 4);
  assert.ok(regras.naoModelados.every((item) => item.verificado === false && item.nota && item.fonte));
  assert.strictEqual(regras.iss.aliquotaUnicaNacional, false);
});

console.log(`\n${ok} testes passaram`);
