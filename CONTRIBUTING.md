# Como publicar um artigo

O site não usa IA para escrever nem para publicar. Um artigo é um arquivo markdown. A revisão acontece no pull request, no celular ou no computador. O GitHub Actions só transforma o markdown em HTML depois do merge.

## O que escrever

Crie `content/artigos/<slug>.md`. O slug é o nome do arquivo: letras minúsculas, números e hífen, como `quanto-guardar-por-mes.md`.

O topo do arquivo é YAML, entre `---`:

```yaml
title: "Título curto"
description: "Uma frase que também vai para o Google."
date: 2026-10-10
updated: 2026-10-10
author: Equipe Quanto Vira
calculadora: simulador-fire
fontes:
  - nome: Nome da fonte
    url: https://exemplo.gov.br/pagina
```

- `author` pode ficar de fora. O padrão é **Equipe Quanto Vira**.
- `calculadora` é uma destas: `simulador-fire`, `pj-vs-clt`, `ir-investimentos`.
- `fontes` lista de onde saiu cada número. Use a página oficial, não um blog.
- `updated` é a data da última revisão. Se faltar, vale a `date`.

O texto aceita parágrafos, `##` e `###`, listas, **negrito**, *itálico*, `código` e links. Não use imagem remota.

## Rascunho

`content/artigos/exemplo.md` está com `draft: true`. O build pula esse arquivo e não cria página. Enquanto o texto não estiver pronto, deixe a linha:

```yaml
draft: true
```

Apague essa linha só quando o artigo puder ir ao ar. Um rascunho incompleto não quebra o build; um artigo sem `draft` e sem título, data ou fonte quebra, de propósito.

## Do pull request ao ar

1. Abra um pull request que só adiciona ou edita o `.md` em `content/artigos/`.
2. O workflow **Verificar** roda o build e os testes. Espere o check verde.
3. Leia o markdown na aba Files do GitHub, inclusive no celular.
4. Faça merge em `main`.
5. O workflow **Publicar artigos** gera `/artigos/<slug>/`, a lista em `/artigos/`, o bloco "Artigos relacionados" na home e na calculadora citada, e atualiza o `sitemap.xml`. Ele commita esses arquivos de volta em `main`.

Não é preciso commitar o HTML no pull request. Quem gera a página é a Action, depois do merge.

## O que precisa estar ligado no GitHub

Em **Settings → Actions → General**:

- **Actions permissions:** permitir GitHub Actions neste repositório.
- **Workflow permissions:** *Read and write permissions*. Sem isso o `GITHUB_TOKEN` não consegue commitar as páginas geradas, mesmo com `contents: write` no workflow. O check **Verificar** só precisa de leitura.

Se `main` exigir pull request para todo push, a Action não consegue devolver o HTML. É preciso liberar o bypass para o `github-actions[bot]`, ou não aplicar essa trava a esse robô.

O workflow de publicação só dispara quando o push em `main` mexe em `content/**`, `scripts/**` ou no próprio `publicar.yml`. O commit gerado leva `[skip ci]` e não entra nesses caminhos, então ele não dispara de novo.
