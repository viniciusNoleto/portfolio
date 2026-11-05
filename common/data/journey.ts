// Dados do portfólio que não mudam com o idioma.
// Os textos ficam em common/data/content/{pt,es,en}.ts (conteúdo) e i18n/locales/*.json (rótulos da interface).
// Fonte: perfil profissional (LinkedIn, lido em 03/11/2026) e os READMEs do GitHub.
// Cada seção corresponde a um lugar do mundo ASCII (lib/world/world.js e lib/world/layout.js).

import { PROJECT_N, projectSectionId } from '~/lib/world/layout.js';

// Data de nascimento: a idade é sempre calculada a partir dela, nunca fixa.
export const BIRTH = { year: 2001, month: 11, day: 23 };
export function ageOn(d: Date = new Date()) {
  const m = d.getMonth() + 1;
  const before = m < BIRTH.month || (m === BIRTH.month && d.getDate() < BIRTH.day);
  return d.getFullYear() - BIRTH.year - (before ? 1 : 0);
}

// Carreira: só os anos (sem mês). O tempo é sempre calculado a partir deles, nunca fixo.
export const CAREER = { codingSince: 2018, workingSince: 2022 };
export const yearsSince = (year: number, d: Date = new Date()) => d.getFullYear() - year;

export const LINKS = {
  linkedin: 'https://www.linkedin.com/in/vin%C3%ADcius-nol%C3%AAto-de-ara%C3%BAjo/',
  github: 'https://github.com/viniciusNoleto',
};

// Repositórios citados nos projetos
export const REPOS = {
  stockWeb: 'https://github.com/viniciusNoleto/white-label-stock-web',
  stockApi: 'https://github.com/viniciusNoleto/white-label-stock-api',
  gateway: 'https://github.com/viniciusNoleto/mocked-payment-gateway',
  storyweaver: 'https://github.com/viniciusNoleto/storyweaver',
  utilityList: 'https://github.com/viniciusNoleto/white-label-utility-list',
};

// Âncoras do cabeçalho; o rótulo de cada uma está em i18n/locales/*.json (nav.<âncora>).
export const NAV = ['formacao', 'trabalho', 'projetos', 'premios', 'cursos', 'palestras', 'contato'] as const;

// Cada seção da página aponta para o item do cabeçalho que fica destacado enquanto ela está na tela.
export const NAV_GROUPS: Record<string, string> = {
  ...Object.fromEntries(NAV.map(a => [a, a])),
  ...Object.fromEntries(Array.from({ length: PROJECT_N }, (_, i) => [projectSectionId(i), 'projetos'])),
  'a3': 'trabalho',
  'mercado-eletronico': 'trabalho',
  'pier': 'contato',
};

// Aparência de cada livro da estante, na mesma ordem de `books` no conteúdo.
export const BOOK_STYLE: { mark: string; tone: 'a' | 'b' | 'c' | 'd' | 'e'; height: number }[] = [
  { mark: '</>', tone: 'a', height: 92 }, // Angular
  { mark: '△', tone: 'b', height: 84 }, // Nuxt 3
  { mark: 'V', tone: 'c', height: 96 }, // Vue 3
  { mark: 'V²', tone: 'd', height: 88 }, // Vue avançado
  { mark: '§', tone: 'e', height: 70 }, // LGPD
  { mark: '★', tone: 'b', height: 74 }, // Hackatur
  { mark: '~', tone: 'c', height: 80 }, // Tailwind
  { mark: 'T', tone: 'a', height: 94 }, // TypeScript
  { mark: '{ }', tone: 'd', height: 86 }, // JavaScript
  { mark: 'V', tone: 'e', height: 78 }, // Vue 2
];
