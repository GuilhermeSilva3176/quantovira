# Quanto Vira (quantovira.com.br)
Calculadoras financeiras estáticas. Primeira ferramenta: `/simulador-fire/` (Monte Carlo com IPCA, CDI e Ibovespa de 1995 a 2025, dados em `data/historico.json`; respostas brutas das APIs em `data/raw/`).

- Testes: `npm test` (Node, sem dependências)
- Artigos: `npm run build:artigos` lê `content/artigos/*.md` e gera `/artigos/`. Arquivo com `draft: true` não é publicado.
- Local: `python3 -m http.server 8080` na raiz e abrir http://localhost:8080/
- Deploy: GitHub Pages a partir da branch `main`, raiz `/`. O domínio está no arquivo `CNAME`.
- Chart.js 4.4.1 (licença MIT) vendorizado em `assets/chart.umd.min.js`.

## Como publicar um artigo

O texto nasce num pull request, não numa IA. O passo a passo completo está em [CONTRIBUTING.md](CONTRIBUTING.md).

1. Crie `content/artigos/<slug>.md` com title, description, date, updated, author (padrão Equipe Quanto Vira), calculadora (`simulador-fire`, `pj-vs-clt` ou `ir-investimentos`) e fontes (`nome` + `url`).
2. Deixe `draft: true` enquanto for rascunho. O exemplo `content/artigos/exemplo.md` está assim e o build ignora.
3. Abra o pull request. O workflow **Verificar** roda o build e os testes.
4. Revise o markdown no GitHub, no celular se quiser, e faça merge em `main`.
5. O workflow **Publicar artigos** gera o HTML, a lista, o bloco "Artigos relacionados" e o sitemap, e commita de volta com `[skip ci]`.

Em **Settings → Actions → General**, a permissão dos workflows precisa ser **Read and write**. Sem isso a Action não grava as páginas geradas. Se `main` exigir pull request para todo push, libere o `github-actions[bot]`.
