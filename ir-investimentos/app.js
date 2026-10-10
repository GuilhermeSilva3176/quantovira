(function () {
  var KEY = 'quantovira:ir:v1';
  var aba = 'acoes';
  var GRUPOS = {
    acoes: ['acoesVendas', 'acoesResultado', 'acoesPrejuizo', 'acoesIrrf'],
    day: ['dayVendas', 'dayResultado', 'dayPrejuizo', 'dayIrrf'],
    etf: ['etfVendas', 'etfResultado', 'etfPrejuizo', 'etfIrrf', 'etfRfResultado', 'etfRfPrazo'],
    fii: ['fiiVendas', 'fiiResultado', 'fiiPrejuizo', 'fiiIrrf', 'fiiRendValor', 'fiiRendEnq'],
    cripto: ['criptoLocal', 'criptoVendas', 'criptoResultado', 'criptoPrejuizo'],
    exterior: ['extRendimento', 'extPrejuizo', 'extImposto', 'extAcordo']
  };
  var PADRAO_SELECT = { fiiRendEnq: 'isento', etfRfPrazo: '', criptoLocal: 'brasil' };

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
  function lerParams() {
    var p = { aba: aba };
    Object.keys(IrParams.NUM).forEach(function (k) {
      var el = document.getElementById(k);
      if (el.value === '') p[k] = k === 'atrasoSelic' ? null : 0;
      else {
        var v = parseFloat(el.value);
        p[k] = isFinite(v) ? v : (k === 'atrasoSelic' ? null : 0);
      }
    });
    Object.keys(IrParams.ENUM).forEach(function (k) {
      if (k === 'aba') return;
      p[k] = document.getElementById(k).value;
    });
    Object.keys(IrParams.BOOL).forEach(function (k) {
      p[k] = document.getElementById(k).checked;
    });
    return p;
  }
  function persist() {
    var p = lerParams();
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {}
    history.replaceState(null, '', location.pathname + '?' + IrParams.encode(p));
  }
  function preenchido(id) {
    var el = document.getElementById(id);
    if (!el) return false;
    if (el.type === 'checkbox') return el.checked;
    if (el.tagName === 'SELECT') return el.value !== PADRAO_SELECT[id];
    var v = parseFloat(el.value);
    return isFinite(v) && v !== 0;
  }
  function dots() {
    Object.keys(GRUPOS).forEach(function (k) {
      var on = GRUPOS[k].some(preenchido);
      var dot = document.querySelector('[data-aba="' + k + '"] .dot');
      if (dot) dot.hidden = !on;
    });
  }
  function showTab(id) {
    if (IrParams.ABAS.indexOf(id) < 0) id = 'acoes';
    aba = id;
    document.querySelectorAll('[role="tab"]').forEach(function (b) {
      var on = b.getAttribute('data-aba') === id;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    document.querySelectorAll('[role="tabpanel"]').forEach(function (p) {
      p.hidden = p.id !== 'panel-' + id;
    });
  }
  function aplicar(p) {
    Object.keys(IrParams.NUM).forEach(function (k) {
      document.getElementById(k).value = p[k] == null ? '' : String(p[k]);
    });
    Object.keys(IrParams.ENUM).forEach(function (k) {
      if (k === 'aba') return;
      document.getElementById(k).value = p[k];
    });
    Object.keys(IrParams.BOOL).forEach(function (k) {
      document.getElementById(k).checked = !!p[k];
    });
    showTab(p.aba);
    if (p.atrasoDias > 0 || (p.atrasoSelic != null && p.atrasoSelic !== 0)) {
      document.getElementById('atrasoBox').open = true;
    }
    dots();
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
  function nz(n) {
    return typeof n === 'number' && isFinite(n) && Math.abs(n) > 0;
  }
  function linha(nome, texto) {
    return '<tr><td>' + nome + '</td><td>' + texto + '</td></tr>';
  }
  function pintar(r) {
    document.getElementById('kDarf').textContent = brl(r.darfBolsa.aRecolher);
    document.getElementById('kVenc').textContent = dataBr(r.darfBolsa.vencimento);
    document.getElementById('kPrej').textContent = brl(r.comum.prejuizoRestante);
    var extra = '';
    if (r.darfBolsa.abaixoDoMinimo) extra = 'O imposto de bolsa ficou abaixo de R$ 10 e espera o próximo mês.';
    else if (r.darfBolsa.aRecolher === 0) extra = 'Não há DARF de bolsa neste mês.';
    else extra = 'Pague até o último dia útil do mês seguinte.';
    if (r.irrfSobra > 0) extra += ' Sobra IRRF para os meses seguintes.';
    document.getElementById('resumoExtra').textContent = extra;

    var rows = [];
    function add(nome, n, texto) {
      rows.push({ nome: nome, n: n, texto: texto != null ? texto : brl(n) });
    }
    add('Ações que entram no imposto', r.comum.ganhoAcoes);
    add('ETF de ações que entra no imposto', r.comum.ganhoEtf);
    add('Compensação de ações e ETF', r.comum.compensado, r.comum.compensado ? brl(-r.comum.compensado) : brl(0));
    add('Imposto de ações e ETF (15%)', r.comum.imposto);
    add('Prejuízo de ações e ETF que sobra', r.comum.prejuizoRestante);
    add('Imposto de day trade (20%)', r.dayTrade.imposto);
    add('Prejuízo de day trade que sobra', r.dayTrade.prejuizoRestante);
    add('Imposto da venda de FII (20%)', r.fiiVenda.imposto);
    add('Prejuízo de FII que sobra', r.fiiVenda.prejuizoRestante);
    add('IRRF abatido', r.irrfBolsa, r.irrfBolsa ? brl(-r.irrfBolsa) : brl(0));
    add('DARF a pagar', r.darfBolsa.aRecolher);
    if (nz(r.darfBolsa.acumulado)) add('Imposto de bolsa para o próximo mês', r.darfBolsa.acumulado);
    if (nz(r.irrfSobra)) add('IRRF que sobra', r.irrfSobra);
    add(r.fiiRendimentos.isento ? 'Rendimentos de FII (isentos)' : 'Rendimentos de FII retidos na fonte', r.fiiRendimentos.imposto);
    add('ETF de renda fixa retido na fonte', r.etfRendaFixa.imposto);
    if (r.cripto.local === 'brasil') {
      add(r.cripto.isento ? 'Cripto no Brasil (isento)' : 'Cripto no Brasil, ganho de capital', r.cripto.imposto);
      if (nz(r.cripto.acumulado)) add('Ganho de capital para o próximo mês', r.cripto.acumulado);
    } else {
      rows.push({ nome: 'Cripto no exterior', n: null, texto: 'na declaração anual' });
    }
    add('Exterior na declaração anual (15%)', r.exterior.devido);
    if (nz(r.exterior.prejuizoRestante)) add('Perda no exterior que sobra', r.exterior.prejuizoRestante);
    if (r.atraso.dias > 0) {
      add('Multa de mora do DARF', r.atraso.bolsa.multa);
      add('Juros do DARF', r.atraso.bolsa.juros);
      if (r.cripto.local === 'brasil') {
        add('Multa de mora do ganho de capital', r.atraso.cripto.multa);
        add('Juros do ganho de capital', r.atraso.cripto.juros);
      }
    }
    var curtas = rows.filter(function (row) { return nz(row.n); });
    document.getElementById('linhas').innerHTML = curtas.map(function (row) { return linha(row.nome, row.texto); }).join('');
    document.getElementById('tabelaCurta').hidden = curtas.length === 0;
    document.getElementById('vazio').hidden = curtas.length > 0;
    document.getElementById('linhasTodas').innerHTML = rows.map(function (row) { return linha(row.nome, row.texto); }).join('');
    document.getElementById('avisos').innerHTML = r.avisos.map(function (a) { return '<li>' + a + '</li>'; }).join('');
  }
  function calcular() {
    if (!window.regrasIr) return;
    pintar(IrInv.calcular(ler(), window.regrasIr));
  }
  function boot() {
    var stored = null;
    try { stored = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    aplicar(IrParams.merge(stored, IrParams.decode(location.search)));
    persist();
    document.querySelectorAll('[role="tab"]').forEach(function (b) {
      b.addEventListener('click', function () {
        showTab(b.getAttribute('data-aba'));
        persist();
      });
      b.addEventListener('keydown', function (e) {
        var i = IrParams.ABAS.indexOf(aba);
        var next = null;
        if (e.key === 'ArrowRight') next = IrParams.ABAS[(i + 1) % IrParams.ABAS.length];
        else if (e.key === 'ArrowLeft') next = IrParams.ABAS[(i - 1 + IrParams.ABAS.length) % IrParams.ABAS.length];
        else if (e.key === 'Home') next = IrParams.ABAS[0];
        else if (e.key === 'End') next = IrParams.ABAS[IrParams.ABAS.length - 1];
        if (!next) return;
        e.preventDefault();
        showTab(next);
        document.getElementById('tab-' + next).focus();
        persist();
      });
    });
    document.querySelectorAll('button.info').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        var tip = document.getElementById(b.getAttribute('aria-controls'));
        var abrir = tip.hidden;
        document.querySelectorAll('.tip').forEach(function (t) { t.hidden = true; });
        document.querySelectorAll('button.info').forEach(function (x) { x.setAttribute('aria-expanded', 'false'); });
        tip.hidden = !abrir;
        b.setAttribute('aria-expanded', abrir ? 'true' : 'false');
      });
    });
    document.getElementById('f').addEventListener('submit', function (e) {
      e.preventDefault();
      dots();
      persist();
      calcular();
    });
    document.getElementById('f').addEventListener('input', function () {
      dots();
      persist();
      calcular();
    });
    document.getElementById('f').addEventListener('change', function () {
      dots();
      persist();
      calcular();
    });
    fetch('/data/regras-ir-2026.json').then(function (r) { return r.json(); }).then(function (dados) {
      window.regrasIr = dados;
      document.getElementById('limites').innerHTML = dados.naoModelados.map(function (item) {
        return '<li><strong>' + item.titulo + '.</strong> ' + item.nota + ' <a href="' + item.fonte + '">Fonte</a></li>';
      }).join('');
      calcular();
    }).catch(function () {
      document.getElementById('resumoExtra').textContent = 'Não foi possível carregar as regras.';
    });
  }
  boot();
})();
