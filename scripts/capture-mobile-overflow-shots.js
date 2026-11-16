#!/usr/bin/env node
/* Capturas 360px — ROOT=worktree da branch base para prints "antes". */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const vp = require('./breadcrumb-viewport.js');
const drawer = require('./drawer-test-lib.js');

const serveRoot = process.env.ROOT ? path.resolve(process.env.ROOT) : vp.root;
const outDir = process.argv[2] || '/opt/cursor/artifacts';
const mode = process.argv[3] || 'all';
const chrome = vp.resolveChrome();
const VIEWPORT = { width: 360, height: 800, deviceScaleFactor: 1 };

if (!chrome) {
  console.error('Chrome não encontrado');
  process.exit(1);
}

function startServer(port) {
  return spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], {
    cwd: serveRoot,
    stdio: 'ignore'
  });
}

async function withRootHttp(fn) {
  const port = 18084 + Math.floor(Math.random() * 800);
  const server = startServer(port);
  try {
    await vp.waitForServer(port);
    return await fn(port);
  } finally {
    server.kill('SIGTERM');
  }
}

async function screenshotJurosFull(page, outfile, afterCalc) {
  const url = 'http://127.0.0.1:' + page.__qvPort + '/juros-compostos/';
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 });
  if (afterCalc) {
    await page.click('button[type="submit"]');
    await page.waitForFunction(function () {
      var el = document.getElementById('kMontante');
      return el && el.textContent && el.textContent !== '–';
    }, { timeout: 12000 });
  }
  await page.screenshot({ path: outfile, fullPage: true });
  console.log('ok ' + path.basename(outfile));
}

async function screenshotMenu(page, outfile, strictDrawer) {
  await page.goto('http://127.0.0.1:' + page.__qvPort + '/juros-compostos/', {
    waitUntil: 'networkidle0',
    timeout: 45000
  });
  await page.click('.nav-toggle');
  await drawer.waitForDrawerSettled(page);
  if (strictDrawer) {
    await drawer.assertDrawerInViewport(page, 'menu captura');
  } else {
    await drawer.delay(100);
  }
  await page.screenshot({ path: outfile });
  console.log('ok ' + path.basename(outfile));
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const strict = !process.env.ROOT;
  const puppeteer = vp.ensurePuppeteer();
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  try {
    await withRootHttp(async function (port) {
      const page = await browser.newPage();
      page.__qvPort = port;
      await vp.preparePage(page);
      await page.setViewport(VIEWPORT);

      if (mode === 'antes' || mode === 'all') {
        await screenshotMenu(page, path.join(outDir, 'antes-menu-360.png'), false);
        await screenshotJurosFull(page, path.join(outDir, 'antes-juros-360.png'), false);
      }
      if (mode === 'depois' || mode === 'all') {
        if (!process.env.ROOT) {
          await screenshotMenu(page, path.join(outDir, 'depois-menu-360.png'), true);
          await screenshotJurosFull(page, path.join(outDir, 'depois-juros-360.png'), true);
        }
      }
    });
  } finally {
    await browser.close();
  }
}

main().catch(function (e) {
  console.error(e.message || e);
  process.exit(1);
});