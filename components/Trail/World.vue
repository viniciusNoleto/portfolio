<template>
  <div class="world" :class="{ ready }" aria-hidden="true">
    <canvas ref="canvas" />
  </div>
</template>

<script setup lang="ts">
  // Canvas fixo, tela cheia, com o mundo ASCII atrás de toda a página.
  // A rolagem vira um z do mundo: cada seção [data-z0] marca onde a sua faixa começa.
  // Se o conteúdo couber na faixa, a página e o cenário rolam exatamente juntos.
  import { END_Z, SIN_EL } from '~/lib/world/layout.js';

  const trail = useTrail();
  const canvas = ref<HTMLCanvasElement | null>(null);
  const ready = ref(false);

  let api: any = null;
  let marks: { y: number; z: number }[] = [];
  let lastSize = '';

  const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

  // Escala: px por unidade do mundo. No desktop o mundo cabe na largura; no celular aproxima.
  function scale() {
    const w = window.innerWidth;
    const wide = w >= 900;
    const k = wide ? clamp(w / 56, 16, 27) : w / 30;
    return { k, u: k * SIN_EL, wide };
  }

  function layout() {
    const { k, u, wide } = scale();
    const root = document.documentElement.style;
    root.setProperty('--u', `${u.toFixed(3)}px`);
    root.setProperty('--k', `${k.toFixed(3)}px`);
    if (!api) return;
    const w = window.innerWidth, h = window.innerHeight;
    if (`${w}x${h}` !== lastSize) {
      lastSize = `${w}x${h}`;
      api.resize(w, h, { k, cell: 3, wide });
    }
    requestAnimationFrame(measure);
  }

  function measure() {
    marks = [...document.querySelectorAll<HTMLElement>('[data-z0]')]
      .map(el => ({ y: el.getBoundingClientRect().top + window.scrollY, z: Number(el.dataset.z0) }))
      .sort((a, b) => a.z - b.z);
    // no fim da página o centro da tela é END_Z (o barco), seja qual for a altura do conteúdo
    const { u } = scale();
    const docH = document.documentElement.scrollHeight, half = window.innerHeight / 2;
    marks.push({ y: docH - half, z: END_Z }, { y: docH, z: END_Z + half / u });
    api?.setTopZ(zAt(half));
  }

  // z do mundo na altura c da página
  function zAt(c: number) {
    if (!marks.length) return 18;
    for (let i = 1; i < marks.length; i++) {
      const a = marks[i - 1], b = marks[i];
      if (c <= b.y || i === marks.length - 1) {
        const t = (c - a.y) / Math.max(1, b.y - a.y);
        return a.z + clamp(t, 0, 1.2) * (b.z - a.z);
      }
    }
    return END_Z;
  }

  // este componente só roda no navegador (<ClientOnly> em app.vue)
  useEventListener('resize', layout);
  useResizeObserver(document.body, layout);
  useEventListener(document, 'visibilitychange', () => api?.pause(document.hidden));

  onMounted(async () => {
    layout();
    if (!canvas.value || !document.createElement('canvas').getContext('webgl2')) {
      trail.failed.value = true;
      return;
    }
    try {
      const { createWorld } = await import('~/lib/world/world.js');
      const lite = window.innerWidth < 900 || (navigator.hardwareConcurrency || 8) <= 4 || location.search.includes('lite');
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      api = await createWorld(canvas.value, { lite, reduced });
      api.setZProvider(() => zAt(window.scrollY + window.innerHeight / 2));
      layout();
      measure();
      api.start();
      ready.value = true;
      trail.attach(api);
      // depuração: o mundo fica acessível no console e nas capturas automáticas
      (window as any).__trailWorld = api;
    } catch (e) {
      console.error(e);
      trail.failed.value = true;
    }
  });

  onBeforeUnmount(() => api?.dispose());
</script>

<style scoped>
  .world {
    position: fixed;
    inset: 0;
    z-index: 0;
    background: var(--bg);
    opacity: 0;
    transition: opacity 1.2s ease;
  }

  .world.ready { opacity: 1; }

  canvas {
    width: 100%;
    height: 100%;
  }
</style>
