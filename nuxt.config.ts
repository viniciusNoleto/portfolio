// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  devtools: { enabled: true },

  modules: ['@vueuse/nuxt'],

  css: [
    'overlayscrollbars/overlayscrollbars.css',
    '~/assets/css/base.css',
    '~/assets/css/trail.css',
  ],

  app: {
    head: {
      // evita o piscar da barra nativa antes do OverlayScrollbars iniciar
      htmlAttrs: { 'lang': 'pt-BR', 'data-overlayscrollbars-initialize': '' },
      bodyAttrs: { 'data-overlayscrollbars-initialize': '' },
      link: [
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'preconnect', href: 'https://api.fontshare.com' },
        { rel: 'preconnect', href: 'https://cdn.fontshare.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://api.fontshare.com/v2/css?f[]=erode@400,401,500,600&display=swap' },
      ],
    },
  },
});
