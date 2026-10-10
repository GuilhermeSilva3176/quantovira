---
title: "Regra dos 4% funciona no Brasil? Taxa de retirada segura com juros reais e IR"
description: "A regra dos 4% veio de um estudo americano de 1994. A conta com o Tesouro IPCA+ de 09/10/2026 mostra o que o IR de 15% faz com o juro real."
date: 2026-10-10
updated: 2026-10-10
author: Equipe Quanto Vira
calculadora: simulador-fire
fontes:
  - nome: William P. Bengen, Determining Withdrawal Rates Using Historical Data (Journal of Financial Planning, outubro de 1994; reedição da FPA em março de 2004)
    url: https://www.financialplanningassociation.org/sites/default/files/2021-04/MAR04%20Determining%20Withdrawal%20Rates%20Using%20Historical%20Data.pdf
  - nome: Lei nº 11.033, de 21 de dezembro de 2004
    url: https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l11033.htm
  - nome: Tesouro Direto — regras, Imposto de Renda e taxa de custódia
    url: https://www.tesourodireto.com.br/sobre-o-tesouro/regras-e-regulamento
  - nome: Tesouro Transparente — taxas dos títulos ofertados pelo Tesouro Direto
    url: https://www.tesourotransparente.gov.br/temas/divida-publica-federal/tesouro-direto
  - nome: Tesouro Transparente — arquivo diário de preços e taxas (base 09/10/2026)
    url: https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/precotaxatesourodireto.csv
  - nome: Banco Central — ata da 281ª reunião do Copom, 15 e 16 de setembro de 2026
    url: https://www.bcb.gov.br/content/copom/atascopom/Copom281-not20260916281.pdf
  - nome: Banco Central — SGS 432, meta Selic definida pelo Copom
    url: https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json&dataInicial=01/09/2026&dataFinal=10/10/2026
  - nome: Banco Central — SGS 13522, IPCA acumulado em 12 meses
    url: https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados?formato=json&dataInicial=01/09/2026&dataFinal=01/09/2026
  - nome: Banco Central — SGS 433, IPCA variação mensal
    url: https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json&dataInicial=01/09/2026&dataFinal=01/09/2026
  - nome: IBGE — IPCA de setembro de 2026
    url: https://agenciadenoticias.ibge.gov.br/agencia-sala-de-imprensa/2013-agencia-de-noticias/releases/48246-ipca-fica-em-0-82-em-setembro
---

A regra dos 4% é um resultado de pesquisa sobre aposentadorias nos Estados Unidos, publicado em 1994. Ela fixa o saque do primeiro ano em 4% do patrimônio inicial e, nos anos seguintes, corrige esse valor pela inflação. No Brasil, esse saque ainda passa pelo juro real e pelo Imposto de Renda da renda fixa. As regras deste texto são as vigentes em 2026. Na página da [Lei nº 11.033/2004](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l11033.htm), a nota da Medida Provisória nº 1.303/2025 aparece com vigência encerrada. A tabela do art. 1º permanece a do texto da lei.

## O que o estudo de 1994 mediu

William P. Bengen publicou *Determining Withdrawal Rates Using Historical Data* no Journal of Financial Planning, em outubro de 1994. A Financial Planning Association reeditou o artigo em março de 2004. O PDF está no [site da associação](https://www.financialplanningassociation.org/sites/default/files/2021-04/MAR04%20Determining%20Withdrawal%20Rates%20Using%20Historical%20Data.pdf).

O estudo usa o histórico americano de ações, títulos do Tesouro e inflação desde 1926, no anuário de 1992 da Ibbotson Associates. A carteira da conclusão inicial tem metade em ações e metade em títulos do Tesouro de prazo intermediário, com rebalanceamento. O saque do primeiro ano é uma porcentagem do patrimônio daquele dia. Depois, o valor acompanha a inflação.

Para uma carteira que precisasse durar pelo menos 30 anos, Bengen concluiu que um saque inicial de 4% ficou de pé dentro daquele histórico. Em nenhum caso passado o dinheiro acabou antes de 33 anos, e na maior parte dos casos a carteira durou 50 anos ou mais. Um saque inicial de 4,25% poderia esgotar a carteira em 28 anos, se aquelas condições se repetissem. Saques iniciais de 3%, e também taxas até cerca de 3,5%, deixaram pelo menos 50 anos em todos os casos do estudo.

A orientação que ele registra é sacar no máximo 4% nos primeiros anos da aposentadoria, em especial para quem se aposenta aos 60 anos ou antes.

O mesmo texto parte de contas com imposto diferido. Bengen escreve que, numa conta tributável, a conclusão poderia ser outra. Os anos são os dos Estados Unidos. CDI, Ibovespa e a tabela brasileira de Imposto de Renda ficam de fora dessa pesquisa.

## R$ 6 mil por mês, a 4%, pedem R$ 1,8 milhão

O exemplo daqui usa um gasto de R$ 6.000,00 por mês. É o valor que já vem preenchido na tela do [simulador FIRE](/simulador-fire/). Doze meses somam R$ 72.000,00.

Pela regra dos 4%, o patrimônio inicial é o gasto do ano dividido por 0,04:

R$ 72.000,00 ÷ 0,04 = **R$ 1.800.000,00**.

O primeiro saque é R$ 72.000,00. Nos anos seguintes, a regra corrige os R$ 72.000,00 pela inflação. O estudo aceita que o principal diminua. O critério dele era o dinheiro durar pelo menos 30 anos nos cenários americanos.

O simulador abre com 3,5%. Com o mesmo gasto, a meta é R$ 72.000,00 ÷ 0,035 = R$ 2.057.142,857..., que em centavos fica **R$ 2.057.142,86**. A taxa de retirada é um campo da tela. Dá para trocar 3,5 por 4 e ver a meta ir a R$ 1.800.000,00.

## A Selic do dia é juro nominal

Em 10/10/2026, a meta da Selic na [série SGS 432](https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json&dataInicial=01/09/2026&dataFinal=10/10/2026) do Banco Central estava em 13,75% ao ano. A [ata da 281ª reunião do Copom](https://www.bcb.gov.br/content/copom/atascopom/Copom281-not20260916281.pdf), de 15 e 16 de setembro de 2026, registra a decisão de reduzir a taxa básica para 13,75% ao ano. Na mesma série, o valor é 14,00% até 16/09/2026 e 13,75% a partir de 17/09/2026.

O IPCA, índice de inflação medido pelo IBGE, subiu 0,82% em setembro de 2026. Em 12 meses, até setembro, ficou em 4,58%, como informa o [comunicado do IBGE](https://agenciadenoticias.ibge.gov.br/agencia-sala-de-imprensa/2013-agencia-de-noticias/releases/48246-ipca-fica-em-0-82-em-setembro). A [série SGS 433](https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json&dataInicial=01/09/2026&dataFinal=01/09/2026) traz o 0,82% do mês, e a [série SGS 13522](https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados?formato=json&dataInicial=01/09/2026&dataFinal=01/09/2026) traz os 4,58% acumulados em 12 meses, na data 01/09/2026.

Uma comparação entre esses dois números oficiais, feita neste texto, usa a conta (1 + Selic) ÷ (1 + IPCA) − 1:

1,1375 ÷ 1,0458 = 1,08768407.

A parte acima de 1 é 0,08768407, ou 8,768407%. Em duas casas decimais, como a Selic e o IPCA publicados, fica 8,77%. A conta junta a Selic de um dia com a inflação dos doze meses anteriores. Ela muda quando o Copom muda a meta ou quando sai um IPCA novo. O Imposto de Renda ainda entra por cima.

## O Tesouro IPCA+ escreve a taxa real na compra

O Tesouro IPCA+ (NTN-B Principal) paga a variação do IPCA mais uma taxa definida na compra. O pagamento é único, no vencimento. O [regulamento do Tesouro Direto](https://www.tesourodireto.com.br/sobre-o-tesouro/regras-e-regulamento) descreve esse título sem cupom semestral.

Na manhã de 09/10/2026, o [arquivo diário do Tesouro Transparente](https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/precotaxatesourodireto.csv) registrava, para o Tesouro IPCA+ com vencimento em 15/08/2050, taxa de compra de 6,48% ao ano e taxa de venda de 6,60% ao ano. O preço unitário de compra era R$ 1.076,35. O de venda, R$ 1.046,60. O conjunto de dados está na página do [Tesouro Transparente](https://www.tesourotransparente.gov.br/temas/divida-publica-federal/tesouro-direto), com atualização em 10/10/2026. A última data-base do arquivo é 09/10/2026.

A taxa de 6,48% vale para quem compra por aquele preço e permanece até 15/08/2050. A venda antes do vencimento usa o preço do dia. Naquela manhã, o preço de venda estava abaixo do preço de compra.

No mesmo arquivo e na mesma manhã, os outros Tesouro IPCA+ sem juros semestrais tinham estas taxas de compra:

- vencimento em 15/05/2029: 6,62%
- vencimento em 15/08/2032: 6,65%
- vencimento em 15/05/2035: 6,66%
- vencimento em 15/08/2040: 6,51%
- vencimento em 15/05/2045: 6,49%
- vencimento em 15/08/2050: 6,48%

O exemplo segue com 6,48%, o título de 2050.

## O IR de 15% incide sobre o rendimento inteiro

O art. 1º da Lei nº 11.033/2004 tributa na fonte os rendimentos das aplicações de renda fixa feitas a partir de 1º de janeiro de 2005:

- 22,5% até 180 dias
- 20% de 181 a 360 dias
- 17,5% de 361 a 720 dias
- 15% acima de 720 dias

O regulamento do Tesouro Direto aplica essa lógica ao rendimento no resgate antecipado, no cupom e no vencimento. O prazo conta da data de liquidação. O IOF entra em resgates com menos de 30 dias. O exemplo usa o último degrau, 15%, porque o prazo supera 720 dias.

O rendimento é o que se recebe acima do que se pagou. No IPCA+, esse valor reúne a correção pelo IPCA e a taxa de 6,48%.

A leitura abaixo é de um ano da taxa contratada, com inflação igual aos 4,58% já medidos até setembro de 2026. É o IPCA passado, colocado como inflação desse ano de conta. O título de verdade conta os dias úteis do contrato e o IPCA de cada mês. Os centavos de um papel comprado podem sair diferentes.

1,0648 × 1,0458 = 1,11356784.

O rendimento nominal bruto é 0,11356784, ou 11,356784%.

Sobre os R$ 1.800.000,00 da regra dos 4%:

1.800.000 × 0,11356784 = 204.422,112.

O ganho bruto do exemplo é R$ 204.422,11. Dentro dele, a correção de 4,58% sobre o principal é 1.800.000 × 0,0458 = **R$ 82.440,00**. O imposto alcança o ganho inteiro, correção incluída. A alíquota de 15% multiplica esse total:

204.422,112 × 15% = 30.663,3168.

O IR do exemplo é R$ 30.663,32. O ganho nominal depois do imposto é 204.422,112 − 30.663,3168 = 173.758,7952, ou R$ 173.758,80. Arredondar o ganho e o imposto antes de subtrair produz R$ 204.422,11 − R$ 30.663,32 = R$ 173.758,79. A lei fixa a alíquota. O centavo final depende da ordem do arredondamento.

Para voltar ao poder de compra do início, divide-se o saldo pela inflação do exemplo. O saldo nominal líquido é 1.800.000 + 173.758,7952 = 1.973.758,7952.

1.973.758,7952 ÷ 1,0458 = 1.887.319,55938.

Acima dos R$ 1.800.000,00 ficam 87.319,55938, em centavos **R$ 87.319,56**. Esse é o ganho real depois do IR. Em doze meses iguais, R$ 87.319,56 ÷ 12 = **R$ 7.276,63** por mês.

A taxa real líquida dessa conta é 87.319,55938 ÷ 1.800.000 = 0,048510866322, ou 4,8510866322%.

Um atalho multiplica 6,48% por (1 − 0,15) e chega a 5,508%. O exemplo chega a 4,851%. A distância aparece porque os 15% também alcançam a correção do IPCA, que está dentro do rendimento.

## Três patrimônios para o mesmo gasto de R$ 72 mil

O gasto anual é o mesmo, R$ 72.000,00. Cada patrimônio responde a uma pergunta.

- A regra dos 4% pede **R$ 1.800.000,00**. O saque do primeiro ano é 4% do patrimônio, e os anos seguintes corrigem esse saque pela inflação. No estudo, o principal pode cair.
- Quem quiser tirar os R$ 72.000,00 só do ganho real depois do IR, e manter o poder de compra do principal, precisa de R$ 72.000,00 ÷ 0,048510866322 = **R$ 1.484.203,55**, com a taxa deste exemplo.
- Quem dividir R$ 72.000,00 pelos 6,48% da tela, sem descontar o Imposto de Renda, chega a R$ 72.000,00 ÷ 0,0648 = **R$ 1.111.111,11**. Esse patrimônio cobre o gasto de R$ 72.000,00 quando os 6,48% são usados por inteiro, em poder de compra.

No patrimônio de R$ 1.800.000,00, o ganho real depois do IR no exemplo (R$ 87.319,56) fica acima dos R$ 72.000,00 da regra. Nesse ano de conta, com essa taxa e esse IPCA, os 4% cabem dentro do ganho real líquido. O principal, em poder de compra, ainda cresce.

A leitura é de um ano, um título e uma inflação já ocorrida. Bengen olhou décadas ruins, com ações e títulos americanos, e aceitou gastar o principal para o dinheiro durar 30 anos. Este texto deixa aquele teste no lugar dele. Aqui entra só a mordida do imposto brasileiro sobre uma taxa real contratada.

O Tesouro IPCA+ sem cupom paga no vencimento, em 15/08/2050, ou na venda. Sacar todo ano exige vender uma parte, no preço daquele dia. A taxa de 6,48% descreve quem fica até o vencimento.

## A custódia de 0,2% fica de fora do ganho

A B3 cobra taxa de custódia de 0,2% ao ano sobre o valor dos títulos, no Tesouro IPCA+, no Tesouro Prefixado e no Tesouro Selic. A isenção até R$ 10.000,00 por CPF vale para o Tesouro Selic. Em R$ 1.800.000,00, 0,2% são **R$ 3.600,00** no ano. Essa taxa ficou de fora do ganho real calculado acima. O dinheiro que sobra para o saque é menor por causa dela.

A instituição financeira pode cobrar outra taxa, anual ou por operação. O Tesouro Direto informa que esse valor é acordado com cada investidor. Como a alíquota muda de corretora para corretora, o exemplo deixa a taxa da instituição de fora.

## O simulador repete anos brasileiros, sem o imposto

O [simulador FIRE](/simulador-fire/) sorteia anos reais de 1995 a 2025. Ações e renda fixa saem do mesmo ano, já sem a inflação: Ibovespa e CDI. O retorno é bruto. A própria tela e a página de [fontes](/fontes/) registram que imposto, taxa e come-cotas ficam de fora, e que por isso o resultado é otimista. A renda fixa da simulação é o CDI. O Tesouro IPCA+ ainda está fora dela.

Uma simulação conta como sucesso quando a meta é atingida e o dinheiro dura até a idade final. A taxa de retirada que vem na tela é 3,5%. O campo aceita 4. O percentual de sucesso é a fração das simulações em que o dinheiro durou. A tela continua sem descontar os 15% deste texto.

## O salário e o lucro da empresa seguem outras regras

A taxa de retirada olha o gasto depois que o patrimônio já existe. O que dá para guardar por mês, enquanto a pessoa trabalha, muda entre CLT e PJ. A comparação de uma nota de R$ 10 mil com salário, 13º, férias, FGTS e INSS está em [Proposta de R$ 10 mil como PJ: quanto ela vale em CLT?](/artigos/proposta-pj-quanto-vale-em-clt/).

O Imposto de Renda do salário e do pró-labore, em 2026, tem redução até zerar na faixa de R$ 5.000,00. A conta está em [Isenção de IR até R$ 5 mil em 2026: o que muda para o CLT e para o PJ que recebe pró-labore](/artigos/isencao-ir-5-mil-2026-clt-pro-labore/). O rendimento do Tesouro deste exemplo segue na tabela regressiva, retido na fonte. A faixa de R$ 5.000,00 é a do rendimento do trabalho.

Quem pretende viver do lucro da própria empresa encontra a regra da [Lei nº 15.270/2025 sobre dividendos](/artigos/dividendos-lei-15270-pj/). Lucro distribuído e venda de Tesouro IPCA+ passam por contas separadas.

Coloque idade, patrimônio, aporte e gasto no [simulador FIRE](/simulador-fire/) e experimente a taxa de retirada em 4 e em 3,5. A meta muda na hora. Para uma leitura mais perto do líquido, o IR de 15% sobre o rendimento nominal, a custódia de 0,2% e a taxa da corretora ainda precisam caber no plano. A tela usa o retorno bruto.

Este texto é educativo. Não é recomendação de investimento, nem consultoria financeira, jurídica ou tributária. A taxa de 09/10/2026 muda no pregão seguinte. A lei, o extrato do título e o preço do dia prevalecem. Para uma decisão de aposentadoria, converse com um profissional certificado.
