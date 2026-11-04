<template>
  <TrailSpot id="palestras">
    <div class="panel rise">
      <h2>Palestras</h2>
      <div class="cards">
        <article v-for="t in TALKS" :key="t.title" class="card">
          <h3>{{ t.title }}</h3>
          <p class="small">{{ t.where }}</p>
          <p>{{ t.text }}</p>
        </article>
      </div>
    </div>
  </TrailSpot>
</template>

<script setup lang="ts">
  import { TALKS } from '~/common/data/journey';
</script>
