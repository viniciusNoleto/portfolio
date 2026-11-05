import en from '~/common/data/content/en';
import es from '~/common/data/content/es';
import pt from '~/common/data/content/pt';
import type { Content } from '~/common/data/content/types';

const CONTENT: Record<string, Content> = { pt, es, en };

// Conteúdo do portfólio no idioma atual; muda junto com o idioma escolhido.
export function useJourney() {
  const { locale } = useI18n();
  return computed(() => CONTENT[locale.value] ?? pt);
}
