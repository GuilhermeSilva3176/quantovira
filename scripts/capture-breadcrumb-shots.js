#!/usr/bin/env node
/* Capturas mobile (390px) da trilha — HTTP na raiz; valida CSS e overflow. */
const fs = require('fs');
const path = require('path');
const vp = require('./breadcrumb-viewport.js');

const root = vp.root;
const outDir = process.argv[2] || path.join(root, 'artifacts', 'breadcrumbs');
const chrome = vp.resolveChrome();

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

async function captureAll(port) {
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
    await page.setViewport(vp.VIEWPORT);
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
        const banner = document.getElementById('cookie-consent');
        const bannerHidden = !banner || banner.hidden;
        return {
          rules: rules,
          hdrBg: header ? getComputedStyle(header).backgroundColor : '',
          logoOk: !!(logo && (logo.naturalWidth || logo.width) > 0),
          breadcrumb: !!breadcrumb,
          bannerHidden: bannerHidden
        };
      });
      if (check.rules < 20) throw new Error(shot.path + ': CSS não aplicou (rules=' + check.rules + ')');
      if (!check.hdrBg || check.hdrBg === 'rgba(0, 0, 0, 0)') {
        throw new Error(shot.path + ': header sem fundo');
      }
      if (!check.logoOk) throw new Error(shot.path + ': logo não carregou');
      if (!check.breadcrumb) throw new Error(shot.path + ': trilha ausente');
      if (!check.bannerHidden) throw new Error(shot.path + ': banner de cookies visível');
      const metrics = await vp.measureOverflow(page);
      vp.assertNoOverflow(metrics, shot.path);
      const out = path.join(outDir, shot.out);
      await page.screenshot({ path: out, fullPage: false });
      if (fs.statSync(out).size < 15000) throw new Error(out + ': PNG pequeno demais');
      console.log(
        'ok ' + out + ' rules=' + check.rules
        + ' doc=' + metrics.docScroll + ' main=' + metrics.mainScroll
      );
    }
  } finally {
    await browser.close();
  }
  const buildArtigos = require('./build-artigos.js');
  const paths = vp.breadcrumbPaths(buildArtigos.lerArtigos(root).publicados);
  await vp.checkPathsNoOverflow(paths, port, chrome);
  console.log('ok overflow em ' + paths.length + ' páginas');
}

vp.withHttpServer(captureAll).catch(function (e) {
  console.error(e.message || e);
  process.exit(1);
});