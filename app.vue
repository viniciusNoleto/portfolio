<template>
  <div class="trail" :class="{ 'no-world': failed, loading: !ready }">
    <ClientOnly>
      <TrailWorld />
    </ClientOnly>

    <TrailNav />
    <TrailLoader />
    <!-- no celular o cabeçalho some; a troca de idioma fica no topo da página -->
    <div class="lang-mobile"><TrailRender v-if="!failed" /><TrailLang /></div>

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
  const { failed, ready } = provideTrail();
  useRise(ready);

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
  // sem JavaScript o mundo nunca carrega: as caixas aparecem direto e o indicador some
  useHead({ noscript: [{ innerHTML: '<style>.trail.loading main{opacity:1!important;visibility:visible!important}.trail .loader{display:none}</style>' }] });
</script>

<style>
  .lang-mobile { display: none; }
  @media (max-width: 899px) {
    .lang-mobile {
      position: relative;
      z-index: 2;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 14px;
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
