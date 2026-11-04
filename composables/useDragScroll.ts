import type { Ref } from 'vue';

// Arrastar para rolar na horizontal: segura, arrasta e solta. Se arrastou, o clique de soltar
// é engolido, para não escolher o item que estava embaixo do ponteiro.
export function useDragScroll(el: Ref<HTMLElement | null>) {
  const dragging = ref(false);
  let startX = 0, startLeft = 0, moved = 0, pid = -1;

  useEventListener(el, 'pointerdown', (e: PointerEvent) => {
    if (!el.value || (e.pointerType === 'mouse' && e.button !== 0)) return;
    pid = e.pointerId; startX = e.clientX; startLeft = el.value.scrollLeft; moved = 0;
  });

  useEventListener(el, 'pointermove', (e: PointerEvent) => {
    if (e.pointerId !== pid || !el.value) return;
    const dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    if (moved > 4 && !dragging.value) { dragging.value = true; el.value.setPointerCapture(pid); }
    if (dragging.value) el.value.scrollLeft = startLeft - dx;
  });

  useEventListener(el, ['pointerup', 'pointercancel'], (e: PointerEvent) => {
    if (e.pointerId !== pid) return;
    pid = -1;
    if (el.value?.hasPointerCapture(e.pointerId)) el.value.releasePointerCapture(e.pointerId);
    requestAnimationFrame(() => { dragging.value = false; });
  });

  useEventListener(el, 'click', (e: MouseEvent) => {
    if (moved <= 4) return;
    e.stopPropagation(); e.preventDefault(); moved = 0;
  }, { capture: true });

  return dragging;
}
