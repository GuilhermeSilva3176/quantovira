#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const og = require('./scripts/og-lib.js');
const S = require('./scripts/site-shell.js');

const root = __dirname;
let ok = 0;
const t = (n, f) => { f(); ok++; console.log('ok -', n); };

t('canonical mapeia para PNG em assets/og-pages', () => {
  assert.strictEqual(og.canonicalToOgRel('https://quantovira.com.br/juros-compostos/'), 'assets/og-pages/juros-compostos.png');
  assert.strictEqual(og.canonicalToOgRel('https://quantovira.com.br/artigos/foo/'), 'assets/og-pages/artigos/foo.png');
  assert.strictEqual(og.canonicalToOgRel('https://quantovira.com.br/'), 'assets/og-pages/home.png');
});

t('site-shell usa a mesma regra de caminho', () => {
  assert.strictEqual(S.canonicalToOgRel('https://quantovira.com.br/ferramentas/'), 'assets/og-pages/ferramentas.png');
});

t('sitemap e HTML descobrem todas as páginas', () => {
  const pages = og.discoverPages(root);
  const locs = og.parseSitemapUrls(fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8'));
  assert.strictEqual(pages.length, locs.length, 'cobertura = sitemap (' + locs.length + ' URLs)');
  pages.forEach(function (p) {
    assert.ok(p.headline.length > 0);
    assert.ok(p.titleLines.length >= 1 && p.titleLines.length <= 3);
    assert.ok(p.ogUrl.startsWith(S.SITE + '/assets/og-pages/'));
  });
});

t('wrap aceita título longo com acentuação', () => {
  const long = 'LCI, LCA, CRI e CRA isentos x CDB tributado: como calcular a taxa equivalente';
  const lines = og.wrapLines(long, 32);
  assert.ok(lines.length >= 2);
  assert.ok(lines.join(' ').includes('LCI'));
  assert.ok(lines.join(' ').includes('equivalente'));
});

t('imagens OG existem após build com dimensões 1200×630', () => {
  const pages = og.discoverPages(root);
  pages.forEach(function (p) {
    const file = path.join(root, p.rel);
    assert.ok(fs.existsSync(file), 'PNG ausente: ' + p.rel);
    const buf = fs.readFileSync(file);
    assert.strictEqual(buf[0], 0x89);
    assert.strictEqual(buf.toString('ascii', 1, 4), 'PNG');
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    assert.strictEqual(w, 1200);
    assert.strictEqual(h, 630);
  });
});

t('meta og:image e twitter:image apontam para PNG da página', () => {
  const pages = og.discoverPages(root);
  pages.forEach(function (p) {
    const html = fs.readFileSync(p.file, 'utf8');
    const expected = p.ogUrl;
    assert.ok(html.includes('property="og:image" content="' + expected + '"'), p.canonical + ' og:image');
    assert.ok(html.includes('name="twitter:image" content="' + expected + '"'), p.canonical + ' twitter:image');
    assert.ok(html.includes('og:image:type'), p.canonical + ' og:image:type');
    assert.ok(!html.includes('content="https://quantovira.com.br/assets/og.png"'), p.canonical + ' não deve usar og genérico');
  });
});

t('nova URL no sitemap gera caminho sem cadastro manual', () => {
  const rel = og.canonicalToOgRel('https://quantovira.com.br/artigos/novo-slug-exemplo/');
  assert.strictEqual(rel, 'assets/og-pages/artigos/novo-slug-exemplo.png');
});

console.log('\n' + ok + ' testes passaram');
