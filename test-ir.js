const assert = require('assert');
const fs = require('fs');
const regras = require('./data/regras-ir-2026.json');
const IR = require('./assets/ir.js');
const Params = require('./assets/ir-params.js');
let ok = 0;
const t = (n, f) => { f(); ok++; console.log('ok -', n); };
const z = { vendas: 0, resultado: 0, prejuizoAcumulado: 0, irrf: 0 };
function calc(extra) {
  return IR.calcular(Object.assign({
    ano: 2026, mes: 2,
    acoes: Object.assign({}, z),
    etfAcoes: Object.assign({}, z),
    dayTrade: Object.assign({}, z),
    fiiVenda: Object.assign({}, z),
    fiiRendimentos: { valor: 0, enquadramento: 'isento' },
    etfRendaFixa: { resultado: 0, prazo: '' },
    cripto: { local: 'brasil', vendas: 0, resultado: 0, prejuizoAcumulado: 0 },
    exterior: { rendimento: 0, prejuizo: 0, impostoPagoExterior: 0, temAcordo: false },
    atraso: { dias: 0, selicAcumulada: null, mesPosterior: true }
  }, extra), regras);
}

t('exemplo da Receita: venda de R$ 60 mil, ganho de R$ 9.967, IRRF de R$ 3', () => {
  const r = calc({ acoes: { vendas: 60000, resultado: 9967, prejuizoAcumulado: 0, irrf: 3 } });
  assert.strictEqual(r.comum.imposto, 1495.05);
  assert.strictEqual(r.darfBolsa.aRecolher, 1492.05);
  assert.ok(!('codigo' in r.darfBolsa));
  assert.ok(!JSON.stringify(r).includes('6015'));
  assert.deepStrictEqual(r.darfBolsa.vencimento, { ano: 2026, mes: 3, dia: 31 });
});

t('ações até R$ 20 mil, inclusive o limite, ficam isentas', () => {
  const noLimite = calc({ acoes: { vendas: 20000, resultado: 1000, prejuizoAcumulado: 500, irrf: 0 } });
  assert.strictEqual(noLimite.comum.imposto, 0);
  assert.strictEqual(noLimite.comum.prejuizoRestante, 500);
  const acima = calc({ acoes: { vendas: 20000.01, resultado: 1000, prejuizoAcumulado: 0, irrf: 0 } });
  assert.strictEqual(acima.comum.imposto, 150);
});

t('day trade é 20% e não usa a isenção de R$ 20 mil', () => {
  const r = calc({ dayTrade: { vendas: 1000, resultado: 1000, prejuizoAcumulado: 0, irrf: 10 } });
  assert.strictEqual(r.dayTrade.imposto, 200);
  assert.strictEqual(r.darfBolsa.aRecolher, 190);
});

t('prejuízo de day trade não abate ação, e o contrário também não', () => {
  const perdaDay = calc({
    acoes: { vendas: 50000, resultado: 1000, prejuizoAcumulado: 0, irrf: 0 },
    dayTrade: { vendas: 1000, resultado: -400, prejuizoAcumulado: 0, irrf: 0 }
  });
  assert.strictEqual(perdaDay.comum.imposto, 150);
  assert.strictEqual(perdaDay.dayTrade.prejuizoRestante, 400);
  const perdaAcao = calc({
    acoes: { vendas: 50000, resultado: -400, prejuizoAcumulado: 0, irrf: 0 },
    dayTrade: { vendas: 1000, resultado: 1000, prejuizoAcumulado: 0, irrf: 0 }
  });
  assert.strictEqual(perdaAcao.dayTrade.imposto, 200);
  assert.strictEqual(perdaAcao.comum.prejuizoRestante, 400);
});

t('ETF de ações não é isento e compensa com ações comuns', () => {
  const soEtf = calc({ etfAcoes: { vendas: 1000, resultado: 1000, prejuizoAcumulado: 0, irrf: 0 } });
  assert.strictEqual(soEtf.comum.imposto, 150);
  const junto = calc({
    acoes: { vendas: 50000, resultado: 1000, prejuizoAcumulado: 0, irrf: 0 },
    etfAcoes: { vendas: 1000, resultado: -400, prejuizoAcumulado: 0, irrf: 0 }
  });
  assert.strictEqual(junto.comum.base, 600);
  assert.strictEqual(junto.comum.imposto, 90);
  assert.strictEqual(junto.comum.prejuizoRestante, 0);
});

t('venda de FII é 20% e o prejuízo não abate ação', () => {
  const r = calc({
    acoes: { vendas: 50000, resultado: 1000, prejuizoAcumulado: 0, irrf: 0 },
    fiiVenda: { vendas: 8000, resultado: 1000, prejuizoAcumulado: 300, irrf: 0 }
  });
  assert.strictEqual(r.fiiVenda.base, 700);
  assert.strictEqual(r.fiiVenda.imposto, 140);
  assert.strictEqual(r.comum.imposto, 150);
  assert.strictEqual(r.darfBolsa.aRecolher, 290);
});

t('rendimento de FII isento fica zerado; sem isenção, 20% não entram no DARF', () => {
  const isento = calc({ fiiRendimentos: { valor: 1000, enquadramento: 'isento' } });
  assert.strictEqual(isento.fiiRendimentos.imposto, 0);
  assert.strictEqual(isento.darfBolsa.aRecolher, 0);
  const tributado = calc({ fiiRendimentos: { valor: 1000, enquadramento: 'tributado' } });
  assert.strictEqual(tributado.fiiRendimentos.imposto, 200);
  assert.strictEqual(tributado.fiiRendimentos.retidoNaFonte, true);
  assert.strictEqual(tributado.darfBolsa.aRecolher, 0);
});

t('ETF de renda fixa usa a faixa do prazo e não entra no DARF mensal', () => {
  const r = calc({ etfRendaFixa: { resultado: 1000, prazo: 'ate180' } });
  assert.strictEqual(r.etfRendaFixa.aliquota, 0.25);
  assert.strictEqual(r.etfRendaFixa.imposto, 250);
  assert.strictEqual(r.darfBolsa.aRecolher, 0);
  const longo = calc({ etfRendaFixa: { resultado: 1000, prazo: 'acima720' } });
  assert.strictEqual(longo.etfRendaFixa.imposto, 150);
});

t('IRRF que sobra não vira DARF negativo, e valor abaixo de R$ 10 acumula', () => {
  const sobra = calc({ acoes: { vendas: 10000, resultado: 100, prejuizoAcumulado: 0, irrf: 2 } });
  assert.strictEqual(sobra.darfBolsa.aRecolher, 0);
  assert.strictEqual(sobra.irrfSobra, 2);
  const baixo = calc({ acoes: { vendas: 30000, resultado: 40, prejuizoAcumulado: 0, irrf: 0 } });
  assert.strictEqual(baixo.comum.imposto, 6);
  assert.strictEqual(baixo.darfBolsa.abaixoDoMinimo, true);
  assert.strictEqual(baixo.darfBolsa.aRecolher, 0);
  assert.strictEqual(baixo.darfBolsa.acumulado, 6);
});

t('cripto no Brasil: isenção de R$ 35 mil e tabela progressiva', () => {
  const isento = calc({ cripto: { local: 'brasil', vendas: 35000, resultado: 5000, prejuizoAcumulado: 0 } });
  assert.strictEqual(isento.cripto.imposto, 0);
  const tributado = calc({ cripto: { local: 'brasil', vendas: 35000.01, resultado: 1000, prejuizoAcumulado: 800 } });
  assert.strictEqual(tributado.cripto.imposto, 150);
  assert.strictEqual(tributado.cripto.prejuizoNaoUsado, 800);
  assert.strictEqual(IR.ganhoProgressivo(6000000, regras.criptoBrasil.faixas), 925000);
});

t('cripto e aplicações no exterior: 15% no ano, com perda e crédito limitado', () => {
  const r = calc({
    cripto: { local: 'exterior', vendas: 10000, resultado: 4000, prejuizoAcumulado: 0 },
    exterior: { rendimento: 6000, prejuizo: 2000, impostoPagoExterior: 500, temAcordo: true }
  });
  assert.strictEqual(r.exterior.base, 8000);
  assert.strictEqual(r.exterior.imposto, 1200);
  assert.strictEqual(r.exterior.credito, 500);
  assert.strictEqual(r.exterior.devido, 700);
  const semAcordo = calc({ exterior: { rendimento: 10000, prejuizo: 0, impostoPagoExterior: 500, temAcordo: false } });
  assert.strictEqual(semAcordo.exterior.credito, 0);
  assert.strictEqual(semAcordo.exterior.devido, 1500);
  const sobra = calc({ exterior: { rendimento: 1000, prejuizo: 2500, impostoPagoExterior: 0, temAcordo: false } });
  assert.strictEqual(sobra.exterior.devido, 0);
  assert.strictEqual(sobra.exterior.prejuizoRestante, 1500);
});

t('multa de 0,33% ao dia, teto de 20%, e juros só com a Selic informada', () => {
  const base = { acoes: { vendas: 60000, resultado: 1000, prejuizoAcumulado: 0, irrf: 0 } };
  const dez = calc(Object.assign({}, base, { atraso: { dias: 10, selicAcumulada: 0.5, mesPosterior: true } }));
  assert.strictEqual(dez.comum.imposto, 150);
  assert.strictEqual(dez.atraso.bolsa.multa, 4.95);
  assert.strictEqual(dez.atraso.bolsa.juros, 2.25);
  const teto = calc(Object.assign({}, base, { atraso: { dias: 100, selicAcumulada: null, mesPosterior: true } }));
  assert.strictEqual(teto.atraso.bolsa.multa, 30);
  assert.strictEqual(teto.atraso.bolsa.juros, null);
  const mesmoMes = calc(Object.assign({}, base, { atraso: { dias: 2, selicAcumulada: 1, mesPosterior: false } }));
  assert.strictEqual(mesmoMes.atraso.bolsa.juros, 0);
  assert.strictEqual(mesmoMes.atraso.bolsa.multa, 0.99);
});

t('vencimento pula fim de semana e feriado nacional fixo', () => {
  assert.deepStrictEqual(IR.vencimentoDoMesSeguinte(2026, 2, regras.feriadosNacionais.dias), { ano: 2026, mes: 3, dia: 31 });
  const comFeriado = regras.feriadosNacionais.dias.concat([{ mes: 3, dia: 31, nome: 'teste' }]);
  assert.deepStrictEqual(IR.vencimentoDoMesSeguinte(2026, 2, comFeriado), { ano: 2026, mes: 3, dia: 30 });
  assert.deepStrictEqual(IR.ultimoDiaUtil(2026, 1, regras.feriadosNacionais.dias), { ano: 2026, mes: 1, dia: 30 });
});

t('JSON traz fonte e ano, marca a MP 1.303 como sem efeito em 2026 e lista o que ficou de fora', () => {
  ['acoesComuns', 'dayTrade', 'etfAcoes', 'fiiVenda', 'fiiRendimentos', 'criptoBrasil', 'exterior', 'darfBolsa', 'atraso'].forEach((k) => {
    assert.strictEqual(regras[k].anoReferencia, 2026);
    assert.ok(regras[k].fonte);
  });
  assert.strictEqual(regras.mp1303.vigenteEm2026, false);
  assert.strictEqual(regras.mp1303.verificado, true);
  assert.ok(regras.naoModelados.length >= 8);
  assert.ok(regras.naoModelados.every((item) => item.verificado === false && item.nota && item.fonte));
  assert.strictEqual(regras.ganhoCapitalPrazo.codigoVerificado, false);
  assert.strictEqual(regras.darfBolsa.codigoVerificado, false);
  assert.ok(!('codigo' in regras.darfBolsa));
  assert.ok(!JSON.stringify(regras).includes('6015'));
  assert.strictEqual(regras.fiiRendimentos.minimoCotistas, 100);
});

t('a interface e as fontes não trazem o código numérico do DARF', () => {
  ['ir-investimentos/index.html', 'ir-investimentos/app.js', 'fontes/index.html', 'assets/ir.js', 'assets/ir-params.js', 'assets/style.css'].forEach((f) => {
    assert.ok(!fs.readFileSync(f, 'utf8').includes('6015'), f);
  });
});

t('parâmetros da URL e do armazenamento voltam iguais e a URL prevalece', () => {
  const amostra = Params.merge(null, {});
  amostra.dayResultado = 1000;
  amostra.dayIrrf = 10;
  amostra.aba = 'day';
  amostra.extAcordo = true;
  amostra.etfRfPrazo = 'ate180';
  amostra.atrasoSelic = 0.5;
  amostra.criptoResultado = -20;
  assert.deepStrictEqual(Params.decode(Params.encode(amostra)), amostra);
  assert.strictEqual(Params.decode('?dayResultado=-40').dayResultado, -40);
  assert.strictEqual(Params.decode('mes=99').mes, 12);
  assert.strictEqual(Params.decode('acoesVendas=-5').acoesVendas, 0);
  assert.strictEqual(Params.decode('aba=zzz').aba, undefined);
  const m = Params.merge(
    { dayResultado: 1000, aba: 'day', acoesVendas: 1, extAcordo: true },
    Params.decode('acoesVendas=10&aba=fii&extAcordo=0')
  );
  assert.strictEqual(m.acoesVendas, 10);
  assert.strictEqual(m.aba, 'fii');
  assert.strictEqual(m.dayResultado, 1000);
  assert.strictEqual(m.acoesResultado, 9967);
  assert.strictEqual(m.extAcordo, false);
  assert.strictEqual(m.atrasoMesPosterior, true);
  assert.strictEqual(m.atrasoSelic, null);
  assert.strictEqual(Params.merge({ aba: 'zzz', atrasoSelic: 'abc' }, {}).aba, 'acoes');
  assert.strictEqual(Params.merge({ aba: 'zzz', atrasoSelic: 'abc' }, {}).atrasoSelic, null);
});

console.log(ok + ' testes passaram');
