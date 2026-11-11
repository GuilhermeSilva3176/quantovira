const assert = require('assert');
const fs = require('fs');
const path = require('path');
const lib = require('./scripts/calc-next-lib.js');

const root = path.resolve(__dirname);
let ok = 0;
const t = (n, f) => {
  f();
  ok++;
  console.log('ok -', n);
};

t('11 calculadoras na fonte', () => {
  assert.strictEqual(lib.SLUGS.length, 11);
});

t('relações exigidas: preço-teto', () => {
  const rel = lib.data.calculadoras['preco-teto'].relacionadas;
  assert.ok(rel.includes('dividend-yield'));
  assert.ok(rel.includes('preco-medio'));
});

t('relações exigidas: juros compostos', () => {
  const rel = lib.data.calculadoras['juros-compostos'].relacionadas;
  assert.ok(rel.includes('renda-fixa'));
  assert.ok(rel.includes('rentabilidade-real'));
});

t('cada calculadora tem pasta index.html', () => {
  lib.SLUGS.forEach(function (slug) {
    const file = path.join(root, slug, 'index.html');
    assert.ok(fs.existsSync(file), slug);
  });
});

const hrefRe = /href="(\/[^"?#]+\/)"/g;

function extractCalcHrefs(html, slug) {
  const start = html.indexOf(lib.MARK_START);
  const end = html.indexOf(lib.MARK_END);
  assert.ok(start >= 0, slug + ': sem marcador início');
  assert.ok(end > start, slug + ': sem marcador fim');
  const block = html.slice(start, end + lib.MARK_END.length);
  const hrefs = [];
  let m;
  const re = /href="(\/[^"?#]+\/)"/g;
  while ((m = re.exec(block)) !== null) hrefs.push(m[1]);
  return { block: block, hrefs: hrefs };
}

lib.SLUGS.forEach(function (slug) {
  t('bloco em ' + slug, () => {
    const html = fs.readFileSync(path.join(root, slug, 'index.html'), 'utf8');
    const { block, hrefs } = extractCalcHrefs(html, slug);
    assert.ok(block.includes('Próximo passo: calcule também'));
    const calcLinks = hrefs.filter((h) => h !== '/ferramentas/');
    assert.strictEqual(calcLinks.length, 3, slug);
    calcLinks.forEach(function (href) {
      const rel = href.replace(/^\/|\/$/g, '');
      assert.notStrictEqual(rel, slug, 'autolink em ' + slug);
      assert.ok(lib.SLUGS.includes(rel), href);
      assert.ok(fs.existsSync(path.join(root, rel, 'index.html')));
    });
    assert.ok(hrefs.includes('/ferramentas/'), slug + ': link hub');
    const n = lib.SLUGS.length;
    assert.ok(block.includes('Ver todas as ' + n + ' calculadoras'), slug);
  });
});

t('idempotência do inject', () => {
  const slug = 'preco-teto';
  const file = path.join(root, slug, 'index.html');
  const before = fs.readFileSync(file, 'utf8');
  const once = lib.injectBlock(before, slug);
  const twice = lib.injectBlock(once, slug);
  assert.strictEqual(once, twice);
  const count = (twice.match(/qv:calc-next-start/g) || []).length;
  assert.strictEqual(count, 1);
});

console.log('\n' + ok + ' testes calc-next ok');
