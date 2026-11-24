---
title: "Taxa equivalente: por que 1% ao mês não é 12% ao ano"
description: "1% ao mês não é 12% ao ano. Veja como converter taxa mensal e anual com juros compostos, e o que muda entre 252 dias úteis e 365 dias corridos."
date: 2026-11-23
updated: 2026-11-23
author: Equipe Quanto Vira
calculadora: ir-investimentos
fontes:
  - nome: Banco Central do Brasil — Remuneração dos Depósitos de Poupança
    url: https://www.bcb.gov.br/pec/poupanca/poupanca.asp?frame=1
  - nome: Banco Central do Brasil — SGS, série 432 (meta Selic)
    url: https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json&dataInicial=01/09/2026&dataFinal=23/11/2026
  - nome: Banco Central do Brasil — ata da 282ª reunião do Copom (3 e 4 de novembro de 2026)
    url: https://www.bcb.gov.br/content/copom/atascopom/Copom282-not20261104282.pdf
  - nome: Resolução BCB nº 46, de 24 de novembro de 2020
    url: https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolução&numero=46
  - nome: Banco Central do Brasil — metodologia de divulgação da taxa Selic (convenção de 252 dias úteis)
    url: https://www3.bcb.gov.br/novoselic/partials/observacao-taxa-selic.html
  - nome: B3 — Metodologia de Apuração da Taxa DI
    url: https://www.b3.com.br/pt_br/market-data-e-indices/indices/indices-de-segmentos-e-setoriais/di/metodologia-de-apuracao-da-taxa/
  - nome: Banco Central do Brasil — SGS, série 25477 (taxa média mensal do cartão de crédito rotativo, PF)
    url: https://api.bcb.gov.br/dados/serie/bcdata.sgs.25477/dados/ultimos/8?formato=json
---

Quem vê 1% ao mês e multiplica por 12 chega a 12% ao ano. Essa conta ignora os juros sobre juros. Com capitalização composta, 1% ao mês equivale a 12,6825% ao ano, não a 12%.

A tabela abaixo usa a mesma conta da [calculadora de taxa equivalente](/taxa-equivalente/): de mês para ano, (1 + taxa mensal)^12 − 1.

| Taxa ao mês | Equivalente ao ano | Só multiplicar por 12 |
| --- | --- | --- |
| 0,50% | 6,1678% | 6,00% |
| 0,6701% (poupança) | 8,3443% | 8,0412% |
| 1,00% | 12,6825% | 12,00% |
| 2,00% | 26,8242% | 24,00% |

A coluna da poupança usa a taxa total de 0,6701% ao mês publicada pelo [Banco Central](https://www.bcb.gov.br/pec/poupanca/poupanca.asp?frame=1) para o período de 19 de novembro a 19 de dezembro de 2026. Os outros percentuais mensais da tabela são só exemplos de conversão, não taxas de um banco.

**Em uma frase:** para comparar um juro mensal com um juro anual, use a taxa equivalente composta, não a multiplicação por 12.

## As duas contas

Para passar a taxa do mês para o ano:

(1 + i_mês)^12 − 1

Para o caminho inverso, do ano para o mês:

(1 + i_ano)^(1/12) − 1

É o que a calculadora do site faz. O 1% entra como 0,01; o 12% entra como 0,12. No fim, multiplique de novo por 100 para ler em percentual. As casas daqui seguem o arredondamento da calculadora, com quatro decimais.

A conta de 1% ao mês:

(1,01)^12 − 1 = 1,126825… − 1 = 0,126825…

Em percentual, **12,6825% ao ano**.

No outro sentido, 12% ao ano não voltam para 1% ao mês:

(1,12)^(1/12) − 1 = 0,00948879…

Isso é **0,9489% ao mês**. Quem cobra ou paga 1% ao mês está, na prática, numa taxa anual maior do que 12%.

A multiplicação por 12 é uma taxa linear, às vezes chamada de nominal. Ela não acumula juro sobre juro. A taxa efetiva é a que de fato se capitaliza no período. Quanto maior a taxa, maior o vão entre as duas: em 2% ao mês, multiplicar por 12 dá 24% ao ano, e a conta composta dá 26,8242%.

## Três casos práticos

A [tabela do Banco Central](https://www.bcb.gov.br/pec/poupanca/poupanca.asp?frame=1) traz a poupança a 0,6701% ao mês no período de 19 de novembro a 19 de dezembro de 2026. Em 12 aniversários, se essa taxa ficasse parada — e isso é uma **suposição**, não uma previsão — o equivalente anual seria:

(1,006701)^12 − 1 = **8,3443% ao ano**.

Multiplicar 0,6701% por 12 daria só 8,0412%. A diferença é o juro composto de um mês no outro. O artigo [Poupança x CDB x Tesouro Selic: R$ 10 mil em 2026](/artigos/poupanca-cdb-tesouro-selic-10-mil-2026/) usa essa mesma taxa mensal de 0,6701% para comparar os três produtos.

A meta da Selic, em 23 de novembro de 2026, está em **13,75% ao ano**, vigente desde 17 de setembro e mantida pelo Copom em 3 e 4 de novembro. Passada para o mês pela conta de 12 meses:

(1,1375)^(1/12) − 1 = **1,0794% ao mês**.

Dividir 13,75% por 12 daria 1,1458% ao mês, um número maior, porque essa divisão também é linear. A [calculadora de juros compostos](/juros-compostos/) parte da taxa anual e a converte para o mês do mesmo jeito composto.

Agora o outro lado da comparação: um juro de dívida cotado ao mês e um investimento cotado ao ano. Na série 25477 do Banco Central, a taxa média do rotativo do cartão de crédito para pessoa física estava em **15,29% ao mês** em setembro de 2026, último valor publicado na consulta de 23 de novembro. É a média das novas operações daquele mês, ponderada pelo valor, não a taxa do seu contrato. Em juros compostos:

(1,1529)^12 − 1 = **451,4418% ao ano**.

Multiplicar 15,29% por 12 daria 183,48% ao ano, bem abaixo do que a capitalização produz. Ao lado de uma aplicação a 13,75% ao ano, a diferença de prazo da cotação some: o que importa é a taxa equivalente no mesmo período.

Esta conversão não é a mesma do artigo [LCI, LCA, CRI e CRA isentos x CDB tributado](/artigos/lci-lca-cri-cra-isentos-cdb-taxa-equivalente/). Lá, “taxa equivalente” é a taxa bruta do CDB que, depois do IR, empata com um título isento. Aqui, é só a troca de período, de mês para ano e de ano para mês.

## 252 dias úteis e 365 dias corridos

A [calculadora de taxa equivalente](/taxa-equivalente/) trabalha com 12 meses. Ela não usa 252 nem 365 dias.

A Selic e o CDI, no mercado, são cotados ao ano na convenção de 252 dias úteis. A [Resolução BCB nº 46, de 24 de novembro de 2020](https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolução&numero=46), e a [página de metodologia do Banco Central](https://www3.bcb.gov.br/novoselic/partials/observacao-taxa-selic.html) dizem que a taxa Selic é expressa “sob a forma anual, considerando a convenção de 252 dias úteis”. O fator de um dia útil é (1 + taxa anual)^(1/252). Com a meta de 13,75% ao ano, esse fator fica em 1,00051137 (oito casas, como o BC apresenta o fator diário). Os juros de Selic e de CDI capitalizam em dia útil, não no sábado, no domingo nem no feriado. A [metodologia da Taxa DI da B3](https://www.b3.com.br/pt_br/market-data-e-indices/indices/indices-de-segmentos-e-setoriais/di/metodologia-de-apuracao-da-taxa/) também expressa as taxas ao ano de 252 dias úteis.

Se o período tiver exatamente 252 dias úteis, uma taxa de 13,75% ao ano nessa convenção devolve 13,75% ao fim do período. O número de dias úteis de um ano corrido pode ser 251, 252 ou 253, então o ganho no calendário pode ficar um fio ao lado.

O [comparador de renda fixa](/renda-fixa/) usa outra convenção: a taxa anual elevada à fração dias/365. É um atalho em dias corridos, útil para comparar produtos no mesmo prazo de calendário. Ele não conta os dias úteis de fato. Se alguém aplica 13,75% a 180 dias nessa conta, o fator é (1,1375)^(180/365) − 1, ou cerca de 6,5596% no período. A conta de mercado, com os dias úteis reais daqueles 180 dias, pode ser um pouco diferente.

Para converter mês e ano no dia a dia, a calculadora de 12 meses basta. Para um CDB ou um título atrelado ao CDI, a convenção de 252 dias úteis é a do mercado. Os dois não se misturam na mesma conta sem dizer qual base está em uso.

Este texto é educativo. Não é recomendação de investimento, nem consultoria financeira, jurídica ou tributária. A taxa do seu contrato, do seu cartão ou do seu título está no extrato e no documento da instituição. A lei, o Banco Central e a B3 prevalecem sobre o exemplo.
