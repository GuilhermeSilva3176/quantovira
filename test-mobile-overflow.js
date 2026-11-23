#!/usr/bin/env node
const assert = require('assert');
const { execFileSync } = require('child_process');
const path = require('path');
const { pathsFromSitemap } = require('./scripts/sitemap-paths.js');
const { resolveChrome } = require('./scripts/resolve-chrome.js');

const root = path.resolve(__dirname);
let ok = 0;
const t = (n, f) => { f(); ok++; console.log('ok -', n); };

t('sitemap com páginas esperadas', () => {
  const paths = pathsFromSitemap();
  assert.ok(paths.includes('/'));
  assert.ok(paths.includes('/juros-compostos/'));
  assert.ok(paths.includes('/privacidade/'));
  assert.strictEqual(paths.length, 34, '34 URLs no sitemap');
});

t('drawer no viewport + 360px e 412px sem overflow (sitemap)', () => {
  if (!resolveChrome()) {
    console.log('  (pulado: sem Chrome)');
    return;
  }
  const run = execFileSync('node', ['scripts/mobile-overflow-check.js'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  assert.ok(/sem overflow horizontal/.test(run), run);
});

console.log('\n' + ok + ' testes mobile overflow ok');