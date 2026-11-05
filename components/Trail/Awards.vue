<template>
  <TrailSpot id="premios">
    <div class="panel rise">
      <h2>{{ t('nav.premios') }}</h2>
      <p class="intro">{{ t('awards.intro') }}</p>
      <ol class="cards">
        <li v-for="(a, i) in chronological" :key="i" class="card">
          <h3>{{ t('awards.heading', { place: a.place, event: a.event }) }}</h3>
          <p class="small">{{ a.project }}<TrailSep />{{ a.when }}<TrailSep />{{ a.by }}</p>
          <p>{{ a.text }}</p>
        </li>
      </ol>
    </div>
  </TrailSpot>
</template>

<script setup lang="ts">
  const { t } = useI18n();
  const journey = useJourney();

  // os prêmios vêm do mais novo ao mais antigo; na página e no mundo a ordem é a dos acontecimentos.
  const chronological = computed(() => [...journey.value.awards].reverse());

  // No mundo, os troféus sobem um de cada vez nos pedestais ao lado do pódio (índices de journey.awards).
  const n = journey.value.awards.length;
  const cur = useWorldPick('podium', n - 1);
  const { resume } = useIntervalFn(() => {
    cur.value = (cur.value + n - 1) % n;
  }, 3600, { immediate: false });

  onMounted(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) resume();
  });
</script>

<style scoped>
  .intro { margin-top: 12px; }
</style>
