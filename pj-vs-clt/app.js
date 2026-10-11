(function () {
  var regras;
  var campos = ['salarioClt', 'vrVa', 'planoSaude', 'plr', 'valorPjMensal', 'proLabore', 'custoContador', 'feriasDias', 'iss', 'contabilidadeCompleta'];
  function num(id) {
    var v = parseFloat(document.getElementById(id).value);
    return isFinite(v) ? v : 0;
  }
  function ler() {
    return {
      salarioClt: num('salarioClt'),
      vrVa: num('vrVa'),
      planoSaude: num('planoSaude'),
      plr: num('plr'),
      valorPjMensal: num('valorPjMensal'),
      regime: document.getElementById('regime').value,
      proLabore: num('proLabore'),
      custoContador: num('custoContador'),
      feriasDias: num('feriasDias'),
      contabilidadeCompleta: document.getElementById('contabilidadeCompleta').checked,
      issAliquota: num('iss') / 100
    };
  }
  function brl(n) {
    if (n == null || !isFinite(n)) return '—';
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  function linha(nome, a, b) {
    return '<tr><td>' + nome + '</td><td>' + brl(a) + '</td><td>' + brl(b) + '</td></tr>';
  }
  function pintar(r) {
    var c = r.clt, p = r.pj;
    document.getElementById('kClt').textContent = brl(c.liquidoEquivalente);
    document.getElementById('kPj').textContent = brl(p.liquidoEquivalente);
    var dif = document.getElementById('kDif');
    dif.textContent = brl(r.diferenca);
    dif.className = r.diferenca > 0 ? 'pos' : (r.diferenca < 0 ? 'neg' : '');
    var eq = document.getElementById('equilibrio');
    if (r.breakEvenMensal == null) {
      eq.textContent = 'Não há ponto de equilíbrio até R$ 250 mil de nota mensal com estes dados.';
    } else {
      var extra = '';
      if (p.regime === 'mei' && r.breakEvenMensal * 12 > regras.mei.limiteReceitaAnual) extra = ' Esse valor estoura o limite anual do MEI.';
      if ((p.regime === 'simples-iii' || p.regime === 'simples-v') && r.breakEvenMensal * 12 > regras.simples.limiteReceitaAnual) extra = ' Esse valor estoura o teto do Simples.';
      eq.textContent = 'Ponto de equilíbrio: nota PJ de ' + brl(r.breakEvenMensal) + ' por mês para o que sobra no PJ alcançar o ano do CLT, já com o FGTS.' + extra;
    }
    var impostosPj = p.das + p.pis + p.cofins + p.iss + p.irpj + p.csll;
    var html = '';
    html += linha('Salários ou receita', c.salarioMensal * 12, p.receitaAnual);
    html += linha('13º', c.decimo, 0);
    html += linha('Terço de férias', c.terco, 0);
    html += linha('INSS', -(c.inssAnualSalarios + c.inss13 + c.inssTerco), -(p.inssSegurado + p.inssPatronal));
    html += linha('IR do trabalho, 13º, férias e pró-labore', -(c.irAnualSalarios + c.ir13 + c.irFerias), -p.irProLabore);
    html += linha('Ajuste anual do IR', -c.ajusteAnual, -p.ajusteAnual);
    html += linha('IR da PLR ou dos dividendos', -c.plrIr, -p.irDividendos);
    html += linha('DAS, PIS, COFINS, ISS, IRPJ e CSLL', 0, -impostosPj);
    html += linha('Contador', 0, -p.contador);
    html += linha('VR/VA e plano de saúde', c.beneficios, 0);
    html += linha('PLR bruta', c.plr, 0);
    html += linha('FGTS de 8%', c.fgts, 0);
    html += linha('Equivalente anual', c.liquidoEquivalente, p.liquidoEquivalente);
    document.getElementById('linhas').innerHTML = html;
    var avisos = (c.avisos || []).concat(p.avisos);
    if (!p.valido) avisos.unshift('Este regime não cobre a receita informada. O número acima não substitui o enquadramento real.');
    document.getElementById('avisos').innerHTML = avisos.map(function (a) { return '<li>' + a + '</li>'; }).join('');
  }
  function calcular() {
    if (!regras) return;
    pintar(PjClt.comparar(ler(), regras));
  }
  fetch('/data/regras-2026.json').then(function (r) { return r.json(); }).then(function (dados) {
    regras = dados;
    document.getElementById('limites').innerHTML = dados.naoModelados.map(function (item) {
      return '<li><strong>' + item.titulo + '.</strong> ' + item.nota + ' <a href="' + item.fonte + '">Fonte</a></li>';
    }).join('') + '<li>VR/VA e plano de saúde só ficam de fora do salário se cumprirem a Lei nº 8.212/1991. Dinheiro livre pode ser salário.</li>';
    calcular();
  }).catch(function () {
    document.getElementById('equilibrio').textContent = 'Não foi possível carregar as regras de 2026.';
  });
  document.getElementById('f').addEventListener('submit', function (e) { e.preventDefault(); calcular(); });
  campos.forEach(function (id) {
    var el = document.getElementById(id);
    el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', calcular);
  });
  document.getElementById('regime').addEventListener('change', calcular);
})();
