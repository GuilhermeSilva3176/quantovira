const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const B = require('./scripts/build-artigos.js');

let ok = 0;
const t = (n, f) => { f(); ok++; console.log('ok -', n); };

function pagina(titulo) {
  return '<!doctype html><html><head><title>' + titulo + '</title></head><body><main><p>' + titulo + '</p></main></body></html>\n';
}

function raizCom(arquivos) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'qv-artigos-'));
  fs.mkdirSync(path.join(root, 'content', 'artigos'), { recursive: true });
  ['index.html', 'simulador-fire/index.html', 'pj-vs-clt/index.html', 'ir-investimentos/index.html'].forEach((rel) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), pagina(rel));
  });
  Object.keys(arquivos).forEach((nome) => {
    fs.writeFileSync(path.join(root, 'content', 'artigos', nome), arquivos[nome]);
  });
  return root;
}

const publicado = `---
title: "Quanto guardar por mês"
description: "Um jeito simples de ler o simulador."
date: 2026-10-10
updated: 2026-10-12
calculadora: simulador-fire
fontes:
  - nome: IBGE
    url: https://www.ibge.gov.br/
  - nome: "Banco Central"
    url: https://www.bcb.gov.br/
---

O simulador responde com uma faixa, não com uma data certa.

## O que observar

- A idade mediana
- A faixa larga

Veja a [metodologia](/fontes/) e **não** trate isso como promessa. Um <script>alert(1)</script> não pode rodar.

[ruim](javascript:alert(1))
`;

const rascunho = `---
title: "Não publicar"
description: "Fica de fora."
date: 2026-01-01
calculadora: ir-investimentos
draft: true
fontes:
  - nome: Receita
    url: https://www.gov.br/
---

Texto de rascunho.
`;

t('front matter lê fontes, rascunho e autor padrão', () => {
  const lido = B.parseFrontMatter(publicado);
  assert.strictEqual(lido.data.title, 'Quanto guardar por mês');
  assert.strictEqual(lido.data.fontes.length, 2);
  assert.strictEqual(lido.data.fontes[1].nome, 'Banco Central');
  assert.strictEqual(B.validar('quanto-guardar', lido.data).author, B.AUTOR_PADRAO);
  assert.strictEqual(B.dataPt('2026-10-10'), '10 de outubro de 2026');
  assert.strictEqual(B.parseFrontMatter(rascunho).data.draft, true);
});

t('markdown vira HTML e não deixa HTML cru nem link javascript', () => {
  const html = B.renderMarkdown(B.parseFrontMatter(publicado).body);
  assert.ok(html.includes('<h2>O que observar</h2>'));
  assert.ok(html.includes('<li>A idade mediana</li>'));
  assert.ok(html.includes('<strong>não</strong>'));
  assert.ok(html.includes('<a href="/fontes/">metodologia</a>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('href="javascript:'));
});

t('o build publica o artigo, ignora o rascunho e é idempotente', () => {
  const root = raizCom({ 'quanto-guardar.md': publicado, 'escondido.md': rascunho });
  fs.mkdirSync(path.join(root, 'artigos', 'velho'), { recursive: true });
  fs.writeFileSync(path.join(root, 'artigos', 'velho', 'index.html'), 'antigo');
  const r = B.build(root);
  assert.strictEqual(r.publicados.length, 1);
  assert.strictEqual(r.rascunhos, 1);
  assert.ok(!fs.existsSync(path.join(root, 'artigos', 'escondido', 'index.html')));
  assert.ok(!fs.existsSync(path.join(root, 'artigos', 'velho')));
  const paginaArtigo = fs.readFileSync(path.join(root, 'artigos', 'quanto-guardar', 'index.html'), 'utf8');
  assert.ok(paginaArtigo.includes('<link rel="canonical" href="https://quantovira.com.br/artigos/quanto-guardar/">'));
  assert.ok(paginaArtigo.includes('"@type":"Article"'));
  assert.ok(paginaArtigo.includes('"headline":"Quanto guardar por mês"'));
  assert.ok(paginaArtigo.includes('Por Equipe Quanto Vira · Atualizado em 12 de outubro de 2026'));
  assert.ok(paginaArtigo.includes('<a href="/simulador-fire/">Simulador FIRE</a>'));
  assert.ok(paginaArtigo.includes('https://www.ibge.gov.br/'));
  assert.ok(paginaArtigo.includes('texto educativo'));
  assert.ok(paginaArtigo.includes('class="ad"'));
  assert.ok(paginaArtigo.includes('<meta property="og:type" content="article">'));
  assert.ok(!paginaArtigo.includes('Não publicar'));
  assert.ok(!paginaArtigo.includes('<script>alert'));
  const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const fire = fs.readFileSync(path.join(root, 'simulador-fire', 'index.html'), 'utf8');
  const pj = fs.readFileSync(path.join(root, 'pj-vs-clt', 'index.html'), 'utf8');
  assert.ok(home.includes('Últimos artigos'));
  assert.ok(home.includes('/artigos/quanto-guardar/'));
  assert.ok(fire.includes('/artigos/quanto-guardar/'));
  assert.ok(!pj.includes('quanto-guardar'));
  const mapa = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  assert.ok(mapa.includes('https://quantovira.com.br/artigos/'));
  assert.ok(mapa.includes('https://quantovira.com.br/artigos/quanto-guardar/</loc><lastmod>2026-10-12</lastmod>'));
  assert.ok(mapa.includes('https://quantovira.com.br/simulador-fire/'));
  assert.ok(!mapa.includes('escondido'));
  const antes = fs.readFileSync(path.join(root, 'artigos', 'quanto-guardar', 'index.html'), 'utf8');
  B.build(root);
  assert.strictEqual(fs.readFileSync(path.join(root, 'artigos', 'quanto-guardar', 'index.html'), 'utf8'), antes);
  assert.strictEqual(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), home);
  assert.strictEqual(fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8'), mapa);
});

t('artigo sem fonte ou com calculadora errada falha', () => {
  assert.throws(() => B.validar('x', { title: 'A', description: 'B', date: '2026-01-01', calculadora: 'ouro', fontes: [{ nome: 'Z', url: 'https://z.dev' }] }), /calculadora/);
  assert.throws(() => B.validar('x', { title: 'A', description: 'B', date: '2026-01-01', calculadora: 'pj-vs-clt', fontes: [] }), /fontes/);
  assert.throws(() => B.validar('index', { title: 'A', description: 'B', date: '2026-01-01', calculadora: 'pj-vs-clt', fontes: [{ nome: 'Z', url: 'https://z.dev' }] }), /slug/);
});

t('o exemplo do repositório é rascunho e não vira página', () => {
  const bruto = fs.readFileSync(path.join(__dirname, 'content', 'artigos', 'exemplo.md'), 'utf8');
  assert.strictEqual(B.parseFrontMatter(bruto).data.draft, true);
  const root = raizCom({ 'exemplo.md': bruto });
  const r = B.build(root);
  assert.strictEqual(r.publicados.length, 0);
  assert.strictEqual(r.rascunhos, 1);
  assert.ok(fs.existsSync(path.join(root, 'artigos', 'index.html')));
  assert.ok(!fs.existsSync(path.join(root, 'artigos', 'exemplo')));
  const lista = fs.readFileSync(path.join(root, 'artigos', 'index.html'), 'utf8');
  assert.ok(lista.includes('Nenhum artigo publicado ainda.'));
  assert.ok(!lista.includes('Modelo de artigo'));
  assert.ok(!fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8').includes('exemplo'));
  assert.ok(!fs.readFileSync(path.join(root, 'index.html'), 'utf8').includes('Últimos artigos'));
});

console.log(ok + ' testes passaram');
