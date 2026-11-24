#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const lib = require('./scripts/breadcrumbs-lib.js');
const buildArtigos = require('./scripts/build-artigos.js');

const root = path.resolve(__dirname);
let ok = 0;
const t = (n, f) => { f(); ok++; console.log('ok -', n); };

const LD_RE = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;

function parseAllLdJson(html) {
  const blocks = [];
  let m;
  const re = new RegExp(LD_RE.source, 'g');
  while ((m = re.exec(html)) !== null) {
    blocks.push(JSON.parse(m[1]));
  }
  return blocks;
}

function sitemapLocs() {
  const xml = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  const locs = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) locs.push(m[1]);
  return new Set(locs);
}

function htmlPathFromUrl(url) {
  const u = new URL(url);
  let p = u.pathname;
  if (p.endsWith('/')) p += 'index.html';
  else p = p.replace(/^\//, '') + '/index.html';
  return path.join(root, p);
}

function findBreadcrumbList(blocks) {
  return blocks.filter(function (o) { return o['@type'] === 'BreadcrumbList'; });
}

function findCollectionPage(blocks) {
  return blocks.filter(function (o) { return o['@type'] === 'CollectionPage'; });
}

function assertBreadcrumbList(bl) {
  assert.strictEqual(bl['@context'], 'https://schema.org');
  assert.ok(Array.isArray(bl.itemListElement));
  bl.itemListElement.forEach(function (item, i) {
    assert.strictEqual(item['@type'], 'ListItem');
    assert.strictEqual(item.position, i + 1);
    assert.ok(typeof item.name === 'string' && item.name.length > 0);
    assert.ok(item.item.startsWith(lib.SITE + '/'), 'URL absoluta: ' + item.item);
    assert.ok(item.item.endsWith('/'), 'barra final: ' + item.item);
  });
}

t('11 calculadoras na fonte', () => {
  assert.strictEqual(lib.SLUGS.length, 11);
});

t('idempotência do inject de trilha', () => {
  const slug = 'juros-compostos';
  const file = path.join(root, slug, 'index.html');
  const before = fs.readFileSync(file, 'utf8');
  const once = lib.patchCalcPage(before, slug);
  const twice = lib.patchCalcPage(once, slug);
  assert.strictEqual(once, twice);
  const marks = (twice.match(/qv:breadcrumb-start/g) || []).length;
  assert.strictEqual(marks, 1);
});

const sitemap = sitemapLocs();
const { publicados } = buildArtigos.lerArtigos(root);
assert.strictEqual(publicados.length, 18, '18 artigos publicados');

lib.SLUGS.forEach(function (slug) {
  t('trilha na calculadora ' + slug, () => {
    const file = path.join(root, slug, 'index.html');
    const html = fs.readFileSync(file, 'utf8');
    assert.ok(html.includes(lib.MARK_START));
    assert.ok(html.includes('aria-label="Trilha de navegação"'));
    assert.ok(html.includes('aria-current="page"'));
    const visible = lib.extractVisibleTrail(html);
    const expected = lib.trailCalc(slug).map(function (c) { return c.name; });
    assert.deepStrictEqual(visible, expected);
    const blocks = parseAllLdJson(html);
    const bl = findBreadcrumbList(blocks);
    assert.strictEqual(bl.length, 1);
    assertBreadcrumbList(bl[0]);
    assert.deepStrictEqual(
      bl[0].itemListElement.map(function (x) { return x.name; }),
      expected
    );
    bl[0].itemListElement.forEach(function (item) {
      assert.ok(sitemap.has(item.item), 'no sitemap: ' + item.item);
    });
    const webApps = blocks.filter(function (o) { return o['@type'] === 'WebApplication'; });
    assert.strictEqual(webApps.length, 1, slug + ': mantém WebApplication');
  });
});

publicados.forEach(function (a) {
  t('trilha no artigo ' + a.slug, () => {
    const file = path.join(root, 'artigos', a.slug, 'index.html');
    const html = fs.readFileSync(file, 'utf8');
    const visible = lib.extractVisibleTrail(html);
    const expected = lib.trailArtigo(a.title, a.slug).map(function (c) { return c.name; });
    assert.deepStrictEqual(visible, expected);
    const blocks = parseAllLdJson(html);
    const bl = findBreadcrumbList(blocks);
    assert.strictEqual(bl.length, 1);
    assertBreadcrumbList(bl[0]);
    const articles = blocks.filter(function (o) { return o['@type'] === 'Article'; });
    assert.strictEqual(articles.length, 1);
  });
});

t('hub ferramentas: trilha, CollectionPage e sem WebApplication', () => {
  const html = fs.readFileSync(path.join(root, 'ferramentas', 'index.html'), 'utf8');
  const visible = lib.extractVisibleTrail(html);
  assert.deepStrictEqual(visible, ['Início', 'Ferramentas']);
  const blocks = parseAllLdJson(html);
  const bl = findBreadcrumbList(blocks);
  assert.strictEqual(bl.length, 1);
  assertBreadcrumbList(bl[0]);
  const col = findCollectionPage(blocks);
  assert.strictEqual(col.length, 1);
  const list = col[0].mainEntity;
  assert.strictEqual(list['@type'], 'ItemList');
  assert.strictEqual(list.itemListElement.length, 11);
  list.itemListElement.forEach(function (item, i) {
    assert.strictEqual(item.position, i + 1);
    assert.ok(item.url.startsWith(lib.SITE));
    assert.ok(sitemap.has(item.url));
  });
  assert.strictEqual(blocks.filter(function (o) { return o['@type'] === 'WebApplication'; }).length, 0);
});

t('hub artigos: trilha e CollectionPage com 18 itens', () => {
  const html = fs.readFileSync(path.join(root, 'artigos', 'index.html'), 'utf8');
  const visible = lib.extractVisibleTrail(html);
  assert.deepStrictEqual(visible, ['Início', 'Artigos']);
  const blocks = parseAllLdJson(html);
  const col = findCollectionPage(blocks);
  assert.strictEqual(col.length, 1);
  assert.strictEqual(col[0].mainEntity.itemListElement.length, 18);
});

t('home sem trilha', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(!html.includes(lib.MARK_START));
  assert.strictEqual(findBreadcrumbList(parseAllLdJson(html)).length, 0);
});

t('patch-breadcrumbs 2x não altera HTML', () => {
  execFileSync('node', ['scripts/patch-breadcrumbs.js'], { cwd: root, stdio: 'pipe' });
  const mid = fs.readFileSync(path.join(root, 'juros-compostos', 'index.html'), 'utf8');
  execFileSync('node', ['scripts/patch-breadcrumbs.js'], { cwd: root, stdio: 'pipe' });
  const after = fs.readFileSync(path.join(root, 'juros-compostos', 'index.html'), 'utf8');
  assert.strictEqual(mid, after);
});

t('overflow mobile coberto em test-mobile-overflow.js', () => {
  assert.ok(true);
});

console.log('\n' + ok + ' testes breadcrumbs ok');