/* Metadados e caminhos das imagens Open Graph por página (sem dependências). */
const fs = require('fs');
const path = require('path');

const S = require('./site-shell.js');
const SITE = S.SITE;
const OG_FALLBACK = S.OG_IMAGE;
const OG_PAGES_DIR = 'assets/og-pages';

const TOOL_SLUGS = new Set([
  'simulador-fire', 'pj-vs-clt', 'ir-investimentos', 'juros-compostos', 'renda-fixa',
  'poupanca', 'preco-teto', 'preco-medio', 'dividend-yield', 'rentabilidade-real',
  'taxa-equivalente'
]);

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function canonicalToOgRel(canonical) {
  const u = new URL(canonical);
  let p = u.pathname.replace(/^\/|\/$/g, '');
  if (!p) return OG_PAGES_DIR + '/home.png';
  return OG_PAGES_DIR + '/' + p + '.png';
}

function canonicalToOgUrl(canonical) {
  return SITE + '/' + canonicalToOgRel(canonical);
}

function parseSitemapUrls(xml) {
  const urls = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) urls.push(m[1].trim());
  return urls;
}

function locToIndexFile(root, loc) {
  const u = new URL(loc);
  if (u.origin !== new URL(SITE).origin) return null;
  let p = u.pathname.replace(/^\/|\/$/g, '');
  if (!p) return path.join(root, 'index.html');
  return path.join(root, p, 'index.html');
}

function metaContent(html, name, prop) {
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let re;
  if (prop) re = new RegExp('<meta\\s+property="' + esc + '"\\s+content="([^"]*)"', 'i');
  else re = new RegExp('<meta\\s+name="' + esc + '"\\s+content="([^"]*)"', 'i');
  const m = html.match(re);
  return m ? m[1] : '';
}

function h1Text(html) {
  const m = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  return m ? m[1].trim() : '';
}

function stripSiteSuffix(title) {
  return String(title).replace(/\s*\|\s*Quanto Vira\s*$/i, '').trim();
}

function pageKind(canonical) {
  const u = new URL(canonical);
  const p = u.pathname.replace(/^\/|\/$/g, '');
  if (!p) return { kicker: 'Quanto Vira', kind: 'home' };
  if (p === 'ferramentas') return { kicker: 'Hub de calculadoras', kind: 'hub' };
  if (p === 'artigos') return { kicker: 'Artigos', kind: 'list' };
  if (p.startsWith('artigos/')) return { kicker: 'Artigo', kind: 'article' };
  if (TOOL_SLUGS.has(p.split('/')[0])) return { kicker: 'Calculadora gratuita', kind: 'tool' };
  return { kicker: 'Quanto Vira', kind: 'page' };
}

function wrapLines(text, maxChars) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  words.forEach(function (w) {
    const next = line ? line + ' ' + w : w;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = w;
    } else line = next;
  });
  if (line) lines.push(line);
  return lines;
}

function titleForCard(title, h1, kind) {
  const base = h1 || stripSiteSuffix(title);
  if (kind === 'tool' && /^Calculadora de /i.test(base)) {
    return base.replace(/^Calculadora de /i, '').replace(/^Calculadora /i, '');
  }
  if (kind === 'tool' && /^Comparador /i.test(base)) return base.replace(/^Comparador /i, '');
  if (kind === 'tool' && /^Simulador /i.test(base)) return base;
  return base;
}

function highlightPhrase(description) {
  const d = String(description).trim();
  if (!d) return { plain: 'Conteúdo gratuito no Quanto Vira.', strong: 'gratuito' };
  const first = d.split(/(?<=[.!?])\s+/)[0] || d;
  const short = first.length > 95 ? first.slice(0, 92).trim() + '…' : first;
  const com = short.match(/\bcom\s+(.+?)(?:[.,]|$)/i);
  if (com && com[1].length >= 4 && com[1].length <= 42) {
    const idx = short.toLowerCase().indexOf(com[1].toLowerCase());
    const before = short.slice(0, idx);
    const mid = short.slice(idx, idx + com[1].length);
    const after = short.slice(idx + com[1].length);
    return { before: before, strong: mid, after: after };
  }
  const words = short.split(/\s+/);
  if (words.length >= 3) {
    const strong = words.slice(-3).join(' ');
    const before = words.slice(0, -3).join(' ');
    return { before: before ? before + ' ' : '', strong: strong, after: '' };
  }
  return { before: short, strong: '', after: '' };
}

function ogAltText(headline, kicker) {
  const h = headline.length > 80 ? headline.slice(0, 77) + '…' : headline;
  return h + ' — ' + kicker + ' · Quanto Vira';
}

function discoverPages(root) {
  const sitemapPath = path.join(root, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) throw new Error('sitemap.xml ausente — rode build:artigos antes');
  const locs = parseSitemapUrls(fs.readFileSync(sitemapPath, 'utf8'));
  const pages = [];
  locs.forEach(function (loc) {
    const canonical = loc.endsWith('/') ? loc : loc + '/';
    const file = locToIndexFile(root, canonical);
    if (!file || !fs.existsSync(file)) throw new Error('página do sitemap sem HTML: ' + canonical);
    const html = fs.readFileSync(file, 'utf8');
    const ogTitle = metaContent(html, 'og:title', true);
    const tFromTitle = html.match(/<title>([^<]+)<\/title>/i);
    const fullTitle = ogTitle || (tFromTitle ? tFromTitle[1] : '') || canonical;
    const description = metaContent(html, 'og:description', true) || metaContent(html, 'description', false);
    const { kicker, kind } = pageKind(canonical);
    const h1 = h1Text(html);
    const headline = titleForCard(fullTitle, h1, kind);
    const rel = canonicalToOgRel(canonical);
    const ogUrl = SITE + '/' + rel;
    const hi = highlightPhrase(description);
    let summaryBefore = hi.before || '';
    let summaryStrong = hi.strong || '';
    let summaryAfter = hi.after || '';
    if (!summaryStrong && hi.plain) {
      summaryBefore = hi.plain;
    }
    pages.push({
      canonical: canonical,
      file: file,
      rel: rel,
      ogUrl: ogUrl,
      kicker: kicker,
      kind: kind,
      headline: headline,
      titleLines: wrapLines(headline, 32).slice(0, 3),
      summaryBefore: summaryBefore,
      summaryStrong: summaryStrong,
      summaryAfter: summaryAfter,
      ogAlt: ogAltText(headline, kicker),
      description: description
    });
  });
  return pages;
}

function renderOgHtml(page) {
  const lines = page.titleLines.map(function (l) {
    return '<div class="tl">' + escapeHtml(l) + '</div>';
  }).join('');
  let ex;
  if (page.summaryStrong) {
    ex = escapeHtml(page.summaryBefore) + '<strong>' + escapeHtml(page.summaryStrong) + '</strong>' + escapeHtml(page.summaryAfter);
  } else {
    ex = escapeHtml(page.summaryBefore || page.description.slice(0, 90));
  }
  const fontSize = page.titleLines.length >= 3 ? 46 : page.titleLines.some(function (l) { return l.length > 28; }) ? 50 : 56;
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    font-family: system-ui, -apple-system, 'Segoe UI', 'Noto Sans', 'Liberation Sans', sans-serif;
    background: linear-gradient(135deg, #14213d 0%, #1a2d52 55%, #0f9d76 100%);
    color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 56px 72px 48px;
  }
  .k { font-size: 22px; letter-spacing: 0.08em; text-transform: uppercase; color: #5ee0b5; font-weight: 700; }
  .title { margin-top: 12px; font-size: ${fontSize}px; font-weight: 800; line-height: 1.12; letter-spacing: -0.02em; max-height: 3.5em; }
  .ex {
    margin-top: 28px;
    background: rgba(255,255,255,0.12);
    border-radius: 14px;
    padding: 22px 28px;
    font-size: 28px;
    line-height: 1.35;
    color: #e8ecf4;
    max-width: 100%;
  }
  .ex strong { color: #5ee0b5; font-weight: 800; font-size: 1.05em; }
  .ft { font-size: 24px; opacity: 0.9; display: flex; justify-content: space-between; font-weight: 700; margin-top: 8px; }
  .ft span:last-child { color: #5ee0b5; font-weight: 700; }
</style>
</head>
<body>
  <div class="top">
    <div class="k">${escapeHtml(page.kicker)}</div>
    <div class="title">${lines}</div>
  </div>
  <div class="ex">${ex}</div>
  <div class="ft"><span>QuantoVira</span><span>quantovira.com.br</span></div>
</body>
</html>`;
}

module.exports = {
  SITE: SITE,
  OG_FALLBACK: OG_FALLBACK,
  OG_PAGES_DIR: OG_PAGES_DIR,
  canonicalToOgRel: canonicalToOgRel,
  canonicalToOgUrl: canonicalToOgUrl,
  parseSitemapUrls: parseSitemapUrls,
  discoverPages: discoverPages,
  renderOgHtml: renderOgHtml,
  pageKind: pageKind,
  wrapLines: wrapLines,
  highlightPhrase: highlightPhrase,
  ogAltText: ogAltText
};
