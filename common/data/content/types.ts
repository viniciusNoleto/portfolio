// Formato do conteúdo do portfólio; cada idioma (pt, es, en) segue o mesmo formato e a mesma ordem.

export type Step = { name: string; text: string };

export type Education = {
  course: string;
  school: string;
  status: string;
  // em andamento: o status ganha destaque
  current: boolean;
  when: string;
  note: string;
};

export type Job = {
  company: string;
  role: string;
  period: string;
  mode: string;
  // sobre o lugar e, separado, o resumo do que eu fiz
  about: string;
  summary: string;
  steps: Step[];
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

export type Award = { event: string; place: string; when: string; by: string; project: string; text: string };

// A aparência de cada livro (símbolo, cor, altura) fica em BOOK_STYLE, em common/data/journey.ts.
export type Book = { title: string; short: string; by: string; when: string; learned: string; used: string };

export type Talk = { title: string; where: string; text: string };

export type Content = {
  education: Education[];
  iteraima: Job;
  a3: {
    company: string;
    mode: string;
    // andares do prédio, de baixo para cima
    floors: { floor: string; role: string; period: string; text: string }[];
  };
  me: Job;
  projects: Project[];
  // do mais novo ao mais antigo
  awards: Award[];
  // "o que aprendi" e "onde usei" ligam cada certificado ao trabalho e aos projetos do perfil
  books: Book[];
  talks: Talk[];
};
