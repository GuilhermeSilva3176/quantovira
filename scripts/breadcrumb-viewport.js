/* Servidor HTTP, puppeteer e checagem de overflow (390px) para a trilha. */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn, spawnSync } = require('child_process');
const { resolveChrome } = require('./resolve-chrome.js');
const lib = require('./breadcrumbs-lib.js');

const root = path.resolve(__dirname, '..');
const depsDir = path.join(__dirname, '.capture-deps');
const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 1 };
const COOKIE_KEY = 'qv-cookie-consent';

function ensurePuppeteer() {
  const mod = path.join(depsDir, 'node_modules', 'puppeteer-core');
  if (!fs.existsSync(mod)) {
    fs.mkdirSync(depsDir, { recursive: true });
    const r = spawnSync(
      'npm',
      ['install', 'puppeteer-core@24.2.0', '--prefix', depsDir, '--no-audit', '--no-fund'],
      { stdio: 'pipe' }
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

function breadcrumbPaths(artigos) {
  const paths = lib.SLUGS.map(function (s) { return '/' + s + '/'; });
  paths.push('/ferramentas/', '/artigos/');
  (artigos || []).forEach(function (a) {
    paths.push('/artigos/' + a.slug + '/');
  });
  return paths;
}

async function preparePage(page) {
  await page.evaluateOnNewDocument(function (key) {
    try { localStorage.setItem(key, 'rejected'); } catch (e) { /* ok */ }
  }, COOKIE_KEY);
}

async function measureOverflow(page) {
  return page.evaluate(function () {
    const main = document.querySelector('main.wrap');
    return {
      innerWidth: window.innerWidth,
      docScroll: document.documentElement.scrollWidth,
      mainScroll: main ? main.scrollWidth : 0
    };
  });
}

function assertNoOverflow(metrics, pathLabel) {
  if (metrics.docScroll > metrics.innerWidth + 1) {
    throw new Error(
      pathLabel + ': document scrollWidth ' + metrics.docScroll + ' > innerWidth ' + metrics.innerWidth
    );
  }
  if (metrics.mainScroll > metrics.innerWidth + 1) {
    throw new Error(
      pathLabel + ': main scrollWidth ' + metrics.mainScroll + ' > innerWidth ' + metrics.innerWidth
    );
  }
}

async function checkPathsNoOverflow(paths, port, chromePath) {
  const puppeteer = ensurePuppeteer();
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  try {
    const page = await browser.newPage();
    await preparePage(page);
    await page.setViewport(VIEWPORT);
    for (let i = 0; i < paths.length; i++) {
      const p = paths[i];
      await page.goto('http://127.0.0.1:' + port + p, {
        waitUntil: 'networkidle0',
        timeout: 45000
      });
      const metrics = await measureOverflow(page);
      assertNoOverflow(metrics, p);
    }
  } finally {
    await browser.close();
  }
}

async function withHttpServer(fn) {
  const port = 18084 + Math.floor(Math.random() * 800);
  const server = startServer(port);
  try {
    await waitForServer(port);
    return await fn(port);
  } finally {
    server.kill('SIGTERM');
  }
}

module.exports = {
  root: root,
  VIEWPORT: VIEWPORT,
  COOKIE_KEY: COOKIE_KEY,
  ensurePuppeteer: ensurePuppeteer,
  waitForServer: waitForServer,
  startServer: startServer,
  breadcrumbPaths: breadcrumbPaths,
  preparePage: preparePage,
  measureOverflow: measureOverflow,
  assertNoOverflow: assertNoOverflow,
  checkPathsNoOverflow: checkPathsNoOverflow,
  withHttpServer: withHttpServer,
  resolveChrome: resolveChrome
};