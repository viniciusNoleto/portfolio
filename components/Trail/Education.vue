<template>
  <TrailSpot id="formacao">
    <div class="panel rise">
      <h2>{{ t('nav.formacao') }}</h2>
      <ul class="cards">
        <li
          v-for="(e, i) in journey.education" :key="i" class="card row" :class="{ on: cur === i }"
          @mouseenter="hover(i)" @mouseleave="hovering = false"
        >
          <span class="dot" :style="{ background: CAMPUS_TONES[i] }" aria-hidden="true" />
          <h3 class="course">{{ e.course }}</h3>
          <span class="status" :class="{ now: e.current }">{{ e.status }}<template v-if="e.when"><TrailSep />{{ e.when }}</template></span>
          <p class="school">{{ e.school }}</p>
          <p class="note">{{ e.note }}</p>
        </li>
      </ul>
    </div>
  </TrailSpot>
</template>

<script setup lang="ts">
  // as mesmas cores das paredes dos cômodos no prédio do campus
  import { CAMPUS_TONES } from '~/lib/world/layout.js';

  // No mundo, o cômodo de cada formação acende um de cada vez; passar o mouse numa caixa acende o dela.
  const { t } = useI18n();
  const journey = useJourney();
  const cur = useWorldPick('campus');
  const hovering = ref(false);
  function hover(i: number) {
    hovering.value = true;
    cur.value = i;
  }

  const { resume } = useIntervalFn(() => {
    if (!hovering.value) cur.value = (cur.value + 1) % journey.value.education.length;
  }, 4200, { immediate: false });

  onMounted(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) resume();
  });
</script>

<style scoped>
  .row {
    grid-template-columns: 12px 1fr auto;
    grid-template-areas: 'dot course status' 'dot school school' 'dot note note';
    gap: 2px 12px;
    align-items: center;
    border: 1px solid transparent;
    transition: background-color 160ms ease, border-color 160ms ease;
  }
  .row.on { background: var(--glass-3); border-color: rgba(255, 255, 255, 0.28); }
  .dot { grid-area: dot; width: 10px; height: 10px; border-radius: 3px; align-self: start; margin-top: 7px; }
  .course { grid-area: course; }
  .school { grid-area: school; color: var(--muted); }
  .status { grid-area: status; font-size: var(--step-small); color: var(--muted); white-space: nowrap; }
  .status.now { color: #9cc2ff; }
  .note { grid-area: note; margin-top: 4px; }
  @media (max-width: 520px) {
    .row { grid-template-columns: 12px 1fr; grid-template-areas: 'dot course' 'dot school' 'dot status' 'dot note'; }
  }
</style>
