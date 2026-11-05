# portfolio

Portfólio de Vinícius Nolêto: uma página só, em Nuxt, com o cenário em Three.js renderizado em ASCII.

```bash
npm install
npm run dev       # http://localhost:3005
npm run generate  # site estático em .output/public
```

## Estrutura

- `app.vue`: a página; liga os painéis ao mundo (`provideTrail`).
- `components/Trail/`: uma seção por componente; `Spot` é a faixa do mundo onde cada painel fica.
- `common/data/journey.ts`: todo o conteúdo (formação, trabalho, projetos, prêmios, cursos, palestras).
- `lib/world/layout.js`: posições compartilhadas entre a página e o mundo (seções, paradas, cores).
- `lib/world/world.js`: o mundo 3D renderizado em ASCII.
- `composables/`: contexto do mundo (`useTrail`), entrada dos painéis (`useRise`) e arrastar para rolar (`useDragScroll`).
- `assets/css/`: `base.css` (reset e barra de rolagem) e `trail.css` (tokens e classes dos painéis).
