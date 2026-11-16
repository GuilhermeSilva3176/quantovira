#!/usr/bin/env node
/* Injeta trilha de navegação e JSON-LD (BreadcrumbList / CollectionPage). */
const fs = require('fs');
const path = require('path');
const lib = require('./breadcrumbs-lib.js');
const buildArtigos = require('./build-artigos.js');

const root = path.resolve(__dirname, '..');

lib.SLUGS.forEach(function (slug) {
  const file = path.join(root, slug, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  html = lib.patchCalcPage(html, slug);
  fs.writeFileSync(file, html);
  console.log('ok', slug + '/index.html');
});

const ferramentasFile = path.join(root, 'ferramentas', 'index.html');
fs.writeFileSync(
  ferramentasFile,
  lib.patchFerramentasHub(fs.readFileSync(ferramentasFile, 'utf8'))
);
console.log('ok', 'ferramentas/index.html');

const { publicados } = buildArtigos.lerArtigos(root);

const artigosIndex = path.join(root, 'artigos', 'index.html');
fs.writeFileSync(
  artigosIndex,
  lib.patchArtigosHub(fs.readFileSync(artigosIndex, 'utf8'), publicados)
);
console.log('ok', 'artigos/index.html');

publicados.forEach(function (a) {
  const file = path.join(root, 'artigos', a.slug, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  html = lib.patchArtigoPage(html, a.title, a.slug);
  fs.writeFileSync(file, html);
  console.log('ok', 'artigos/' + a.slug + '/index.html');
});

console.log(publicados.length + ' artigo(s) com trilha');