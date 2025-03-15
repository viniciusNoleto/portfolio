<template>
  <section class="h-20">
    <header class="fixed center-flex backdrop-blur-md h-20 w-full shadow-md z-20">
      <nav class="max-w-[60rem] w-full flex justify-between gap-12 mx-6">
        <NuxtLink
          class="font-bold text-sm flex items-center text-primary-600"
          to="#"
        >
          <NuxtImg
            v-if="!exampleStore.name"
            src="/images/logotipo.png"
            class="h-10"
          />

          <span v-else>
            {{ exampleStore.name }}
          </span>
        </NuxtLink>
  
        <div class="hidden lg:flex gap-12">
          <NuxtLink
            v-for="link in [
              {
                name: 'Início',
                icon: 'uil-estate',
                to: '#me'
              },
              {
                name: 'Habilidades',
                icon: 'icon-park-outline:new-computer',
                to: '#skills'
              },
              {
                name: 'Qualificações',
                icon: 'mdi:clipboard-edit-outline',
                to: '#about'
              },
              {
                name: 'Contato',
                icon: 'uil-message',
                to: '#contact'
              }
            ]"
            :key="link.name"
            :to="link.to"
            class="leading-none font-semibold center-flex gap-1 transition-all text-sm underline decoration-transparent hover:decoration-primary-500"
          >
            <Icon :name="link.icon" />
            {{ link.name }}
          </NuxtLink>
        </div>
        
        <NoletoButton
          class="center-flex text-2xl cursor-pointer"
          @action="changeColorMode"
        >
          <Icon
            :name="colorMode.preference === 'light' ? 'line-md:sunny-outline' : 'line-md:moon-simple'"
          />
        </NoletoButton>
      </nav>
    </header>
  </section>
</template>

<script lang="ts" setup>

  // const fps = useFps();

  const colorMode = useColorMode();

  function changeColorMode() {
    colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark';
  }

  const exampleStore = useExampleStore();

</script>
