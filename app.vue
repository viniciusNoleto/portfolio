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
    title: 'Vinícius Nolêto, desenvolvedor full stack',
    description: 'Portfólio de Vinícius Nolêto, desenvolvedor full stack em Boa Vista, Roraima: formação, trabalho, projetos, prêmios, cursos e palestras.',
    ogTitle: 'Vinícius Nolêto, desenvolvedor full stack',
    ogDescription: 'Desenvolvedor full stack em Boa Vista, Roraima, com especialidade em Vue e Nuxt. Também React, Next, Angular e Laravel.',
    themeColor: '#0a0d14',
  });
</script>
