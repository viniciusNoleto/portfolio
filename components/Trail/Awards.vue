<template>
  <TrailSpot id="premios">
    <div class="panel rise">
      <h2>Prêmios</h2>
      <p class="intro">Em Roraima, três primeiros lugares seguidos.</p>
      <ol class="cards">
        <li v-for="a in chronological" :key="a.event" class="card">
          <h3>{{ a.place }} no {{ a.event }}</h3>
          <p class="small">{{ a.project }}<TrailSep />{{ a.when }}<TrailSep />{{ a.by }}</p>
          <p>{{ a.text }}</p>
        </li>
      </ol>
      <p class="extra">
        Em 2024 voltei à Expoferr com o {{ AWARD_EXTRA.project }}. {{ AWARD_EXTRA.text }}
        <a :href="AWARD_EXTRA.href" target="_blank" rel="noopener">Ver no GitHub</a>
      </p>
    </div>
  </TrailSpot>
</template>

<script setup lang="ts">
  import { AWARD_EXTRA, AWARDS } from '~/common/data/journey';

  // AWARDS vem do mais novo ao mais antigo; na página e no mundo a ordem é a dos acontecimentos.
  const chronological = [...AWARDS].reverse();

  // No mundo, os troféus sobem um de cada vez nos pedestais ao lado do pódio (índices de AWARDS).
  const cur = useWorldPick('podium', AWARDS.length - 1);
  const { resume } = useIntervalFn(() => {
    cur.value = (cur.value + AWARDS.length - 1) % AWARDS.length;
  }, 3600, { immediate: false });

  onMounted(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) resume();
  });
</script>

<style scoped>
  .intro { margin-top: 12px; }
  .extra { margin-top: 14px; color: var(--muted); font-size: var(--step-small); }
  .extra a { color: var(--ink); }
</style>
