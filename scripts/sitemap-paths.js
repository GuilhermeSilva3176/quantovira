/* Caminhos locais a partir do sitemap.xml (paths com barra final). */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function pathsFromSitemap(file) {
  const xml = fs.readFileSync(file || path.join(root, 'sitemap.xml'), 'utf8');
  const paths = [];
  const re = /<loc>https:\/\/quantovira\.com\.br([^<]*)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    let p = m[1];
    if (!p.endsWith('/')) p += '/';
    if (p === '//') p = '/';
    paths.push(p);
  }
  return paths;
}

module.exports = { root: root, pathsFromSitemap: pathsFromSitemap };