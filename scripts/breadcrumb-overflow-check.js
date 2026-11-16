#!/usr/bin/env node
/* Exit 0 se 390px não tiver overflow em todas as páginas com trilha. */
const buildArtigos = require('./build-artigos.js');
const vp = require('./breadcrumb-viewport.js');

const chrome = vp.resolveChrome();
if (!chrome) {
  console.error('Chrome não encontrado');
  process.exit(1);
}

const { publicados } = buildArtigos.lerArtigos(vp.root);
const paths = vp.breadcrumbPaths(publicados);

vp.withHttpServer(function (port) {
  return vp.checkPathsNoOverflow(paths, port, chrome);
}).then(function () {
  console.log(paths.length + ' página(s) sem overflow em ' + vp.VIEWPORT.width + 'px');
}).catch(function (e) {
  console.error(e.message || e);
  process.exit(1);
});