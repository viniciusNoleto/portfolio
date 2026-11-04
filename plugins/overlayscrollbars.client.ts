import { OverlayScrollbars } from 'overlayscrollbars';

// Barra de rolagem da página desenhada por cima do conteúdo (não ocupa largura) e só com o polegar.
// Aplicada ao body, o window continua sendo o elemento que rola: window.scrollY, scrollTo e o
// evento 'scroll' do window seguem funcionando (Nav, World, âncoras).
export default defineNuxtPlugin(() => {
  OverlayScrollbars(document.body, {
    overflow: { x: 'hidden' },
    scrollbars: {
      theme: 'os-theme-thumb',
      autoHide: 'never',
      clickScroll: false,
    },
  });
});
