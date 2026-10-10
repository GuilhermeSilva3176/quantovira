const assert = require('assert');
const S = require('./assets/sim.js');
const data = require('./data/historico.json');
let ok = 0; const t = (n, f) => { f(); ok++; console.log('ok -', n); };
const base = { idade: 30, patrimonio: 0, aporteMensal: 0, gastoMensal: 1000, taxaRetirada: 4, pctAcoes: 0, idadeFinal: 40, nSims: 200, seed: 1 };
t('meta = gasto anual / taxa', () => assert.strictEqual(S.simulate(base, data.anos).meta, 300000));
t('carteira mista pondera retornos', () => {
  const y = { ibov_real: 0.2, cdi_real: 0.05 };
  assert.ok(Math.abs(S.portfolioReal(y, 60) - 0.14) < 1e-12);
});
t('retorno real fixo 0%: aportes somam linearmente', () => {
  const r = S.simulate({ ...base, aporteMensal: 1000, gastoMensal: 1e9 }, [{ ibov_real: 0, cdi_real: 0 }]);
  assert.strictEqual(r.bands.p50[10], 120000); assert.strictEqual(r.probAtingir, 0);
});
t('retorno fixo 10%: juros compostos com aporte no início do ano', () => {
  const r = S.simulate({ ...base, patrimonio: 1000, aporteMensal: 0, gastoMensal: 1e9, idadeFinal: 32 }, [{ ibov_real: 0.1, cdi_real: 0.1 }]);
  assert.ok(Math.abs(r.bands.p50[2] - 1210) < 1e-9);
});
t('já tem a meta e retorno 0: saques esgotam => fracasso', () => {
  const r = S.simulate({ ...base, patrimonio: 300000, idadeFinal: 80 }, [{ ibov_real: 0, cdi_real: 0 }]);
  assert.strictEqual(r.idadeFire.p50, 30); assert.strictEqual(r.probSucesso, 0); // 25 anos de saque, 50 anos de horizonte
});
t('já tem a meta e retorno 5%>4%: sucesso garantido', () => {
  const r = S.simulate({ ...base, patrimonio: 300000, idadeFinal: 80 }, [{ ibov_real: 0.05, cdi_real: 0.05 }]);
  assert.strictEqual(r.probSucesso, 1);
});
t('seed determinística', () => {
  const a = S.simulate({ ...base, aporteMensal: 3000, pctAcoes: 50, idadeFinal: 90 }, data.anos);
  const b = S.simulate({ ...base, aporteMensal: 3000, pctAcoes: 50, idadeFinal: 90 }, data.anos);
  assert.deepStrictEqual(a, b);
});
t('dataset: 31 anos, reais coerentes', () => {
  assert.strictEqual(data.anos.length, 31);
  for (const y of data.anos) assert.ok(Math.abs((1 + y.cdi) / (1 + y.ipca) - 1 - y.cdi_real) < 1e-5);
});
t('percentis ordenados', () => {
  const r = S.simulate({ ...base, aporteMensal: 3000, pctAcoes: 50, idadeFinal: 90, nSims: 1000 }, data.anos);
  r.bands.p10.forEach((v, i) => assert.ok(v <= r.bands.p50[i] && r.bands.p50[i] <= r.bands.p90[i]));
});
console.log(`\n${ok} testes passaram`);
