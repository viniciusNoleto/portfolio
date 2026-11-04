import type { InjectionKey, Ref } from 'vue';

// O que a página usa do mundo (lib/world/world.js → createWorld).
export type WorldApi = { select(key: string, idx: number): void };

type Trail = {
  failed: Ref<boolean>;
  attach(api: WorldApi): void;
  select(key: string, idx: number): void;
};

const TRAIL: InjectionKey<Trail> = Symbol('trail');

// Página: liga os painéis ao mundo. Os painéis escolhem coisas antes de o mundo carregar,
// então guardo a última escolha de cada lugar e repasso tudo quando ele fica pronto.
export function provideTrail() {
  const failed = ref(false);
  const picks: Record<string, number> = {};
  let world: WorldApi | null = null;

  const trail: Trail = {
    failed,
    attach(api) {
      world = api;
      for (const [key, idx] of Object.entries(picks)) api.select(key, idx);
    },
    select(key, idx) {
      picks[key] = idx;
      world?.select(key, idx);
    },
  };

  provide(TRAIL, trail);
  return trail;
}

export const useTrail = () => inject(TRAIL)!;

// Painel: o item escolhido de um lugar do mundo. Mudar o valor muda o mundo.
export function useWorldPick(key: string, initial = 0) {
  const trail = useTrail();
  const cur = ref(initial);
  watch(cur, idx => trail.select(key, idx), { immediate: true });
  return cur;
}
