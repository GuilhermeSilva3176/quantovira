(function(){
  var KEY='quantovira:fire:v1';
  var brl=function(v){return v.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});};
  var ids=Object.keys(FireParams.FIELDS), anos=null, chart=null;
  var el=function(i){return document.getElementById(i);};
  function load(){
    var stored=null; try{stored=JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){}
    var p=FireParams.merge(stored,FireParams.decode(location.search));
    ids.forEach(function(i){el(i).value=p[i];});
  }
  function read(){var p={};ids.forEach(function(i){p[i]=parseFloat(el(i).value);});return p;}
  function persist(p){
    try{localStorage.setItem(KEY,JSON.stringify(p));}catch(e){}
    history.replaceState(null,'',location.pathname+'?'+FireParams.encode(p));
  }
  function updMeta(){var p=read();el('metaTxt').textContent='Sua meta: '+brl(p.gastoMensal*12/(p.taxaRetirada/100));el('pctTxt').textContent=p.pctAcoes+'%';}
  function run(e){
    if(e)e.preventDefault(); if(!anos)return;
    var p=read();
    if(!(p.idadeFinal>p.idade)){alert('A idade final precisa ser maior que a atual.');return;}
    persist(p);
    p.seed=Date.now()%2147483647;
    var r=FireSim.simulate(p,anos);
    el('kSuc').textContent=Math.round(r.probSucesso*100)+'%';
    el('kAge').textContent=isNaN(r.idadeFire.p50)?'não atinge':Math.round(r.idadeFire.p50)+' anos';
    el('kAgeR').textContent=isNaN(r.idadeFire.p10)?'–':Math.round(r.idadeFire.p10)+'–'+Math.round(r.idadeFire.p90);
    el('explain').textContent='Em '+Math.round(r.probAtingir*100)+'% das '+p.nSims+' simulações você atinge a meta de '+brl(r.meta)+' antes dos '+p.idadeFinal+' anos. Em '+Math.round(r.probSucesso*100)+'% delas, além disso, o dinheiro dura até lá. Valores em reais de hoje.';
    var ds=[
      {label:'p90 (otimista)',data:r.bands.p90,borderColor:'#7fd8bd',backgroundColor:'rgba(15,157,118,.12)',fill:'+2',pointRadius:0,borderWidth:1},
      {label:'p50 (mediana)',data:r.bands.p50,borderColor:'#0f9d76',pointRadius:0,borderWidth:3,fill:false},
      {label:'p10 (pessimista)',data:r.bands.p10,borderColor:'#7fd8bd',pointRadius:0,borderWidth:1,fill:false},
      {label:'Meta FIRE',data:r.idades.map(function(){return r.meta;}),borderColor:'#e07a5f',borderDash:[6,4],pointRadius:0,borderWidth:1.5,fill:false}];
    if(chart)chart.destroy();
    if(typeof Chart==='undefined'){document.querySelector('.chartbox').textContent='Não foi possível carregar o gráfico.';return;}
    chart=new Chart(el('chart'),{type:'line',data:{labels:r.idades,datasets:ds},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},
      scales:{y:{ticks:{callback:function(v){return brl(v);}}},x:{title:{display:true,text:'Idade'}}},
      plugins:{tooltip:{callbacks:{label:function(c){return c.dataset.label+': '+brl(c.parsed.y);}}}}}});
  }
  function copyLink(){
    var p=read(); var url=location.origin+location.pathname+'?'+FireParams.encode(p);
    var done=function(){el('copyMsg').textContent='Link copiado!';setTimeout(function(){el('copyMsg').textContent='';},2500);};
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(url).then(done,function(){prompt('Copie o link:',url);});}
    else prompt('Copie o link:',url);
  }
  load();
  ids.forEach(function(i){el(i).addEventListener('input',updMeta);});
  el('f').addEventListener('submit',run);
  el('copy').addEventListener('click',copyLink);
  fetch('/data/historico.json').then(function(r){return r.json();}).then(function(d){anos=d.anos;updMeta();run();})
    .catch(function(){el('explain').textContent='Erro ao carregar os dados históricos.';});
})();
