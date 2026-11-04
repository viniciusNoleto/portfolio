<template>
  <TrailSpot id="inicio">
    <div class="panel rise hero">
      <p class="kicker">{{ age }} anos<TrailSep />Boa Vista, Roraima</p>
      <h1>Vinícius Nolêto</h1>
      <p class="lead">
        Engenheiro de software full stack, com especialidade em Vue e Nuxt e experiência do banco de dados à interface.
      </p>
      <div class="actions">
        <a class="btn" :href="LINKS.linkedin" target="_blank" rel="noopener">LinkedIn</a>
        <a :href="LINKS.github" target="_blank" rel="noopener">GitHub</a>
      </div>
      <dl class="facts">
        <div><dt>Hoje</dt><dd>Programador full stack pleno no Mercado Eletrônico, remoto</dd></div>
        <div><dt>Stack</dt><dd>Vue, Nuxt, React, Next, Angular, TypeScript, Laravel, Docker</dd></div>
        <div><dt>Estrada</dt><dd>Cerca de 4 anos de desenvolvimento, desde agosto de 2022</dd></div>
      </dl>
    </div>
  </TrailSpot>
</template>

<script setup lang="ts">
  import { LINKS, ageOn } from '~/common/data/journey';

  // calculada a partir da data de nascimento; recalculada no navegador para não ficar presa à data do build
  const age = ref(ageOn());
  onMounted(() => { age.value = ageOn(); });
</script>

<style scoped>
  .hero { margin-top: var(--nav-h); }
  h1 { font-size: clamp(2.5rem, 1.5rem + 3.2vw, 4.5rem); line-height: 0.92; letter-spacing: -0.035em; }
  .lead { margin-top: 18px; max-width: 34ch; }
  .actions { margin-top: 20px; display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
  .facts { margin-top: 24px; display: grid; gap: 8px; font-size: var(--step-small); }
  .facts div { display: grid; grid-template-columns: 5rem 1fr; gap: 14px; }
  .facts dt { color: var(--muted); }
  @media (max-width: 899px) { .hero { margin-top: 12px; } }
</style>
