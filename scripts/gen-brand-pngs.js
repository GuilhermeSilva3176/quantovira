#!/usr/bin/env node
/* Gera og.png, favicon.png e apple-touch-icon.png (Chrome headless). */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const assets = path.join(root, 'assets');
const chrome = process.env.CHROME || '/usr/local/bin/google-chrome';
const ogHtml = path.join(__dirname, 'brand-og.html');

function shot(url, out, w, h) {
  execFileSync(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--window-size=' + w + ',' + h,
    '--screenshot=' + out,
    url
  ], { stdio: 'inherit' });
}

if (!fs.existsSync(chrome)) {
  console.error('Chrome não encontrado em ' + chrome);
  process.exit(1);
}

shot('file://' + ogHtml, path.join(assets, 'og.png'), 1200, 630);

const favHtml = path.join(assets, 'favicon-shot.html');
fs.writeFileSync(favHtml, `<!DOCTYPE html><html><head><style>body{margin:0;background:#14213d;display:flex;align-items:center;justify-content:center;width:180px;height:180px}img{width:120px;height:120px}</style></head><body><img src="logo.svg" alt=""></body></html>`);
shot('file://' + favHtml, path.join(assets, 'apple-touch-icon.png'), 180, 180);
shot('file://' + favHtml, path.join(assets, 'favicon.png'), 32, 32);
fs.unlinkSync(favHtml);
console.log('PNG de marca gerados em assets/');
