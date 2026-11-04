// Layout compartilhado entre o mundo 3D (lib/world/world.js) e as seções da página.
// Tudo em unidades do mundo: x atravessa a tela, z desce a página (z = 0 é o topo).
// A câmera é ortográfica e inclinada, então 1 unidade de z no chão vale sempre
// `--u` pixels na tela: a página e o cenário rolam juntos, como uma pintura só.

// Câmera mais deitada: dá para ver a encosta do morro e as fachadas dos prédios.
export const EL_DEG = 40;
export const SIN_EL = Math.sin(EL_DEG * Math.PI / 180);
export const RIVER_Z = 1012;
// z no centro da tela quando a página chega ao fim: o barco no meio do rio
export const END_Z = 1092;
export const WORLD_LEN = 1136;

// Ruas horizontais da cidade (z do eixo de cada rua). A avenida que liga todas fica em x = 0.
export const STREETS = [168, 220, 280, 340];
// Projetos no parque industrial: um galpão por projeto. `PROJECT_Z(i)` é o z da fileira onde eu paro
// em frente ao galpão (o caminho faz uma serpentina entre as fileiras).
export const PROJECT_N = 6;
export const PROJECT_Z = i => 408 + 52 * i;
// Cor de cada galpão; a caixa do projeto na página usa a mesma.
export const PROJECT_COLORS = ['#e7b25a', '#2fbf9a', '#9b6cff', '#5aa0ff', '#ff6f91', '#ffd166'];
// Paredes dos cômodos do prédio do campus; a lista da formação usa as mesmas cores.
export const CAMPUS_TONES = ['#ffd9a0', '#cfe6ff', '#c9f2c0', '#ffd0c2', '#e6d6ff'];
// id da seção de cada projeto na página
export const projectSectionId = i => (i === 0 ? 'projetos' : `projeto-${i + 1}`);

// Paradas do personagem: `x, z` é onde ele fica; `cz` é o z que a câmera centraliza enquanto ele está ali.
export const STOPS = [
  { key: 'home', x: 13, z: 32.5, cz: 30 },
  { key: 'campus', x: 9, z: 108.5, cz: 100 },
  { key: 'iteraima', x: 14, z: STREETS[1] - 4.4, cz: 208 },
  { key: 'a3', x: -10.5, z: STREETS[2] - 4.4, cz: 266 },
  { key: 'me', x: 16.5, z: STREETS[3] - 4.4, cz: 326 },
  ...Array.from({ length: PROJECT_N }, (_, i) => ({ key: `p${i}`, x: i % 2 === 0 ? -12 : 12, z: PROJECT_Z(i), cz: PROJECT_Z(i) - 8 })),
  { key: 'podium', x: -8, z: 754, cz: 764 },
  { key: 'library', x: -10, z: 882.6, cz: 879 },
  { key: 'stage', x: -15, z: 920, cz: 926 },
  { key: 'pier', x: 1.4, z: RIVER_Z - 9, cz: RIVER_Z - 9 },
  // o embarque acontece com a câmera ainda no fim do píer (onde o barco espera); daí o barco sai e chega em END_Z junto com a rolagem
  { key: 'boat', x: 0, z: END_Z, cz: RIVER_Z + 30 },
];

// Seções da página, na ordem. `z0` é onde a faixa da seção começa no mundo; `panel` é o
// topo da caixa de texto (em z) e `side` o lado da tela em que ela fica.
export const SECTIONS = [
  { id: 'inicio', z0: 0, panel: 4, side: 'left' },
  { id: 'formacao', z0: 70, panel: 82, side: 'left' },
  { id: 'trabalho', z0: 165, panel: 190, side: 'left' },
  { id: 'a3', z0: 240, panel: 250, side: 'right' },
  { id: 'mercado-eletronico', z0: 300, panel: 308, side: 'left' },
  ...Array.from({ length: PROJECT_N }, (_, i) => ({
    id: projectSectionId(i),
    z0: i === 0 ? 362 : PROJECT_Z(i) - 28,
    panel: PROJECT_Z(i) - 26,
    // a parada fica de um lado da serpentina e a caixa do outro
    side: i % 2 === 0 ? 'right' : 'left',
  })),
  { id: 'premios', z0: 700, panel: 744, side: 'right' },
  { id: 'cursos', z0: 820, panel: 852, side: 'right' },
  { id: 'palestras', z0: 900, panel: 910, side: 'right' },
  { id: 'pier', z0: 960, panel: null, side: 'none' },
  { id: 'contato', z0: 1020, panel: END_Z + 6, side: 'both' },
];

// A última seção vai até END_Z (mais meia tela, somada no CSS), para o fim da página parar no barco.
export function sectionSpan(id) {
  const i = SECTIONS.findIndex(s => s.id === id);
  const next = SECTIONS[i + 1];
  return (next ? next.z0 : END_Z) - SECTIONS[i].z0;
}

export const section = id => SECTIONS.find(s => s.id === id);
