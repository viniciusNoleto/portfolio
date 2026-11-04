// Entrada dos painéis: cada `.rise` mostra os filhos em sequência quando entra na tela
// (as transições ficam em assets/css/trail.css, ativadas pela classe `rise-on` no <html>).
export function useRise() {
  let io: IntersectionObserver | null = null;

  onMounted(() => {
    if (!('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('rise-on');
    io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('in');
        io?.unobserve(e.target);
      }
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.rise').forEach(el => io!.observe(el));
  });

  onBeforeUnmount(() => io?.disconnect());
}
