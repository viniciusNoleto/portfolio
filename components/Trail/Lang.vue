<template>
  <div class="lang" role="group" :aria-label="t('lang.label')">
    <button
      v-for="l in locales" :key="l.code" type="button" :class="{ on: locale === l.code }"
      :aria-pressed="locale === l.code" :aria-label="l.name" :title="l.name" :lang="l.language"
      @click="setLocale(l.code)"
    >
      <TrailFlag :code="l.code" />
    </button>
  </div>
</template>

<script setup lang="ts">
  // Troca de idioma: português (Brasil), espanhol (México) e inglês (Estados Unidos).
  const { locale, locales, setLocale, t } = useI18n();
</script>

<style scoped>
  .lang { display: flex; gap: 2px; }
  button {
    padding: 6px 7px;
    border-radius: var(--radius);
    opacity: 0.55;
    transition: opacity 160ms ease, background-color 160ms ease;
  }
  button:hover { opacity: 0.9; background: var(--glass-2); }
  button.on { opacity: 1; background: var(--glass-3); }
  button:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
</style>
