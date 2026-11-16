#!/usr/bin/env node
/* Capturas 360px: juros-compostos (com cálculo) e menu — HTTP na raiz. */
const fs = require('fs');
const path = require('path');
const vp = require('./breadcrumb-viewport.js');

const outDir = process.argv[2] || '/opt/cursor/artifacts';
const mode = process.argv[3] || 'all';
const chrome = vp.resolveChrome();
const VIEWPORT = { width: 360, height: 800, deviceScaleFactor: 1 };

if (!chrome) {
  console.error('Chrome não encontrado');
  process.exit(1);
}

async function run(port) {
  const puppeteer = vp.ensurePuppeteer();
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  try {
    const page = await browser.newPage();
    await vp.preparePage(page);
    await page.setViewport(VIEWPORT);
    const base = 'http://127.0.0.1:' + port + '/juros-compostos/';

    await page.goto(base, { waitUntil: 'networkidle0', timeout: 45000 });

    await page.click('button[type="submit"]');
    await page.waitForFunction(
      () => {
        const el = document.getElementById('kMontante');
        return el && el.textContent && el.textContent !== '–';
      },
      { timeout: 10000 }
    );
    await page.screenshot({ path: path.join(outDir, 'depois-juros-360.png') });
    console.log('ok depois-juros-360.png');

    await page.goto(base, { waitUntil: 'networkidle0' });
    await page.click('.nav-toggle');
    await page.waitForSelector('#site-nav.is-open');
    await page.screenshot({ path: path.join(outDir, 'depois-menu-360.png') });
    console.log('ok depois-menu-360.png');
  } finally {
    await browser.close();
  }
}

async function beforeMenu(port) {
  const puppeteer = vp.ensurePuppeteer();
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  try {
    const page = await browser.newPage();
    await vp.preparePage(page);
    await page.setViewport(VIEWPORT);
    await page.goto('http://127.0.0.1:' + port + '/juros-compostos/', {
      waitUntil: 'networkidle0',
      timeout: 45000
    });
    await page.click('.nav-toggle');
    await page.waitForSelector('.site-nav.is-open, body.nav-open', { timeout: 5000 }).catch(() => {});
    await page.screenshot({ path: path.join(outDir, 'antes-menu-360.png') });
    console.log('ok antes-menu-360.png');
  } finally {
    await browser.close();
  }
}

vp.withHttpServer(async function (port) {
  if (mode === 'antes' || mode === 'all') {
    await beforeMenu(port);
    const puppeteer = vp.ensurePuppeteer();
    const browser = await puppeteer.launch({
      executablePath: chrome,
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    try {
      const page = await browser.newPage();
      await vp.preparePage(page);
      await page.setViewport(VIEWPORT);
      await page.goto('http://127.0.0.1:' + port + '/juros-compostos/', {
        waitUntil: 'networkidle0',
        timeout: 45000
      });
      await page.screenshot({ path: path.join(outDir, 'antes-juros-360.png') });
      console.log('ok antes-juros-360.png');
    } finally {
      await browser.close();
    }
  }
  if (mode === 'depois' || mode === 'all') {
    await run(port);
  }
}).catch(function (e) {
  console.error(e.message || e);
  process.exit(1);
});