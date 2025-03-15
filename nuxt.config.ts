import { NoletoTheme } from "./themes/noleto";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  devtools: { enabled: true },

  router: {
    options: {
      scrollBehaviorType: 'smooth'
    }
  },

  colorMode: {
    classSuffix: '',
  },

  icon: {
    customCollections: [
      {
        prefix: 'noleto',
        dir: './assets/icons'
      },
    ],
  },

  css: [
    '~/assets/css/style.css',
    '~/assets/css/old.css',
  ],

  modules: [
    '@formkit/auto-animate/nuxt',
    '@primevue/nuxt-module',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxt/image',
    '@nuxt/icon',
  ],

  primevue: {
    options: {
      theme: {
        preset: NoletoTheme,
        options: {
          darkModeSelector: '.dark',
        }
      }
    },
    autoImport: false,
    components: { exclude: '*' },
    directives: {
      prefix: 'pv-', /* v-pv-directive */
      include: ['tooltip']
    },
  },
});