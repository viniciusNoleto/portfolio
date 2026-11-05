import { REPOS } from '../journey';
import type { Content } from './types';

// US English
const en: Content = {
  education: [
    {
      course: 'Graduate Certificate in Software Engineering for Applied AI',
      school: 'UNIPDS',
      status: 'In progress',
      current: true,
      when: 'since 2026',
      note: 'How to bring AI into real systems: language models, agents, MCP servers and the engineering practices to take it to production.',
    },
    {
      course: 'Software Engineering',
      school: "Bachelor's degree",
      status: 'In progress',
      current: true,
      when: '',
      note: 'Software architecture, development processes, quality, testing and project management.',
    },
    {
      course: 'Graduate Certificate in Enterprise Cybersecurity Management',
      school: 'Estácio',
      status: 'Completed',
      current: false,
      when: '2026',
      note: "Information security, LGPD (Brazil's data protection law) and risk management, to make product and code decisions with data protection in mind.",
    },
    {
      course: 'Systems Analysis and Development',
      school: 'Estácio',
      status: 'Completed',
      current: false,
      when: '',
      note: 'The foundations of programming: logic, algorithms, data structures, databases and web development.',
    },
  ],

  iteraima: {
    company: 'Iteraima',
    role: 'Full Stack Developer',
    period: 'Aug 2022 – Nov 2023',
    mode: 'Part-time, on-site in Boa Vista',
    about: "Roraima's Land and Settlement Institute, the state government agency that regularizes land and grants land titles.",
    summary: 'I built REGULARIZA from scratch, the system that runs the whole land grant process: from scattered spreadsheets to the database and payment.',
    steps: [
      { name: 'Spreadsheets', text: 'The data was spread across dozens of Excel files and there was no database. I wrote Python scripts that read, cleaned and cross-referenced all of it.' },
      { name: 'Database', text: 'I designed the database from scratch and migrated the spreadsheet records into it, with each grant process already linked to its plots and applicants.' },
      { name: 'System', text: 'REGULARIZA, built in PHP and JavaScript, tracks each land grant process from the application to the title.' },
      { name: 'Payment', text: "A billing module integrated with Banco do Brasil's PIX and boleto API for paying the land grants." },
    ],
  },

  a3: {
    company: 'A&3 Serviço de Tecnologia',
    mode: 'Full-time, on-site in Boa Vista',
    floors: [
      { floor: 'Ground floor', role: 'Intern', period: 'Oct 2023 – Nov 2023', text: 'I joined for the PHP backend. Nobody was dedicated to the front-end; I showed I could handle it and started refactoring it. That is when Vue.js got me hooked.' },
      { floor: '1st floor', role: 'Junior Front-end Developer', period: 'Dec 2023 – Jun 2024', text: 'I started a Nuxt project from scratch with design patterns, typed the codebase with TypeScript generics and adopted Tailwind for the components. I handled the deploy on my own and standardized the whole team’s environment with Docker.' },
      { floor: '2nd floor', role: 'Mid-level Front-end Developer', period: 'Jun 2024 – Jul 2025', text: 'I led the front-end team: trained interns, assigned tasks and reviewed code. I invested in architecture and documentation so new screens shipped fast and safely.' },
    ],
  },

  me: {
    company: 'Mercado Eletrônico',
    role: 'Mid-level Full Stack Developer',
    period: 'Jul 2025 – present',
    mode: 'Full-time, remote',
    about: 'A B2B procurement and sales platform for large companies, with clients in Brazil, Portugal, the United States and Mexico.',
    summary: 'I work full stack, specializing in Vue and Nuxt, owning the front-end architecture and the AI features.',
    steps: [
      { name: 'Vue and Nuxt', text: 'My front-end specialty, working full stack whenever the delivery calls for it.' },
      { name: 'Architecture', text: 'Abstraction, modularization and code reuse for solutions that grow without becoming hard to maintain.' },
      { name: 'AI', text: 'MCP (Model Context Protocol) servers and AI chat features integrated into enterprise applications.' },
      { name: 'Tech Talk', text: 'An internal talk on the architecture of front-end communication with the API.' },
    ],
  },

  projects: [
    {
      name: 'White Label Stock',
      period: '2026',
      kind: 'Personal, open source',
      stack: 'Angular 22 SSR, Express, Laravel 13, PostgreSQL 16',
      text: 'White label inventory management: items with recipes and assembly, delivery bundles, units, categories and warehouses.',
      detail: [
        'Angular with signals, zoneless change detection and Signal Forms; Express renders the app and proxies /api to the API, no CORS.',
        'Laravel API with Controller, FormRequest, DTO and Action; messages in pt-BR, es-MX and en-US.',
        'Opaque tokens with refresh token rotation; a reused token revokes the whole family.',
        'Vitest and Playwright on the front end, Pest against a real PostgreSQL on the API.',
      ],
      links: [
        { label: 'Front end on GitHub', href: REPOS.stockWeb },
        { label: 'API on GitHub', href: REPOS.stockApi },
      ],
    },
    {
      name: 'Mocked Payment Gateway',
      period: 'Sep–Nov 2026',
      kind: 'Personal, open source',
      stack: 'Nuxt 4, Nitro, PostgreSQL, Drizzle, Zod, Playwright',
      text: 'A fake Pix PSP for testing payment integrations without real money, including when everything goes wrong.',
      detail: [
        'Charges with BR Code, status, cancellation, expiration and reconciliation of incoming Pix payments.',
        'Webhooks signed with HMAC-SHA256, Idempotency-Key and retries with backoff.',
        'Simulates 503s, latency, random failures and late, duplicated or lost webhooks.',
        'Transactional Outbox, SELECT FOR UPDATE with SKIP LOCKED and real-time updates with pg_notify and SSE.',
      ],
      links: [{ label: 'GitHub', href: REPOS.gateway }],
    },
    {
      name: 'Storyweaver',
      period: 'Jul 2026',
      kind: 'Personal, open source',
      stack: 'Next.js 16, React 19, PostgreSQL, Drizzle, SSE',
      text: "A two-screen tabletop RPG table: the game master sees everything on the laptop and the players' big screen shows only what it should, in real time.",
      detail: [
        'Events over SSE; the API strips hit points and hidden characters on the server before sending them to the big screen.',
        'Animated cards with an RGB-interpolated health frame, mana crystals and six conditions, each with its own effect.',
        'A drag-and-drop board split into areas, characters saved as templates and a name generator.',
        'Tests with Vitest and Playwright.',
      ],
      links: [{ label: 'GitHub', href: REPOS.storyweaver }],
    },
    {
      name: 'White Label Utility List',
      period: 'May–Oct 2026',
      kind: 'Personal, open source',
      stack: 'Next.js 16, React 19, Mantine, Drizzle, PostgreSQL',
      text: 'A list system that adapts to any use case: the admin defines the data shape at runtime, with no new code and no migrations. It works as an inventory, a contact directory, asset tracking or anything tabular.',
      detail: [
        'Text, number, date, select fields tied to reusable internal lists (with a color per item) and objects with subfields.',
        'Forms, validation, filters and columns are generated from that configuration; the order of everything is set by dragging.',
        'Combinable filters stored in the URL and Excel export of the filtered result.',
        'White label: swappable name, colors, logo and copy, in pt-BR, es-MX and en-US.',
      ],
      links: [{ label: 'GitHub', href: REPOS.utilityList }],
    },
    {
      name: 'Eventure',
      period: 'Sep–Dec 2025',
      kind: 'Public website and admin panel',
      stack: 'Nuxt 3, TypeScript, Pinia, PrimeVue, Tailwind, i18n',
      text: 'Ticket sales and event management. I built the public website and the admin panel.',
      detail: [
        'SSR website for SEO: events, event groups, organizers and a merch store.',
        'Checkout with Pix and card, payment tracking and QR code tickets for entry.',
        'Ticket transfers, affiliates, sign-in with Google, Apple and Meta, in Portuguese, English and Spanish.',
        'Admin panel for events, groups, organizers and banners.',
      ],
    },
    {
      name: 'VestMentor',
      period: 'Oct 2024 – Dec 2025',
      kind: 'Web platform',
      stack: 'Nuxt 3, TypeScript, Pinia, PrimeVue, Tailwind, Chart.js',
      text: "Prep for Brazil's college entrance exams and the ENEM: students solve questions, track their performance by subject and organize their routine.",
      detail: [
        'Zen Mode: sessions built from category, subject and topic filters, with a live question count.',
        'Mock exams, reviews driven by performance, a study schedule and daily goals.',
        'Progress with Chart.js: right and wrong answers and the average per subject.',
        'Question authoring with a rich text editor (Quill), a welcome tour (driver.js) and Pix payments.',
      ],
    },
  ],

  awards: [
    {
      event: 'Hackatur 2024',
      place: '1st place',
      when: 'May 2024',
      by: 'Sebrae, International Tourism Fair',
      project: 'Tourism Flow',
      text: "Tourist routes as overlapping graphs: OpenLayers maps that filter itineraries from several agencies and build each visitor's path. I built the front end and the Docker deploy.",
    },
    {
      event: 'Agrotech Expoferr 2023',
      place: '1st place',
      when: 'Nov 2023',
      by: 'Sebrae and the Government of Roraima',
      project: 'Green Eye',
      text: 'In 32 hours, a Laravel API connected to WhatsApp: the farmer sends a photo of the plant and gets back the pest identified by Google Vertex.',
    },
    {
      event: 'NASA Space Apps Boa Vista 2023',
      place: '1st place overall',
      when: 'Oct 2023',
      by: 'NASA and the City of Boa Vista',
      project: 'Safe Dive',
      text: 'Team In Water: an app prototype to assess water quality, report problems and raise awareness about the extinction of aquatic animals.',
    },
  ],

  books: [
    { title: 'Angular — The Complete Guide', short: 'Angular', by: 'Udemy, Maximilian Schwarzmüller', when: 'May 2026', learned: 'Standalone components, signals, RxJS, forms, routing and SSR.', used: 'White Label Stock, in Angular 22 with signals and Signal Forms. It was the missing ecosystem.' },
    { title: 'The Nuxt 3 Bootcamp', short: 'Nuxt 3', by: 'Udemy', when: 'Dec 2025', learned: 'Server-side rendering, Nitro server routes, data fetching and middleware.', used: 'Mocked Payment Gateway, in Nuxt 4 with Nitro, and day-to-day work at Mercado Eletrônico.' },
    { title: 'Vue JS 3: Composition API', short: 'Vue 3', by: 'Udemy, with Pinia, Firebase 9 and Vite', when: 'Aug 2025', learned: 'Composables, Pinia stores and organizing large Vue 3 projects.', used: 'At Mercado Eletrônico, where Vue and Nuxt are my specialty, and on VestMentor.' },
    { title: 'Advanced Web Development with Vue and Vuex', short: 'Advanced Vue', by: 'Udemy', when: 'Mar 2025', learned: 'Vue 2 and 3 side by side, Vuex and patterns for codebases that need to migrate.', used: 'Leading the front end at A&3: code review and screen architecture.' },
    { title: 'Overview LGPD', short: 'LGPD', by: 'Mconsult Consultoria e Tecnologia', when: 'Oct 2024', learned: "Personal data, legal bases and the duties of anyone handling data under Brazil's data protection law.", used: 'It paved the way to the graduate certificate in Enterprise Cybersecurity Management.' },
    { title: 'Hackatur Seminar', short: 'Hackatur', by: 'Sebrae', when: 'Apr 2024', learned: "Tourism in Roraima: who the agencies are, the itineraries and the problems visitors run into.", used: 'A month later, Tourism Flow won Hackatur 2024.' },
    { title: 'Complete Tailwind', short: 'Tailwind', by: 'Udemy', when: 'Apr 2024', learned: 'Utility-first CSS, design tokens and components without loose stylesheets.', used: 'Adopted in the A&3 components and in every project since.' },
    { title: 'Complete TypeScript', short: 'TypeScript', by: 'Udemy', when: 'Mar 2024', learned: 'Advanced types and, above all, generics.', used: 'The typed, reusable foundation of the Nuxt project I started from scratch at A&3.' },
    { title: 'Complete JavaScript', short: 'JavaScript', by: 'Udemy', when: 'Mar 2024', learned: 'The language fundamentals revisited carefully, from async to modules.', used: 'In everything: from REGULARIZA at Iteraima to the projects of today.' },
    { title: 'Complete Vue JS 2', short: 'Vue 2', by: 'Udemy', when: 'Mar 2024', learned: 'The Options API, components and the Vue 2 lifecycle.', used: 'In the A&3 front-end refactor, where my interest in Vue began.' },
  ],

  talks: [
    { title: 'API Communication Architecture for the Front End', where: 'Tech Talk at Mercado Eletrônico', text: 'Routes, abstraction layers, standardized HTTP calls, state and error handling on the front end.' },
    { title: 'Careers in tech', where: 'ITEM / CCTI Boa Vista', text: 'For two classes of the Full Stack Development Training course, at the invitation of Virgílio Borges.' },
  ],
};

export default en;
