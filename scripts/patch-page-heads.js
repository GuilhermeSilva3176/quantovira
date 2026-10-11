#!/usr/bin/env node
/* Atualiza <head>, header e footer das páginas estáticas (exceto artigos gerados). */
const fs = require('fs');
const path = require('path');
const S = require('./site-shell.js');

const root = path.resolve(__dirname, '..');

const PAGES = [
  {
    file: 'index.html',
    title: 'Quanto Vira | Calculadoras financeiras gratuitas para o Brasil',
    description: 'Simulador FIRE com dados históricos, comparador PJ x CLT e calculadora de IR de investimentos — gratuito, sem cadastro e sem rastreamento.',
    canonical: S.SITE + '/',
    ogType: 'website',
    jsonLd: S.orgWebSiteJsonLd()
  },
  {
    file: 'simulador-fire/index.html',
    title: 'Simulador FIRE com Monte Carlo | Quanto Vira',
    description: 'Simule independência financeira com Monte Carlo e anos reais de IPCA, CDI e Ibovespa (1995–2025). Veja probabilidade de sucesso, idade FIRE e faixas p10/p50/p90.',
    canonical: S.SITE + '/simulador-fire/',
    ogType: 'website',
    ogDescription: 'Probabilidade de sucesso, faixas p10/p50/p90 e idade estimada de independência financeira, em valores reais.',
    jsonLd: S.webAppJsonLd({
      name: 'Simulador FIRE',
      url: S.SITE + '/simulador-fire/',
      description: 'Simulador gratuito de independência financeira (FIRE) com Monte Carlo e dados históricos do Brasil.'
    })
  },
  {
    file: 'pj-vs-clt/index.html',
    title: 'Comparador PJ x CLT 2026 | Quanto Vira',
    description: 'Compare o líquido anual como CLT e como PJ (MEI, Simples Anexo III ou V, Lucro Presumido) com INSS, IR, FGTS, 13º, férias e DAS de 2026.',
    canonical: S.SITE + '/pj-vs-clt/',
    ogType: 'website',
    ogDescription: 'Líquido anual equivalente, detalhamento e ponto de equilíbrio entre salário CLT e nota PJ.',
    jsonLd: S.webAppJsonLd({
      name: 'Comparador PJ x CLT',
      url: S.SITE + '/pj-vs-clt/',
      description: 'Compare quanto sobra no ano como empregado CLT e como PJ com as regras tributárias de 2026.'
    })
  },
  {
    file: 'ir-investimentos/index.html',
    title: 'Calculadora de IR de investimentos 2026 | Quanto Vira',
    description: 'Calcule o imposto de ações, day trade, FIIs, ETFs, cripto e investimentos no exterior. Veja DARF, vencimento e compensação de prejuízo.',
    canonical: S.SITE + '/ir-investimentos/',
    ogType: 'website',
    ogDescription: 'Imposto por categoria, DARF, vencimento e prejuízo a compensar, com regras de 2026.',
    jsonLd: S.webAppJsonLd({
      name: 'IR de investimentos',
      url: S.SITE + '/ir-investimentos/',
      description: 'Calculadora gratuita de imposto de renda sobre investimentos para pessoa física no Brasil.'
    })
  },
  {
    file: 'sobre/index.html',
    title: 'Sobre o Quanto Vira | Calculadoras financeiras gratuitas',
    description: 'Conheça o Quanto Vira: calculadoras educativas com dados públicos do Brasil, sem cadastro, sem cookies e sem rastreamento.',
    canonical: S.SITE + '/sobre/',
    ogType: 'website'
  },
  {
    file: 'contato/index.html',
    title: 'Contato | Quanto Vira',
    description: 'Entre em contato com a equipe do Quanto Vira para correções, sugestões de calculadoras ou dúvidas sobre os cálculos.',
    canonical: S.SITE + '/contato/',
    ogType: 'website'
  },
  {
    file: 'privacidade/index.html',
    title: 'Privacidade | Quanto Vira',
    description: 'Política de privacidade do Quanto Vira: sem cookies de rastreamento, sem cadastro e sem coleta de dados pessoais nas calculadoras.',
    canonical: S.SITE + '/privacidade/',
    ogType: 'website'
  },
  {
    file: 'fontes/index.html',
    title: 'Fontes e metodologia | Quanto Vira',
    description: 'Fontes oficiais e metodologia dos cálculos do Quanto Vira: Banco Central, IBGE, Receita Federal e séries usadas no simulador FIRE.',
    canonical: S.SITE + '/fontes/',
    ogType: 'website'
  }
];

function patchHead(html, meta) {
  const head = S.headBlock({
    title: meta.title,
    description: meta.description,
    ogDescription: meta.ogDescription,
    canonical: meta.canonical,
    ogType: meta.ogType,
    jsonLd: meta.jsonLd || null
  });
  const reHead = /<head>[\s\S]*?<\/head>/;
  if (!reHead.test(html)) throw new Error('sem head: ' + meta.file);
  html = html.replace(reHead, '<head>\n' + head + '\n</head>');
  html = html.replace(/<header class="top">[\s\S]*?<\/header>/, S.HEADER);
  html = html.replace(/<footer class="wrap foot">[\s\S]*?<\/footer>/, S.FOOTER);
  return html;
}

function deferScripts(html) {
  return html.replace(/<script src="([^"]+)"><\/script>/g, '<script src="$1" defer></script>');
}

PAGES.forEach(function (meta) {
  const file = path.join(root, meta.file);
  let html = fs.readFileSync(file, 'utf8');
  html = patchHead(html, meta);
  html = deferScripts(html);
  fs.writeFileSync(file, html);
  console.log('ok', meta.file);
});
