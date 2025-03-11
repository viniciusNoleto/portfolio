<template>
  <section class="flex flex-col relative min-h-screen overflow-x-hidden">
    <NuxtLoadingIndicator :color="PRIMARY_COLOR" />

    <LayoutHeader />

    <section class="flex flex-col gap-20">
      <LayoutMe id="me" />

      <div class="center-flex">
        <div class="h-px w-[80%] bg-gradient-to-r from-transparent via-gray-500/35 to-transparent"/>
      </div>
  
      <LayoutSkills id="skills" />
    </section>

    <StyleStainWrapper class="top-0 right-0">
      <StyleStainCore class="h-[175vh] from-primary-500/20" />
    </StyleStainWrapper>

    <StyleStainWrapper class="top-0 right-0">
      <StyleStainCore class="h-[100vh] from-blue-500/20" />
    </StyleStainWrapper>

    <!-- <Main /> -->

    <div
      class="h-[300vh]"
    />

  </section>
</template>

<script setup>

  import { PRIMARY_COLOR } from './shared/constants/colors';

  const APP_TITLE = "Vinícius Nolêto's portfolio";

  useHead({
    titleTemplate: (title) => title ? `${title} | ${APP_TITLE}` : APP_TITLE,
  });

  useSeoMeta({
    description: "Vinícius Nolêto de Araújo - Front-end Developer",
  });

</script>

<style lang="css" scoped>

</style>