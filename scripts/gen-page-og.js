#!/usr/bin/env node
/* Gera assets/og-pages/*.png (1200×630) para cada URL do sitemap — Chrome headless. */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const og = require('./og-lib.js');

const root = path.resolve(__dirname, '..');
const chrome = process.env.CHROME || '/usr/local/bin/google-chrome';
const tmpDir = path.join(__dirname, '.og-tmp');

function shot(htmlPath, out, w, h, profile) {
  fs.mkdirSync(path.dirname(profile), { recursive: true });
  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--hide-scrollbars',
    '--user-data-dir=' + profile,
    '--window-size=' + w + ',' + h,
    '--screenshot=' + out,
    'file://' + htmlPath
  ];
  return new Promise(function (resolve, reject) {
    const child = spawn(chrome, args, { stdio: 'ignore' });
    let settled = false;
    const finish = function (err) {
      if (settled) return;
      settled = true;
      clearInterval(poll);
      clearTimeout(hard);
      try { child.kill('SIGKILL'); } catch (e) { /* ok */ }
      if (err) reject(err);
      else resolve();
    };
    const poll = setInterval(function () {
      if (fs.existsSync(out) && fs.statSync(out).size > 8000) finish();
    }, 120);
    const hard = setTimeout(function () {
      const ok = fs.existsSync(out) && fs.statSync(out).size > 8000;
      finish(ok ? null : new Error('screenshot timeout: ' + out));
    }, 25000);
    child.on('error', function (e) { finish(e); });
    child.on('exit', function () {
      if (fs.existsSync(out) && fs.statSync(out).size > 8000) finish();
    });
  });
}

async function main() {
  if (!fs.existsSync(chrome)) {
    console.error('Chrome não encontrado em ' + chrome + ' (defina CHROME)');
    process.exit(1);
  }
  const pages = og.discoverPages(root);
  fs.mkdirSync(tmpDir, { recursive: true });
  fs.mkdirSync(path.join(root, og.OG_PAGES_DIR), { recursive: true });

  const manifest = {};
  for (const page of pages) {
    const out = path.join(root, page.rel);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const htmlPath = path.join(tmpDir, page.rel.replace(/\//g, '_') + '.html');
    fs.writeFileSync(htmlPath, og.renderOgHtml(page));
    if (fs.existsSync(out)) fs.unlinkSync(out);
    await shot(htmlPath, out, 1200, 630, path.join(tmpDir, 'chrome-' + page.rel.replace(/\//g, '_')));
    manifest[page.canonical] = { rel: page.rel, ogUrl: page.ogUrl };
    console.log('og', page.rel);
  }

  fs.writeFileSync(path.join(root, og.OG_PAGES_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

  const keep = new Set(pages.map(function (p) { return path.join(root, p.rel); }));
  function prune(dir) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(function (name) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) prune(full);
      else if (name.endsWith('.png') && !keep.has(full)) {
        fs.unlinkSync(full);
        console.log('remove', path.relative(root, full));
      }
    });
  }
  prune(path.join(root, og.OG_PAGES_DIR));

  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) { /* ok */ }
  console.log(pages.length + ' imagem(ns) OG em ' + og.OG_PAGES_DIR + '/');
}

if (require.main === module) {
  main().catch(function (e) {
    console.error(e.message || e);
    process.exit(1);
  });
}

module.exports = { main: main };
