<template>
  <div class="trail" :class="{ 'no-world': failed }">
    <ClientOnly>
      <TrailWorld />
    </ClientOnly>

    <TrailNav />
    <!-- no celular o cabeçalho some; a troca de idioma fica no topo da página -->
    <div class="lang-mobile"><TrailLang /></div>

    <main>
      <TrailHero />
      <TrailEducation />
      <TrailWork />
      <TrailProjects />
      <TrailAwards />
      <TrailLibrary />
      <TrailStage />
      <TrailSpot id="pier" />
      <TrailContact />
    </main>
  </div>
</template>

<script setup lang="ts">
  const { failed } = provideTrail();
  useRise();

  const { t, locale, locales } = useI18n();
  const language = computed(() => locales.value.find(l => l.code === locale.value)?.language ?? 'pt-BR');

  useHead({ htmlAttrs: { lang: language } });
  useSeoMeta({
    title: () => t('seo.title'),
    description: () => t('seo.description'),
    ogTitle: () => t('seo.title'),
    ogDescription: () => t('seo.ogDescription'),
    ogLocale: () => language.value.replace('-', '_'),
    themeColor: '#0a0d14',
  });
</script>

<style>
  .lang-mobile { display: none; }
  @media (max-width: 899px) {
    .lang-mobile {
      position: relative;
      z-index: 2;
      display: flex;
      justify-content: flex-end;
      padding: 12px var(--m) 0;
    }
    .lang-mobile .lang {
      background: var(--glass);
      -webkit-backdrop-filter: blur(16px) saturate(1.35);
      backdrop-filter: blur(16px) saturate(1.35);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 2px;
    }
  }
</style>
