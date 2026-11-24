---
title: "Rentabilidade real: como descontar a inflação"
description: "Não basta subtrair o IPCA do rendimento. Veja a fórmula de Fisher e o ganho real, já com IR, de R$ 10 mil na poupança, no CDB e no Tesouro Selic."
date: 2026-11-24
updated: 2026-11-24
author: Equipe Quanto Vira
calculadora: rentabilidade-real
fontes:
  - nome: IBGE — Inflação (IPCA)
    url: https://www.ibge.gov.br/explica/inflacao.php
  - nome: IBGE — IPCA fica em 0,14% em outubro (12 de novembro de 2026)
    url: https://agenciadenoticias.ibge.gov.br/agencia-sala-de-imprensa/2013-agencia-de-noticias/releases/48568-ipca-fica-em-0-14-em-outubro
  - nome: Banco Central do Brasil — SGS, série 13522 (IPCA acumulado em 12 meses)
    url: https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados?formato=json&dataInicial=01/08/2026&dataFinal=24/11/2026
  - nome: Tesouro Direto — Regras e Regulamento
    url: https://www.tesourodireto.com.br/sobre-o-tesouro/regras-e-regulamento
---

O rendimento que aparece no extrato é nominal: ainda não tirou a inflação. O que interessa para o poder de compra é a rentabilidade real. Ela não se obtém subtraindo o IPCA do ganho. A conta certa divide os dois fatores.

O exemplo abaixo retoma os resgates líquidos de 1 ano do artigo [Poupança x CDB x Tesouro Selic: R$ 10 mil em 2026](/artigos/poupanca-cdb-tesouro-selic-10-mil-2026/), sobre R$ 10 mil. A inflação é o IPCA acumulado em 12 meses até outubro de 2026, de **4,63%**. O índice é calculado pelo [IBGE](https://www.ibge.gov.br/explica/inflacao.php) e republicado na [série 13522 do Banco Central](https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados?formato=json&dataInicial=01/08/2026&dataFinal=24/11/2026). Na consulta de 24 de novembro de 2026, esse era o último valor disponível: o IPCA de novembro ainda não havia sido divulgado.

A fórmula é a de Fisher, a mesma da [calculadora de rentabilidade real](/rentabilidade-real/): (1 + nominal) ÷ (1 + inflação) − 1. O nominal daqui já está líquido de IR. No Tesouro Selic, o resgate do outro artigo ainda não desconta a custódia da B3.

| Aplicação (1 ano, líquido de IR) | Rendimento nominal | Subtrair o IPCA | Fórmula de Fisher (real) |
| --- | --- | --- | --- |
| Poupança (R$ 10.834,43) | 8,3443% | 3,71% | 3,55% |
| CDB 100% do CDI (R$ 11.126,12) | 11,2612% | 6,63% | 6,34% |
| Tesouro Selic (R$ 11.134,37) | 11,3437% | 6,71% | 6,42% |

**Em uma frase:** subtrair o IPCA superestima o ganho real; no CDB deste exemplo, a diferença é de 0,29 ponto percentual.

Comparar um rendimento projetado de 1 ano com o IPCA dos 12 meses já ocorridos é uma **aproximação**. Os resgates do outro artigo **supõem** Selic, CDI e TR parados no valor usado naquele texto. O IPCA de 4,63% mede o passado, até outubro de 2026, não a inflação dos próximos 12 meses.

## O que o IPCA mede

O IPCA é o índice oficial de inflação do Brasil, produzido pelo IBGE. No [comunicado de 12 de novembro de 2026](https://agenciadenoticias.ibge.gov.br/agencia-sala-de-imprensa/2013-agencia-de-noticias/releases/48568-ipca-fica-em-0-14-em-outubro), o índice de outubro ficou em 0,14%. No ano até outubro, acumula 4,10%. Em 12 meses, 4,63%, depois de 4,58% até setembro. O Banco Central republica esse acumulado de 12 meses na série 13522, com data de referência 01/10/2026 e valor 4,63. Na consulta desta data, ainda não havia dado de novembro.

Para um horizonte de 1 ano, o acumulado de 12 meses é o recorte usual. Não é uma previsão.

## Por que não basta subtrair

Se o dinheiro rende 11,2612% e os preços sobem 4,63%, os dois fatores atuam juntos. O que sobra não é a diferença 11,2612 − 4,63 = 6,6312, ou **6,63%**. É o que resta depois de corrigir o montante pela inflação.

A [calculadora de rentabilidade real](/rentabilidade-real/) usa:

(1 + i_nominal) ÷ (1 + i_inflação) − 1

No CDB, o resgate líquido é R$ 11.126,12. O fator nominal é 11.126,12 ÷ 10.000,00 = 1,112612, ou 11,2612%. A inflação de 4,63% entra como 1,0463.

1,112612 ÷ 1,0463 = 1,063377…

1,063377… − 1 = 0,063378, ou **6,3378%**, que arredonda para **6,34%**.

Em poder de compra de outubro, aqueles R$ 11.126,12 equivalem a cerca de R$ 10.633,78. O ganho real é cerca de R$ 633,78, não os R$ 663,12 que a subtração sugeriria.

A poupança e o Tesouro Selic seguem a mesma conta. Na poupança, 1,083443 ÷ 1,0463 − 1 = 3,5499%, ou **3,55%**. No Tesouro Selic, 1,113437 ÷ 1,0463 − 1 = 6,4166%, ou **6,42%**. A calculadora do site mostra duas casas; os percentuais nominais longos vêm da divisão do resgate pelos R$ 10 mil.

## Use o rendimento líquido de IR

A inflação come o que de fato entra na conta, não o rendimento bruto de um CDB ou de um título do Tesouro. No exemplo, o CDB rendeu R$ 1.365,00 brutos e pagou R$ 238,88 de IR. O Tesouro Selic rendeu R$ 1.375,00 e pagou R$ 240,63. A poupança não tem esse imposto.

Se a conta real usasse o bruto de 13,65% do CDB, o Fisher daria cerca de 8,62% — quase 2,3 pontos acima dos 6,34% líquidos. A [calculadora de rentabilidade real](/rentabilidade-real/) aceita o percentual que você informar; para CDB e Tesouro, o certo é o líquido, depois da [tabela regressiva do IR](/artigos/tabela-regressiva-ir-renda-fixa/). O [comparador de renda fixa](/renda-fixa/) já traz uma coluna de rentabilidade real a partir do líquido e do IPCA de 12 meses.

## Tesouro IPCA+: o juro já vem real

O Tesouro IPCA+ é outra história. A taxa do título, anunciada na compra, já é um juro real, acima do IPCA. Não se aplica de novo a fórmula de Fisher sobre essa taxa — isso descontaria a inflação duas vezes. O artigo [Quanto preciso para viver de renda com Tesouro IPCA+](/artigos/quanto-preciso-para-viver-de-renda-tesouro-ipca/) parte dessa taxa real. A [regra dos 4%](/artigos/regra-dos-4-por-cento-brasil/) também trabalha com juro real e com o IR. Se o título for vendido antes do vencimento, o preço de mercado pode ser outro, e o ganho efetivo muda.

## Como usar as calculadoras

Na [calculadora de rentabilidade real](/rentabilidade-real/), entre o percentual nominal líquido ao ano e a inflação que quer descontar, em geral o IPCA de 12 meses. O [comparador de renda fixa](/renda-fixa/) junta IR, prazo e inflação na mesma tela. A [calculadora de juros compostos](/juros-compostos/) mostra o crescimento nominal mês a mês. A [calculadora de taxa equivalente](/taxa-equivalente/) e o artigo [Taxa equivalente: por que 1% ao mês não é 12% ao ano](/artigos/taxa-equivalente-mensal-anual/) convertem mês e ano, mas não descontam inflação.

Este texto é educativo. Não é recomendação de investimento, nem consultoria financeira, jurídica ou tributária. A inflação dos próximos 12 meses pode ser diferente dos 4,63% até outubro de 2026. O IBGE, o Banco Central e o extrato da instituição prevalecem sobre o exemplo.
