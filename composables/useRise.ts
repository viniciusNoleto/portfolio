import type { Ref } from 'vue';

// Entrada dos painéis: cada `.rise` mostra os filhos em sequência quando entra na tela
// (as transições ficam em assets/css/trail.css, ativadas pela classe `rise-on` no <html>).
// Só começa a observar quando `when` fica verdadeiro, para a entrada acontecer depois do carregamento.
export function useRise(when: Ref<boolean> = ref(true)) {
  let io: IntersectionObserver | null = null;

  onMounted(() => {
    if (!('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('rise-on');
    watch(when, (on) => { if (on) start(); }, { immediate: true });
  });

  function start() {
    if (io) return;
    io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('in');
        io?.unobserve(e.target);
      }
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.rise').forEach(el => io!.observe(el));
  }

  onBeforeUnmount(() => io?.disconnect());
}
