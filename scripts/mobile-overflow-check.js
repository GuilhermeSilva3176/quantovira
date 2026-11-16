#!/usr/bin/env node
/* Todas as URLs do sitemap em 360px e 412px — documentElement.scrollWidth <= innerWidth. */
const { pathsFromSitemap } = require('./sitemap-paths.js');
const vp = require('./breadcrumb-viewport.js');
const drawer = require('./drawer-test-lib.js');

const WIDTHS = [360, 412];
const chrome = vp.resolveChrome();

if (!chrome) {
  console.error('Chrome não encontrado');
  process.exit(1);
}

const paths = pathsFromSitemap();

async function checkDrawerAtWidth(page, port, w) {
  await page.setViewport({ width: w, height: 844, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:' + port + '/juros-compostos/', {
    waitUntil: 'networkidle0',
    timeout: 45000
  });
  await page.click('.nav-toggle');
  await drawer.waitForDrawerSettled(page);
  await drawer.assertDrawerInViewport(page, 'menu @' + w + 'px');
}

async function checkViewport(page, port, w, h, pathList) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  for (let i = 0; i < pathList.length; i++) {
    const p = pathList[i];
    await page.goto('http://127.0.0.1:' + port + p, {
      waitUntil: 'networkidle0',
      timeout: 45000
    });
    let metrics = await page.evaluate(function () {
      return {
        innerWidth: window.innerWidth,
        docScroll: document.documentElement.scrollWidth
      };
    });
    if (metrics.docScroll > metrics.innerWidth + 1) {
      throw new Error(
        p + ' @' + w + 'px: scrollWidth ' + metrics.docScroll + ' > innerWidth ' + metrics.innerWidth
      );
    }
    if (p === '/juros-compostos/') {
      await page.click('button[type="submit"]');
      await page.waitForFunction(function () {
        const el = document.getElementById('kMontante');
        return el && el.textContent && el.textContent !== '–';
      }, { timeout: 12000 });
      metrics = await page.evaluate(function () {
        return {
          innerWidth: window.innerWidth,
          docScroll: document.documentElement.scrollWidth
        };
      });
      if (metrics.docScroll > metrics.innerWidth + 1) {
        throw new Error(
          p + ' (após Calcular) @' + w + 'px: scrollWidth ' + metrics.docScroll
            + ' > innerWidth ' + metrics.innerWidth
        );
      }
    }
  }
  await checkDrawerAtWidth(page, port, w);
}

vp.withHttpServer(async function (port) {
  const puppeteer = vp.ensurePuppeteer();
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  try {
    const page = await browser.newPage();
    await vp.preparePage(page);
    for (let wi = 0; wi < WIDTHS.length; wi++) {
      await checkViewport(page, port, WIDTHS[wi], 844, paths);
    }
  } finally {
    await browser.close();
  }
  console.log(
    paths.length + ' página(s) × ' + WIDTHS.length + ' larguras — sem overflow horizontal'
  );
}).catch(function (e) {
  console.error(e.message || e);
  process.exit(1);
});