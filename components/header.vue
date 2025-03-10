<template>
  <header class="center-flex p-6 shadow">
    <nav class="w-[75%] flex justify-between">
      <NuxtLink
        class="italic font-extrabold"
        to="#"
      >
        &lt;Nolêto /&gt;
      </NuxtLink>

      <div class="flex gap-12">
        <NuxtLink
          v-for="link in [
            {
              name: 'Início',
              icon: 'uil-estate',
              to: '#home'
            },
            {
              name: 'Sobre',
              icon: 'uil-user',
              to: '#about'
            },
            {
              name: 'Habilidades',
              icon: 'uil-file',
              to: '#skills'
            },
            {
              name: 'Contato',
              icon: 'uil-message',
              to: '#contact'
            }
          ]"
          :key="link.name"
          :to="link.to"
          class="leading-none font-semibold center-flex gap-1"
        >
          <Icon :name="link.icon" />
          {{ link.name }}
        </NuxtLink>
      </div>
      
      <Button
        class="center-flex text-xl cursor-pointer"
        @click="changeColorMode"
      >
        <Icon
          :name="colorMode.preference === 'light' ? 'line-md:sunny-outline' : 'line-md:moon-simple'"
        />
      </Button>
    </nav>
  </header>
</template>

<script lang="ts" setup>

  const colorMode = useColorMode();

  function changeColorMode() {
    colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark';
  }

</script>
