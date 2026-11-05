<template>
  <!-- Iteraima: o processo de outorga, etapa por etapa -->
  <TrailSpot id="trabalho">
    <div class="panel rise">
      <p class="kicker">{{ t('work.firstJob') }}<TrailSep />{{ ITERAIMA.period }}</p>
      <h2>{{ ITERAIMA.company }}</h2>
      <p class="role">{{ ITERAIMA.role }}<br><span class="muted">{{ ITERAIMA.mode }}</span></p>
      <p class="about">{{ ITERAIMA.about }}</p>
      <p class="label">{{ t('work.whatIDid') }}</p>
      <p class="summary">{{ ITERAIMA.summary }}</p>
      <ol class="cards">
        <li v-for="(s, i) in ITERAIMA.steps" :key="i" class="card">
          <h3>{{ s.name }}</h3>
          <p>{{ s.text }}</p>
        </li>
      </ol>
    </div>
  </TrailSpot>

  <!-- A&3: os três cargos, do mais recente ao primeiro -->
  <TrailSpot id="a3">
    <div class="panel rise">
      <p class="kicker">{{ t('work.grewMost') }}</p>
      <h2>{{ t('work.a3Title') }}</h2>
      <p class="role">{{ A3.company }}<br><span class="muted">{{ A3.mode }}</span></p>
      <ol class="cards">
        <li v-for="(f, i) in [...A3.floors].reverse()" :key="i" class="card">
          <h3>{{ f.role }}</h3>
          <p class="small">{{ f.period }}</p>
          <p>{{ f.text }}</p>
        </li>
      </ol>
    </div>
  </TrailSpot>

  <!-- Mercado Eletrônico -->
  <TrailSpot id="mercado-eletronico">
    <div class="panel rise">
      <p class="kicker">{{ t('work.today') }}<TrailSep />{{ ME.period }}</p>
      <h2>{{ ME.company }}</h2>
      <p class="role">{{ ME.role }}<br><span class="muted">{{ ME.mode }}</span></p>
      <p class="about">{{ ME.about }}</p>
      <p class="label">{{ t('work.whatIDo') }}</p>
      <p class="summary">{{ ME.summary }}</p>
      <ul class="cards">
        <li v-for="(s, i) in ME.steps" :key="i" class="card">
          <h3>{{ s.name }}</h3>
          <p>{{ s.text }}</p>
        </li>
      </ul>
    </div>
  </TrailSpot>
</template>

<script setup lang="ts">
  const { t } = useI18n();
  const journey = useJourney();
  const ITERAIMA = computed(() => journey.value.iteraima);
  const A3 = computed(() => journey.value.a3);
  const ME = computed(() => journey.value.me);
</script>

<style scoped>
  .role { margin-top: 12px; }
  /* sobre o lugar: separado, mais discreto, com um fio à esquerda */
  .about {
    margin-top: 12px;
    padding-left: 10px;
    border-left: 2px solid var(--line);
    color: var(--muted);
    font-size: var(--step-small);
    max-width: 52ch;
  }
  .label { margin-top: 18px; font-size: var(--step-small); font-weight: 600; letter-spacing: 0.02em; }
  .summary { margin-top: 4px; max-width: 48ch; }
</style>
