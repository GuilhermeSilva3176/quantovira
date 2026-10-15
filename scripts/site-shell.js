/* Fragmentos HTML compartilhados (sem dependências). */
const SITE = 'https://quantovira.com.br';
const OG_IMAGE = SITE + '/assets/og.png';
const OG_IMAGE_ALT = 'Quanto Vira — calculadoras financeiras gratuitas para o Brasil';

const NAV =
  '<a href="/ferramentas/">Ferramentas</a><a href="/simulador-fire/">Simulador FIRE</a><a href="/pj-vs-clt/">PJ x CLT</a><a href="/ir-investimentos/">IR</a><a href="/artigos/">Artigos</a><a href="/sobre/">Sobre</a>';

const HEADER =
  '<header class="top"><div class="wrap top-inner"><a class="brand" href="/" aria-label="Quanto Vira — início"><img class="brand-mark" src="/assets/logo.svg" alt="" width="32" height="32" decoding="async"><span class="brand-text">Quanto<span>Vira</span></span></a>'
  + '<button type="button" class="nav-toggle" aria-controls="site-nav" aria-expanded="false" aria-label="Abrir menu"><span class="nav-toggle-bar" aria-hidden="true"></span><span class="nav-toggle-bar" aria-hidden="true"></span><span class="nav-toggle-bar" aria-hidden="true"></span></button>'
  + '<nav id="site-nav" class="site-nav" aria-label="Principal">' + NAV + '</nav></div><div class="nav-backdrop" hidden></div></header>';

const FOOTER_TAGLINE = 'Sem cadastro · dados das calculadoras ficam no seu navegador';

const FOOTER =
  '<footer class="wrap foot">© Quanto Vira · <a href="/sobre/">Sobre</a> · <a href="/contato/">Contato</a> · <a href="/privacidade/">Privacidade</a> · <a href="/fontes/">Fontes</a> · ' + FOOTER_TAGLINE + '.</footer>';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function iconLinks() {
  return [
    '<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">',
    '<link rel="icon" href="/assets/favicon.png" type="image/png" sizes="32x32">',
    '<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" sizes="180x180">'
  ].join('\n');
}

function socialMeta(opts) {
  const title = escapeHtml(opts.title);
  const description = escapeHtml(opts.description);
  const ogDescription = escapeHtml(opts.ogDescription || opts.description);
  const url = escapeHtml(opts.canonical);
  const ogType = opts.ogType || 'website';
  let extra = opts.extraHead || '';
  if (!extra.includes('og:image')) {
    extra += '\n<meta property="og:image" content="' + OG_IMAGE + '">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta property="og:image:alt" content="' + escapeHtml(OG_IMAGE_ALT) + '">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="' + title + '">\n<meta name="twitter:description" content="' + ogDescription + '">\n<meta name="twitter:image" content="' + OG_IMAGE + '">';
  }
  return '<title>' + title + '</title>\n<meta name="description" content="' + description + '">\n<link rel="canonical" href="' + url + '">\n'
    + iconLinks() + '\n<meta property="og:title" content="' + title + '">\n<meta property="og:description" content="' + ogDescription + '">\n<meta property="og:url" content="' + url + '">\n<meta property="og:site_name" content="Quanto Vira">\n<meta property="og:locale" content="pt_BR">\n<meta property="og:type" content="' + ogType + '">' + extra;
}

function jsonLdScript(obj) {
  return '\n<script type="application/ld+json">' + JSON.stringify(obj).replace(/</g, '\\u003c') + '</script>';
}

function orgWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': SITE + '/#organization',
        name: 'Quanto Vira',
        url: SITE + '/',
        logo: SITE + '/assets/logo.svg',
        description: 'Calculadoras e simuladores financeiros gratuitos com dados reais do Brasil.'
      },
      {
        '@type': 'WebSite',
        '@id': SITE + '/#website',
        url: SITE + '/',
        name: 'Quanto Vira',
        description: 'Calculadoras financeiras gratuitas: renda fixa, ações, FIRE, PJ x CLT e IR de investimentos.',
        publisher: { '@id': SITE + '/#organization' },
        inLanguage: 'pt-BR'
      }
    ]
  };
}

function webAppJsonLd(opts) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: opts.name,
    url: opts.url,
    description: opts.description,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    browserRequirements: 'Requires JavaScript',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL'
    },
    isAccessibleForFree: true,
    inLanguage: 'pt-BR',
    publisher: { '@type': 'Organization', name: 'Quanto Vira', url: SITE + '/' }
  };
}

function headBlock(opts) {
  const json = opts.jsonLd ? jsonLdScript(opts.jsonLd) : (opts.jsonLdRaw || '');
  return '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="robots" content="index,follow">\n'
    + socialMeta(opts) + json + '\n<link rel="stylesheet" href="/assets/style.css">\n<script src="/assets/site-nav.js" defer></script>\n<script src="/assets/cookie-consent.js" defer></script>';
}

module.exports = {
  SITE: SITE,
  OG_IMAGE: OG_IMAGE,
  NAV: NAV,
  HEADER: HEADER,
  FOOTER: FOOTER,
  FOOTER_TAGLINE: FOOTER_TAGLINE,
  escapeHtml: escapeHtml,
  headBlock: headBlock,
  orgWebSiteJsonLd: orgWebSiteJsonLd,
  webAppJsonLd: webAppJsonLd,
  jsonLdScript: jsonLdScript
};
