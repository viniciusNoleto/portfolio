<template>
  <TrailSpot id="palestras">
    <div class="panel rise">
      <h2>{{ t('nav.palestras') }}</h2>
      <div class="cards">
        <article v-for="(talk, i) in journey.talks" :key="i" class="card">
          <h3>{{ talk.title }}</h3>
          <p class="small">{{ talk.where }}</p>
          <p>{{ talk.text }}</p>
        </article>
      </div>
    </div>
  </TrailSpot>
</template>

<script setup lang="ts">
  const { t } = useI18n();
  const journey = useJourney();
</script>
