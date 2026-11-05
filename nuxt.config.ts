// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  devtools: { enabled: true },

  modules: ['@vueuse/nuxt', '@nuxtjs/i18n'],

  // Três idiomas na mesma URL; a escolha fica num cookie e, na primeira visita, vem do navegador.
  // Rótulos da interface em i18n/locales/*.json; o conteúdo em common/data/content/*.ts.
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'pt',
    locales: [
      { code: 'pt', language: 'pt-BR', name: 'Português', file: 'pt.json' },
      { code: 'es', language: 'es-MX', name: 'Español', file: 'es.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    detectBrowserLanguage: { useCookie: true, cookieKey: 'lang', redirectOn: 'root', fallbackLocale: 'pt' },
    bundle: { optimizeTranslationDirective: false },
  },

  css: [
    'overlayscrollbars/overlayscrollbars.css',
    '~/assets/css/base.css',
    '~/assets/css/trail.css',
  ],

  app: {
    head: {
      // o atributo lang vem do idioma atual (app.vue); data-overlayscrollbars-initialize evita o piscar da barra nativa antes do OverlayScrollbars iniciar
      htmlAttrs: { 'data-overlayscrollbars-initialize': '' },
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
