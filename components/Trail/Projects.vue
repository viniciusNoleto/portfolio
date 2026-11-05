<template>
  <TrailSpot v-for="(p, i) in PROJECTS" :id="projectSectionId(i)" :key="i">
    <article class="panel rise project" :style="{ '--theme': PROJECT_COLORS[i] }">
      <p class="kicker">{{ t('nav.projetos') }}<TrailSep /><span class="num">{{ pad(i + 1) }}/{{ pad(PROJECTS.length) }}</span></p>
      <h2>{{ p.name }}</h2>
      <p class="small meta">{{ p.period }}<TrailSep />{{ p.kind }}</p>
      <p class="text">{{ p.text }}</p>
      <p class="small stackline">{{ p.stack }}</p>
      <ul class="detail">
        <li v-for="d in p.detail" :key="d">{{ d }}</li>
      </ul>
      <p v-if="p.links?.length" class="links">
        <a v-for="l in p.links" :key="l.href" :href="l.href" target="_blank" rel="noopener">{{ l.label }}</a>
      </p>
    </article>
  </TrailSpot>
</template>

<script setup lang="ts">
  // a borda de cada caixa tem a cor do galpão do projeto no mundo
  import { PROJECT_COLORS, projectSectionId } from '~/lib/world/layout.js';

  const { t } = useI18n();
  const journey = useJourney();
  const PROJECTS = computed(() => journey.value.projects);

  const pad = (n: number) => String(n).padStart(2, '0');
</script>

<style scoped>
  .project { border-top: 3px solid var(--theme); }
  .num { color: var(--theme); font-weight: 600; }
  .meta { margin-top: 8px; }
  .text { margin-top: 14px; max-width: 46ch; }
  .stackline { margin-top: 12px; }
  .detail { margin-top: 10px; padding-left: 1.1em; display: grid; gap: 6px; font-size: var(--step-small); }
  .links { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 14px; }
</style>
