<template>
  <section class="center-flex px-6">
    <section class="max-w-[60rem] flex items-center py-14 gap-8">
      <div class="flex flex-col gap-4">
        <NuxtLink
          v-for="link in [
            {
              to: 'https://www.instagram.com/noletovini/',
              icon: 'uil-instagram'
            },
            {
              to: 'https://github.com/viniciusNoleto',
              icon: 'uil-github-alt'
            },
            {
              to: 'https://www.linkedin.com/in/vin%C3%ADcius-nol%C3%AAto-de-ara%C3%BAjo/',
              icon: 'uil-linkedin-alt'
            },
          ]"
          :key="link.icon"
          :to="link.to"
          target="_blank"
          class="bg-primary-500 h-8 w-8 rounded-full center-flex text-white transition-all duration-500 group hover:bg-primary-500/10"
        >
          <Icon
            :name="link.icon"
            class="transition-all group-hover:scale-110 group-hover:text-primary-500"
          />
        </NuxtLink>
      </div>
  
      <div class="flex flex-col gap-3">
        <div class="flex flex-col">
          <span class="text-lg font-bold">
            Olá!<span class="shake">👋🏼</span>, me chamo Vinícius Nolêto.
          </span>
  
          <span class="font-medium">
            Eu sou
            <span
              id="typer"
              class="font-semibold"
            />
          </span>
        </div>
        
  
        <p class="home__description">
          Sou um desenvolvedor <i class="font-medium">web</i> com foco em <i class="font-medium">frontend</i> e experiência sólida em <i class="font-medium">backend</i>, utilizando <i class="font-medium underline decoration-2 decoration-emerald-400">Vue</i>, <i class="font-medium underline decoration-2 decoration-emerald-500">Nuxt</i> e <i class="font-medium underline decoration-2 decoration-blue-400">Tailwind</i> para criar interfaces eficientes e intuitivas. Minha abordagem de programação combina <u>programação funcional</u> e <u>orientação a objetos</u>, priorizando código bem estruturado e otimizado. Sempre em busca de conhecimento e novos desafios!
        </p>
  
        <NuxtLink
          to="#contact"
          class="bg-gradient-to-br from-primary-400 to-primary-700 hover:ring ring-primary-400/50 transition-all duration-500 text-white w-fit center-flex p-2.5 gap-1 rounded-lg leading-none"
        >
          Entre em contato
          <Icon name="uil-message" />
        </NuxtLink>
      </div>

      <div class="merge-childs">
        <div
          class="blob scale-110 bg-primary-500/50"
          style="animation-delay: 800ms"
        />
  
        <div
          class="blob scale-110 bg-primary-500/50"
          style="animation-delay: 200ms"
        />
  
        <div class="blob z-10">
          <NuxtImg src="/images/me.jpg" alt="Vinícius Nolêto Profile pick" />
        </div>
      </div>
    </section>
  </section>
</template>

<script lang="ts" setup>

  import Typed from 'typed.js';

  onMounted(() => {
    new Typed('#typer', {
      strings: [
        'um desenvolvedor web.',
        'um programador frontend.',
        'um entusiasta de tecnologia!',
      ],
      typeSpeed: 50,
      backSpeed: 50,
      backDelay: 1000,
      loop: true,
    });
  });

</script>

<style scoped>

  .shake {
    animation-name: shake-animation;
    animation-duration: 2.5s;
    animation-iteration-count: infinite;
    transform-origin: 70% 70%;
    display: inline-block;
  }

  @keyframes shake-animation {
    0% {
      transform: rotate(0.0deg)
    }

    10% {
      transform: rotate(14.0deg)
    }

    20% {
      transform: rotate(-8.0deg)
    }

    30% {
      transform: rotate(14.0deg)
    }

    40% {
      transform: rotate(-4.0deg)
    }

    50% {
      transform: rotate(10.0deg)
    }

    60% {
      transform: rotate(0.0deg)
    }

    100% {
      transform: rotate(0.0deg)
    }
  }

  .blob {
    width: 200px;
    height: 200px;
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
    overflow: hidden;
    animation-name: blob-morph;
    animation-duration: 3s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }

  @keyframes blob-morph {
    0%, 100% {
      border-radius: 40% 60% 70% 30% / 40% 40% 60% 50%;
    }
    34% {
      border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%;
    }
    67% {
      border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%;
    }
  }

</style>