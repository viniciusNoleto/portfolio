<template>
  <TrailSpot id="formacao">
    <div class="panel rise">
      <h2>Formação</h2>
      <ul class="cards">
        <li v-for="(e, i) in EDUCATION" :key="e.course">
          <button class="row" :aria-pressed="cur === i" @click="cur = i">
            <span class="dot" :style="{ background: CAMPUS_TONES[i] }" aria-hidden="true" />
            <span class="course">{{ e.course }}</span>
            <span class="school">{{ e.school }}</span>
            <span class="status" :class="{ now: e.status.startsWith('Em') }">{{ e.status }}<template v-if="e.when"><TrailSep />{{ e.when }}</template></span>
          </button>
        </li>
      </ul>
      <p class="card note" aria-live="polite">{{ EDUCATION[cur].note }}</p>
    </div>
  </TrailSpot>
</template>

<script setup lang="ts">
  import { EDUCATION } from '~/common/data/journey';
  // as mesmas cores das paredes dos cômodos no prédio do campus
  import { CAMPUS_TONES } from '~/lib/world/layout.js';

  const cur = useWorldPick('campus');
</script>

<style scoped>
  .row {
    width: 100%;
    display: grid;
    grid-template-columns: 12px 1fr auto;
    grid-template-areas: 'dot course status' 'dot school school';
    gap: 2px 12px;
    align-items: center;
    padding: var(--box-pad);
    color: var(--ink);
    text-align: left;
    background: var(--glass-2);
    border: 1px solid transparent;
    border-radius: var(--radius);
    transition: background-color 160ms ease, border-color 160ms ease;
  }
  .row:hover { background: var(--glass-3); }
  .row[aria-pressed='true'] { background: var(--glass-3); border-color: rgba(255, 255, 255, 0.28); }
  .dot { grid-area: dot; width: 10px; height: 10px; border-radius: 3px; align-self: start; margin-top: 7px; }
  .course { grid-area: course; line-height: 1.25; }
  .school { grid-area: school; color: var(--muted); font-size: var(--step-small); }
  .status { grid-area: status; font-size: var(--step-small); color: var(--muted); white-space: nowrap; }
  .status.now { color: #9cc2ff; }
  .note { margin-top: 8px; min-height: 4.2em; }
  @media (max-width: 520px) {
    .row { grid-template-columns: 12px 1fr; grid-template-areas: 'dot course' 'dot school' 'dot status'; }
  }
</style>
