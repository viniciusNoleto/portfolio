// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  devtools: { enabled: true },

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
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxt/image',
    '@nuxt/icon',
  ],
})