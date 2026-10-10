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
