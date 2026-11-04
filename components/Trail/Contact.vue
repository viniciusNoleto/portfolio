<template>
  <TrailSpot id="contato">
    <!-- No fim da página o barco fica no meio da tela; a caixa fica logo abaixo dele, centralizada. -->
    <div class="center">
      <div class="panel rise find">
        <h3>Onde me encontrar</h3>
        <dl>
          <div><dt>LinkedIn</dt><dd><a :href="LINKS.linkedin" target="_blank" rel="noopener">Vinícius Nolêto de Araújo</a></dd></div>
          <div><dt>GitHub</dt><dd><a :href="LINKS.github" target="_blank" rel="noopener">viniciusNoleto</a></dd></div>
        </dl>
      </div>
    </div>
  </TrailSpot>
</template>

<script setup lang="ts">
  import { LINKS } from '~/common/data/journey';
</script>

<style scoped>
  .center { width: 100%; display: flex; justify-content: center; }
  .find { width: min(440px, 100%); }
  .find h3 { margin-bottom: 14px; }
  dl { display: grid; gap: 6px; font-size: var(--step-small); }
  dl div { display: grid; grid-template-columns: 5.5rem 1fr; gap: 10px; }
  dt { color: var(--muted); }
</style>
