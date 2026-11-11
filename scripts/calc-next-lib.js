/* Bloco "Próximo passo: calcule também" — dados e HTML. */
const path = require('path');
const data = require(path.join(__dirname, '..', 'data', 'calc-relacoes.json'));

const SLUGS = Object.keys(data.calculadoras);

const MARK_START = '<!-- qv:calc-next-start -->';
const MARK_END = '<!-- qv:calc-next-end -->';

const BLOCK_RE = /<!-- qv:calc-next-start -->[\s\S]*?<!-- qv:calc-next-end -->\n?/g;

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function calcBySlug(slug) {
  const c = data.calculadoras[slug];
  if (!c) throw new Error('calculadora desconhecida: ' + slug);
  return c;
}

function validateRelations() {
  SLUGS.forEach(function (slug) {
    const c = calcBySlug(slug);
    if (!Array.isArray(c.relacionadas) || c.relacionadas.length !== 3) {
      throw new Error(slug + ': precisa de exatamente 3 relacionadas');
    }
    c.relacionadas.forEach(function (rel) {
      if (!data.calculadoras[rel]) throw new Error(slug + ': relação inválida ' + rel);
      if (rel === slug) throw new Error(slug + ': autolink para ' + rel);
    });
  });
}

function blockHtmlForSlug(slug) {
  const c = calcBySlug(slug);
  const n = SLUGS.length;
  const items = c.relacionadas.map(function (rel) {
    const t = calcBySlug(rel);
    const href = '/' + rel + '/';
    return (
      '<a class="calc-next-item" href="' + href + '">'
      + '<span class="calc-next-icon" aria-hidden="true">' + escapeHtml(t.icone) + '</span>'
      + '<span class="calc-next-text">'
      + '<strong class="calc-next-name">' + escapeHtml(t.nome) + '</strong>'
      + '<span class="calc-next-desc">' + escapeHtml(t.descricaoCurta) + '</span>'
      + '</span>'
      + '<span class="calc-next-chevron" aria-hidden="true">›</span>'
      + '</a>'
    );
  }).join('\n');

  return (
    MARK_START + '\n'
    + '<aside class="card calc-next" aria-labelledby="calc-next-title">\n'
    + '  <h2 id="calc-next-title">Próximo passo: calcule também</h2>\n'
    + '  <nav class="calc-next-list" aria-label="Calculadoras relacionadas">\n'
    + '    ' + items.split('\n').join('\n    ') + '\n'
    + '  </nav>\n'
    + '  <p class="calc-next-all"><a href="/ferramentas/">Ver todas as ' + n + ' calculadoras</a></p>\n'
    + '</aside>\n'
    + MARK_END
  );
}

function stripBlock(html) {
  return html.replace(BLOCK_RE, '');
}

function injectBlock(html, slug) {
  const block = blockHtmlForSlug(slug);
  html = stripBlock(html);
  const re = /(<article class="card article">)/;
  if (!re.test(html)) throw new Error('sem article.card: ' + slug);
  return html.replace(re, block + '\n$1');
}

validateRelations();

module.exports = {
  data: data,
  SLUGS: SLUGS,
  MARK_START: MARK_START,
  MARK_END: MARK_END,
  BLOCK_RE: BLOCK_RE,
  blockHtmlForSlug: blockHtmlForSlug,
  stripBlock: stripBlock,
  injectBlock: injectBlock,
  validateRelations: validateRelations
};
