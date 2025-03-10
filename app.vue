<template>
  <div>
    <NuxtLoadingIndicator :color="PRIMARY_COLOR" />

    <Header />

    <Main />
  </div>
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
