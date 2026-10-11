---
title: "Quanto preciso para viver de renda com Tesouro IPCA+? Simulação para R$ 5, 10 e 20 mil por mês"
description: "A conta usa a taxa de 6,48% do Tesouro IPCA+ 2050 na manhã de 09/10/2026 e o IR de 15% para achar o patrimônio de uma renda de R$ 5 mil, R$ 10 mil e R$ 20 mil."
date: 2026-10-10
updated: 2026-10-10
author: Equipe Quanto Vira
calculadora: simulador-fire
fontes:
  - nome: Lei nº 11.033, de 21 de dezembro de 2004
    url: https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l11033.htm
  - nome: Decreto nº 12.814, de 9 de janeiro de 2026
    url: https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/decreto/d12814.htm
  - nome: Tesouro Direto — regras, Imposto de Renda, custódia e limite de compra
    url: https://www.tesourodireto.com.br/sobre-o-tesouro/regras-e-regulamento
  - nome: Tesouro Direto — preços e taxas (consulta em 10/10/2026, mercado fechado)
    url: https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm
  - nome: Tesouro Transparente — taxas dos títulos ofertados pelo Tesouro Direto
    url: https://www.tesourotransparente.gov.br/temas/divida-publica-federal/tesouro-direto
  - nome: Tesouro Transparente — arquivo diário de preços e taxas (base 09/10/2026)
    url: https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/precotaxatesourodireto.csv
  - nome: Tesouro Nacional — mercado secundário (cupom da NTN-B e contagem em dias úteis)
    url: https://www.gov.br/tesouronacional/pt-br/divida-publica-federal/mercado-interno/mercado-secundario
  - nome: Banco Central — SGS 432, meta Selic definida pelo Copom
    url: https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json&dataInicial=01/09/2026&dataFinal=10/10/2026
  - nome: Banco Central — ata da 281ª reunião do Copom, 15 e 16 de setembro de 2026
    url: https://www.bcb.gov.br/content/copom/atascopom/Copom281-not20260916281.pdf
  - nome: Banco Central — SGS 13522, IPCA acumulado em 12 meses
    url: https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados?formato=json&dataInicial=01/09/2026&dataFinal=01/09/2026
  - nome: Banco Central — SGS 433, IPCA variação mensal
    url: https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json&dataInicial=01/09/2026&dataFinal=01/09/2026
  - nome: IBGE — IPCA de setembro de 2026
    url: https://agenciadenoticias.ibge.gov.br/agencia-sala-de-imprensa/2013-agencia-de-noticias/releases/48246-ipca-fica-em-0-82-em-setembro
---

Para uma renda de R$ 5.000,00 por mês, esta conta pede **R$ 1.236.836,29**. Para R$ 10.000,00, **R$ 2.473.672,58**. Para R$ 20.000,00, **R$ 4.947.345,17**. Os três valores usam o ganho real depois do Imposto de Renda e mantêm o poder de compra do dinheiro aplicado. A taxa é a de compra do Tesouro IPCA+ com vencimento em 15/08/2050, lida na manhã de 09/10/2026: 6,48% ao ano. As regras deste texto são as vigentes em 2026. Na página da [Lei nº 11.033/2004](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l11033.htm), a nota da Medida Provisória nº 1.303/2025 aparece com vigência encerrada. A tabela do art. 1º permanece a do texto da lei.

## O que esta conta chama de viver de renda

Viver de renda, aqui, é tirar o gasto do ano só do que o título rendeu acima da inflação, depois do imposto. O principal fica no lugar, em poder de compra. Os R$ 5.000,00, R$ 10.000,00 e R$ 20.000,00 são os três gastos mensais da pergunta. Não são uma sugestão de quanto gastar.

Há outra pergunta, com outro patrimônio. A [regra dos 4%](/artigos/regra-dos-4-por-cento-brasil/) fixa o saque do primeiro ano em 4% do patrimônio e, nos anos seguintes, corrige esse saque pela inflação. Naquele estudo, o principal pode cair. Para os mesmos três gastos, 4% do patrimônio pedem R$ 1.500.000,00, R$ 3.000.000,00 e R$ 6.000.000,00. A conta deste texto é a do ganho real líquido. A regra dos 4% fica no artigo dela.

## A taxa da manhã de 09/10/2026

O Tesouro IPCA+ (NTN-B Principal) paga a variação do IPCA mais uma taxa definida na compra. O IPCA é o índice de inflação medido pelo IBGE. O pagamento é único, no vencimento. O [regulamento do Tesouro Direto](https://www.tesourodireto.com.br/sobre-o-tesouro/regras-e-regulamento) descreve esse título sem cupom semestral.

Em 10/10/2026, sábado, o [arquivo diário do Tesouro Transparente](https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/precotaxatesourodireto.csv) tinha como última data-base 09/10/2026. A [página de preços e taxas](https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm), consultada nesse sábado, informava mercado fechado e última atualização às 18h de 09/10/2026. As colunas usadas aqui são as da manhã. Não há, neste arquivo, uma linha de 10/10/2026.

Para o Tesouro IPCA+ com vencimento em 15/08/2050, a manhã de 09/10/2026 registrava taxa de compra de 6,48% ao ano e taxa de venda de 6,60% ao ano. O preço unitário de compra era R$ 1.076,35. O de venda, R$ 1.046,60. O conjunto de dados está na página do [Tesouro Transparente](https://www.tesourotransparente.gov.br/temas/divida-publica-federal/tesouro-direto).

A taxa de 6,48% vale para quem compra por aquele preço e permanece até 15/08/2050. A venda antes do vencimento usa o preço do dia. Naquela manhã, o preço de venda estava abaixo do preço de compra.

No mesmo arquivo e na mesma manhã, os outros Tesouro IPCA+ sem juros semestrais tinham estas taxas de compra:

- vencimento em 15/05/2029: 6,62%
- vencimento em 15/08/2032: 6,65%
- vencimento em 15/05/2035: 6,66%
- vencimento em 15/08/2040: 6,51%
- vencimento em 15/05/2045: 6,49%
- vencimento em 15/08/2050: 6,48%

O exemplo segue com 6,48%, o título de 2050. É o mesmo papel e a mesma manhã da conta da regra dos 4%.

## A Selic de 13,75% é juro nominal

Em 10/10/2026, a meta da Selic na [série SGS 432](https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json&dataInicial=01/09/2026&dataFinal=10/10/2026) do Banco Central estava em 13,75% ao ano. A [ata da 281ª reunião do Copom](https://www.bcb.gov.br/content/copom/atascopom/Copom281-not20260916281.pdf), de 15 e 16 de setembro de 2026, registra a decisão de reduzir a taxa básica para 13,75% ao ano. Na mesma série, o valor é 14,00% até 16/09/2026 e 13,75% a partir de 17/09/2026.

A Selic é juro nominal. O Tesouro IPCA+ escreve na compra a taxa real, acima do IPCA. A divisão deste texto usa 6,48%, a taxa do título. Ela deixa os 13,75% de fora.

## O IPCA de setembro entra na conta de um ano

O IPCA subiu 0,82% em setembro de 2026. Em 12 meses, até setembro, ficou em 4,58%, como informa o [comunicado do IBGE](https://agenciadenoticias.ibge.gov.br/agencia-sala-de-imprensa/2013-agencia-de-noticias/releases/48246-ipca-fica-em-0-82-em-setembro). A [série SGS 433](https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json&dataInicial=01/09/2026&dataFinal=01/09/2026) traz o 0,82% do mês, e a [série SGS 13522](https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados?formato=json&dataInicial=01/09/2026&dataFinal=01/09/2026) traz os 4,58% acumulados em 12 meses, na data 01/09/2026.

A leitura abaixo usa esses 4,58% como a inflação de um ano de conta. É o IPCA passado, colocado nesse lugar. O título de verdade conta os dias úteis do contrato e o IPCA de cada mês. A página do [Tesouro Nacional sobre o mercado secundário](https://www.gov.br/tesouronacional/pt-br/divida-publica-federal/mercado-interno/mercado-secundario) registra que o padrão brasileiro de apreçamento usa dias úteis, na base 252. Os centavos de um papel comprado podem sair diferentes.

## O IR de 15% pega correção e juro

O art. 1º da Lei nº 11.033/2004 tributa na fonte os rendimentos das aplicações de renda fixa feitas a partir de 1º de janeiro de 2005:

- 22,5% até 180 dias
- 20% de 181 a 360 dias
- 17,5% de 361 a 720 dias
- 15% acima de 720 dias

A conta de cada faixa, com um rendimento parado de R$ 1.200, está na [tabela regressiva do IR na renda fixa](/artigos/tabela-regressiva-ir-renda-fixa/). O regulamento do Tesouro Direto aplica essa lógica ao rendimento no resgate antecipado, no cupom e no vencimento. O prazo conta da data de liquidação. O IOF entra em resgates com menos de 30 dias. O exemplo usa o último degrau, 15%, porque o prazo supera 720 dias. A página do Tesouro escreve essa faixa como "acima de 721 dias". Um título levado por anos cai em 15% nas duas redações.

O rendimento é o que se recebe acima do que se pagou. No IPCA+, esse valor reúne a correção pelo IPCA e a taxa de 6,48%. O imposto alcança o ganho inteiro, correção incluída.

A isenção e a redução de imposto até R$ 5.000 em 2026 são outra regra. Elas valem para o imposto mensal do salário e do pró-labore, como explica o artigo [Isenção de IR até R$ 5 mil em 2026](/artigos/isencao-ir-5-mil-2026-clt-pro-labore/). Uma renda de R$ 5.000,00 vinda do Tesouro continua na tabela regressiva, retida na fonte.

## De 6,48% e 4,58% sai a taxa real depois do imposto

Um ano da taxa contratada, com inflação igual aos 4,58%:

1,0648 × 1,0458 = 1,11356784.

O rendimento nominal bruto é 0,11356784, ou 11,356784%.

O imposto de 15% sobre esse rendimento é 0,11356784 × 0,15 = 0,017035176.

O rendimento nominal depois do imposto é 0,11356784 − 0,017035176 = 0,096532664.

Para cada R$ 1,00 no início, o saldo nominal fica em 1,096532664. Para voltar ao poder de compra do início, divide-se pela inflação do exemplo:

1,096532664 ÷ 1,0458 = 1,048510866322...

A parte acima de 1, cortada nesse ponto, é 0,048510866322, ou 4,8510866322%. Essa é a taxa real líquida usada nas três divisões abaixo. O artigo da regra dos 4% chega ao mesmo 0,048510866322 com estes insumos, num patrimônio de R$ 1.800.000,00.

Um atalho multiplica 6,48% por (1 − 0,15) e chega a 5,508%. Esse 5,508% é o que a conta deste texto devolve quando a inflação do ano é zero. Com os 4,58% já medidos, a taxa cai para 4,8510866322%. A distância aparece porque os 15% também alcançam a correção do IPCA.

## R$ 5 mil, R$ 10 mil e R$ 20 mil

O gasto do ano é o gasto do mês vezes 12. O patrimônio que mantém o poder de compra é esse gasto dividido por 0,048510866322.

- R$ 5.000,00 por mês são R$ 60.000,00 no ano. R$ 60.000,00 ÷ 0,048510866322 = 1.236.836,2915..., em centavos **R$ 1.236.836,29**.
- R$ 10.000,00 por mês são R$ 120.000,00 no ano. R$ 120.000,00 ÷ 0,048510866322 = 2.473.672,5830..., em centavos **R$ 2.473.672,58**.
- R$ 20.000,00 por mês são R$ 240.000,00 no ano. R$ 240.000,00 ÷ 0,048510866322 = 4.947.345,1660..., em centavos **R$ 4.947.345,17**.

Cada gasto ainda cabe em outras duas divisões, que respondem outras perguntas.

Quem divide o gasto do ano pelos 6,48% da tela, sem descontar o Imposto de Renda, trata a taxa real inteira como dinheiro disponível:

- R$ 60.000,00 ÷ 0,0648 = **R$ 925.925,93**
- R$ 120.000,00 ÷ 0,0648 = **R$ 1.851.851,85**
- R$ 240.000,00 ÷ 0,0648 = **R$ 3.703.703,70**

Quem usa o atalho de 5,508%, que deixa de fora o imposto sobre a correção do IPCA:

- R$ 60.000,00 ÷ 0,05508 = **R$ 1.089.324,62**
- R$ 120.000,00 ÷ 0,05508 = **R$ 2.178.649,24**
- R$ 240.000,00 ÷ 0,05508 = **R$ 4.357.298,47**

A divisão por 0,048510866322 é a que desconta os 15% sobre o rendimento nominal e ainda repõe a inflação de 4,58% no principal.

## A conferência do patrimônio de R$ 10 mil

O meio da lista, R$ 2.473.672,58, dá para refazer o ano inteiro.

2.473.672,58 × 0,11356784 = 280.929,6517778272.

O ganho bruto do exemplo é R$ 280.929,65. A alíquota de 15% multiplica o ganho antes do arredondamento:

280.929,6517778272 × 15% = 42.139,44776667408.

O IR do exemplo é R$ 42.139,45. O ganho nominal depois do imposto é 280.929,6517778272 − 42.139,44776667408 = 238.790,20401115312, ou R$ 238.790,20. Arredondar o ganho e o imposto antes de subtrair produz o mesmo centavo: R$ 280.929,65 − R$ 42.139,45 = R$ 238.790,20. A lei fixa a alíquota. O centavo final depende da ordem do arredondamento.

O saldo nominal é 2.473.672,58 + 238.790,20401115312 = 2.712.462,78401115312.

2.712.462,78401115312 ÷ 1,0458 = 2.593.672,57985384693.

Acima dos R$ 2.473.672,58 ficam 119.999,99985384693, em centavos **R$ 120.000,00**. Em doze meses iguais, R$ 120.000,00 ÷ 12 = **R$ 10.000,00** por mês.

A mesma taxa, nos outros dois patrimônios, devolve R$ 60.000,00 e R$ 240.000,00 no ano. Em centavos, isso é R$ 5.000,00 e R$ 20.000,00 por mês.

## A custódia de 0,2% fica de fora do ganho

A B3 cobra taxa de custódia de 0,2% ao ano sobre o valor dos títulos, no Tesouro IPCA+, no Tesouro Prefixado e no Tesouro Selic. A isenção até R$ 10.000,00 por CPF vale para o Tesouro Selic. Sobre os três patrimônios, 0,2% são:

- R$ 1.236.836,29 × 0,2% = **R$ 2.473,67** no ano
- R$ 2.473.672,58 × 0,2% = **R$ 4.947,35** no ano
- R$ 4.947.345,17 × 0,2% = **R$ 9.894,69** no ano

Essa taxa ficou de fora do ganho real calculado acima. O dinheiro que sobra para o saque é menor por causa dela. A instituição financeira pode cobrar outra taxa, anual ou por operação. O Tesouro Direto informa que esse valor é acordado com cada investidor. Como a alíquota muda de corretora para corretora, o exemplo deixa a taxa da instituição de fora.

## Sacar todo mês exige vender, ou escolher o título com juros

O Tesouro IPCA+ sem cupom paga no vencimento, em 15/08/2050, ou na venda. Sacar todo ano exige vender uma parte, no preço daquele dia. A taxa de 6,48% descreve quem fica até o vencimento. Na manhã de 09/10/2026, o preço de venda desse papel era R$ 1.046,60, e o de compra, R$ 1.076,35.

O título que deposita juros no caminho é o Tesouro IPCA+ com Juros Semestrais (NTN-B). O regulamento diz que ele paga a variação do IPCA mais os juros definidos na compra, em parcelas semestrais, e o principal no vencimento. O art. 7º do [Decreto nº 12.814/2026](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/decreto/d12814.htm) define a taxa de juros na emissão, pelo Ministro da Fazenda, calculada sobre o valor nominal atualizado pelo IPCA do mês anterior. O pagamento dos juros é semestral. O principal sai numa parcela, no vencimento.

A página do Tesouro Nacional separa dois números que o mercado mistura. A taxa real muda com o pregão. O cupom de juros, a remuneração periódica, está fixo em 6% ao ano. Na manhã de 09/10/2026, o Tesouro IPCA+ com Juros Semestrais de 15/08/2050 tinha taxa de compra de 6,52% ao ano e taxa de venda de 6,64% ao ano. O preço unitário de compra era R$ 4.539,30. O de venda, R$ 4.469,79. Os 6,52% são a taxa real daquela manhã. Os 6% são o cupom. O dinheiro que cai a cada seis meses é o cupom, calculado sobre o valor nominal atualizado, e o IR incide sobre esse pagamento.

No mesmo arquivo, as outras taxas de compra da manhã, para o título com juros semestrais, eram:

- vencimento em 15/08/2030: 6,66%
- vencimento em 15/08/2032: 6,64%
- vencimento em 15/05/2035: 6,65%
- vencimento em 15/05/2037: 6,66%
- vencimento em 15/08/2040: 6,55%
- vencimento em 15/05/2045: 6,53%
- vencimento em 15/08/2050: 6,52%
- vencimento em 15/05/2055: 6,47%
- vencimento em 15/08/2060: 6,47%

Os três patrimônios deste texto usam a taxa de 6,48% do título sem cupom. Eles respondem quanto precisa sobrar, em poder de compra, depois do IR. Eles não convertem o cupom de 6% num depósito mensal. Esse depósito depende do valor nominal atualizado de cada papel e da quantidade comprada pelo preço do dia.

## O limite de compra é R$ 2 milhões por mês

O regulamento do Tesouro Direto limita o investimento a R$ 2.000.000,00 por pessoa por mês, somando os títulos comprados no mês. Nos meses em que a pessoa já recebe resgate ou juros de títulos comprados antes no Tesouro Direto, o limite do mês soma esses valores aos R$ 2.000.000,00. A conta abaixo usa o teto simples, de quem ainda não tem esse acréscimo.

- R$ 1.236.836,29 cabem num mês.
- R$ 2.473.672,58 passam de um mês. Depois de R$ 2.000.000,00, faltam **R$ 473.672,58** para o mês seguinte.
- R$ 4.947.345,17 passam de dois meses de teto, que somam R$ 4.000.000,00. No terceiro mês faltam **R$ 947.345,17**.

## O simulador FIRE ainda não usa o IPCA+

O [simulador FIRE](/simulador-fire/) sorteia anos reais de 1995 a 2025. Ações e renda fixa saem do mesmo ano, já sem a inflação: Ibovespa e CDI. O retorno é bruto. A própria tela e a página de [fontes](/fontes/) registram que imposto, taxa e come-cotas ficam de fora, e que por isso o resultado é otimista. A renda fixa da simulação é o CDI. O Tesouro IPCA+ ainda está fora dela.

A taxa de retirada que vem na tela é 3,5%. O campo aceita outro número. A meta é o gasto do ano dividido por essa taxa. Com R$ 10.000,00 por mês, o gasto do ano é R$ 120.000,00. A 3,5%, a meta da tela fica em R$ 120.000,00 ÷ 0,035 = R$ 3.428.571,428..., em centavos **R$ 3.428.571,43**. A 4%, volta aos R$ 3.000.000,00 da regra dos 4%. O percentual de sucesso é a fração das simulações em que o dinheiro durou. A tela continua sem descontar os 15% deste texto.

Coloque idade, patrimônio, aporte e gasto no [simulador FIRE](/simulador-fire/). Para uma leitura mais perto do líquido, o IR de 15% sobre o rendimento nominal, a custódia de 0,2% e a taxa da corretora ainda precisam caber no plano. Os patrimônios de R$ 1.236.836,29, R$ 2.473.672,58 e R$ 4.947.345,17 valem para a manhã de 09/10/2026, para o título de 15/08/2050 e para uma inflação de 4,58% nesse ano de conta.

Este texto é educativo. Não é recomendação de investimento, nem consultoria financeira, jurídica ou tributária. A taxa de 09/10/2026 muda no pregão seguinte. A lei, o extrato do título e o preço do dia prevalecem. Para uma decisão de aposentadoria, converse com um profissional certificado.
