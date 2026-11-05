// Conteúdo do portfólio.
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
export const CAREER = { codingSince: 2019, workingSince: 2022 };
export const yearsSince = (year: number, d: Date = new Date()) => d.getFullYear() - year;

export const LINKS = {
  linkedin: 'https://www.linkedin.com/in/vin%C3%ADcius-nol%C3%AAto-de-ara%C3%BAjo/',
  github: 'https://github.com/viniciusNoleto',
};

export const NAV = [
  { label: 'Formação', anchor: 'formacao' },
  { label: 'Trabalho', anchor: 'trabalho' },
  { label: 'Projetos', anchor: 'projetos' },
  { label: 'Prêmios', anchor: 'premios' },
  { label: 'Cursos', anchor: 'cursos' },
  { label: 'Palestras', anchor: 'palestras' },
  { label: 'Contato', anchor: 'contato' },
];

// Cada seção da página aponta para o item do cabeçalho que fica destacado enquanto ela está na tela.
export const NAV_GROUPS: Record<string, string> = {
  ...Object.fromEntries(NAV.map(n => [n.anchor, n.anchor])),
  ...Object.fromEntries(Array.from({ length: PROJECT_N }, (_, i) => [projectSectionId(i), 'projetos'])),
  'a3': 'trabalho',
  'mercado-eletronico': 'trabalho',
  'pier': 'contato',
};

export const EDUCATION = [
  {
    course: 'Pós em Engenharia de Software em IA Aplicada',
    school: 'UNIPDS',
    status: 'Em andamento',
    when: 'desde 2026',
    note: 'Como integrar IA a sistemas de verdade: modelos de linguagem, agentes, servidores MCP e as práticas de engenharia para levar isso à produção.',
  },
  {
    course: 'Engenharia de Software',
    school: 'Graduação',
    status: 'Em andamento',
    when: '',
    note: 'Arquitetura de software, processos de desenvolvimento, qualidade, testes e gestão de projetos.',
  },
  {
    course: 'Pós em Gestão na Cibersegurança Empresarial',
    school: 'Estácio',
    status: 'Concluída',
    when: '2026',
    note: 'Segurança da informação, LGPD e gestão de riscos, para decidir produto e código pensando na proteção dos dados.',
  },
  {
    course: 'Análise e Desenvolvimento de Sistemas',
    school: 'Estácio',
    status: 'Concluído',
    when: '',
    note: 'A base da programação: lógica, algoritmos, estruturas de dados, banco de dados e desenvolvimento web.',
  },
];

export const ITERAIMA = {
  company: 'Iteraima',
  role: 'Desenvolvedor Full Stack',
  period: 'ago/2022 – nov/2023',
  mode: 'Meio período, presencial em Boa Vista',
  // sobre o lugar e, separado, o resumo do que eu fiz
  about: 'Instituto de Terras e Colonização de Roraima, o órgão do governo do estado que regulariza e outorga os títulos de terra.',
  summary: 'Construí do zero o REGULARIZA, o sistema que conduz todo o processo de outorga: das planilhas soltas ao banco de dados e ao pagamento.',
  steps: [
    {
      name: 'Planilhas',
      text: 'Os dados estavam espalhados em dezenas de arquivos Excel e não havia banco de dados. Escrevi scripts em Python que leram, limparam e cruzaram tudo.',
    },
    {
      name: 'Banco',
      text: 'Modelei o banco do zero e migrei os registros das planilhas para ele, com os processos de outorga já relacionados aos lotes e aos requerentes.',
    },
    {
      name: 'Sistema',
      text: 'O REGULARIZA, em PHP e JavaScript, acompanha cada processo de outorga do pedido até o título.',
    },
    {
      name: 'Pagamento',
      text: 'Módulo financeiro integrado à API de PIX e boleto do Banco do Brasil para o pagamento das outorgas.',
    },
  ],
};

export const A3 = {
  company: 'A&3 Serviço de Tecnologia',
  mode: 'Tempo integral, presencial em Boa Vista',
  // Andares do prédio, de baixo para cima.
  floors: [
    {
      floor: 'Térreo',
      role: 'Estagiário',
      period: 'out/2023 – nov/2023',
      text: 'Entrei para o backend em PHP. O front-end não tinha ninguém dedicado; mostrei que sabia e passei a refatorá-lo. Foi aí que o Vue.js me pegou.',
    },
    {
      floor: '1º andar',
      role: 'Desenvolvedor Front-end Júnior',
      period: 'dez/2023 – jun/2024',
      text: 'Comecei um projeto do zero em Nuxt com design patterns, tipei a base com generics em TypeScript e adotei Tailwind nos componentes. Fiz o deploy sozinho e padronizei o ambiente de todo o setor com Docker.',
    },
    {
      floor: '2º andar',
      role: 'Desenvolvedor Front-end Pleno',
      period: 'jun/2024 – jul/2025',
      text: 'Liderei a equipe de front-end: treinei estagiários, distribuí tarefas e revisei código. Investi em arquitetura e documentação para que telas novas saíssem rápidas e seguras.',
    },
  ],
};

export const ME = {
  company: 'Mercado Eletrônico',
  role: 'Programador Full Stack Pleno',
  period: 'jul/2025 – hoje',
  mode: 'Tempo integral, remoto',
  about: 'Plataforma de compras e vendas entre empresas de grande porte, com clientes no Brasil, em Portugal, nos Estados Unidos e no México.',
  summary: 'Desenvolvo como full stack, com especialidade em Vue e Nuxt, cuidando da arquitetura do front-end e das funcionalidades com IA.',
  steps: [
    {
      name: 'Vue e Nuxt',
      text: 'A especialidade no front-end, com atuação full stack quando a entrega pede.',
    },
    {
      name: 'Arquitetura',
      text: 'Abstração, modularização e reutilização de código para soluções que crescem sem ficar difíceis de manter.',
    },
    {
      name: 'IA',
      text: 'Servidores MCP (Model Context Protocol) e funcionalidades de chat com IA integradas a aplicações corporativas.',
    },
    {
      name: 'Tech Talk',
      text: 'Apresentação interna sobre a arquitetura de comunicação do front-end com a API.',
    },
  ],
};

export type Project = {
  name: string;
  period: string;
  kind: string;
  stack: string;
  text: string;
  detail: string[];
  links?: { label: string; href: string }[];
};

export const PROJECTS: Project[] = [
  {
    name: 'White Label Stock',
    period: '2026',
    kind: 'Pessoal, open source',
    stack: 'Angular 22 SSR, Express, Laravel 13, PostgreSQL 16',
    text: 'Gestão de estoque white label: itens com receitas e montagem, pacotes de entrega, unidades, categorias e depósitos.',
    detail: [
      'Angular com signals, change detection sem zone e Signal Forms; o Express renderiza e faz proxy de /api para a API, sem CORS.',
      'API em Laravel com Controller, FormRequest, DTO e Action; mensagens em pt-BR, es-MX e en-US.',
      'Tokens opacos com rotação de refresh token; um token reaproveitado revoga a família inteira.',
      'Vitest e Playwright no front, Pest contra um PostgreSQL real na API.',
    ],
    links: [
      { label: 'Front no GitHub', href: 'https://github.com/viniciusNoleto/white-label-stock-web' },
      { label: 'API no GitHub', href: 'https://github.com/viniciusNoleto/white-label-stock-api' },
    ],
  },
  {
    name: 'Mocked Payment Gateway',
    period: 'set–nov/2026',
    kind: 'Pessoal, open source',
    stack: 'Nuxt 4, Nitro, PostgreSQL, Drizzle, Zod, Playwright',
    text: 'Um PSP Pix de mentira para testar integrações financeiras sem dinheiro real, inclusive quando tudo dá errado.',
    detail: [
      'Cobranças com BR Code, status, cancelamento, expiração e conciliação de Pix recebidos.',
      'Webhooks assinados com HMAC-SHA256, Idempotency-Key e retentativas com backoff.',
      'Simula 503, latência, falhas aleatórias e webhooks atrasados, duplicados ou perdidos.',
      'Transactional Outbox, SELECT FOR UPDATE com SKIP LOCKED e tempo real com pg_notify e SSE.',
    ],
    links: [{ label: 'GitHub', href: 'https://github.com/viniciusNoleto/mocked-payment-gateway' }],
  },
  {
    name: 'Storyweaver',
    period: 'jul/2026',
    kind: 'Pessoal, open source',
    stack: 'Next.js 16, React 19, PostgreSQL, Drizzle, SSE',
    text: 'Mesa de RPG com duas telas: o mestre vê tudo no notebook e o telão dos jogadores mostra só o que deve, em tempo real.',
    detail: [
      'Eventos por SSE; a API remove no servidor os números de vida e os personagens ocultos antes de enviar ao telão.',
      'Cartas animadas com moldura de vida interpolada em RGB, cristais de mana e seis condições com efeito próprio.',
      'Tabuleiro em divisões com arrastar e soltar, personagens salvos como molde e gerador de nomes.',
      'Testes com Vitest e Playwright.',
    ],
    links: [{ label: 'GitHub', href: 'https://github.com/viniciusNoleto/storyweaver' }],
  },
  {
    name: 'White Label Utility List',
    period: 'mai–out/2026',
    kind: 'Pessoal, open source',
    stack: 'Next.js 16, React 19, Mantine, Drizzle, PostgreSQL',
    text: 'Um sistema de listas que se adapta a qualquer caso: o administrador define o formato dos dados em tempo de execução, sem código novo e sem migração. Serve de inventário, cadastro de contatos, controle de ativos ou qualquer coisa tabular.',
    detail: [
      'Campos de texto, número, data, seleção ligada a listas internas reutilizáveis (com cor por item) e objetos com subcampos.',
      'Formulários, validação, filtros e colunas são gerados dessa configuração; a ordem de tudo se ajusta arrastando.',
      'Filtros combináveis guardados na URL e exportação para Excel do resultado filtrado.',
      'White label: nome, cores, logo e textos trocáveis, em pt-BR, es-MX e en-US.',
    ],
    links: [{ label: 'GitHub', href: 'https://github.com/viniciusNoleto/white-label-utility-list' }],
  },
  {
    name: 'Eventure',
    period: 'set–dez/2025',
    kind: 'Site público e painel administrativo',
    stack: 'Nuxt 3, TypeScript, Pinia, PrimeVue, Tailwind, i18n',
    text: 'Venda de ingressos e gestão de eventos. Fiz o site público e o painel administrativo.',
    detail: [
      'Site com SSR para SEO: eventos, grupos de eventos, organizadores e loja de produtos.',
      'Checkout com Pix e cartão, acompanhamento do pagamento e ingresso com QR Code para a entrada.',
      'Transferência de ingressos, afiliações, login com Google, Apple e Meta, em português, inglês e espanhol.',
      'Painel administrativo de eventos, grupos, organizadores e banners.',
    ],
  },
  {
    name: 'VestMentor',
    period: 'out/2024 – dez/2025',
    kind: 'Plataforma web',
    stack: 'Nuxt 3, TypeScript, Pinia, PrimeVue, Tailwind, Chart.js',
    text: 'Estudo para vestibular e ENEM: o aluno resolve questões, acompanha o aproveitamento por disciplina e organiza a rotina.',
    detail: [
      'Modo Zen: partidas montadas por filtros de categoria, disciplina e conteúdo, com a contagem de questões em tempo real.',
      'Simulados, revisões guiadas pelo desempenho, cronograma de estudos e metas diárias.',
      'Progresso com Chart.js: acertos, erros e média por disciplina.',
      'Cadastro de questões com editor rico (Quill), tour de boas-vindas (driver.js) e pagamento por Pix.',
    ],
  },
];

export const AWARDS = [
  {
    event: 'Hackatur 2024',
    place: '1º lugar',
    when: 'mai/2024',
    by: 'Sebrae, Salão Internacional de Turismo',
    project: 'Tourism Flow',
    text: 'Rotas turísticas como grafos sobrepostos: mapas OpenLayers que filtram roteiros de várias agências e montam o caminho de cada visitante. Fiz o front-end e o deploy com Docker.',
  },
  {
    event: 'Agrotech Expoferr 2023',
    place: '1º lugar',
    when: 'nov/2023',
    by: 'Sebrae e Governo de Roraima',
    project: 'Green Eye',
    text: 'Em 32 horas, uma API em Laravel ligada ao WhatsApp: o produtor manda a foto da planta e recebe a praga identificada pelo Google Vertex.',
  },
  {
    event: 'NASA Space Apps Boa Vista 2023',
    place: '1º lugar geral',
    when: 'out/2023',
    by: 'NASA e Prefeitura de Boa Vista',
    project: 'Safe Dive',
    text: 'Equipe In Water: protótipo de app para avaliar a qualidade da água, denunciar problemas e conscientizar sobre a extinção de animais aquáticos.',
  },
];

export type Book = {
  title: string;
  short: string;
  // símbolo da lombada e da capa, do assunto do livro
  mark: string;
  by: string;
  when: string;
  learned: string;
  used: string;
  tone: 'a' | 'b' | 'c' | 'd' | 'e';
  height: number;
};

// "O que aprendi" e "onde usei" ligam cada certificado ao trabalho e aos projetos do perfil.
export const BOOKS: Book[] = [
  {
    title: 'Angular — The Complete Guide',
    short: 'Angular',
    mark: '</>',
    by: 'Udemy, Maximilian Schwarzmüller',
    when: 'mai/2026',
    learned: 'Componentes standalone, signals, RxJS, formulários, rotas e SSR.',
    used: 'White Label Stock, em Angular 22 com signals e Signal Forms. Foi o ecossistema que faltava.',
    tone: 'a',
    height: 92,
  },
  {
    title: 'The Nuxt 3 Bootcamp',
    short: 'Nuxt 3',
    mark: '△',
    by: 'Udemy',
    when: 'dez/2025',
    learned: 'Renderização no servidor, rotas de servidor no Nitro, busca de dados e middlewares.',
    used: 'Mocked Payment Gateway, em Nuxt 4 com Nitro, e o dia a dia no Mercado Eletrônico.',
    tone: 'b',
    height: 84,
  },
  {
    title: 'Vue JS 3: Composition API',
    short: 'Vue 3',
    mark: 'V',
    by: 'Udemy, com Pinia, Firebase 9 e Vite',
    when: 'ago/2025',
    learned: 'Composables, stores em Pinia e a organização de projetos grandes em Vue 3.',
    used: 'No Mercado Eletrônico, onde Vue e Nuxt são a especialidade, e no VestMentor.',
    tone: 'c',
    height: 96,
  },
  {
    title: 'Desenvolvimento Web Avançado com Vue e Vuex',
    short: 'Vue avançado',
    mark: 'V²',
    by: 'Udemy',
    when: 'mar/2025',
    learned: 'Vue 2 e 3 lado a lado, Vuex e padrões para bases de código que precisam migrar.',
    used: 'Na liderança do front-end da A&3: revisão de código e arquitetura das telas.',
    tone: 'd',
    height: 88,
  },
  {
    title: 'Overview LGPD',
    short: 'LGPD',
    mark: '§',
    by: 'Mconsult Consultoria e Tecnologia',
    when: 'out/2024',
    learned: 'Dados pessoais, bases legais e as obrigações de quem trata dados.',
    used: 'Abriu o caminho para a pós em Gestão na Cibersegurança Empresarial.',
    tone: 'e',
    height: 70,
  },
  {
    title: 'Seminário Hackatur',
    short: 'Hackatur',
    mark: '★',
    by: 'Sebrae',
    when: 'abr/2024',
    learned: 'O turismo de Roraima: quem são as agências, os roteiros e os problemas de quem visita.',
    used: 'Um mês depois, o Tourism Flow venceu o Hackatur 2024.',
    tone: 'b',
    height: 74,
  },
  {
    title: 'Tailwind Completo',
    short: 'Tailwind',
    mark: '~',
    by: 'Udemy',
    when: 'abr/2024',
    learned: 'CSS utilitário, design tokens e componentes sem folhas de estilo soltas.',
    used: 'Adotado nos componentes da A&3 e em todos os projetos desde então.',
    tone: 'c',
    height: 80,
  },
  {
    title: 'TypeScript Completo',
    short: 'TypeScript',
    mark: 'T',
    by: 'Udemy',
    when: 'mar/2024',
    learned: 'Tipos avançados e, principalmente, generics.',
    used: 'A base tipada e reutilizável do projeto em Nuxt que comecei do zero na A&3.',
    tone: 'a',
    height: 94,
  },
  {
    title: 'JavaScript Completo',
    short: 'JavaScript',
    mark: '{ }',
    by: 'Udemy',
    when: 'mar/2024',
    learned: 'Os fundamentos da linguagem revistos com calma, do assíncrono aos módulos.',
    used: 'Em tudo: do REGULARIZA no Iteraima aos projetos de hoje.',
    tone: 'd',
    height: 86,
  },
  {
    title: 'Vue JS 2 Completo',
    short: 'Vue 2',
    mark: 'V',
    by: 'Udemy',
    when: 'mar/2024',
    learned: 'Options API, componentes e o ciclo de vida do Vue 2.',
    used: 'Na refatoração do front-end da A&3, onde começou o interesse por Vue.',
    tone: 'e',
    height: 78,
  },
];

export const TALKS = [
  {
    title: 'Arquitetura de Comunicação com API para Front-end',
    where: 'Tech Talk no Mercado Eletrônico',
    text: 'Rotas, camadas de abstração, chamadas HTTP padronizadas, estado e tratamento de erros no front-end.',
  },
  {
    title: 'Carreira em tecnologia',
    where: 'ITEM / CCTI Boa Vista',
    text: 'Para duas turmas do curso Capacitação em Desenvolvimento Full Stack, a convite de Virgílio Borges.',
  },
];
