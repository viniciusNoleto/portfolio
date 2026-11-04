<template>
  <header class="trail-nav">
    <a class="mark" href="#inicio">Vinícius Nolêto</a>
    <nav aria-label="Seções">
      <a
        v-for="item in NAV" :key="item.anchor" :href="`#${item.anchor}`"
        :class="{ on: active === item.anchor }" :aria-current="active === item.anchor ? 'location' : undefined"
      >{{ item.label }}</a>
    </nav>
  </header>
</template>

<script setup lang="ts">
  import { NAV, NAV_GROUPS } from '~/common/data/journey';

  // A seção atual é a última cujo topo já passou do meio da tela.
  const active = ref('');
  let spots: { el: HTMLElement; anchor: string }[] = [];
  let raf = 0;

  function update() {
    raf = 0;
    const mid = window.innerHeight * 0.5;
    let cur = '';
    for (const s of spots) if (s.el.getBoundingClientRect().top <= mid) cur = s.anchor;
    // no fim da página o contato fica ativo mesmo que a sua faixa não chegue ao meio da tela
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = 'contato';
    active.value = cur;
  }

  const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
  useEventListener('scroll', schedule, { passive: true });
  useEventListener('resize', schedule);

  onMounted(() => {
    spots = [...document.querySelectorAll<HTMLElement>('.trail .spot[id]')]
      .map(el => ({ el, anchor: NAV_GROUPS[el.id] ?? '' }));
    update();
  });
  onBeforeUnmount(() => cancelAnimationFrame(raf));
</script>

<style scoped>
  .trail-nav {
    position: fixed;
    top: 10px;
    left: var(--m);
    right: var(--m);
    z-index: 5;
    height: var(--nav-h);
    padding: 0 10px 0 18px;
    display: flex;
    align-items: center;
    gap: 24px;
    background: var(--glass);
    -webkit-backdrop-filter: blur(16px) saturate(1.35);
    backdrop-filter: blur(16px) saturate(1.35);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    font-size: var(--step-small);
  }
  .mark { font-size: var(--step-body); font-weight: 600; text-decoration: none; margin-right: auto; }
  nav { display: flex; gap: 4px; }
  nav a {
    padding: 6px 10px;
    border-radius: var(--radius);
    text-decoration: none;
    color: var(--muted);
    transition: color 160ms ease, background-color 160ms ease;
  }
  nav a:hover { color: var(--ink); background: var(--glass-2); }
  nav a.on { color: var(--ink); background: var(--glass-3); }
  @media (max-width: 899px) { .trail-nav { display: none; } }
</style>
