<template>
  <div class="trail" :class="{ 'no-world': failed }">
    <ClientOnly>
      <TrailWorld />
    </ClientOnly>

    <TrailNav />

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

  useSeoMeta({
    title: 'Vinícius Nolêto, engenheiro de software full stack',
    description: 'Portfólio de Vinícius Nolêto, engenheiro de software full stack em Boa Vista, Roraima: formação, trabalho, projetos, prêmios, cursos e palestras.',
    ogTitle: 'Vinícius Nolêto, engenheiro de software full stack',
    ogDescription: 'Vue, Nuxt, React, Next, Angular e Laravel. Uma caminhada por um mundo em ASCII, de casa até o rio.',
    themeColor: '#0a0d14',
  });
</script>
