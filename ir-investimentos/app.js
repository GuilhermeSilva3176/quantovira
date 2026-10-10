(function () {
  function num(id) {
    var el = document.getElementById(id);
    if (el.value === '') return id === 'atrasoSelic' ? null : 0;
    var v = parseFloat(el.value);
    return isFinite(v) ? v : 0;
  }
  function ler() {
    return {
      ano: num('ano'),
      mes: num('mes'),
      acoes: { vendas: num('acoesVendas'), resultado: num('acoesResultado'), prejuizoAcumulado: num('acoesPrejuizo'), irrf: num('acoesIrrf') },
      etfAcoes: { vendas: num('etfVendas'), resultado: num('etfResultado'), prejuizoAcumulado: num('etfPrejuizo'), irrf: num('etfIrrf') },
      dayTrade: { vendas: num('dayVendas'), resultado: num('dayResultado'), prejuizoAcumulado: num('dayPrejuizo'), irrf: num('dayIrrf') },
      fiiVenda: { vendas: num('fiiVendas'), resultado: num('fiiResultado'), prejuizoAcumulado: num('fiiPrejuizo'), irrf: num('fiiIrrf') },
      fiiRendimentos: { valor: num('fiiRendValor'), enquadramento: document.getElementById('fiiRendEnq').value },
      etfRendaFixa: { resultado: num('etfRfResultado'), prazo: document.getElementById('etfRfPrazo').value },
      cripto: { local: document.getElementById('criptoLocal').value, vendas: num('criptoVendas'), resultado: num('criptoResultado'), prejuizoAcumulado: num('criptoPrejuizo') },
      exterior: { rendimento: num('extRendimento'), prejuizo: num('extPrejuizo'), impostoPagoExterior: num('extImposto'), temAcordo: document.getElementById('extAcordo').checked },
      atraso: { dias: num('atrasoDias'), selicAcumulada: num('atrasoSelic'), mesPosterior: document.getElementById('atrasoMesPosterior').checked }
    };
  }
  function brl(n) {
    if (n == null || !isFinite(n)) return '—';
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  function dataBr(v) {
    if (!v) return '—';
    function p(n) { return n < 10 ? '0' + n : '' + n; }
    return p(v.dia) + '/' + p(v.mes) + '/' + v.ano;
  }
  function linha(nome, valor) {
    return '<tr><td>' + nome + '</td><td>' + valor + '</td></tr>';
  }
  function pintar(r) {
    var darf = document.getElementById('kDarf');
    darf.textContent = brl(r.darf6015.aRecolher);
    darf.className = r.darf6015.aRecolher > 0 ? '' : '';
    document.getElementById('kVenc').textContent = dataBr(r.darf6015.vencimento);
    document.getElementById('kPrej').textContent = brl(r.comum.prejuizoRestante);
    var resumo = 'Código 6015. ';
    if (r.darf6015.abaixoDoMinimo) resumo += 'O imposto de bolsa ficou abaixo de R$ 10 e espera o próximo mês. ';
    else if (r.darf6015.aRecolher === 0) resumo += 'Não há DARF de bolsa neste mês. ';
    else resumo += 'Pague até o último dia útil do mês seguinte. ';
    if (r.irrfSobra > 0) resumo += 'Sobra IRRF para os meses seguintes. ';
    document.getElementById('resumo').textContent = resumo;
    var html = '';
    html += linha('Ações que entram no imposto', brl(r.comum.ganhoAcoes));
    html += linha('ETF de ações que entra no imposto', brl(r.comum.ganhoEtf));
    html += linha('Compensação de ações e ETF', brl(-r.comum.compensado));
    html += linha('Imposto de ações e ETF (15%)', brl(r.comum.imposto));
    html += linha('Prejuízo de ações e ETF que sobra', brl(r.comum.prejuizoRestante));
    html += linha('Imposto de day trade (20%)', brl(r.dayTrade.imposto));
    html += linha('Prejuízo de day trade que sobra', brl(r.dayTrade.prejuizoRestante));
    html += linha('Imposto da venda de FII (20%)', brl(r.fiiVenda.imposto));
    html += linha('Prejuízo de FII que sobra', brl(r.fiiVenda.prejuizoRestante));
    html += linha('IRRF abatido', brl(-r.irrfBolsa));
    html += linha('DARF 6015 a pagar', brl(r.darf6015.aRecolher));
    if (r.darf6015.acumulado > 0) html += linha('Imposto de bolsa para o próximo mês', brl(r.darf6015.acumulado));
    if (r.irrfSobra > 0) html += linha('IRRF que sobra', brl(r.irrfSobra));
    html += linha(r.fiiRendimentos.isento ? 'Rendimentos de FII (isentos)' : 'Rendimentos de FII retidos na fonte', brl(r.fiiRendimentos.imposto));
    html += linha('ETF de renda fixa retido na fonte', brl(r.etfRendaFixa.imposto));
    if (r.cripto.local === 'brasil') {
      html += linha(r.cripto.isento ? 'Cripto no Brasil (isento)' : 'Cripto no Brasil, ganho de capital', brl(r.cripto.imposto));
      if (r.cripto.acumulado > 0) html += linha('Ganho de capital para o próximo mês', brl(r.cripto.acumulado));
    } else {
      html += linha('Cripto no exterior', 'na declaração anual');
    }
    html += linha('Exterior na declaração anual (15%)', brl(r.exterior.devido));
    if (r.exterior.prejuizoRestante > 0) html += linha('Perda no exterior que sobra', brl(r.exterior.prejuizoRestante));
    if (r.atraso.dias > 0) {
      html += linha('Multa de mora do DARF 6015', brl(r.atraso.bolsa.multa));
      html += linha('Juros do DARF 6015', brl(r.atraso.bolsa.juros));
      if (r.cripto.local === 'brasil') {
        html += linha('Multa de mora do ganho de capital', brl(r.atraso.cripto.multa));
        html += linha('Juros do ganho de capital', brl(r.atraso.cripto.juros));
      }
    }
    document.getElementById('linhas').innerHTML = html;
    document.getElementById('avisos').innerHTML = r.avisos.map(function (a) { return '<li>' + a + '</li>'; }).join('');
  }
  function calcular() {
    if (!window.regrasIr) return;
    pintar(IrInv.calcular(ler(), window.regrasIr));
  }
  fetch('/data/regras-ir-2026.json').then(function (r) { return r.json(); }).then(function (dados) {
    window.regrasIr = dados;
    document.getElementById('limites').innerHTML = dados.naoModelados.map(function (item) {
      return '<li><strong>' + item.titulo + '.</strong> ' + item.nota + ' <a href="' + item.fonte + '">Fonte</a></li>';
    }).join('');
    calcular();
  }).catch(function () {
    document.getElementById('resumo').textContent = 'Não foi possível carregar as regras.';
  });
  document.getElementById('f').addEventListener('submit', function (e) { e.preventDefault(); calcular(); });
  document.getElementById('f').addEventListener('input', calcular);
  document.getElementById('f').addEventListener('change', calcular);
})();
