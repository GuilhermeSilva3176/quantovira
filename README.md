# Quanto Vira (quantovira.com.br)
Calculadoras financeiras estáticas. Primeira ferramenta: `/simulador-fire/` (Monte Carlo com IPCA, CDI e Ibovespa de 1995 a 2025, dados em `data/historico.json`; respostas brutas das APIs em `data/raw/`).

- Testes: `npm test` (Node, sem dependências)
- Local: `python3 -m http.server 8080` na raiz e abrir http://localhost:8080/
- Deploy: GitHub Pages a partir da branch `main`, raiz `/`. O domínio está no arquivo `CNAME`.
- Chart.js 4.4.1 (licença MIT) vendorizado em `assets/chart.umd.min.js`.
