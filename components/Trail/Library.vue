<template>
  <TrailSpot id="cursos">
    <div class="panel rise">
      <h2>Cursos</h2>
      <p class="intro">Arraste a estante para os lados e clique em um livro para ver a capa.</p>

      <div ref="shelf" class="shelf" :class="{ dragging }" role="list" aria-label="Cursos">
        <div v-for="(b, i) in BOOKS" :key="b.title" role="listitem" class="slot" :class="{ on: cur === i }">
          <button
            class="book" :class="`t-${b.tone}`" :style="{ '--h': `${b.height}%` }"
            :aria-pressed="cur === i" :aria-label="`${b.title}, ${b.when}`" draggable="false"
            @click="cur = i"
          >
            <span class="spine" aria-hidden="true">
              <span class="spine-mark">{{ b.mark }}</span>
              <span class="spine-title">{{ b.short }}</span>
              <span class="spine-year">{{ b.when.slice(-4) }}</span>
            </span>
            <!-- escolhido: o livro gira e mostra a capa, fechado -->
            <span class="cover" aria-hidden="true">
              <span class="cover-mark">{{ b.mark }}</span>
              <span class="cover-title">{{ b.short }}</span>
              <span class="cover-year">{{ b.when }}</span>
            </span>
          </button>
        </div>
      </div>

      <article class="card info" :class="`t-${book.tone}`" aria-live="polite">
        <h3>{{ book.title }}</h3>
        <p class="small">{{ book.by }}<TrailSep />{{ book.when }}</p>
        <dl>
          <dt>O que aprendi</dt>
          <dd>{{ book.learned }}</dd>
          <dt>Onde usei</dt>
          <dd>{{ book.used }}</dd>
        </dl>
      </article>
    </div>
  </TrailSpot>
</template>

<script setup lang="ts">
  import { BOOKS } from '~/common/data/journey';

  const cur = useWorldPick('library');
  const book = computed(() => BOOKS[cur.value]);

  // a estante rola arrastando; se arrastou, o clique de soltar não escolhe livro
  const shelf = ref<HTMLElement | null>(null);
  const dragging = useDragScroll(shelf);
</script>

<style scoped>
  .intro { margin-top: 12px; max-width: 46ch; color: var(--muted); font-size: var(--step-small); }

  .t-a { --tone: #7fb0f8; --deep: #1f3f73; }
  .t-b { --tone: #8fc9a4; --deep: #1f4d32; }
  .t-c { --tone: #e9c46a; --deep: #6a4a12; }
  .t-d { --tone: #e59a7c; --deep: #6e2b1a; }
  .t-e { --tone: #c9c2b4; --deep: #45403a; }

  /* a estante: lombadas em pé; a escolhida gira e mostra a capa */
  .shelf {
    margin-top: 16px;
    height: 200px;
    padding: 18px 12px 0;
    display: flex;
    align-items: flex-end;
    gap: 3px;
    overflow-x: auto;
    scrollbar-width: none;
    cursor: grab;
    touch-action: pan-y;
    user-select: none;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.32), rgba(0, 0, 0, 0.12));
    border-radius: var(--radius) var(--radius) 0 0;
    border-bottom: 10px solid #5b3b22;
  }
  .shelf::-webkit-scrollbar { display: none; }
  .shelf.dragging { cursor: grabbing; }
  .shelf.dragging .book { pointer-events: none; }
  .slot { flex: 0 0 auto; height: 100%; display: flex; align-items: flex-end; width: 34px; transition: width 520ms cubic-bezier(.2,.7,.2,1); }
  .slot.on { width: 116px; }

  .book {
    position: relative;
    width: 100%;
    height: var(--h);
    border-radius: 3px 3px 0 0;
    perspective: 700px;
    transition: transform 360ms cubic-bezier(.2,.7,.2,1), height 520ms cubic-bezier(.2,.7,.2,1);
  }
  .slot:not(.on) .book:hover { transform: translateY(-6px); }
  .slot.on .book { height: 92%; }

  .spine, .cover { position: absolute; inset: 0; border-radius: inherit; }
  .spine {
    transition: opacity 300ms ease;
    display: grid;
    grid-template-rows: auto 1fr auto;
    justify-items: center;
    padding: 6px 0;
    overflow: hidden;
    color: var(--deep);
    background:
      linear-gradient(180deg, var(--deep) 0 7px, transparent 7px calc(100% - 7px), var(--deep) calc(100% - 7px)),
      linear-gradient(90deg, rgba(0, 0, 0, 0.18), transparent 30%, rgba(255, 255, 255, 0.14) 60%, rgba(0, 0, 0, 0.16)),
      var(--tone);
  }
  .spine-mark { margin-top: 6px; font-size: 0.7rem; font-weight: 700; }
  .spine-title { writing-mode: vertical-rl; transform: rotate(180deg); font-weight: 700; font-size: 0.78rem; letter-spacing: 0.04em; text-transform: uppercase; white-space: nowrap; overflow: hidden; max-height: 100%; align-self: center; }
  .spine-year { margin-bottom: 6px; font-size: 0.62rem; font-weight: 600; }
  .slot.on .spine { opacity: 0; }

  /* capa: gira a partir da lombada (lado esquerdo) até ficar de frente */
  .cover {
    display: grid;
    grid-template-rows: 1fr auto auto;
    gap: 4px;
    padding: 12px 10px 10px 16px;
    text-align: left;
    color: #fbf7ee;
    border-radius: 3px 5px 0 0;
    opacity: 0;
    pointer-events: none;
    transform-origin: 0 50%;
    transform: rotateY(80deg);
    transition: transform 560ms cubic-bezier(.2,.7,.2,1), opacity 240ms ease;
    background:
      linear-gradient(90deg, rgba(0, 0, 0, 0.32) 0 6px, rgba(255, 255, 255, 0.16) 6px 8px, transparent 8px),
      radial-gradient(120% 70% at 70% 30%, rgba(255, 255, 255, 0.22), transparent 60%),
      linear-gradient(160deg, var(--tone), var(--deep));
    box-shadow: 0 10px 18px -10px rgba(0, 0, 0, 0.6);
  }
  .slot.on .cover { opacity: 1; transform: rotateY(0deg); }
  .cover-mark { align-self: center; justify-self: center; font-size: 1.9rem; font-weight: 700; line-height: 1; opacity: 0.9; }
  .cover-title { font-size: 0.95rem; font-weight: 600; line-height: 1.05; letter-spacing: -0.01em; }
  .cover-year { font-size: 0.62rem; opacity: 0.85; }

  /* informações do livro escolhido, logo abaixo da estante */
  .info { margin-top: 10px; border-left: 3px solid var(--tone); }
  .info dl { margin-top: 6px; display: grid; gap: 2px; font-size: var(--step-small); }
  .info dt { font-weight: 600; }
  .info dd { margin: 0 0 6px; }
  .info dd:last-child { margin-bottom: 0; }

  @media (max-width: 600px) {
    .shelf { height: 170px; }
    .slot { width: 30px; }
    .slot.on { width: 100px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .slot, .book, .spine, .cover { transition: none; }
  }
</style>
