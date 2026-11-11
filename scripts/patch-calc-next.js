#!/usr/bin/env node
/* Injeta o bloco "calcule também" nas páginas das calculadoras (idempotente). */
const fs = require('fs');
const path = require('path');
const lib = require('./calc-next-lib.js');

const root = path.resolve(__dirname, '..');

lib.SLUGS.forEach(function (slug) {
  const file = path.join(root, slug, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  html = lib.injectBlock(html, slug);
  fs.writeFileSync(file, html);
  console.log('ok', slug + '/index.html');
});
