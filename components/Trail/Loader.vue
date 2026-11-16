<template>
  <!-- enquanto o mundo carrega: só o cabeçalho e este indicador no meio da tela -->
  <Transition name="loader">
    <div v-if="show" class="loader" role="status" aria-live="polite">
      <pre class="glyphs" aria-hidden="true">{{ frame }}</pre>
      <p class="label">{{ t('loading') }}</p>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  const { t } = useI18n();
  const { ready } = useTrail();
  const show = computed(() => !ready.value);

  // uma linha de caracteres ASCII que acende da esquerda para a direita, no tom do motor do mundo
  const RAMP = ' .:-=+*#%@';
  const W = 14;
  const tick = ref(0);
  const frame = computed(() => {
    let s = '';
    for (let i = 0; i < W; i++) {
      const d = (tick.value - i + W * 4) % (W + 6);
      s += RAMP[Math.max(0, RAMP.length - 1 - d)] ?? ' ';
    }
    return s;
  });

  let timer: ReturnType<typeof setInterval> | undefined;
  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { tick.value = W - 1; return; }
    timer = setInterval(() => { tick.value++; }, 70);
  });
  watch(ready, (r) => { if (r) clearInterval(timer); });
  onBeforeUnmount(() => clearInterval(timer));
</script>

<style scoped>
  .loader {
    position: fixed;
    inset: 0;
    z-index: 3;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 10px;
    pointer-events: none;
    color: var(--muted);
  }
  .glyphs {
    margin: 0;
    font-family: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
    font-size: 15px;
    letter-spacing: 0.18em;
    color: var(--accent);
  }
  .label { font-size: var(--step-small); letter-spacing: 0.02em; }

  .loader-leave-active { transition: opacity 600ms ease; }
  .loader-leave-to { opacity: 0; }
</style>
