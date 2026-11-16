#!/usr/bin/env node
/* Capturas mobile (390px) da trilha — HTTP na raiz; valida CSS antes de salvar. */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn, spawnSync } = require('child_process');
const { resolveChrome } = require('./resolve-chrome.js');

const root = path.resolve(__dirname, '..');
const outDir = process.argv[2] || path.join(root, 'artifacts', 'breadcrumbs');
const depsDir = path.join(__dirname, '.capture-deps');
const chrome = resolveChrome();

if (!chrome) {
  console.error('Chrome não encontrado — defina CHROME ou instale chromium.');
  process.exit(1);
}

const shots = [
  { path: '/juros-compostos/', out: 'breadcrumb-juros-compostos-390.png' },
  {
    path: '/artigos/lci-lca-cri-cra-isentos-cdb-taxa-equivalente/',
    out: 'breadcrumb-artigo-titulo-longo-390.png'
  }
];

function ensurePuppeteer() {
  const mod = path.join(depsDir, 'node_modules', 'puppeteer-core');
  if (!fs.existsSync(mod)) {
    fs.mkdirSync(depsDir, { recursive: true });
    console.error('instalando puppeteer-core em', depsDir);
    const r = spawnSync(
      'npm',
      ['install', 'puppeteer-core@24.2.0', '--prefix', depsDir, '--no-audit', '--no-fund'],
      { stdio: 'inherit' }
    );
    if (r.status !== 0) throw new Error('npm install puppeteer-core falhou');
  }
  return require(mod);
}

function waitForServer(port) {
  return new Promise(function (resolve, reject) {
    let n = 0;
    const tryOnce = function () {
      const req = http.get('http://127.0.0.1:' + port + '/assets/style.css', function (res) {
        res.resume();
        if (res.statusCode === 200) resolve();
        else if (++n >= 50) reject(new Error('CSS HTTP ' + res.statusCode));
        else setTimeout(tryOnce, 100);
      });
      req.on('error', function () {
        if (++n >= 50) reject(new Error('servidor na porta ' + port));
        else setTimeout(tryOnce, 100);
      });
      req.setTimeout(2500, function () {
        req.destroy();
        if (++n >= 50) reject(new Error('timeout servidor'));
        else setTimeout(tryOnce, 100);
      });
    };
    tryOnce();
  });
}

function startServer(port) {
  return spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], {
    cwd: root,
    stdio: 'ignore'
  });
}

async function captureAll(port) {
  const puppeteer = ensurePuppeteer();
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    for (let i = 0; i < shots.length; i++) {
      const shot = shots[i];
      await page.goto('http://127.0.0.1:' + port + shot.path, {
        waitUntil: 'networkidle0',
        timeout: 45000
      });
      const check = await page.evaluate(function () {
        let rules = 0;
        for (let si = 0; si < document.styleSheets.length; si++) {
          try { rules += document.styleSheets[si].cssRules.length; } catch (e) { /* ok */ }
        }
        const header = document.querySelector('header.top');
        const logo = document.querySelector('.brand-mark');
        const breadcrumb = document.querySelector('nav.breadcrumb');
        return {
          rules: rules,
          hdrBg: header ? getComputedStyle(header).backgroundColor : '',
          logoOk: !!(logo && (logo.naturalWidth || logo.width) > 0),
          breadcrumb: !!breadcrumb
        };
      });
      if (check.rules < 20) throw new Error(shot.path + ': CSS não aplicou (rules=' + check.rules + ')');
      if (!check.hdrBg || check.hdrBg === 'rgba(0, 0, 0, 0)') {
        throw new Error(shot.path + ': header sem fundo');
      }
      if (!check.logoOk) throw new Error(shot.path + ': logo não carregou');
      if (!check.breadcrumb) throw new Error(shot.path + ': trilha ausente');
      const out = path.join(outDir, shot.out);
      await page.screenshot({ path: out, fullPage: false });
      if (fs.statSync(out).size < 15000) throw new Error(out + ': PNG pequeno demais');
      console.log('ok ' + out + ' rules=' + check.rules + ' header=' + check.hdrBg);
    }
  } finally {
    await browser.close();
  }
}

(async function () {
  const port = 18083;
  const server = startServer(port);
  try {
    await waitForServer(port);
    await captureAll(port);
  } finally {
    server.kill('SIGTERM');
  }
})().catch(function (e) {
  console.error(e.message || e);
  process.exit(1);
});