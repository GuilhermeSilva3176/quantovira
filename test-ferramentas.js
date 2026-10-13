const assert = require('assert');
const F = require('./assets/ferramentas.js');
const taxas = require('./data/taxas-2026.json');
let ok = 0;
const t = (n, f) => {
  f();
  ok++;
  console.log('ok -', n);
};

t('IR regressivo 2026', () => {
  assert.strictEqual(F.aliquotaIrRendaFixa(180), 0.225);
  assert.strictEqual(F.aliquotaIrRendaFixa(181), 0.2);
  assert.strictEqual(F.aliquotaIrRendaFixa(360), 0.2);
  assert.strictEqual(F.aliquotaIrRendaFixa(361), 0.175);
  assert.strictEqual(F.aliquotaIrRendaFixa(720), 0.175);
  assert.strictEqual(F.aliquotaIrRendaFixa(721), 0.15);
});

t('juros compostos com aportes', () => {
  const r = F.jurosCompostos({ valorInicial: 1000, aporteMensal: 100, taxaAnualPct: 12, meses: 12 });
  assert.ok(r.montante > 1000 + 12 * 100);
  assert.ok(Math.abs(r.rendimento - (r.montante - r.totalAportes)) < 1e-9);
});

t('poupança: Selic alta usa 0,5% + TR', () => {
  const m = F.poupancaTaxaMensalPct(13.75, 0.12);
  assert.ok(Math.abs(m - (0.12 + 0.5)) < 1e-9);
});

t('poupança: Selic baixa usa 70% Selic + TR', () => {
  const m = F.poupancaTaxaMensalPct(8, 0.1);
  const esperado = (0.1 / 100 + (0.08 * 0.7) / 12) * 100;
  assert.ok(Math.abs(m - esperado) < 1e-9);
});

t('Fisher rentabilidade real', () => {
  const real = F.rentabilidadeRealFisher(13.75, 4.58);
  assert.ok(Math.abs(real - 8.768407) < 0.01);
});

t('taxa mensal ↔ anual', () => {
  const m = F.taxaMensalDeAnual(12) * 100;
  const volta = F.taxaAnualDeMensal(m);
  assert.ok(Math.abs(volta - 12) < 0.0001);
});

t('Bazin e Graham', () => {
  assert.ok(Math.abs(F.precoTetoBazin(1.2, 6) - 20) < 1e-9);
  assert.ok(Math.abs(F.precoTetoGraham(2, 10) - Math.sqrt(450)) < 1e-9);
});

t('preço médio', () => {
  const r = F.precoMedio([
    { quantidade: 100, preco: 10 },
    { quantidade: 50, preco: 14 }
  ]);
  assert.strictEqual(r.quantidade, 150);
  assert.ok(Math.abs(r.precoMedio - (100 * 10 + 50 * 14) / 150) < 1e-9);
});

t('dividend yield', () => {
  assert.ok(Math.abs(F.dividendYield(2, 40) - 5) < 1e-9);
});

t('CDB 90% CDI equivalente isento 361 dias', () => {
  const eq = F.cdbTaxaEquivalenteIsento(90, 400);
  assert.ok(Math.abs(eq - 90 / 0.825) < 0.0001);
});

t('comparar renda fixa: LCI isenta rende mais que CDB mesmo % CDI', () => {
  const c = F.compararRendaFixa({
    valor: 10000,
    dias: 400,
    pctCdiCdb: 100,
    pctCdiLci: 100,
    tesouroAa: 11,
    cdiAa: taxas.cdi_aa,
    ipca12m: taxas.ipca_12m,
    selicAa: taxas.selic_aa,
    trMensal: taxas.tr_mensal
  });
  assert.ok(c.lci.ganhoLiquido > c.cdb.ganhoLiquido);
});

t('taxas 2026 tem fonte e data', () => {
  assert.strictEqual(taxas.ano, 2026);
  assert.ok(taxas.fonte);
  assert.ok(taxas.dataReferencia);
  assert.ok(taxas.cdi_aa > 0);
});

console.log(`\n${ok} testes passaram`);
