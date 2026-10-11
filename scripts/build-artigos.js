#!/usr/bin/env node
/* Gera as páginas de artigos a partir de content/artigos/*.md. Sem dependências. */
const fs = require('fs');
const path = require('path');

const S = require('./site-shell.js');
const SITE = S.SITE;
const AUTOR_PADRAO = 'Equipe Quanto Vira';
const ULTIMOS_ARTIGOS_HOME = 6;
const ARTIGOS_RELACIONADOS_CALC = 6;
const CALCULADORAS = {
  'simulador-fire': { href: '/simulador-fire/', nome: 'Simulador FIRE' },
  'pj-vs-clt': { href: '/pj-vs-clt/', nome: 'PJ x CLT' },
  'ir-investimentos': { href: '/ir-investimentos/', nome: 'IR de investimentos' }
};
const PAGINAS_FIXAS = [
  '/',
  '/simulador-fire/',
  '/pj-vs-clt/',
  '/ir-investimentos/',
  '/sobre/',
  '/contato/',
  '/privacidade/',
  '/fontes/',
  '/artigos/'
];
const RELACIONADOS = [
  { arquivo: 'index.html', calculadora: null },
  { arquivo: 'simulador-fire/index.html', calculadora: 'simulador-fire' },
  { arquivo: 'pj-vs-clt/index.html', calculadora: 'pj-vs-clt' },
  { arquivo: 'ir-investimentos/index.html', calculadora: 'ir-investimentos' }
];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const NAV = S.NAV;
const INICIO = '<!-- artigos:inicio -->';
const FIM = '<!-- artigos:fim -->';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function dataValida(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

function hojeSaoPaulo(agora) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(agora || new Date());
}

function dataComFuso(iso) {
  if (!dataValida(iso)) throw new Error('data inválida: ' + iso);
  return iso + 'T00:00:00-03:00';
}

function dataPt(iso) {
  const p = String(iso).slice(0, 10).split('-');
  return Number(p[2]) + ' de ' + MESES[Number(p[1]) - 1] + ' de ' + p[0];
}

function unquote(s) {
  s = String(s).trim();
  if (s.length >= 2 && s[0] === '"' && s[s.length - 1] === '"') {
    return s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
  if (s.length >= 2 && s[0] === "'" && s[s.length - 1] === "'") return s.slice(1, -1);
  return s;
}

function coerce(s) {
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (s === 'null' || s === '~') return null;
  return s;
}

function parseYaml(text) {
  const data = {};
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || /^\s*#/.test(line)) { i++; continue; }
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) throw new Error('linha de front matter inválida: ' + line);
    const key = m[1];
    const rest = m[2].trim();
    if (rest === '[]') { data[key] = []; i++; continue; }
    if (rest === '' || rest === '|' || rest === '>') {
      const items = [];
      i++;
      while (i < lines.length) {
        if (!lines[i].trim() || /^\s*#/.test(lines[i])) { i++; continue; }
        if (!lines[i].startsWith('  ')) break;
        if (!lines[i].startsWith('  - ')) throw new Error('lista inválida em ' + key);
        const item = {};
        const first = lines[i].slice(4);
        const kv = first.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
        if (!kv) throw new Error('item inválido em ' + key);
        item[kv[1]] = coerce(unquote(kv[2]));
        i++;
        while (i < lines.length && lines[i].startsWith('    ') && !lines[i].startsWith('    - ')) {
          if (!lines[i].trim() || /^\s*#/.test(lines[i])) { i++; continue; }
          const kv2 = lines[i].trim().match(/^([A-Za-z0-9_]+):\s*(.*)$/);
          if (!kv2) throw new Error('campo inválido em ' + key);
          item[kv2[1]] = coerce(unquote(kv2[2]));
          i++;
        }
        items.push(item);
      }
      data[key] = items;
      continue;
    }
    data[key] = coerce(unquote(rest));
    i++;
  }
  return data;
}

function parseFrontMatter(raw) {
  const text = String(raw).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (!text.startsWith('---\n')) throw new Error('o arquivo precisa começar com front matter (---)');
  const end = text.indexOf('\n---\n', 4);
  if (end < 0) throw new Error('front matter sem fechamento (---)');
  return { data: parseYaml(text.slice(4, end)), body: text.slice(end + 5) };
}

function urlSegura(url) {
  if (typeof url !== 'string') return false;
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  return /^https?:\/\//i.test(url);
}

function renderInline(src) {
  let out = '';
  let i = 0;
  while (i < src.length) {
    if (src.startsWith('**', i)) {
      const end = src.indexOf('**', i + 2);
      if (end > i + 2) {
        out += '<strong>' + renderInline(src.slice(i + 2, end)) + '</strong>';
        i = end + 2;
        continue;
      }
    }
    if (src[i] === '*' && src[i + 1] && src[i + 1] !== ' ' && src[i + 1] !== '*') {
      const end = src.indexOf('*', i + 1);
      if (end > i + 1 && src[end - 1] !== ' ') {
        out += '<em>' + renderInline(src.slice(i + 1, end)) + '</em>';
        i = end + 1;
        continue;
      }
    }
    if (src[i] === '[') {
      const close = src.indexOf(']', i + 1);
      if (close > i && src[close + 1] === '(') {
        const end = src.indexOf(')', close + 2);
        if (end > close) {
          const rotulo = src.slice(i + 1, close);
          const url = src.slice(close + 2, end).trim();
          if (urlSegura(url)) {
            out += '<a href="' + escapeHtml(url) + '">' + renderInline(rotulo) + '</a>';
            i = end + 1;
            continue;
          }
        }
      }
    }
    if (src[i] === '`') {
      const end = src.indexOf('`', i + 1);
      if (end > i) {
        out += '<code>' + escapeHtml(src.slice(i + 1, end)) + '</code>';
        i = end + 1;
        continue;
      }
    }
    out += escapeHtml(src[i]);
    i++;
  }
  return out;
}

function renderMarkdown(src) {
  const lines = String(src).replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith('```')) {
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) { buf.push(lines[i]); i++; }
      if (i < lines.length) i++;
      blocks.push('<pre><code>' + escapeHtml(buf.join('\n')) + '</code></pre>');
      continue;
    }
    const h = line.match(/^(#{1,3})\s+(.+)$/);
    if (h) {
      const level = h[1].length === 1 ? 2 : h[1].length;
      blocks.push('<h' + level + '>' + renderInline(h[2].trim()) + '</h' + level + '>');
      i++;
      continue;
    }
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push('<blockquote><p>' + renderInline(buf.join(' ')) + '</p></blockquote>');
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push('<li>' + renderInline(lines[i].replace(/^[-*]\s+/, '')) + '</li>');
        i++;
      }
      blocks.push('<ul>' + items.join('') + '</ul>');
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push('<li>' + renderInline(lines[i].replace(/^\d+\.\s+/, '')) + '</li>');
        i++;
      }
      blocks.push('<ol>' + items.join('') + '</ol>');
      continue;
    }
    const buf = [line.trim()];
    i++;
    while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s|```|>\s?|[-*]\s+|\d+\.\s+)/.test(lines[i])) {
      buf.push(lines[i].trim());
      i++;
    }
    blocks.push('<p>' + renderInline(buf.join(' ')) + '</p>');
  }
  return blocks.join('\n');
}

function validar(slug, data) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug === 'index') {
    throw new Error(slug + ': o nome do arquivo precisa ser um slug (letras minúsculas e hífen)');
  }
  if (!data.title || typeof data.title !== 'string') throw new Error(slug + ': falta o title');
  if (!data.description || typeof data.description !== 'string') throw new Error(slug + ': falta a description');
  if (!dataValida(data.date)) throw new Error(slug + ': date precisa ser AAAA-MM-DD');
  const updated = data.updated || data.date;
  if (!dataValida(updated)) throw new Error(slug + ': updated precisa ser AAAA-MM-DD');
  if (!CALCULADORAS[data.calculadora]) {
    throw new Error(slug + ': calculadora precisa ser simulador-fire, pj-vs-clt ou ir-investimentos');
  }
  if (!Array.isArray(data.fontes) || data.fontes.length === 0) throw new Error(slug + ': falta a lista fontes');
  data.fontes.forEach(function (f, idx) {
    if (!f || typeof f.nome !== 'string' || !f.nome.trim()) throw new Error(slug + ': fonte ' + (idx + 1) + ' sem nome');
    if (!urlSegura(f.url) || !/^https?:\/\//i.test(f.url)) throw new Error(slug + ': fonte ' + (idx + 1) + ' precisa de url http(s)');
  });
  return {
    slug: slug,
    title: data.title.trim(),
    description: data.description.trim(),
    date: data.date,
    updated: updated,
    author: (typeof data.author === 'string' && data.author.trim()) ? data.author.trim() : AUTOR_PADRAO,
    calculadora: data.calculadora,
    fontes: data.fontes.map(function (f) { return { nome: f.nome.trim(), url: f.url.trim() }; })
  };
}

function lerArtigos(root) {
  const dir = path.join(root, 'content', 'artigos');
  if (!fs.existsSync(dir)) throw new Error('pasta ausente: content/artigos');
  const arquivos = fs.readdirSync(dir).filter(function (n) { return n.endsWith('.md'); }).sort();
  const publicados = [];
  let rascunhos = 0;
  arquivos.forEach(function (nome) {
    const slug = nome.slice(0, -3);
    let parsed;
    try {
      parsed = parseFrontMatter(fs.readFileSync(path.join(dir, nome), 'utf8'));
    } catch (e) {
      throw new Error(nome + ': ' + e.message);
    }
    if (parsed.data.draft === true) { rascunhos++; return; }
    const meta = validar(slug, parsed.data);
    meta.html = renderMarkdown(parsed.body);
    publicados.push(meta);
  });
  publicados.sort(function (a, b) {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
  });
  return { publicados: publicados, rascunhos: rascunhos };
}

function layout(opts) {
  const head = S.headBlock({
    title: opts.title,
    description: opts.description,
    canonical: opts.canonical,
    ogType: opts.ogType,
    extraHead: opts.extraHead,
    jsonLdRaw: opts.jsonLd ? '\n<script type="application/ld+json">' + opts.jsonLd + '</script>' : '',
    jsonLd: opts.jsonLdObject || null
  });
  return '<!doctype html>\n<html lang="pt-BR">\n<head>\n' + head + '\n</head>\n<body>\n' + S.HEADER + '\n<main class="wrap">\n' + opts.main
    + '\n<!-- Para exibir o anúncio, acrescente a classe ads no body. -->\n<aside class="ad" aria-label="Publicidade">Espaço publicitário</aside>\n</main>\n' + S.FOOTER + '\n</body>\n</html>\n';
}

function jsonLd(artigo) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: artigo.title,
    description: artigo.description,
    datePublished: dataComFuso(artigo.date),
    dateModified: dataComFuso(artigo.updated),
    inLanguage: 'pt-BR',
    author: { '@type': 'Organization', name: artigo.author },
    publisher: { '@type': 'Organization', name: 'Quanto Vira', url: SITE + '/' },
    mainEntityOfPage: SITE + '/artigos/' + artigo.slug + '/'
  };
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function htmlArtigo(artigo, todosArtigos) {
  const calc = CALCULADORAS[artigo.calculadora];
  const fontes = artigo.fontes.map(function (f) {
    return '<li><a href="' + escapeHtml(f.url) + '">' + escapeHtml(f.nome) + '</a></li>';
  }).join('');
  const relacionados = (todosArtigos || []).filter(function (a) {
    return a.slug !== artigo.slug && a.calculadora === artigo.calculadora;
  }).slice(0, 4);
  const blocoRel = relacionados.length ? '\n' + blocoRelacionados(relacionados, 'Mais sobre ' + calc.nome) : '';
  const main = '<article class="card page prose">\n<h1>' + escapeHtml(artigo.title) + '</h1>\n<p class="byline">Por '
    + escapeHtml(artigo.author) + ' · Atualizado em ' + dataPt(artigo.updated) + '</p>\n<p class="lead">'
    + escapeHtml(artigo.description) + '</p>\n<aside class="callout"><p>Leve os seus números para a calculadora <a href="'
    + calc.href + '">' + escapeHtml(calc.nome) + '</a>.</p></aside>\n' + artigo.html
    + '\n<h2>Fontes</h2>\n<ul class="sources">' + fontes + '</ul>\n<p class="disclaimer"><strong>Aviso:</strong> texto educativo. Não é recomendação de investimento, nem consultoria financeira, jurídica ou tributária.</p>\n</article>'
    + blocoRel;
  return layout({
    title: artigo.title + ' | Quanto Vira',
    description: artigo.description,
    canonical: SITE + '/artigos/' + artigo.slug + '/',
    ogType: 'article',
    extraHead: '\n<meta property="article:published_time" content="' + dataComFuso(artigo.date) + '">\n<meta property="article:modified_time" content="' + dataComFuso(artigo.updated) + '">',
    jsonLd: jsonLd(artigo),
    main: main
  });
}

function htmlLista(artigos) {
  let corpo;
  if (!artigos.length) {
    corpo = '<p>Nenhum artigo publicado ainda.</p>';
  } else {
    const cards = artigos.map(function (a) {
      const calc = CALCULADORAS[a.calculadora];
      return '<a class="card tool" href="/artigos/' + a.slug + '/"><h2>' + escapeHtml(a.title) + '</h2><p>'
        + escapeHtml(a.description) + '</p><p class="hint">' + dataPt(a.date) + ' · ' + escapeHtml(calc.nome) + '</p></a>';
    }).join('\n');
    corpo = '<div class="tools">\n' + cards + '\n</div>';
  }
  const main = '<h1>Artigos</h1>\n<p class="lead">Textos educativos ligados às calculadoras. Cada um cita a fonte e aponta para a conta.</p>\n' + corpo;
  return layout({
    title: 'Artigos | Quanto Vira',
    description: 'Textos educativos do Quanto Vira sobre independência financeira, PJ x CLT e IR de investimentos.',
    canonical: SITE + '/artigos/',
    ogType: 'website',
    main: main
  });
}

function blocoRelacionados(lista, titulo) {
  if (!lista.length) return '';
  const h = titulo || 'Artigos relacionados';
  const cards = lista.map(function (a) {
    return '<a class="card tool" href="/artigos/' + a.slug + '/"><h2>' + escapeHtml(a.title) + '</h2><p>' + escapeHtml(a.description) + '</p></a>';
  }).join('\n');
  const mais = lista.length >= 4 ? '\n<p class="hint"><a href="/artigos/">Ver todos os artigos</a></p>' : '';
  return '<section class="artigos-rel" aria-label="' + escapeHtml(h) + '">\n<h2>' + escapeHtml(h) + '</h2>\n<div class="tools">\n' + cards + '\n</div>' + mais + '\n</section>';
}

function injetar(html, bloco) {
  const miolo = bloco ? '\n' + bloco + '\n' : '\n';
  const trecho = INICIO + miolo + FIM;
  const re = /<!-- artigos:inicio -->[\s\S]*?<!-- artigos:fim -->/;
  if (re.test(html)) return html.replace(re, trecho);
  if (!html.includes('</main>')) throw new Error('página sem </main>');
  return html.replace('</main>', trecho + '\n</main>');
}

function sitemap(artigos) {
  const linhas = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  PAGINAS_FIXAS.forEach(function (p) {
    linhas.push('  <url><loc>' + SITE + p + '</loc></url>');
  });
  artigos.slice().sort(function (a, b) { return a.slug < b.slug ? -1 : 1; }).forEach(function (a) {
    linhas.push('  <url><loc>' + SITE + '/artigos/' + a.slug + '/</loc><lastmod>' + dataComFuso(a.updated) + '</lastmod></url>');
  });
  linhas.push('</urlset>', '');
  return linhas.join('\n');
}

function escrever(arquivo, conteudo) {
  fs.mkdirSync(path.dirname(arquivo), { recursive: true });
  const atual = fs.existsSync(arquivo) ? fs.readFileSync(arquivo, 'utf8') : null;
  if (atual !== conteudo) fs.writeFileSync(arquivo, conteudo);
}

function build(root) {
  const lidos = lerArtigos(root);
  const artigos = lidos.publicados;
  const dir = path.join(root, 'artigos');
  fs.mkdirSync(dir, { recursive: true });
  const manter = {};
  artigos.forEach(function (a) { manter[a.slug] = true; });
  fs.readdirSync(dir).forEach(function (nome) {
    const full = path.join(dir, nome);
    if (nome === 'index.html') return;
    if (!fs.statSync(full).isDirectory()) return;
    if (!manter[nome]) fs.rmSync(full, { recursive: true, force: true });
  });
  artigos.forEach(function (a) {
    escrever(path.join(dir, a.slug, 'index.html'), htmlArtigo(a, artigos));
  });
  escrever(path.join(dir, 'index.html'), htmlLista(artigos));
  RELACIONADOS.forEach(function (pagina) {
    const arquivo = path.join(root, pagina.arquivo);
    if (!fs.existsSync(arquivo)) throw new Error('página ausente: ' + pagina.arquivo);
    let lista = pagina.calculadora
      ? artigos.filter(function (a) { return a.calculadora === pagina.calculadora; }).slice(0, ARTIGOS_RELACIONADOS_CALC)
      : artigos.slice(0, ULTIMOS_ARTIGOS_HOME);
    const titulo = pagina.calculadora ? 'Artigos relacionados' : 'Últimos artigos';
    const html = fs.readFileSync(arquivo, 'utf8');
    const novo = injetar(html, blocoRelacionados(lista, titulo));
    if (novo !== html) fs.writeFileSync(arquivo, novo);
  });
  escrever(path.join(root, 'sitemap.xml'), sitemap(artigos));
  return lidos;
}

if (require.main === module) {
  try {
    const r = build(path.resolve(__dirname, '..'));
    console.log(r.publicados.length + ' artigo(s) publicado(s), ' + r.rascunhos + ' rascunho(s) ignorado(s)');
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  }
}

module.exports = {
  build: build,
  parseFrontMatter: parseFrontMatter,
  renderMarkdown: renderMarkdown,
  validar: validar,
  dataPt: dataPt,
  hojeSaoPaulo: hojeSaoPaulo,
  dataComFuso: dataComFuso,
  AUTOR_PADRAO: AUTOR_PADRAO
};
