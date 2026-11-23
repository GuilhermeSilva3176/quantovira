const assert = require('assert');
const M = require('./assets/money-input.js');
const TP = require('./assets/tool-params.js');
const P = require('./assets/params.js');

let ok = 0;
const t = (n, f) => { f(); ok++; console.log('ok -', n); };

t('parseDecimal inteiro sem separador', () => assert.strictEqual(M.parseDecimal('10000'), 10000));
t('parseDecimal BR com milhar e centavos', () => assert.strictEqual(M.parseDecimal('10.000,50'), 10000.5));
t('parseDecimal US com ponto decimal', () => assert.strictEqual(M.parseDecimal('10000.50'), 10000.5));
t('parseDecimal vírgula decimal', () => assert.strictEqual(M.parseDecimal('12,5'), 12.5));
t('parseDecimal rejeita negativo quando min>=0', () => assert.ok(isNaN(M.parseDecimal('-5'))));
t('parseDecimal aceita negativo com flag', () => assert.strictEqual(M.parseDecimal('-9967', { allowNegative: true }), -9967));
t('parseParamNumber em URL', () => assert.strictEqual(M.parseParamNumber('12,5'), 12.5));
t('formatMoney', () => assert.strictEqual(M.formatMoney(10000, 2), '10.000,00'));
t('formatPercent', () => assert.strictEqual(M.formatPercent(12.5, 1), '12,5'));
t('parseInteger', () => assert.strictEqual(M.parseInteger('60'), 60));
t('parseInteger com milhar BR', () => assert.strictEqual(M.parseInteger('1.200'), 1200));

const api = TP.make({
  valor: { min: 0, max: 1e12, def: 10000 },
  taxa: { min: 0, max: 100, def: 12 }
});
t('tool-params decode valor=10000,50', () => assert.strictEqual(api.decode('valor=10000,50').valor, 10000.5));
t('tool-params decode taxa=12,5', () => assert.strictEqual(api.decode('taxa=12,5').taxa, 12.5));
t('tool-params encode mantém ponto', () => {
  const q = api.encode({ valor: 10000.5, taxa: 12.5 });
  assert.ok(/valor=10000\.5/.test(q) || /valor=10000%2C5/.test(q) === false);
  assert.ok(q.indexOf('valor=10000.5') >= 0);
});

t('params decode taxaRetirada com vírgula', () => {
  const d = P.decode('taxaRetirada=3,25');
  assert.strictEqual(d.taxaRetirada, 3.25);
});

console.log('\n' + ok + ' testes money-input ok');