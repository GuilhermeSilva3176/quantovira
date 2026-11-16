/* Trilha de navegação (HTML + JSON-LD) e CollectionPage dos hubs. */
const path = require('path');
const calcData = require(path.join(__dirname, '..', 'data', 'calc-relacoes.json'));
const S = require('./site-shell.js');

const SLUGS = Object.keys(calcData.calculadoras);

const MARK_START = '<!-- qv:breadcrumb-start -->';
const MARK_END = '<!-- qv:breadcrumb-end -->';
const MARK_LD_START = '<!-- qv:breadcrumb-ld-start -->';
const MARK_LD_END = '<!-- qv:breadcrumb-ld-end -->';
const MARK_COL_START = '<!-- qv:collection-ld-start -->';
const MARK_COL_END = '<!-- qv:collection-ld-end -->';

const NAV_BLOCK_RE = new RegExp(
  '<!-- qv:breadcrumb-start -->[\\s\\S]*?<!-- qv:breadcrumb-end -->\\n?',
  'g'
);
const BREADCRUMB_LD_RE = new RegExp(
  '<!-- qv:breadcrumb-ld-start -->[\\s\\S]*?<!-- qv:breadcrumb-ld-end -->\\n?',
  'g'
);
const COLLECTION_LD_RE = new RegExp(
  '<!-- qv:collection-ld-start -->[\\s\\S]*?<!-- qv:collection-ld-end -->\\n?',
  'g'
);

const HOME = { name: 'Início', path: '/' };
const HUB_FERRAMENTAS = { name: 'Ferramentas', path: '/ferramentas/' };
const HUB_ARTIGOS = { name: 'Artigos', path: '/artigos/' };

function absUrl(pathname) {
  if (pathname === '/') return S.SITE + '/';
  return S.SITE + (pathname.startsWith('/') ? pathname : '/' + pathname);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** @typedef {{ name: string, path: string }} Crumb */

function trailCalc(slug) {
  const c = calcData.calculadoras[slug];
  if (!c) throw new Error('calculadora desconhecida: ' + slug);
  return [HOME, HUB_FERRAMENTAS, { name: c.nome, path: '/' + slug + '/' }];
}

function trailArtigo(title, slug) {
  return [HOME, HUB_ARTIGOS, { name: title, path: '/artigos/' + slug + '/' }];
}

function trailHubFerramentas() {
  return [HOME, { name: HUB_FERRAMENTAS.name, path: HUB_FERRAMENTAS.path }];
}

function trailHubArtigos() {
  return [HOME, { name: HUB_ARTIGOS.name, path: HUB_ARTIGOS.path }];
}

function breadcrumbListJsonLd(trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(function (crumb, i) {
      return {
        '@type': 'ListItem',
        position: i + 1,
        name: crumb.name,
        item: absUrl(crumb.path)
      };
    })
  };
}

function navHtml(trail) {
  const items = trail.map(function (crumb, i) {
    const last = i === trail.length - 1;
    if (last) {
      return (
        '<li class="breadcrumb-item" aria-current="page">'
        + '<span class="breadcrumb-current">' + escapeHtml(crumb.name) + '</span></li>'
      );
    }
    return (
      '<li class="breadcrumb-item"><a href="' + escapeHtml(crumb.path) + '">'
      + escapeHtml(crumb.name) + '</a></li>'
    );
  }).join('\n    ');
  return (
    MARK_START + '\n'
    + '<nav class="breadcrumb" aria-label="Trilha de navegação">\n'
    + '  <ol class="breadcrumb-list">\n    ' + items + '\n  </ol>\n'
    + '</nav>\n'
    + MARK_END
  );
}

function ldScriptBlock(obj) {
  const json = JSON.stringify(obj).replace(/</g, '\\u003c');
  return (
    MARK_LD_START + '\n'
    + '<script type="application/ld+json">' + json + '</script>\n'
    + MARK_LD_END
  );
}

function collectionScriptBlock(obj) {
  const json = JSON.stringify(obj).replace(/</g, '\\u003c');
  return (
    MARK_COL_START + '\n'
    + '<script type="application/ld+json">' + json + '</script>\n'
    + MARK_COL_END
  );
}

function ferramentasCollectionJsonLd() {
  const itemListElement = SLUGS.map(function (slug, i) {
    const c = calcData.calculadoras[slug];
    return {
      '@type': 'ListItem',
      position: i + 1,
      name: c.nome,
      url: absUrl('/' + slug + '/')
    };
  });
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Calculadoras e ferramentas',
    url: absUrl('/ferramentas/'),
    description: 'Hub de calculadoras financeiras educativas para o Brasil.',
    inLanguage: 'pt-BR',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: itemListElement.length,
      itemListElement: itemListElement
    }
  };
}

function artigosCollectionJsonLd(artigos) {
  const sorted = artigos.slice().sort(function (a, b) {
    return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
  });
  const itemListElement = sorted.map(function (a, i) {
    return {
      '@type': 'ListItem',
      position: i + 1,
      name: a.title,
      url: absUrl('/artigos/' + a.slug + '/')
    };
  });
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Artigos',
    url: absUrl('/artigos/'),
    description: 'Textos educativos do Quanto Vira sobre independência financeira, PJ x CLT e IR de investimentos.',
    inLanguage: 'pt-BR',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: itemListElement.length,
      itemListElement: itemListElement
    }
  };
}

function stripNav(html) {
  return html.replace(NAV_BLOCK_RE, '');
}

function stripBreadcrumbLd(html) {
  return html.replace(BREADCRUMB_LD_RE, '');
}

function stripCollectionLd(html) {
  return html.replace(COLLECTION_LD_RE, '');
}

function stripLegacyFerramentasWebApp(html) {
  return html.replace(/<script type="application\/ld\+json">(\{[\s\S]*?\})<\/script>\n?/g, function (tag, raw) {
    try {
      const o = JSON.parse(raw);
      if (o['@type'] === 'WebApplication' && o.url === absUrl('/ferramentas/')) return '';
    } catch (e) { /* mantém */ }
    return tag;
  });
}

function injectNav(html, trail) {
  html = stripNav(html);
  const block = navHtml(trail);
  const anchor = '<main class="wrap">\n';
  if (!html.includes(anchor)) throw new Error('sem <main class="wrap">');
  return html.replace(anchor, anchor + block + '\n');
}

function injectBreadcrumbLd(html, trail) {
  html = stripBreadcrumbLd(html);
  const block = ldScriptBlock(breadcrumbListJsonLd(trail));
  if (!html.includes('</head>')) throw new Error('sem </head>');
  return html.replace('</head>', block + '\n</head>');
}

function injectCollectionLd(html, obj, stripLegacyWebApp) {
  html = stripCollectionLd(html);
  if (stripLegacyWebApp) html = stripLegacyFerramentasWebApp(html);
  const block = collectionScriptBlock(obj);
  if (!html.includes('</head>')) throw new Error('sem </head>');
  return html.replace('</head>', block + '\n</head>');
}

function patchCalcPage(html, slug) {
  const trail = trailCalc(slug);
  html = injectNav(html, trail);
  return injectBreadcrumbLd(html, trail);
}

function patchArtigoPage(html, title, slug) {
  const trail = trailArtigo(title, slug);
  html = injectNav(html, trail);
  return injectBreadcrumbLd(html, trail);
}

function patchFerramentasHub(html) {
  const trail = trailHubFerramentas();
  html = injectNav(html, trail);
  html = injectBreadcrumbLd(html, trail);
  return injectCollectionLd(html, ferramentasCollectionJsonLd(), true);
}

function patchArtigosHub(html, artigos) {
  const trail = trailHubArtigos();
  html = injectNav(html, trail);
  html = injectBreadcrumbLd(html, trail);
  return injectCollectionLd(html, artigosCollectionJsonLd(artigos), false);
}

function extractVisibleTrail(html) {
  const start = html.indexOf(MARK_START);
  const end = html.indexOf(MARK_END);
  if (start < 0 || end < 0) return null;
  const block = html.slice(start, end + MARK_END.length);
  const names = [];
  const linkRe = /<a href="[^"]*">([^<]*)<\/a>/g;
  const currentRe = /<span class="breadcrumb-current">([^<]*)<\/span>/g;
  let m;
  while ((m = linkRe.exec(block)) !== null) names.push(m[1]);
  while ((m = currentRe.exec(block)) !== null) names.push(m[1]);
  return names;
}

function pagesWithBreadcrumbs() {
  const paths = SLUGS.map(function (s) {
    return '/' + s + '/';
  });
  paths.push('/ferramentas/', '/artigos/');
  return paths;
}

module.exports = {
  SITE: S.SITE,
  SLUGS: SLUGS,
  calcData: calcData,
  MARK_START: MARK_START,
  MARK_END: MARK_END,
  MARK_LD_START: MARK_LD_START,
  MARK_LD_END: MARK_LD_END,
  MARK_COL_START: MARK_COL_START,
  MARK_COL_END: MARK_COL_END,
  absUrl: absUrl,
  trailCalc: trailCalc,
  trailArtigo: trailArtigo,
  trailHubFerramentas: trailHubFerramentas,
  trailHubArtigos: trailHubArtigos,
  breadcrumbListJsonLd: breadcrumbListJsonLd,
  navHtml: navHtml,
  ferramentasCollectionJsonLd: ferramentasCollectionJsonLd,
  artigosCollectionJsonLd: artigosCollectionJsonLd,
  stripNav: stripNav,
  stripBreadcrumbLd: stripBreadcrumbLd,
  injectNav: injectNav,
  injectBreadcrumbLd: injectBreadcrumbLd,
  patchCalcPage: patchCalcPage,
  patchArtigoPage: patchArtigoPage,
  patchFerramentasHub: patchFerramentasHub,
  patchArtigosHub: patchArtigosHub,
  extractVisibleTrail: extractVisibleTrail,
  pagesWithBreadcrumbs: pagesWithBreadcrumbs
};