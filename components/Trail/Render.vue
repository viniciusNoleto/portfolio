<template>
  <!-- switch vertical: em cima o motor ASCII, embaixo o 3D original -->
  <button
    type="button" role="switch" class="ascii-switch" :class="{ off: !ascii }"
    :aria-checked="ascii" :aria-label="t('render.label')" :title="ascii ? t('render.ascii') : t('render.plain')"
    @click="ascii = !ascii"
  >
    <span class="knob" />
  </button>
</template>

<script setup lang="ts">
  const { t } = useI18n();
  const { ascii } = useTrail();
</script>

<style scoped>
  .ascii-switch {
    position: relative;
    flex: none;
    width: 10px;
    height: 20px;
    padding: 0;
    border-radius: 999px;
    background: var(--glass-3);
    border: 1px solid var(--line);
    cursor: pointer;
    transition: background-color 160ms ease;
  }
  .ascii-switch:hover { background: var(--glass-2); }
  .ascii-switch:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  /* área de toque maior que o desenho */
  .ascii-switch::before { content: ''; position: absolute; inset: -8px -10px; }
  .knob {
    position: absolute;
    left: 1px;
    top: 1px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    transition: transform 200ms cubic-bezier(.3, .7, .2, 1), background-color 160ms ease;
  }
  .off .knob { transform: translateY(10px); background: var(--muted); }
  @media (prefers-reduced-motion: reduce) { .knob { transition: none; } }
</style>
