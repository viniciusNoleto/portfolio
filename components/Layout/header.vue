<template>
  <section class="h-20">
    <header class="fixed center-flex backdrop-blur-md h-20 w-full shadow-md z-20">
      <span class="font-bold mr-4">
        {{ fps }}
      </span>

      <nav class="max-w-[60rem] w-full flex justify-between gap-12">
        <NuxtLink
          class="italic font-extrabold flex items-center text-primary-600"
          to="#"
        >
          <NuxtImg
            src="/images/logotipo.png"
            class="h-10"
          />
        </NuxtLink>
  
        <div class="flex gap-12">
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
                name: 'Histórico',
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
            :to="{ hash: link.to }"
            external
            class="leading-none font-semibold center-flex gap-1 transition-all underline decoration-transparent hover:decoration-primary-500"
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
  </section>
</template>

<script lang="ts" setup>

  const fps = useFps();

  const colorMode = useColorMode();

  function changeColorMode() {
    colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark';
  }

</script>
