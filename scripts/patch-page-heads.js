#!/usr/bin/env node
/* Atualiza <head>, header e footer das páginas estáticas (exceto artigos gerados). */
const fs = require('fs');
const path = require('path');
const S = require('./site-shell.js');
const ogLib = require('./og-lib.js');

const root = path.resolve(__dirname, '..');

const PAGES = [
  {
    file: 'index.html',
    title: 'Quanto Vira | Calculadoras financeiras gratuitas para o Brasil',
    description: 'Calculadoras de juros compostos, renda fixa, ações, FIRE, PJ x CLT e IR — gratuito, sem cadastro; dados das simulações ficam no seu navegador.',
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
    file: 'ferramentas/index.html',
    title: 'Calculadoras e ferramentas | Quanto Vira',
    description: 'Hub de calculadoras: renda fixa, ações, impostos, carreira e planejamento financeiro com regras do Brasil.',
    canonical: S.SITE + '/ferramentas/',
    ogType: 'website',
    ogDescription: 'Juros compostos, comparador de renda fixa, preço teto, FIRE, PJ x CLT e mais — tudo gratuito.',
    jsonLd: S.webAppJsonLd({
      name: 'Ferramentas Quanto Vira',
      url: S.SITE + '/ferramentas/',
      description: 'Hub de calculadoras financeiras educativas para o Brasil.'
    })
  },
  {
    file: 'juros-compostos/index.html',
    title: 'Calculadora de juros compostos com aportes | Quanto Vira',
    description: 'Simule juros compostos com aportes mensais. Veja a fórmula M = C(1+i)^n, a diferença para os juros simples e como ler o resultado.',
    canonical: S.SITE + '/juros-compostos/',
    ogType: 'website',
    jsonLd: S.webAppJsonLd({
      name: 'Juros compostos',
      url: S.SITE + '/juros-compostos/',
      description: 'Calculadora de juros compostos com aportes mensais. Mostra o total, o que saiu do bolso e os juros.'
    })
  },
  {
    file: 'renda-fixa/index.html',
    title: 'Calculadora de renda fixa: compare CDB, LCI e Tesouro | Quanto Vira',
    description: 'Simule CDB, LCI/LCA, Tesouro e poupança no mesmo prazo. Veja ganho líquido de IR, saldo total e rentabilidade real após IPCA.',
    canonical: S.SITE + '/renda-fixa/',
    ogType: 'website',
    jsonLd: S.webAppJsonLd({
      name: 'Comparador de renda fixa',
      url: S.SITE + '/renda-fixa/',
      description: 'CDB, LCI/LCA, Tesouro e poupança com imposto e inflação.'
    })
  },
  {
    file: 'poupanca/index.html',
    title: 'Calculadora de poupança: rendimento com Selic e TR | Quanto Vira',
    description: 'Informe valor depositado e meses na poupança. Veja saldo final, rendimento total e taxa ao mês com as regras oficiais de Selic e TR.',
    canonical: S.SITE + '/poupanca/',
    ogType: 'website',
    jsonLd: S.webAppJsonLd({
      name: 'Simulador de poupança',
      url: S.SITE + '/poupanca/',
      description: 'Simulador da poupança com regras oficiais de remuneração.'
    })
  },
  {
    file: 'preco-teto/index.html',
    title: 'Calculadora de preço teto: Bazin e Graham para ações | Quanto Vira',
    description: 'Calcule preço teto Bazin pelos dividendos e Graham por LPA e VPA. Compare com o preço de mercado para ver margem de segurança.',
    canonical: S.SITE + '/preco-teto/',
    ogType: 'website',
    jsonLd: S.webAppJsonLd({
      name: 'Preço teto',
      url: S.SITE + '/preco-teto/',
      description: 'Preço teto Bazin e Graham para ações.'
    })
  },
  {
    file: 'preco-medio/index.html',
    title: 'Calculadora de preço médio de ações | Quanto Vira',
    description: 'Some até quatro compras do mesmo ativo com quantidade e preço. Veja preço médio, quantidade total e custo total investido.',
    canonical: S.SITE + '/preco-medio/',
    ogType: 'website',
    jsonLd: S.webAppJsonLd({
      name: 'Preço médio',
      url: S.SITE + '/preco-medio/',
      description: 'Calculadora de preço médio de ações.'
    })
  },
  {
    file: 'dividend-yield/index.html',
    title: 'Calculadora de dividend yield de ações e FIIs | Quanto Vira',
    description: 'Informe os dividendos pagos no ano e o preço da ação ou FII. Veja o dividend yield em percentual sobre o preço que você informou.',
    canonical: S.SITE + '/dividend-yield/',
    ogType: 'website',
    jsonLd: S.webAppJsonLd({
      name: 'Dividend yield',
      url: S.SITE + '/dividend-yield/',
      description: 'Calculadora de dividend yield.'
    })
  },
  {
    file: 'rentabilidade-real/index.html',
    title: 'Calculadora de rentabilidade real: ganho real acima do IPCA | Quanto Vira',
    description: 'Informe a rentabilidade nominal ao ano e a inflação (IPCA). Veja o ganho real ao ano pela fórmula de Fisher, acima da inflação.',
    canonical: S.SITE + '/rentabilidade-real/',
    ogType: 'website',
    jsonLd: S.webAppJsonLd({
      name: 'Rentabilidade real',
      url: S.SITE + '/rentabilidade-real/',
      description: 'Rentabilidade real com equação de Fisher.'
    })
  },
  {
    file: 'taxa-equivalente/index.html',
    title: 'Calculadora de taxa equivalente: juros mensais em anuais | Quanto Vira',
    description: 'Converta taxa de juros mensal em anual (ou anual em mensal) com capitalização composta. Veja a taxa equivalente na hora.',
    canonical: S.SITE + '/taxa-equivalente/',
    ogType: 'website',
    jsonLd: S.webAppJsonLd({
      name: 'Taxa equivalente',
      url: S.SITE + '/taxa-equivalente/',
      description: 'Conversão entre taxa mensal e anual.'
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
    description: 'Conheça o Quanto Vira: calculadoras educativas com dados públicos do Brasil, sem cadastro e com simulações salvas só no seu navegador.',
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
    description: 'Política de privacidade do Quanto Vira: sem cadastro, dados das calculadoras no navegador e informações sobre cookies de anúncios (Google AdSense).',
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

function stripSuffix(t) {
  return String(t).replace(/\s*\|\s*Quanto Vira\s*$/i, '').trim();
}

function patchHead(html, meta) {
  const head = S.headBlock({
    title: meta.title,
    description: meta.description,
    ogDescription: meta.ogDescription,
    canonical: meta.canonical,
    ogType: meta.ogType,
    ogImageAlt: meta.ogImageAlt || ogLib.ogAltText(stripSuffix(meta.title), ogLib.pageKind(meta.canonical).kicker),
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
