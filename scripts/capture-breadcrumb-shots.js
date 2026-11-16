#!/usr/bin/env node
/* Capturas mobile (390px) da trilha no topo — uso local/CI com Chrome. */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { resolveChrome } = require('./resolve-chrome.js');

const root = path.resolve(__dirname, '..');
const outDir = process.argv[2] || path.join(root, 'artifacts', 'breadcrumbs');
const chrome = resolveChrome();

if (!chrome) {
  console.error('Chrome não encontrado — defina CHROME ou instale chromium.');
  process.exit(1);
}

const shots = [
  {
    file: path.join(root, 'juros-compostos', 'index.html'),
    out: path.join(outDir, 'breadcrumb-juros-compostos-390.png')
  },
  {
    file: path.join(root, 'artigos', 'lci-lca-cri-cra-isentos-cdb-taxa-equivalente', 'index.html'),
    out: path.join(outDir, 'breadcrumb-artigo-titulo-longo-390.png')
  }
];

fs.mkdirSync(outDir, { recursive: true });

function screenshot(localFile, outFile) {
  const profile = path.join(__dirname, '.breadcrumb-shot-profile-' + path.basename(outFile, '.png'));
  fs.mkdirSync(profile, { recursive: true });
  const url = 'file://' + localFile;
  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--hide-scrollbars',
    '--user-data-dir=' + profile,
    '--window-size=390,844',
    '--screenshot=' + outFile,
    url
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
      if (fs.existsSync(outFile) && fs.statSync(outFile).size > 1000) finish();
    }, 120);
    const hard = setTimeout(function () {
      const ok = fs.existsSync(outFile) && fs.statSync(outFile).size > 1000;
      finish(ok ? null : new Error('screenshot timeout: ' + outFile));
    }, 25000);
    child.on('error', function (e) { finish(e); });
    child.on('exit', function () {
      if (fs.existsSync(outFile) && fs.statSync(outFile).size > 1000) finish();
    });
  });
}

(async function () {
  for (let i = 0; i < shots.length; i++) {
    const s = shots[i];
    if (!fs.existsSync(s.file)) throw new Error('página ausente: ' + s.file);
    await screenshot(s.file, s.out);
    console.log('ok', s.out);
  }
})().catch(function (e) {
  console.error(e.message || e);
  process.exit(1);
});