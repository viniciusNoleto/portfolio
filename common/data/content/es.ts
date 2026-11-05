import { REPOS } from '../journey';
import type { Content } from './types';

// Español de México
const es: Content = {
  education: [
    {
      course: 'Posgrado en Ingeniería de Software en IA Aplicada',
      school: 'UNIPDS',
      status: 'En curso',
      current: true,
      when: 'desde 2026',
      note: 'Cómo integrar IA en sistemas reales: modelos de lenguaje, agentes, servidores MCP y las prácticas de ingeniería para llevarlo a producción.',
    },
    {
      course: 'Ingeniería de Software',
      school: 'Licenciatura',
      status: 'En curso',
      current: true,
      when: '',
      note: 'Arquitectura de software, procesos de desarrollo, calidad, pruebas y gestión de proyectos.',
    },
    {
      course: 'Posgrado en Gestión de la Ciberseguridad Empresarial',
      school: 'Estácio',
      status: 'Concluido',
      current: false,
      when: '2026',
      note: 'Seguridad de la información, LGPD (la ley brasileña de protección de datos) y gestión de riesgos, para decidir producto y código pensando en la protección de los datos.',
    },
    {
      course: 'Análisis y Desarrollo de Sistemas',
      school: 'Estácio',
      status: 'Concluido',
      current: false,
      when: '',
      note: 'La base de la programación: lógica, algoritmos, estructuras de datos, bases de datos y desarrollo web.',
    },
  ],

  iteraima: {
    company: 'Iteraima',
    role: 'Desarrollador Full Stack',
    period: 'ago/2022 – nov/2023',
    mode: 'Medio tiempo, presencial en Boa Vista',
    about: 'Instituto de Tierras y Colonización de Roraima, el organismo del gobierno estatal que regulariza y otorga los títulos de propiedad de la tierra.',
    summary: 'Construí desde cero REGULARIZA, el sistema que conduce todo el proceso de otorgamiento: de las hojas de cálculo sueltas a la base de datos y al pago.',
    steps: [
      { name: 'Hojas de cálculo', text: 'Los datos estaban dispersos en decenas de archivos de Excel y no había base de datos. Escribí scripts en Python que los leyeron, limpiaron y cruzaron.' },
      { name: 'Base de datos', text: 'Modelé la base desde cero y migré a ella los registros de las hojas de cálculo, con los procesos de otorgamiento ya relacionados con los lotes y los solicitantes.' },
      { name: 'Sistema', text: 'REGULARIZA, en PHP y JavaScript, da seguimiento a cada proceso de otorgamiento, desde la solicitud hasta el título.' },
      { name: 'Pago', text: 'Módulo financiero integrado a la API de PIX y boleto del Banco do Brasil para el pago de los otorgamientos.' },
    ],
  },

  a3: {
    company: 'A&3 Serviço de Tecnologia',
    mode: 'Tiempo completo, presencial en Boa Vista',
    floors: [
      { floor: 'Planta baja', role: 'Becario', period: 'oct/2023 – nov/2023', text: 'Entré para el backend en PHP. El front-end no tenía a nadie dedicado; demostré que sabía y empecé a refactorizarlo. Ahí fue donde Vue.js me atrapó.' },
      { floor: '1er piso', role: 'Desarrollador Front-end Junior', period: 'dic/2023 – jun/2024', text: 'Empecé un proyecto desde cero en Nuxt con design patterns, tipé la base con generics en TypeScript y adopté Tailwind en los componentes. Hice el deploy por mi cuenta y estandaricé el entorno de todo el equipo con Docker.' },
      { floor: '2º piso', role: 'Desarrollador Front-end Semi Senior', period: 'jun/2024 – jul/2025', text: 'Lideré el equipo de front-end: capacité a becarios, repartí tareas y revisé código. Invertí en arquitectura y documentación para que las pantallas nuevas salieran rápidas y seguras.' },
    ],
  },

  me: {
    company: 'Mercado Eletrônico',
    role: 'Programador Full Stack Semi Senior',
    period: 'jul/2025 – hoy',
    mode: 'Tiempo completo, remoto',
    about: 'Plataforma de compras y ventas entre grandes empresas, con clientes en Brasil, Portugal, Estados Unidos y México.',
    summary: 'Desarrollo como full stack, con especialidad en Vue y Nuxt, a cargo de la arquitectura del front-end y de las funcionalidades con IA.',
    steps: [
      { name: 'Vue y Nuxt', text: 'La especialidad en el front-end, con trabajo full stack cuando la entrega lo pide.' },
      { name: 'Arquitectura', text: 'Abstracción, modularización y reutilización de código para soluciones que crecen sin volverse difíciles de mantener.' },
      { name: 'IA', text: 'Servidores MCP (Model Context Protocol) y funcionalidades de chat con IA integradas a aplicaciones corporativas.' },
      { name: 'Tech Talk', text: 'Presentación interna sobre la arquitectura de comunicación del front-end con la API.' },
    ],
  },

  projects: [
    {
      name: 'White Label Stock',
      period: '2026',
      kind: 'Personal, open source',
      stack: 'Angular 22 SSR, Express, Laravel 13, PostgreSQL 16',
      text: 'Gestión de inventario white label: artículos con recetas y ensamblaje, paquetes de entrega, unidades, categorías y almacenes.',
      detail: [
        'Angular con signals, change detection sin zone y Signal Forms; Express renderiza y hace proxy de /api hacia la API, sin CORS.',
        'API en Laravel con Controller, FormRequest, DTO y Action; mensajes en pt-BR, es-MX y en-US.',
        'Tokens opacos con rotación del refresh token; un token reutilizado revoca a toda la familia.',
        'Vitest y Playwright en el front, Pest contra un PostgreSQL real en la API.',
      ],
      links: [
        { label: 'Front en GitHub', href: REPOS.stockWeb },
        { label: 'API en GitHub', href: REPOS.stockApi },
      ],
    },
    {
      name: 'Mocked Payment Gateway',
      period: 'sep–nov/2026',
      kind: 'Personal, open source',
      stack: 'Nuxt 4, Nitro, PostgreSQL, Drizzle, Zod, Playwright',
      text: 'Un PSP de Pix de mentira para probar integraciones financieras sin dinero real, incluso cuando todo sale mal.',
      detail: [
        'Cobros con BR Code, estado, cancelación, expiración y conciliación de Pix recibidos.',
        'Webhooks firmados con HMAC-SHA256, Idempotency-Key y reintentos con backoff.',
        'Simula 503, latencia, fallas aleatorias y webhooks retrasados, duplicados o perdidos.',
        'Transactional Outbox, SELECT FOR UPDATE con SKIP LOCKED y tiempo real con pg_notify y SSE.',
      ],
      links: [{ label: 'GitHub', href: REPOS.gateway }],
    },
    {
      name: 'Storyweaver',
      period: 'jul/2026',
      kind: 'Personal, open source',
      stack: 'Next.js 16, React 19, PostgreSQL, Drizzle, SSE',
      text: 'Mesa de rol con dos pantallas: el máster ve todo en la laptop y la pantalla de los jugadores muestra solo lo que debe, en tiempo real.',
      detail: [
        'Eventos por SSE; la API quita en el servidor los puntos de vida y los personajes ocultos antes de enviarlos a la pantalla.',
        'Cartas animadas con marco de vida interpolado en RGB, cristales de maná y seis condiciones con efecto propio.',
        'Tablero en divisiones con arrastrar y soltar, personajes guardados como plantilla y generador de nombres.',
        'Pruebas con Vitest y Playwright.',
      ],
      links: [{ label: 'GitHub', href: REPOS.storyweaver }],
    },
    {
      name: 'White Label Utility List',
      period: 'may–oct/2026',
      kind: 'Personal, open source',
      stack: 'Next.js 16, React 19, Mantine, Drizzle, PostgreSQL',
      text: 'Un sistema de listas que se adapta a cualquier caso: el administrador define el formato de los datos en tiempo de ejecución, sin código nuevo y sin migraciones. Sirve como inventario, directorio de contactos, control de activos o cualquier cosa tabular.',
      detail: [
        'Campos de texto, número, fecha, selección ligada a listas internas reutilizables (con color por elemento) y objetos con subcampos.',
        'Formularios, validación, filtros y columnas se generan a partir de esa configuración; el orden de todo se ajusta arrastrando.',
        'Filtros combinables guardados en la URL y exportación a Excel del resultado filtrado.',
        'White label: nombre, colores, logo y textos intercambiables, en pt-BR, es-MX y en-US.',
      ],
      links: [{ label: 'GitHub', href: REPOS.utilityList }],
    },
    {
      name: 'Eventure',
      period: 'sep–dic/2025',
      kind: 'Sitio público y panel administrativo',
      stack: 'Nuxt 3, TypeScript, Pinia, PrimeVue, Tailwind, i18n',
      text: 'Venta de boletos y gestión de eventos. Hice el sitio público y el panel administrativo.',
      detail: [
        'Sitio con SSR para SEO: eventos, grupos de eventos, organizadores y tienda de productos.',
        'Checkout con Pix y tarjeta, seguimiento del pago y boleto con código QR para la entrada.',
        'Transferencia de boletos, afiliaciones, inicio de sesión con Google, Apple y Meta, en portugués, inglés y español.',
        'Panel administrativo de eventos, grupos, organizadores y banners.',
      ],
    },
    {
      name: 'VestMentor',
      period: 'oct/2024 – dic/2025',
      kind: 'Plataforma web',
      stack: 'Nuxt 3, TypeScript, Pinia, PrimeVue, Tailwind, Chart.js',
      text: 'Estudio para el examen de admisión y el ENEM: el alumno resuelve preguntas, sigue su rendimiento por materia y organiza su rutina.',
      detail: [
        'Modo Zen: partidas armadas con filtros de categoría, materia y contenido, con el conteo de preguntas en tiempo real.',
        'Simulacros, repasos guiados por el desempeño, calendario de estudio y metas diarias.',
        'Progreso con Chart.js: aciertos, errores y promedio por materia.',
        'Registro de preguntas con editor enriquecido (Quill), tour de bienvenida (driver.js) y pago con Pix.',
      ],
    },
  ],

  awards: [
    {
      event: 'Hackatur 2024',
      place: '1er lugar',
      when: 'may/2024',
      by: 'Sebrae, Salón Internacional de Turismo',
      project: 'Tourism Flow',
      text: 'Rutas turísticas como grafos superpuestos: mapas OpenLayers que filtran itinerarios de varias agencias y arman el camino de cada visitante. Hice el front-end y el deploy con Docker.',
    },
    {
      event: 'Agrotech Expoferr 2023',
      place: '1er lugar',
      when: 'nov/2023',
      by: 'Sebrae y Gobierno de Roraima',
      project: 'Green Eye',
      text: 'En 32 horas, una API en Laravel conectada a WhatsApp: el productor manda la foto de la planta y recibe la plaga identificada por Google Vertex.',
    },
    {
      event: 'NASA Space Apps Boa Vista 2023',
      place: '1er lugar general',
      when: 'oct/2023',
      by: 'NASA y Ayuntamiento de Boa Vista',
      project: 'Safe Dive',
      text: 'Equipo In Water: prototipo de app para evaluar la calidad del agua, denunciar problemas y concientizar sobre la extinción de animales acuáticos.',
    },
  ],

  books: [
    { title: 'Angular — The Complete Guide', short: 'Angular', by: 'Udemy, Maximilian Schwarzmüller', when: 'may/2026', learned: 'Componentes standalone, signals, RxJS, formularios, rutas y SSR.', used: 'White Label Stock, en Angular 22 con signals y Signal Forms. Era el ecosistema que me faltaba.' },
    { title: 'The Nuxt 3 Bootcamp', short: 'Nuxt 3', by: 'Udemy', when: 'dic/2025', learned: 'Renderizado en el servidor, rutas de servidor en Nitro, obtención de datos y middlewares.', used: 'Mocked Payment Gateway, en Nuxt 4 con Nitro, y el día a día en Mercado Eletrônico.' },
    { title: 'Vue JS 3: Composition API', short: 'Vue 3', by: 'Udemy, con Pinia, Firebase 9 y Vite', when: 'ago/2025', learned: 'Composables, stores en Pinia y la organización de proyectos grandes en Vue 3.', used: 'En Mercado Eletrônico, donde Vue y Nuxt son la especialidad, y en VestMentor.' },
    { title: 'Desarrollo Web Avanzado con Vue y Vuex', short: 'Vue avanzado', by: 'Udemy', when: 'mar/2025', learned: 'Vue 2 y 3 lado a lado, Vuex y patrones para bases de código que necesitan migrar.', used: 'Al liderar el front-end de A&3: revisión de código y arquitectura de las pantallas.' },
    { title: 'Overview LGPD', short: 'LGPD', by: 'Mconsult Consultoria e Tecnologia', when: 'oct/2024', learned: 'Datos personales, bases legales y las obligaciones de quien trata datos según la ley brasileña.', used: 'Abrió el camino al posgrado en Gestión de la Ciberseguridad Empresarial.' },
    { title: 'Seminario Hackatur', short: 'Hackatur', by: 'Sebrae', when: 'abr/2024', learned: 'El turismo de Roraima: quiénes son las agencias, los itinerarios y los problemas de quien lo visita.', used: 'Un mes después, Tourism Flow ganó el Hackatur 2024.' },
    { title: 'Tailwind Completo', short: 'Tailwind', by: 'Udemy', when: 'abr/2024', learned: 'CSS utilitario, design tokens y componentes sin hojas de estilo sueltas.', used: 'Adoptado en los componentes de A&3 y en todos los proyectos desde entonces.' },
    { title: 'TypeScript Completo', short: 'TypeScript', by: 'Udemy', when: 'mar/2024', learned: 'Tipos avanzados y, sobre todo, generics.', used: 'La base tipada y reutilizable del proyecto en Nuxt que empecé desde cero en A&3.' },
    { title: 'JavaScript Completo', short: 'JavaScript', by: 'Udemy', when: 'mar/2024', learned: 'Los fundamentos del lenguaje repasados con calma, de lo asíncrono a los módulos.', used: 'En todo: de REGULARIZA en Iteraima a los proyectos de hoy.' },
    { title: 'Vue JS 2 Completo', short: 'Vue 2', by: 'Udemy', when: 'mar/2024', learned: 'Options API, componentes y el ciclo de vida de Vue 2.', used: 'En la refactorización del front-end de A&3, donde empezó el interés por Vue.' },
  ],

  talks: [
    { title: 'Arquitectura de Comunicación con la API para Front-end', where: 'Tech Talk en Mercado Eletrônico', text: 'Rutas, capas de abstracción, llamadas HTTP estandarizadas, estado y manejo de errores en el front-end.' },
    { title: 'Carrera en tecnología', where: 'ITEM / CCTI Boa Vista', text: 'Para dos grupos del curso Capacitación en Desarrollo Full Stack, por invitación de Virgílio Borges.' },
  ],
};

export default es;
