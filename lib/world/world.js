// O caminho de casa até o rio, na vertical: um diorama ASCII em Three.js.
// O mundo é uma faixa comprida que desce a página. A câmera é ortográfica e acompanha a rolagem
// (1 unidade de z = `--u` px), então as caixas de texto ficam presas ao cenário como numa pintura.
// O personagem anda pelo caminho e para em cada lugar do portfólio.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CAMPUS_TONES, EL_DEG, END_Z, PROJECT_COLORS as THEME, PROJECT_N, PROJECT_Z, RIVER_Z, STOPS, STREETS, WORLD_LEN } from './layout.js';

export const STOP_KEYS = STOPS.map(s => s.key);
const CLS = { grass: 1, leaf: 2, flower: 3, stone: 4, road: 5, accent: 6, wood: 7, sand: 8, water: 9, foam: 10, person: 11, roof: 12, rock: 13, wall: 14, window: 15 };

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const fract = x => x - Math.floor(x);
const hash2 = (x, y) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453);
function vnoise(x, y) {
  const i = Math.floor(x), j = Math.floor(y), f = x - i, g = y - j, u = f * f * (3 - 2 * f), v = g * g * (3 - 2 * g);
  return (hash2(i, j) * (1 - u) + hash2(i + 1, j) * u) * (1 - v) + (hash2(i, j + 1) * (1 - u) + hash2(i + 1, j + 1) * u) * v;
}
const fbm = (x, y) => vnoise(x, y) * .5 + vnoise(x * 2.1 + 3, y * 2.1) * .28 + vnoise(x * 4.3, y * 4.3 + 5) * .15 + vnoise(x * 8.7, y * 8.7) * .07;
let seed = 23;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
const angDamp = (a, b, k, dt) => { const d = ((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return a + d * (1 - Math.exp(-k * dt)); };
const ease = t => t * t * (3 - 2 * t);

const time = { value: 0 };
function tag(mat, cls, extra) {
  mat.onBeforeCompile = (s) => {
    extra?.(s);
    s.fragmentShader = s.fragmentShader.replace('#include <dithering_fragment>', `#include <dithering_fragment>\n gl_FragColor.a = ${(cls / 16).toFixed(4)};`);
  };
  mat.customProgramCacheKey = () => `c${cls}${extra ? extra.toString().length : 0}`;
  return mat;
}
const loadImg = url => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
function pixels(img, w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, w, h);
  return { d: x.getImageData(0, 0, w, h).data, w, h };
}
const yieldFrame = () => new Promise(r => setTimeout(r, 0));

// ---------- o caminho ----------
// Pontos de controle [x, z]. `k` é o tipo do trecho que chega no ponto e `r` diz se vou de moto nele.
// tipos: 0 terra, 1 asfalto, 2 (sem uso), 3 nenhum (anda no chão do lugar: calçada, piso, grama), 4 escada, 5 calçamento
const PTS = [];
const add = (k, r, ...pp) => { for (const [x, z] of pp) PTS.push({ x, z, k, r }); };
const [H1, H2, H3, H4] = STREETS;
// casa no alto do morro: saio pela porta, desço a escada na diagonal e sigo de lado pelo pé do morro
add(0, 0, [13, 32.5], [11, 36]);
add(4, 0, [7.5, 40.5], [3, 46], [-1.5, 51.5], [-5, 57]);
add(0, 0, [-4.5, 60.5], [-1, 63], [8, 63.6], [17, 64.2], [23, 66.5], [24.5, 71], [24.5, 75.5]);
// escada ao lado do prédio do campus; depois passo pela frente até o portão
add(4, 0, [24.5, 81], [24.5, 87], [24.5, 93.5]);
add(0, 0, [24, 99], [21.5, 105.5], [16, 108], [9, 108.5]);
// riacho e a calçada da cidade, onde a moto está numa vaga
add(0, 0, [3, 109.5], [-3.5, 113], [-8.5, 120], [-9.5, 128], [-9, 136], [-8.5, 144]);
add(3, 0, [-9.5, 150], [-12, 153.5], [-14, 157]);
// de moto: saio do estacionamento, dobro na avenida e paro na vaga em frente ao Iteraima
add(3, 1, [-14, 160.5], [-12, 165.5], [-7, H1 + 1.5], [-3, H1 + 2], [-1.5, H1 + 5.5], [-1.5, H1 + 22], [-1.5, H2 - 10], [-1, H2 - 4], [2, H2 + 1.4],
  [8, H2 + 1.5], [11.2, H2 + 1.3], [13.4, H2 - .3], [14, H2 - 2.6]);
add(3, 0, [14, H2 - 3.6], [14, H2 - 4.4], [14.5, H2 - 3.5], [14.2, H2 - 2.6]);
// Iteraima → A&3: volto pela rua, desço a avenida e dobro à direita
add(3, 1, [13.5, H2 - .8], [11, H2 - 1.3], [5, H2 - 1.5], [1.5, H2 - 1.5], [-1.5, H2 + 2], [-1.5, H2 + 20], [-1.5, H3 - 18], [-1.8, H3 - 6],
  [-4, H3 - 1.6], [-7.5, H3 - 1.2], [-9.8, H3 - 1.6], [-10.5, H3 - 2.6]);
add(3, 0, [-10.5, H3 - 3.6], [-10.5, H3 - 4.4], [-10, H3 - 3.5], [-10.3, H3 - 2.6]);
// A&3 → Mercado Eletrônico
add(3, 1, [-10.2, H3 - 1], [-8, H3 + 1.3], [-3, H3 + 1.5], [-1.5, H3 + 4], [-1.5, H3 + 20], [-1.5, H4 - 18], [-1.2, H4 - 6], [1, H4 + 1.4],
  [6, H4 + 1.5], [11.5, H4 + 1.5], [15.1, H4 + .3], [16.5, H4 - 2.6]);
add(3, 0, [16.5, H4 - 3.6], [16.5, H4 - 4.4], [17, H4 - 3.5], [16.7, H4 - 2.6]);
// Mercado Eletrônico → segundo estacionamento, antes do parque industrial
add(3, 1, [15.9, H4 - .8], [13.5, H4 - 1.4], [11, H4 - 1.4], [8.2, H4 + .5], [7.5, H4 + 4], [7.6, H4 + 10], [9, H4 + 16], [12, H4 + 21], [14, H4 + 25], [14, H4 + 28.5]);
// a pé até o portão do parque industrial
add(3, 0, [14, H4 + 31], [14.5, H4 + 33.5], [18, H4 + 37], [21.5, H4 + 43], [21.5, H4 + 55]);
// serpentina entre os galpões, a pé pelo concreto: atravesso a fileira, paro em frente ao galpão e desço pelo canto
for (let i = 0; i < PROJECT_N; i++) {
  const z = PROJECT_Z(i), s = i % 2 === 0 ? -1 : 1;
  add(3, 0, [-s * 21.5, z - 4], [-s * 18, z], [-s * 6, z], [s * 12, z]);
  add(3, 0, [s * 18, z + .2], [s * 21.5, z + 4], [s * 21.5, z + 22]);
}
// rua com faixa de pedestre
add(3, 0, [18, 697], [8, 704], [2, 711], [0, 718], [0, 726], [0, 734], [0, 742]);
// praça: pela grama até o pódio; depois o passeio reto entre as quadras
add(3, 0, [-2.5, 747], [-6.5, 751.5], [-8, 754], [-5, 757.5], [-.6, 760.5], [0, 764], [0, 790], [0, 816], [0, 846]);
// biblioteca: sento na mesa; palanque lateral: subo pela ponta, falo e desço por trás da plateia
add(3, 0, [-1.5, 856], [-2, 868], [-5, 879], [-8, 881.8], [-10, 882.6], [-6.5, 881.3], [-3, 886], [-1.5, 898], [0, 906],
  [-1.5, 909.6], [-6, 910.6], [-10.5, 911.4], [-13.5, 914], [-15, 917.5], [-15, 920], [-14.5, 923.5], [-12.8, 927.6], [-8.5, 931], [-1, 934], [6, 938.5], [10, 943]);
// beira-rio, noiva e píer
add(0, 0, [11, 946], [5, 960], [2, 975], [1, 990], [1.4, RIVER_Z - 9], [.6, RIVER_Z - 3], [0, RIVER_Z + 7], [0, RIVER_Z + 17], [0, RIVER_Z + 25]);

const pathCurve = new THREE.CatmullRomCurve3(PTS.map(p => new THREE.Vector3(p.x, 0, p.z)), false, 'centripetal');
pathCurve.arcLengthDivisions = 12000;
const pathLen = pathCurve.getLength();
const NS = Math.round(pathLen * 4);
const pathS = [];
{
  let j = 0;
  for (let i = 0; i <= NS; i++) {
    const p = pathCurve.getPointAt(i / NS);
    while (j < PTS.length - 1 && Math.hypot(p.x - PTS[j + 1].x, p.z - PTS[j + 1].z) < .2) j++;
    const nx = PTS[Math.min(j + 1, PTS.length - 1)];
    pathS.push({ x: p.x, z: p.z, s: i / NS * pathLen, y: .3, k: nx.k, r: nx.r });
  }
}
const HALF = [1.15, 2.3, 1.5, 1.2, 1.25, 1.4];
function nearestS(x, z, from = 0) { let b = null, bd = 1e9; for (const p of pathS) { if (p.s < from) continue; const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < bd) { bd = d; b = p; } } return b; }
const STOP_S = [];
{ let from = 0; for (const st of STOPS) { const s = st.key === 'boat' ? pathLen : nearestS(st.x, st.z, from).s; STOP_S.push(s); from = s + .5; } }
const STOP_PZ = STOP_S.map(s => pathCurve.getPointAt(s / pathLen).z);
const CZ = STOPS.map(s => s.cz ?? s.z);
// trechos de moto [início, fim] em comprimento de caminho
const RIDES = [];
for (let i = 1; i < pathS.length; i++) {
  const a = pathS[i - 1], b = pathS[i];
  if (b.r && !a.r) RIDES.push([a.s, pathLen]);
  if (!b.r && a.r) RIDES[RIDES.length - 1][1] = a.s;
}

// rolagem → ponto do caminho. Em volta de cada parada há uma janela em que ele fica parado;
// entre duas paradas ele anda metade pelo z da tela e metade pela distância, para as curvas não virarem saltos.
const DWELL = 9;
let homeEnd = CZ[0] + DWELL; // no celular a tela mostra mais z; em casa ele fica até a página começar a rolar
function sForZ(zc) {
  if (zc <= homeEnd) return STOP_S[0];
  for (let i = 0; i < STOPS.length; i++) {
    const next = STOPS[i + 1], end = i === 0 ? homeEnd : CZ[i] + DWELL;
    if (zc <= end) return STOP_S[i];
    if (!next) return STOP_S[i];
    const nz = CZ[i + 1] - DWELL;
    if (zc < nz) {
      const t = clamp((zc - end) / (nz - end));
      const zl = lerp(STOP_PZ[i], STOP_PZ[i + 1], t);
      const a = Math.round(STOP_S[i] / pathLen * NS), b = Math.round(STOP_S[i + 1] / pathLen * NS);
      let mx = -1e9, sz = STOP_S[i + 1];
      for (let k = a; k <= b; k++) { mx = Math.max(mx, pathS[k].z); if (mx >= zl) { sz = pathS[k].s; break; } }
      return lerp(sz, lerp(STOP_S[i], STOP_S[i + 1], ease(t)), .5);
    }
  }
  return STOP_S[STOP_S.length - 1];
}

// ---------- água e relevo ----------
const riverZ = x => RIVER_Z + 1.4 * Math.sin(x * .06 + 1) + (fbm(x * .08, 3.3) - .5) * 2;
const streamZ = x => 136 + 2.2 * Math.sin(x * .07) + (fbm(x * .05, 7) - .5) * 2;
function landDistRaw(x, z) { // > 0 terra, < 0 água
  return Math.min(riverZ(x) - z, Math.abs(z - streamZ(x)) - 5);
}
// O morro de casa: um platô alto, a encosta, um patamar no pé do morro e a descida até o campus.
const crest = x => 41 + 2.5 * Math.sin(x * .08 + 1) + (fbm(x * .05, 1.7) - .5) * 3;
function hill(x, z) {
  const top = 11 + 2.5 * sstep(-25, 5, x) + (fbm(x * .07, z * .07) - .5) * .8;
  return 4 * sstep(94, 75, z) + (top - 4) * sstep(crest(x) + 14, crest(x), z);
}
function mount(x, z) { // pedra aflorando nas encostas
  const c = crest(x);
  const band = sstep(c - 1, c + 3, z) * sstep(c + 15, c + 10, z) + .7 * sstep(75, 79, z) * sstep(94, 89, z);
  if (band <= 0) return 0;
  return band * Math.max(0, fbm(x * .13 + 4, z * .2) - .56) * 7;
}
function rawHFrom(ld, mt, x, z) {
  if (ld < 0) return Math.max(ld * .5, -2.4) - .05;
  let y = .3 + .8 * (1 - Math.exp(-ld * .5));
  y += sstep(0, 5, ld) * ((fbm(x * .05, z * .05) - .5) * 1.2 + (fbm(x * .3, z * .3) - .5) * .3);
  return y + hill(x, z) + mt * sstep(0, 4, ld);
}
const rawH = (x, z) => rawHFrom(landDistRaw(x, z), mount(x, z), x, z);

// terreiros planos: chão de cada lugar. A ordem importa: o primeiro que contém o ponto vale.
const PADY = .45;
const HOUSE_Y = rawH(12.5, 27) + .1;
const PADS = [
  { x0: 4, x1: 21, z0: 21, z1: 36.5, t: 'yard', y: HOUSE_Y }, // quintal gramado da casa
  { x0: -3, x1: 22, z0: 93, z1: 111, t: 'plaza' }, // campus
  // cidade: ruas, estacionamentos, a horta do Iteraima e as calçadas
  ...STREETS.map(c => ({ x0: -50, x1: 50, z0: c - 3.4, z1: c + 3.4, t: 'asphalt' })),
  { x0: -3.4, x1: 3.4, z0: H1, z1: H4, t: 'asphalt' },
  { x0: -16, x1: -9, z0: 162, z1: 165, t: 'asphalt' }, { x0: 5.5, x1: 10, z0: 343, z1: 345.5, t: 'asphalt' },
  { x0: -28, x1: -6, z0: 148.5, z1: 162.9, t: 'asphalt' }, // estacionamento 1
  { x0: 4, x1: 30, z0: 345, z1: 373, t: 'asphalt' }, // estacionamento 2
  { x0: 6, x1: 30, z0: 226.5, z1: 246, t: 'farm' },
  { x0: 9.6, x1: 32.4, z0: 326, z1: 336.6, t: 'square' }, // praça do Mercado Eletrônico, na frente do prédio
  { x0: -50, x1: 50, z0: 146, z1: 375, t: 'sidewalk' },
  { x0: -48, x1: 48, z0: 375, z1: 702, t: 'concrete' }, // parque industrial
  { x0: -60, x1: 60, z0: 718, z1: 722, t: 'sidewalk' }, { x0: -60, x1: 60, z0: 722, z1: 738, t: 'asphalt' }, { x0: -60, x1: 60, z0: 738, z1: 742, t: 'sidewalk' },
  // praça: o pódio numa laje de calçada (com terra espalhada em volta), passeios retos e quadras entre eles
  { x0: -16.5, x1: 1.7, z0: 747, z1: 760, t: 'podium', fringe: 2.4 }, // a borda direita segue a do passeio
  { x0: -1.7, x1: 1.7, z0: 760, z1: 848, t: 'walk' },
  { x0: -36, x1: 36, z0: 788.4, z1: 791.6, t: 'walk' },
  { x0: -36, x1: 36, z0: 815.4, z1: 818.6, t: 'walk' },
  { x0: -27, x1: -5, z0: 767, z1: 785, t: 'court' }, // basquete
  { x0: 5, x1: 27, z0: 767, z1: 785, t: 'futsal' },
  { x0: -25, x1: -6, z0: 795, z1: 811, t: 'sandcourt' }, // vôlei de areia
  { x0: 5, x1: 28, z0: 795, z1: 811, t: 'tennis' },
  { x0: -28, x1: 28, z0: 848, z1: 908, t: 'wood' }, // biblioteca
  { x0: -31.5, x1: 31.5, z0: 844.5, z1: 911.5, t: 'sidewalk' }, // calçada em volta da biblioteca
  { x0: -30, x1: 30, z0: 910, z1: 958, t: 'lawn' }, // palanque no gramado
];
const padAt = (x, z, m = 0) => PADS.find(p => x > p.x0 - m && x < p.x1 + m && z > p.z0 - m && z < p.z1 + m);
const FRINGED = PADS.filter(p => p.fringe);
const rectD = (p, x, z) => Math.hypot(Math.max(p.x0 - x, 0, x - p.x1), Math.max(p.z0 - z, 0, z - p.z1));
function padNear(x, z) {
  let best = 1e9, y = PADY;
  for (const p of PADS) { const dx = Math.max(p.x0 - x, 0, x - p.x1), dz = Math.max(p.z0 - z, 0, z - p.z1), d = Math.hypot(dx, dz); if (d < best) { best = d; y = p.y ?? PADY; } }
  return [best, y];
}

const X0 = -50, X1 = 50, Z0 = -30, Z1 = WORLD_LEN + 40, FPU = 2;
const FW = (X1 - X0) * FPU + 1, FH = (Z1 - Z0) * FPU + 1;
const fH = new Float32Array(FW * FH), fD = new Float32Array(FW * FH), fL = new Float32Array(FW * FH), fM = new Float32Array(FW * FH), fK = new Uint8Array(FW * FH);
async function buildFields() {
  const ys = new Float32Array(pathS.length);
  for (let i = 0; i < pathS.length; i++) ys[i] = rawH(pathS[i].x, pathS[i].z);
  for (let pass = 0; pass < 6; pass++) {
    const c = Float32Array.from(ys);
    for (let i = 0; i < c.length; i++) { let a = 0, n = 0; for (let k = -10; k <= 10; k++) { const v = c[i + k]; if (v !== undefined) { a += v; n++; } } ys[i] = a / n; }
  }
  pathS.forEach((p, i) => { const wet = Math.abs(p.z - streamZ(p.x)) < 9; p.y = wet ? Math.max(ys[i], -.32) : Math.max(ys[i], .32); });
  const BZ = 3, buckets = new Map();
  for (let i = 0; i < pathS.length; i += 2) { const p = pathS[i], b = Math.floor(p.z / BZ); if (!buckets.has(b)) buckets.set(b, []); buckets.get(b).push(p); }
  for (let j = 0; j < FH; j++) {
    if (j % 300 === 0) await yieldFrame();
    const z = Z0 + j / FPU;
    for (let i = 0; i < FW; i++) {
      const x = X0 + i / FPU, o = j * FW + i;
      const ld = landDistRaw(x, z), mt = mount(x, z);
      fL[o] = ld; fM[o] = mt;
      let y = rawHFrom(ld, mt, x, z);
      let best = 36, by = .3, bk = 3;
      for (let b = Math.floor((z - 6) / BZ); b <= Math.floor((z + 6) / BZ); b++) {
        const list = buckets.get(b); if (!list) continue;
        for (const p of list) { const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < best) { best = d; by = p.y; bk = p.k; } }
      }
      const D = Math.sqrt(best);
      fD[o] = D; fK[o] = bk;
      // a escada fica acima do barranco: os degraus aparecem
      if (z < RIVER_Z - 6) { const hw = HALF[bk]; const k = sstep(hw + 2.4, hw + .2, D); y = y * (1 - k) + (by - (bk === 4 ? .38 : .03)) * k; }
      const [pd, py] = padNear(x, z);
      if (pd < 3) y = lerp(y, py, sstep(3, .2, pd));
      fH[o] = y;
    }
  }
}
function samp(f, x, z) {
  const u = clamp((x - X0) / (X1 - X0)) * (FW - 1), v = clamp((z - Z0) / (Z1 - Z0)) * (FH - 1);
  const i = Math.min(FW - 2, u | 0), j = Math.min(FH - 2, v | 0), a = u - i, b = v - j;
  return (f[j * FW + i] * (1 - a) + f[j * FW + i + 1] * a) * (1 - b) + (f[(j + 1) * FW + i] * (1 - a) + f[(j + 1) * FW + i + 1] * a) * b;
}
const nearestK = (x, z) => fK[Math.round(clamp((z - Z0) / (Z1 - Z0)) * (FH - 1)) * FW + Math.round(clamp((x - X0) / (X1 - X0)) * (FW - 1))];
const H = (x, z) => samp(fH, x, z);
const pathD = (x, z) => samp(fD, x, z);
const landD = (x, z) => samp(fL, x, z);
const mountH = (x, z) => samp(fM, x, z);

// pisos onde o personagem sobe (pódio, palanque, píer)
const FLOORS = [];
const floorAt = (x, z) => { let y = -1e9; for (const f of FLOORS) if (x > f.x0 && x < f.x1 && z > f.z0 && z < f.z1) y = Math.max(y, f.y); return y; };
const PIER = { x0: -1.3, x1: 1.3, z0: RIVER_Z - 5.5, z1: RIVER_Z + 27, y: .78 };
FLOORS.push(PIER);

// ---------- chão ----------
async function buildTerrain(lite) {
  const names = ['leafy_grass', 'coast_sand_01', 'castle_wall_slates', 'aerial_rocks_02', 'weathered_planks'];
  const [grass, sand, slate, rock, planks] = await Promise.all(names.map(n => loadImg(`/world/assets/tex/${n}.jpg`).then(i => pixels(i, 256, 256))));
  const PPU = lite ? 3 : 5, TW = (X1 - X0) * PPU, TH = (Z1 - Z0) * PPU;
  const col = new Uint8Array(TW * TH * 4), cls = new Uint8Array(TW * TH * 4);
  const pick = (t, x, z, m) => { const o = (((fract(z / m) * t.h) | 0) * t.w + ((fract(x / m) * t.w) | 0)) * 4; return [t.d[o], t.d[o + 1], t.d[o + 2]]; };
  for (let j = 0; j < TH; j++) {
    if (j % 120 === 0) await yieldFrame();
    const z = Z0 + (Z1 - Z0) * j / (TH - 1);
    for (let i = 0; i < TW; i++) {
      const x = X0 + (X1 - X0) * i / (TW - 1);
      const n = vnoise(x * .3, z * .3) * .65 + vnoise(x * 1.3, z * 1.3) * .35;
      const pd = pathD(x, z), kind = nearestK(x, z), pad = padAt(x, z);
      let c, k;
      const paving = () => { // o calçamento da praça
        const p = pick(slate, x, z, 2.4), tile = (fract(x / 2) < .06 || fract(z / 2) < .06) ? .8 : 1;
        return [(p[0] * .42 + 46) * tile, (p[1] * .4 + 42) * tile, (p[2] * .38 + 40) * tile];
      };
      const dirt = () => { const p = pick(sand, x, z, 3), v = .75 + .4 * n; return [p[0] * 1.15 * v + 30, p[1] * .5 * v, p[2] * .32 * v]; };
      const grassCol = () => {
        const p = pick(grass, x, z, 2.6), v = .62 + .55 * vnoise(x * .12 + 5, z * .12), dry = vnoise(x * .04 + 9, z * .06);
        return [p[0] * (.34 + dry * .3) * v + 10, p[1] * (1.08 + dry * .12) * v + 22, p[2] * .3 * v + 6];
      };
      // terra espalhada sobre a grama: um pouco da grama aparece por baixo, mais marrom que a estrada
      const sprinkle = (f) => { const d = dirt(), g2 = grassCol(), m = f * (.6 + .3 * vnoise(x * 5, z * 5)); return [lerp(g2[0], d[0] * .9 + 18, m), lerp(g2[1], d[1] * 1.15 + 16, m), lerp(g2[2], d[2] + 8, m)]; };
      // manchas e grãos que rareiam com a distância
      const scatter = (d, w) => {
        if (d > w) return false;
        const f = d / w, clump = vnoise(x * .9 + 3, z * .9), grain = vnoise(x * 4.6, z * 4.6 + 7);
        return clump * .4 + grain * .6 > .42 + f * .45;
      };
      // a estrada de terra do cais começa no gramado do palanque aos poucos, em grãos que vão se juntando
      // o mesmo vale para o quintal de casa: perto do primeiro degrau a grama vira terra, antes da pedra
      const yard = pad?.t === 'yard';
      // o topo da escada fica dentro do quintal, com os primeiros degraus abaixo do gramado: ali o chão é terra,
      // para a terra encostar no primeiro degrau visível (escada → terra → grama), sem faixa de grama no meio
      const yardStair = kind === 4 && yard;
      const dirty = kind === 0 || yardStair;
      const roadStart = kind === 0 && z > 930 && z < 962 ? sstep(940, 961, z) : kind === 0 && yard ? sstep(31.6, 35.8, z) : 1;
      const dirtOk = !pad || pad.t === 'lawn' || (yard && roadStart > 0);
      const onRoad = dirty && pd < HALF[yardStair ? 4 : 0] + (n - .5) * .5 && (roadStart >= 1 || vnoise(x * 4.2, z * 4.2) * .55 + vnoise(x * 1.2, z * 1.2) * .45 < roadStart * 1.02);
      const nearRoad = dirty && !onRoad && dirtOk && scatter(pd - HALF[yardStair ? 4 : 0] + .2, roadStart < 1 ? 3.2 : 2.2);
      if (onRoad && dirtOk) { c = roadStart < 1 ? sprinkle(.75 + .25 * roadStart) : dirt(); k = CLS.road; }
      else if (nearRoad) { c = sprinkle(.8); k = CLS.sand; }
      else if (kind !== 0 && kind !== 3 && pd < HALF[kind] && !pad) {
        if (kind === 1) { const v = 58 + n * 22, edge = pd > HALF[1] - .28; c = edge ? [196, 196, 186] : [v, v, v + 5]; k = CLS.road; }
        else if (kind === 4) { const v = 150 + n * 30; c = [v, v - 2, v - 8]; k = CLS.stone; }
        else { c = paving(); k = CLS.sand; }
      } else if (pad) {
        const t = pad.t;
        // linhas das quadras, a 0,4 da borda, e o meio
        const lx = Math.min(x - pad.x0, pad.x1 - x), lz = Math.min(z - pad.z0, pad.z1 - z), mx = Math.abs(x - (pad.x0 + pad.x1) / 2), mz = Math.abs(z - (pad.z0 + pad.z1) / 2);
        const courtLine = (Math.abs(lx - .5) < .1 && lz > .4) || (Math.abs(lz - .5) < .1 && lx > .4) || (mx < .08 && lz > .4);
        if (t === 'yard' || t === 'lawn') { c = pick(grass, x, z, 2.6); const v = .62 + .55 * vnoise(x * .12 + 5, z * .12); c = [c[0] * .4 * v + 10, c[1] * 1.12 * v + 22, c[2] * .3 * v + 6]; k = CLS.sand; }
        else if (t === 'base') { c = pick(slate, x, z, 3.2); c = [c[0] * .95 + 20, c[1] * .92 + 16, c[2] * .86 + 8]; k = CLS.stone; }
        else if (t === 'plaza') {
          c = paving(); const r = Math.hypot(mx, mz), ring = Math.sin(r * .9) > .8 ? .8 : 1;
          c = [c[0] * ring, c[1] * ring, c[2] * ring]; k = CLS.sand;
        } else if (t === 'square') { c = paving(); k = CLS.sand; }
        else if (t === 'walk') {
          // passeio: calçamento com meio-fio claro nas bordas
          const curb = Math.min(x - pad.x0, pad.x1 - x, z - pad.z0, pad.z1 - z) < .28 && !PADS.some(q => q !== pad && q.t === 'walk' && x > q.x0 && x < q.x1 && z > q.z0 && z < q.z1);
          c = curb ? [178, 172, 160] : paving(); k = curb ? CLS.stone : CLS.sand;
        } else if (t === 'podium') { const v = 158 + n * 26, joint = (fract(x / 1.6) < .05 || fract(z / 1.6) < .05) ? .8 : 1; c = [v * joint, (v - 3) * joint, (v - 10) * joint]; k = CLS.road; }
        else if (t === 'court' || t === 'futsal') {
          const L = pad.x1 - pad.x0, zc = (pad.z0 + pad.z1) / 2, ex = Math.min(x - pad.x0, pad.x1 - x), dz = Math.abs(z - zc);
          const circle = Math.abs(Math.hypot(mx, mz) - 2.2) < .09;
          let line = courtLine || circle, paint = false;
          if (t === 'court') {
            // garrafão e linha de três pontos nas duas pontas
            paint = ex < 6.2 && dz < 2.6 && ex > .5;
            line = line || (ex > .5 && ex < 6.3 && Math.abs(dz - 2.6) < .08) || (Math.abs(ex - 6.2) < .08 && dz < 2.6) || (Math.abs(Math.hypot(ex - 1.6, dz) - 7.2) < .09 && ex > .5 && ex < L / 2);
          } else {
            // áreas dos goleiros: meia-lua em cada gol
            line = line || (Math.abs(Math.hypot(ex - .5, dz) - 4.4) < .09 && ex > .5);
          }
          const base = t === 'court' ? (paint ? [148, 78, 54] : [52, 112, 150]) : [70, 138, 78];
          c = line ? [236, 236, 228] : base.map(v => v * (.92 + n * .16)); k = CLS.stone;
        } else if (t === 'tennis') {
          // quadra dura: linhas laterais, de saque e o centro do saque; a rede fica no meio, em x
          const ex = Math.min(x - pad.x0, pad.x1 - x), dz = Math.abs(z - (pad.z0 + pad.z1) / 2), half = (pad.z1 - pad.z0) / 2;
          const inner = ex > .5 && dz < half - .5;
          const line = courtLine || (inner && Math.abs(dz - (half - 2)) < .08) || (inner && Math.abs(ex - (pad.x1 - pad.x0) / 2 + 6.4) < .08 && dz < half - 2) || (dz < .08 && ex > (pad.x1 - pad.x0) / 2 - 6.4);
          const base = inner ? [64, 112, 160] : [62, 128, 92];
          c = line ? [238, 238, 230] : base.map(v => v * (.94 + n * .12)); k = CLS.stone;
        } else if (t === 'sandcourt') {
          c = pick(sand, x, z, 3); c = courtLine ? [240, 240, 232] : [c[0] * 1.15 + 30, c[1] * 1.05 + 22, c[2] * .8 + 10]; k = courtLine ? CLS.stone : CLS.sand;
        } else if (t === 'asphalt') { const v = 56 + n * 22; c = [v, v, v + 5]; k = CLS.road; }
        else if (t === 'sidewalk') { const v = 150 + n * 30, joint = (fract(x / 2.2) < .05 || fract(z / 2.2) < .05) ? .82 : 1; c = [v * joint, v * joint, (v - 6) * joint]; k = CLS.road; }
        else if (t === 'concrete') { const v = 64 + n * 34, seam = (fract(x / 8) < .025 || fract(z / 8) < .025) ? .7 : 1; c = [v * seam, (v + 3) * seam, (v + 8) * seam]; k = CLS.sand; }
        else if (t === 'farm') { const row = fract(z / 1.4) < .45; const v = row ? .62 : 1; c = pick(sand, x, z, 3); c = [(c[0] * .55 + 30) * v, (c[1] * .32 + 14) * v, (c[2] * .2 + 6) * v]; k = CLS.sand; }
        else { c = pick(planks, x, z, 4); c = [c[0] * .9 + 70, c[1] * .72 + 42, c[2] * .5 + 20]; k = CLS.sand; }
      } else {
        const ld = landD(x, z), mt = mountH(x, z);
        if (ld < 2.2 + n * 1.6) { c = pick(sand, x, z, 3.4); c = [c[0] * 1.1 + 10, c[1] * 1.02 + 6, c[2] * .82]; k = CLS.sand; }
        else if (mt > 1.1 + n * 1.2) { c = pick(rock, x, z, 6); const v = .8 + mt * .05; c = [c[0] * v + 10, c[1] * v + 8, c[2] * v + 6]; k = CLS.rock; }
        else {
          // gramado verde e vivo, com manchas mais claras e mais escuras
          c = pick(grass, x, z, 2.6); const v = .62 + .55 * vnoise(x * .12 + 5, z * .12), dry = vnoise(x * .04 + 9, z * .06);
          c = [c[0] * (.34 + dry * .3) * v + 10, c[1] * (1.08 + dry * .12) * v + 22, c[2] * .3 * v + 6]; k = CLS.sand;
          // faixa de terra irregular em volta da laje do pódio
          for (const fp of FRINGED) { const d = rectD(fp, x, z); if (d < fp.fringe + 1.6 && (d < fp.fringe * (.12 + .6 * vnoise(x * .8 + 1, z * .8)) || scatter(d, fp.fringe + 1.4))) { c = sprinkle(d < .5 ? .85 : .7); break; } }
          // encosta: capim em listras descendo o morro, mais escuro que o platô
          const sl = H(x, z - .6) - H(x, z + .6);
          if (sl > .25) { const st = sstep(.25, .9, sl), streak = vnoise(x * 1.7, z * .14); const f = lerp(1, .62 + .5 * streak, st); c = [c[0] * f, c[1] * f, c[2] * f]; }
        }
      }
      const o = (j * TW + i) * 4;
      col[o] = Math.min(255, c[0]); col[o + 1] = Math.min(255, c[1]); col[o + 2] = Math.min(255, c[2]); col[o + 3] = 255; cls[o] = k * 16;
    }
  }
  const colTex = new THREE.DataTexture(col, TW, TH, THREE.RGBAFormat);
  colTex.colorSpace = THREE.SRGBColorSpace; colTex.magFilter = THREE.LinearFilter; colTex.minFilter = THREE.LinearMipmapLinearFilter; colTex.generateMipmaps = true; colTex.anisotropy = 8; colTex.needsUpdate = true;
  const clsTex = new THREE.DataTexture(cls, TW, TH, THREE.RGBAFormat); clsTex.magFilter = clsTex.minFilter = THREE.NearestFilter; clsTex.needsUpdate = true;
  const m = new THREE.MeshLambertMaterial({ map: colTex });
  m.onBeforeCompile = (s) => {
    s.uniforms.clsTex = { value: clsTex };
    s.fragmentShader = 'uniform sampler2D clsTex;\n' + s.fragmentShader.replace('#include <dithering_fragment>', `#include <dithering_fragment>\n gl_FragColor.a = texture2D(clsTex, vMapUv).r;`);
  };
  // em faixas, para o recorte de câmera descartar o que está fora da tela
  const group = new THREE.Group();
  const SEG = 80;
  for (let z0 = Z0; z0 < Z1; z0 += SEG) {
    const z1 = Math.min(Z1, z0 + SEG);
    const g = new THREE.PlaneGeometry(X1 - X0, z1 - z0, (X1 - X0), (z1 - z0)); g.rotateX(-Math.PI / 2); g.translate((X0 + X1) / 2, 0, (z0 + z1) / 2);
    const p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, H(x, z)); uv.setXY(i, (x - X0) / (X1 - X0), (z - Z0) / (Z1 - Z0)); }
    g.computeVertexNormals(); g.computeBoundingSphere();
    const mesh = new THREE.Mesh(g, m); mesh.receiveShadow = true; group.add(mesh);
  }
  return group;
}

// ---------- água ----------
function buildWater(warm) {
  const depth = new Float32Array(FW * FH * 4);
  for (let i = 0; i < FW * FH; i++) depth[i * 4] = -fH[i];
  const dt = new THREE.DataTexture(depth, FW, FH, THREE.RGBAFormat, THREE.FloatType);
  dt.magFilter = dt.minFilter = THREE.LinearFilter; dt.needsUpdate = true;
  const m = new THREE.ShaderMaterial({
    uniforms: { uD: { value: dt }, uT: time, uB: { value: new THREE.Vector4(X0, Z0, X1 - X0, Z1 - Z0) }, uWarm: warm },
    vertexShader: `varying vec3 vW; void main(){ vW = (modelMatrix*vec4(position,1.)).xyz; gl_Position = projectionMatrix*viewMatrix*vec4(vW,1.); }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uD; uniform float uT, uWarm; uniform vec4 uB; varying vec3 vW;
      float h21(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float vn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
        return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y); }
      float fbm(vec2 p){ return vn(p)*.55+vn(p*2.1+3.1)*.3+vn(p*4.3+7.7)*.15; }
      void main(){
        vec2 uv = (vW.xz-uB.xy)/uB.zw;
        float d = texture2D(uD,uv).r;
        if(d<-.04) discard;
        vec2 flow = vec2(-uT*.35,0.);
        float n = fbm(vW.xz*vec2(.18,.4)+flow*.4);
        float dist = sqrt(max(d,0.));
        float ph = dist*6.+uT*.8+n*3.;
        float saw = fract(ph/6.2832);
        float lace = smoothstep(.4,.62,fbm(vW.xz*1.1+flow));
        float range = smoothstep(1.7,.7,dist)*smoothstep(.0,.25,dist);
        float trail = smoothstep(0.,.03,saw)*(1.-smoothstep(.04,.3,saw));
        float foam = trail*range*mix(.25,1.,lace);
        float swash = .16+.1*sin(uT*.7+vW.x*.2+n*4.);
        float rim = smoothstep(swash+.26,swash,d)*(.4+.6*lace);
        vec3 shallow = vec3(.5,.62,.5), mid = vec3(.12,.42,.48), deep = vec3(.03,.18,.3);
        vec3 c = mix(shallow,mid,smoothstep(.05,1.2,dist));
        c = mix(c,deep,smoothstep(1.2,3.8,dist));
        float streak = vn(vW.xz*vec2(.25,2.6)+vec2(-uT*.5,0.));
        c *= .84+.3*streak;
        float sp = smoothstep(.8,.92,vn(vW.xz*vec2(.9,3.4)+vec2(-uT*.8,uT*.1)));
        c += mix(vec3(.45,.5,.45),vec3(.9,.55,.25),uWarm)*sp*smoothstep(1.,2.6,dist);
        c = mix(c, c*vec3(1.25,.92,.78)+vec3(.12,.04,.0), uWarm*.6);
        float cls = 9.;
        float f = max(foam,rim);
        if(f>.32){ c = mix(c,vec3(1.,1.,.95),clamp(f*1.5,0.,1.)); cls = 10.; }
        gl_FragColor = vec4(c,cls/16.);
      }`,
  });
  const group = new THREE.Group();
  const SEG = 160;
  for (let z0 = Z0; z0 < Z1; z0 += SEG) {
    const z1 = Math.min(Z1, z0 + SEG);
    const g = new THREE.PlaneGeometry(X1 - X0, z1 - z0); g.rotateX(-Math.PI / 2); g.translate((X0 + X1) / 2, 0, (z0 + z1) / 2);
    group.add(new THREE.Mesh(g, m));
  }
  return group;
}

// ---------- vento ----------
function bladeWind(s) {
  s.uniforms.uT = time;
  s.vertexShader = 'uniform float uT;\n' + s.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
    float ph = instanceMatrix[3].x*.34+instanceMatrix[3].z*.22;
    float gust = sin(uT*.75-ph)*.5+.5;
    transformed.x += (sin(uT*1.6+ph*2.)*.28+gust*.6)*.22*position.y*position.y;`);
}
function leafWind(s) {
  s.uniforms.uT = time;
  s.vertexShader = 'uniform float uT;\n' + s.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
    float ph = instanceMatrix[3].x*.9+instanceMatrix[3].z*.7+instanceMatrix[3].y*.8;
    transformed.y += sin(uT*2.1+ph)*.035;
    transformed += vec3(1.,0.,.4)*sin(uT*.8+instanceMatrix[3].z*.22)*.06;`);
}

// Instâncias divididas em faixas de z, para o recorte de câmera funcionar.
function chunked(scene, geo, mat, items, { shadow = false, receive = true } = {}) { // taste-skill-ignore: sombra projetada da cena 3D, não CSS
  const CH = 30, buckets = new Map();
  for (const it of items) { const k = Math.floor((it.z - Z0) / CH); if (!buckets.has(k)) buckets.set(k, []); buckets.get(k).push(it); }
  const o = new THREE.Object3D(), c = new THREE.Color();
  for (const list of buckets.values()) {
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((it, i) => {
      o.position.set(it.x, it.y, it.z); o.rotation.set(it.rx || 0, it.ry || 0, it.rz || 0);
      o.scale.set(it.sx ?? it.s ?? 1, it.sy ?? it.s ?? 1, it.sz ?? it.s ?? 1); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
      c.setRGB(it.r, it.g, it.b); im.setColorAt(i, c);
    });
    im.computeBoundingSphere(); im.castShadow = shadow; im.receiveShadow = receive; scene.add(im);
  }
}

const occupied = (x, z, m = 0) => {
  const k = nearestK(x, z);
  return pathD(x, z) < HALF[k] + .9 + m || !!padAt(x, z, .6 + m) || landD(x, z) < .8 + m || (z > RIVER_Z - 10 && Math.abs(x) < 3);
};
// a praça é um parque: gramado fechado, sem o chão do lavrado aparecendo
const parkZ = z => z > 742 && z < 848;

function buildGrass(scene, lite) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([-.045, 0, 0, .045, 0, 0, .012, .6, 0, -.045, 0, 0, .012, .6, 0, 0, 1, 0], 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(new Array(18).fill(0).map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
  const N = lite ? 110000 : 280000, items = [];
  let guard = 0;
  while (items.length < N && guard++ < N * 8) {
    const x = X0 + 1 + rnd() * (X1 - X0 - 2), z = Z0 + 1 + rnd() * (Z1 - Z0 - 2);
    const pad = padAt(x, z, .3);
    if (pad ? pad.t !== 'yard' || pathD(x, z) < 1.6 || (x > 7.5 && x < 17.5 && z > 25.5 && z < 30.5) : occupied(x, z, -.6)) continue;
    const tuft = fbm(x * .5 + 7, z * .5);
    if (tuft < (parkZ(z) ? .3 : .44)) continue; // capim em touceiras
    const mt = mountH(x, z); if (mt > 1.5 && rnd() < .8) continue;
    const s = .22 + rnd() * .3 + (tuft - .44) * .5, v = .62 + rnd() * .55, dry = fbm(x * .04 + 9, z * .06), wet = sstep(4, .5, landD(x, z));
    const r = (.16 + dry * .2) * v, gg = (.5 + dry * .06 + wet * .1) * v, b = (.08 + dry * .03) * v;
    items.push({ x, y: H(x, z) - .02, z, ry: rnd() * 6.28, sx: 1.5, sy: s, sz: 1.5, r, g: gg, b });
  }
  chunked(scene, g, tag(new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }), CLS.grass, bladeWind), items);
}
function buildFlowers(scene, lite) {
  const g = new THREE.PlaneGeometry(.14, .14); g.rotateX(-Math.PI / 2 + .25);
  const items = [], N = lite ? 9000 : 24000;
  let guard = 0;
  while (items.length < N && guard++ < N * 40) {
    const x = X0 + rnd() * (X1 - X0), z = Z0 + rnd() * (Z1 - Z0);
    if (fbm(x * .09 + 11, z * .1 - 4) < .62 || occupied(x, z, -.4)) continue;
    const r = rnd();
    const c = r < .45 ? [.95, .78, .18] : r < .8 ? [.92, .92, .84] : [.95, .4, .5];
    items.push({ x, y: H(x, z) + .2 + rnd() * .14, z, ry: rnd() * 6.28, s: .8 + rnd() * .8, r: c[0], g: c[1], b: c[2] });
  }
  chunked(scene, g, tag(new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }), CLS.flower, bladeWind), items);
}

// ---------- árvores: buritis, cajueiros, ipês e arbustos do lavrado ----------
const PAL = {
  green: [[.2, .42, .1], [.3, .5, .12], [.14, .3, .09], [.42, .55, .15]],
  ipe: [[.98, .78, .1], [1, .86, .25], [.9, .66, .06], [.8, .6, .1]],
  ipeRoxo: [[.72, .42, .86], [.82, .55, .95], [.6, .32, .74], [.9, .7, 1]],
  caju: [[.16, .36, .1], [.24, .44, .12], [.5, .3, .1], [.12, .28, .08]],
  shrub: [[.52, .5, .16], [.4, .42, .12], [.62, .52, .18], [.3, .34, .1]],
  frond: [[.3, .52, .14], [.22, .44, .1], [.4, .58, .18], [.5, .46, .14]],
};
function buildTrees(scene, barkTex, lite, extra) {
  const spots = [];
  const near = (x, z, r2) => spots.some(t => (t.x - x) ** 2 + (t.z - z) ** 2 < r2);
  const tryPush = (x, z, kind, s, force = false) => {
    if (!force && (occupied(x, z, kind === 'shrub' ? .3 : 1.6) || near(x, z, kind === 'shrub' ? 4 : 12))) return false;
    spots.push({ x, z, kind, s }); return true;
  };
  for (const t of extra) tryPush(t[0], t[1], t[2], t[3], true);
  let guard = 0;
  const N = lite ? 170 : 280;
  while (spots.length < N && guard++ < 40000) {
    const x = X0 + 2 + rnd() * (X1 - X0 - 4), z = Z0 + rnd() * (Z1 - Z0);
    if (Math.abs(x) < 11 && rnd() < .85) continue; // o corredor do caminho fica livre
    if (z > 744 && z < 820 && Math.abs(x) < 38) continue; // as quadras da praça ficam à vista
    const wet = landD(x, z) < 5;
    const r = rnd();
    const kind = wet ? (r < .6 ? 'buriti' : 'shrub') : r < .3 ? 'shrub' : r < .5 ? 'caju' : r < .66 ? 'ipe' : r < .76 ? 'ipeRoxo' : r < .88 ? 'buriti' : 'green';
    tryPush(x, z, kind, .8 + rnd() * .45);
  }
  const leaves = [], trunks = new Map();
  const addTrunk = (g, z) => { const k = Math.floor((z - Z0) / 60); if (!trunks.has(k)) trunks.set(k, []); trunks.get(k).push(g); };
  for (const t of spots) {
    const y0 = H(t.x, t.z);
    if (t.kind === 'buriti') {
      const H0 = 8 * t.s;
      const tg = new THREE.CylinderGeometry(.2 * t.s, .26 * t.s, H0, 7); tg.translate(t.x, y0 + H0 / 2, t.z); addTrunk(tg, t.z);
      const fr = 16;
      for (let f = 0; f < fr; f++) {
        const a = f / fr * 6.28 + rnd() * .3, up = .25 + rnd() * .7, len = (1.6 + rnd() * .8) * t.s;
        const dir = new THREE.Vector3(Math.cos(a) * Math.cos(up), Math.sin(up), Math.sin(a) * Math.cos(up));
        for (let i = 0; i < 20; i++) {
          const k = i / 19, r = k * len, droop = -k * k * 1.3 * t.s;
          const p = PAL.frond[(rnd() * 4) | 0], lit = .75 + .45 * dir.y;
          leaves.push(t.x + dir.x * r + (rnd() - .5) * .35, y0 + H0 + dir.y * r + droop + (rnd() - .5) * .2, t.z + dir.z * r + (rnd() - .5) * .35, p[0] * lit, p[1] * lit, p[2] * lit);
        }
      }
      continue;
    }
    const big = t.kind !== 'shrub', H0 = (big ? 3.4 : 1.1) * t.s;
    const tg = new THREE.CylinderGeometry(.08 * t.s, .2 * t.s, H0, 6); tg.translate(t.x, y0 + H0 / 2, t.z); addTrunk(tg, t.z);
    const lobes = big ? 8 : 3, palK = PAL[t.kind] || PAL.green;
    for (let l = 0; l < lobes; l++) {
      const a = rnd() * 6.28, r = rnd() ** .6 * (big ? 2.1 : .7) * t.s, lx = t.x + Math.cos(a) * r, lz = t.z + Math.sin(a) * r;
      const ly = y0 + H0 * .9 + (rnd() - .3) * (big ? 1.4 : .5) * t.s, lr = (big ? .8 + rnd() * .5 : .55 + rnd() * .3) * t.s, n = big ? 90 : 45;
      for (let i = 0; i < n; i++) {
        const u = rnd() * 2 - 1, th = rnd() * 6.28, q = Math.sqrt(1 - u * u), rr = lr * Math.cbrt(rnd());
        const p = palK[(rnd() * palK.length) | 0], lit = .72 + .6 * clamp(u * .5 + .5);
        leaves.push(lx + q * Math.cos(th) * rr, ly + u * rr * .7, lz + q * Math.sin(th) * rr, p[0] * lit, p[1] * lit, p[2] * lit);
      }
    }
  }
  const barkMat = tag(new THREE.MeshLambertMaterial({ map: barkTex, color: '#d8cfc0' }), CLS.wood);
  for (const list of trunks.values()) { const m = new THREE.Mesh(mergeGeometries(list), barkMat); m.castShadow = true; scene.add(m); }
  const items = [];
  for (let i = 0; i < leaves.length / 6; i++) items.push({ x: leaves[i * 6], y: leaves[i * 6 + 1], z: leaves[i * 6 + 2], rx: rnd() * 6, ry: rnd() * 6, rz: rnd() * 6, r: leaves[i * 6 + 3], g: leaves[i * 6 + 4], b: leaves[i * 6 + 5] });
  chunked(scene, new THREE.PlaneGeometry(.32, .24), tag(new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }), CLS.leaf, leafWind), items, { shadow: true });
  // cupinzeiros e pedras soltas
  const mound = new THREE.ConeGeometry(.55, 1.4, 7, 3); mound.translate(0, .62, 0);
  const mp = mound.attributes.position; for (let i = 0; i < mp.count; i++) { const k = 1 + (hash2(mp.getX(i) * 9, mp.getZ(i) * 7 + mp.getY(i)) - .5) * .3; mp.setX(i, mp.getX(i) * k); mp.setZ(i, mp.getZ(i) * k); }
  mound.computeVertexNormals();
  const mounds = [];
  guard = 0;
  while (mounds.length < 90 && guard++ < 9000) { const x = X0 + rnd() * (X1 - X0), z = Z0 + rnd() * (Z1 - Z0); if (occupied(x, z, .5) || Math.abs(x) < 9 || (z > 140 && z < 950)) continue; const s = .6 + rnd() * .9; mounds.push({ x, y: H(x, z) - .1, z, ry: rnd() * 6, s, r: .7, g: .38, b: .24 }); }
  chunked(scene, mound, tag(new THREE.MeshLambertMaterial({ color: '#ffffff' }), CLS.rock), mounds, { shadow: true });
  const boulder = new THREE.DodecahedronGeometry(1, 0), stones = [];
  guard = 0;
  while (stones.length < 30 && guard++ < 9000) { const x = X0 + rnd() * (X1 - X0), z = 25 + rnd() * 75; if (mountH(x, z) < .8 || occupied(x, z)) continue; const s = .35 + rnd() * .7; stones.push({ x, y: H(x, z) + s * .2, z, rx: rnd() * 3, ry: rnd() * 3, sx: s * 1.3, sy: s * .8, sz: s, r: .42, g: .4, b: .37 }); }
  chunked(scene, boulder, tag(new THREE.MeshLambertMaterial({ color: '#ffffff' }), CLS.rock), stones, { shadow: true });
}

// ---------- construção ----------
const MAT = {};
const matCache = new Map();
function cmat(hex, cls = CLS.accent, e = .3) {
  const key = `${hex}|${cls}|${e}`;
  if (!matCache.has(key)) matCache.set(key, tag(new THREE.MeshLambertMaterial({ color: hex, emissive: new THREE.Color(hex).multiplyScalar(e) }), cls));
  return matCache.get(key);
}
const freshMat = (hex, cls, e = .3) => tag(new THREE.MeshLambertMaterial({ color: hex, emissive: new THREE.Color(hex).multiplyScalar(e) }), cls);
function mats(texs) {
  const L = (o, cls) => tag(new THREE.MeshLambertMaterial(o), cls);
  Object.assign(MAT, {
    wallCream: L({ color: '#efe3c8' }, CLS.wall), wallWhite: L({ color: '#f2efe8' }, CLS.wall), wallOchre: L({ color: '#e7b25a' }, CLS.wall),
    wallBlue: L({ color: '#9fb6d8' }, CLS.wall), wallGreen: L({ color: '#a9c79a' }, CLS.wall), wallPink: L({ color: '#e9a99a' }, CLS.wall),
    wallMetal: L({ color: '#a9b2be' }, CLS.wall), wallBrick: L({ color: '#b8664a' }, CLS.wall),
    roofTile: L({ color: '#c8643c', emissive: '#40150a', emissiveIntensity: .4, side: THREE.DoubleSide }, CLS.roof),
    roofTin: L({ color: '#8f97a3', emissive: '#1b1f26', emissiveIntensity: .3, side: THREE.DoubleSide }, CLS.roof),
    roofFlat: L({ color: '#6f6a64', emissive: '#16130f', emissiveIntensity: .3 }, CLS.roof),
    roofGreen: L({ color: '#6fa77c', emissive: '#16301f', emissiveIntensity: .35, side: THREE.DoubleSide }, CLS.roof),
    wood: L({ map: texs.planks, color: '#c68e5a' }, CLS.wood), woodDark: L({ map: texs.planks, color: '#8a5a36' }, CLS.wood),
    stone: L({ map: texs.slate, color: '#d6d1c8' }, CLS.stone), window: L({ color: '#28323f', emissive: '#0c1420', emissiveIntensity: .5 }, CLS.window),
    blue: cmat('#3f7fe0', CLS.accent, .35), red: cmat('#e04a2a', CLS.accent, .35), white: L({ color: '#f4f4ef' }, CLS.wall),
    green: cmat('#2e9a52', CLS.accent, .3), gold: cmat('#f2c335', CLS.accent, .45), orange: cmat('#f08a24', CLS.accent, .35),
    yellow: cmat('#f2c935', CLS.accent, .4), metal: L({ color: '#b8bec8' }, CLS.stone), dark: L({ color: '#2b2a2c' }, CLS.stone),
    rubber: L({ color: '#1c1c1e' }, CLS.stone), screen: cmat('#5a9bfc', CLS.accent, .9), lineWhite: L({ color: '#f2f2ec', emissive: '#555555' }, CLS.wall),
    lineYellow: cmat('#f2c935', CLS.wall, .4),
  });
}
function box(parent, w, h, d, mat, x, y, z, ry = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.rotation.y = ry;
  m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
function cyl(parent, rt, rb, h, mat, x, y, z, seg = 8) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
function gable(parent, w, d, h, mat, x, y, z) {
  const sh = new THREE.Shape(); sh.moveTo(-d / 2 - .35, 0); sh.lineTo(0, h); sh.lineTo(d / 2 + .35, 0); sh.lineTo(-d / 2 - .35, 0);
  const g = new THREE.ExtrudeGeometry(sh, { depth: w + .7, bevelEnabled: false }); g.rotateY(Math.PI / 2); g.translate(-(w + .7) / 2, 0, 0);
  const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
function windows(parent, x0, x1, y, z, n, w = .7, h = .8, mat = MAT.window) { for (let i = 0; i < n; i++) { const x = n === 1 ? (x0 + x1) / 2 : lerp(x0, x1, i / (n - 1)); box(parent, w, h, .08, mat, x, y, z); } }
function house(g, x, zf, { w = 6, d = 4, h = 2.6, wall = MAT.wallCream, roof = MAT.roofTile } = {}) {
  const z = zf - d / 2, y = H(x, z);
  box(g, w + .6, .3, d + .6, MAT.stone, x, y + .1, z);
  box(g, w, h, d, wall, x, y + .25 + h / 2, z);
  gable(g, w, d, 1.6, roof, x, y + .25 + h, z);
  box(g, .95, 1.75, .1, MAT.woodDark, x + w * .18, y + .25 + .88, zf + .02);
  windows(g, x - w * .34, x - w * .06, y + .25 + h * .58, zf + .02, 2, .8, .75);
  return y;
}
// Laje com caixas de ar-condicionado e claraboias, para o telhado não virar um bloco liso.
function roofKit(g, x, y, z, w, d) {
  for (let i = 0; i < Math.floor(w / 5); i++) { const ax = x - w / 2 + 2.5 + i * 5; box(g, 1.4, .8, 1.1, MAT.metal, ax, y + .4, z - d * .2); box(g, .9, .1, .9, MAT.dark, ax, y + .85, z - d * .2); }
  for (let i = 0; i < Math.floor(w / 7); i++) box(g, 2.4, .25, 1.6, MAT.window, x - w / 2 + 3.5 + i * 7, y + .12, z + d * .18);
  box(g, w, .5, .25, MAT.wallWhite, x, y + .25, z + d / 2 + .1);
}
// Fachada com aberturas de verdade: as janelas são buracos, com o cômodo visível atrás.
function facade(g, mat, { x0, x1, y0, zf, fh, floors, holes, sill = .5, wh = 3, t = .3, rec = 1.4 }) {
  const band = (a, b) => { if (b - a > .01) box(g, x1 - x0, b - a, t, mat, (x0 + x1) / 2, (a + b) / 2, zf - t / 2); };
  for (let f = 0; f < floors; f++) {
    const fy = y0 + f * fh, wy0 = fy + sill, wy1 = wy0 + wh;
    band(fy, wy0); band(wy1, fy + fh);
    let cur = x0;
    for (const h of holes.filter(q => q.f === f).sort((a, b) => a.x - b.x)) {
      const a = h.x - h.w / 2;
      if (a > cur) box(g, a - cur, wh, t, mat, (a + cur) / 2, (wy0 + wy1) / 2, zf - t / 2);
      cur = h.x + h.w / 2;
    }
    if (x1 > cur) box(g, x1 - cur, wh, t, mat, (x1 + cur) / 2, (wy0 + wy1) / 2, zf - t / 2);
    box(g, x1 - x0 - .1, .2, rec, MAT.stone, (x0 + x1) / 2, fy + .1, zf - rec / 2);
  }
  for (const sx of [x0 + t / 2, x1 - t / 2]) box(g, t, floors * fh, rec, mat, sx, y0 + floors * fh / 2, zf - rec / 2);
}
// Cômodo atrás de uma janela: parede do fundo, vidro e um "eu" que aparece quando o cômodo é escolhido.
function room(g, { x, w, fy, zf, sill = .5, wh = 3, rec = 1.4, color }) {
  const backMat = freshMat('#3a3f4a', CLS.wall, .1);
  const back = box(g, w + .2, wh, .1, backMat, x, fy + sill + wh / 2, zf - rec + .06);
  const glass = box(g, w, wh, .06, MAT.window, x, fy + sill + wh / 2, zf - .12);
  const props = new THREE.Group(); g.add(props);
  const clone = makeMe(1);
  clone.g.position.set(x - w * .18, fy + .2, zf - rec * .5); clone.g.visible = false; g.add(clone.g);
  return { back, backMat, glass, props, clone, lit: new THREE.Color(color), dim: new THREE.Color('#3a3f4a'), k: 0, x, fy, zf, rec, w };
}
// Porta de duas folhas que abre para fora (para a câmera), com o escuro do saguão atrás. Devolve as dobradiças.
function doubleDoor(g, x, y, z, w, h, mat = MAT.woodDark) {
  box(g, w, h, .04, MAT.dark, x, y + h / 2, z + .03);
  return [-1, 1].map((sx) => {
    const hinge = new THREE.Group(); hinge.position.set(x + sx * w / 2, y, z + .1); g.add(hinge);
    box(hinge, w / 2 - .02, h, .12, mat, -sx * w / 4, h / 2, 0);
    box(hinge, .08, .3, .14, MAT.gold, -sx * (w / 2 - .22), h * .48, .04);
    hinge.userData.sx = sx;
    return hinge;
  });
}
// Mesa com cadeira: a cadeira fica atrás (em z) ou ao lado, conforme `side`.
function desk(p, x, y, z, { w = 1.4, d = .7, ry = 0, monitor = false, chair = true } = {}) {
  const gp = new THREE.Group(); gp.position.set(x, y, z); gp.rotation.y = ry; p.add(gp);
  box(gp, w, .08, d, MAT.wood, 0, .82, 0);
  for (const sx of [-w / 2 + .08, w / 2 - .08]) box(gp, .08, .82, d - .1, MAT.woodDark, sx, .41, 0);
  if (monitor) { box(gp, .7, .46, .05, MAT.screen, 0, 1.18, d * .25); box(gp, .08, .3, .08, MAT.dark, 0, .96, d * .3); }
  if (chair) { box(gp, .55, .08, .55, MAT.dark, 0, .5, -d / 2 - .45); box(gp, .55, .6, .08, MAT.dark, 0, .82, -d / 2 - .74); }
  return gp;
}

// Lote de geometria: junta caixas e telhados da mesma cor em poucas malhas (a cidade tem centenas de casas).
function makeBatch() {
  const groups = new Map();
  const put = (geo, mat, z) => {
    const g2 = geo.index ? geo.toNonIndexed() : geo; g2.clearGroups();
    const key = `${mat.uuid}:${Math.floor((z - Z0) / 40)}`;
    if (!groups.has(key)) groups.set(key, { mat, list: [] });
    groups.get(key).list.push(g2);
  };
  return {
    box(w, h, d, mat, x, y, z, ry = 0) { const g2 = new THREE.BoxGeometry(w, h, d); if (ry) g2.rotateY(ry); g2.translate(x, y, z); put(g2, mat, z); },
    cyl(rt, rb, h, mat, x, y, z, seg = 8) { const g2 = new THREE.CylinderGeometry(rt, rb, h, seg); g2.translate(x, y, z); put(g2, mat, z); },
    geo: put,
    flush(parent) {
      for (const { mat, list } of groups.values()) { const m = new THREE.Mesh(mergeGeometries(list), mat); m.castShadow = true; m.receiveShadow = true; parent.add(m); }
      groups.clear();
    },
  };
}
function gableGeo(w, d, h) {
  const sh = new THREE.Shape(); sh.moveTo(-d / 2 - .35, 0); sh.lineTo(0, h); sh.lineTo(d / 2 + .35, 0); sh.lineTo(-d / 2 - .35, 0);
  const g2 = new THREE.ExtrudeGeometry(sh, { depth: w + .5, bevelEnabled: false }); g2.rotateY(Math.PI / 2); g2.translate(-(w + .5) / 2, 0, 0);
  return g2;
}
const WALLS = ['#efe3c8', '#e7b25a', '#9fb6d8', '#a9c79a', '#e9a99a', '#f2efe8', '#d9b48a', '#c9d6e0', '#f0c9a0', '#b8d4b0', '#d7a6c9', '#e6d27a'];
const AWNING = ['#e04a2a', '#2e9a52', '#3f7fe0', '#f08a24', '#9b6cff', '#e2b13c', '#ff6f91'];
// Casa, loja ou prediozinho da cidade, com a fachada virada para +z (para a câmera).
function cityBuilding(B, x, zf, w, d, kind, r) {
  const y = PADY, wall = cmat(WALLS[(r() * WALLS.length) | 0], CLS.wall, .06);
  if (kind === 'house') {
    const h = 2.6 + r() * .7;
    B.box(w, h, d, wall, x, y + h / 2, zf - d / 2);
    const rf = gableGeo(w, d, 1.3 + r() * .5); rf.translate(x, y + h, zf - d / 2); B.geo(rf, r() < .7 ? MAT.roofTile : MAT.roofTin, zf);
    B.box(.9, 1.8, .1, MAT.woodDark, x + w * .22, y + .9, zf + .03);
    B.box(1, .9, .08, MAT.window, x - w * .2, y + 1.55, zf + .03);
    if (w > 6) B.box(1, .9, .08, MAT.window, x - w * .2 - 1.6, y + 1.55, zf + .03);
    return h + 1.5;
  }
  if (kind === 'shop') {
    const h = 3.4 + r() * 1.2, aw = cmat(AWNING[(r() * AWNING.length) | 0], CLS.accent, .35);
    B.box(w, h, d, wall, x, y + h / 2, zf - d / 2);
    B.box(w + .2, .3, d + .2, MAT.roofFlat, x, y + h + .15, zf - d / 2);
    B.box(w - 1, 2, .08, MAT.window, x, y + 1.1, zf + .03); // vitrine
    B.box(.9, 2, .1, MAT.dark, x + w / 2 - 1, y + 1, zf + .05);
    const awn = new THREE.BoxGeometry(w - .4, .12, 1.3); awn.rotateX(.35); awn.translate(x, y + 2.5, zf + .55); B.geo(awn, aw, zf);
    B.box(w * .7, .7, .12, aw, x, y + h - .6, zf + .08); // letreiro
    return h;
  }
  // prédio baixo de apartamentos ou escritórios
  const fl = 2 + ((r() * 3) | 0), fh = 3, h = fl * fh;
  B.box(w, h, d, wall, x, y + h / 2, zf - d / 2);
  B.box(w + .2, .3, d + .2, MAT.roofFlat, x, y + h + .15, zf - d / 2);
  B.box(1.4, .8, 1.1, MAT.metal, x - w / 4, y + h + .7, zf - d / 2);
  const nw = Math.max(1, Math.floor((w - 1) / 2.2));
  for (let f = 0; f < fl; f++) for (let i = 0; i < nw; i++) B.box(1.3, 1.4, .08, MAT.window, x - w / 2 + (i + .5) * (w / nw), y + f * fh + 1.6, zf + .03);
  B.box(1.2, 2, .1, MAT.dark, x, y + 1, zf + .05);
  return h;
}
// Preenche uma quadra com faixas de construções, da frente (z1) para o fundo.
function fillBlock(B, x0, x1, z0, z1, reserved, r) {
  let zf = z1, front = true;
  while (zf - z0 > 6) {
    const d = Math.min(zf - z0, 7 + r() * 4);
    let x = x0 + r() * .6;
    while (x1 - x > 4) {
      const w = Math.min(x1 - x, 4.5 + r() * 4.5), cx = x + w / 2;
      const hit = reserved.some(q => cx + w / 2 > q[0] && cx - w / 2 < q[1] && zf > q[2] && zf - d < q[3]);
      if (!hit) {
        const p = r(), kind = front ? (p < .55 ? 'shop' : p < .8 ? 'tall' : 'house') : (p < .7 ? 'house' : 'tall');
        cityBuilding(B, cx, zf, w - .6, Math.min(d, kind === 'house' ? 6 : d), kind, r);
      }
      x += w + .3 + r() * .7;
    }
    zf -= d + 1.4; front = false;
  }
}
// Vaga pintada no chão: as duas laterais e o fundo.
function stall(B, x, z, w, d, ry = 0) {
  const c = Math.cos(ry), s = Math.sin(ry), at = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  for (const sx of [-w / 2, w / 2]) { const [px, pz] = at(sx, 0); B.box(.1, .03, d, MAT.lineWhite, px, PADY + .03, pz, ry); }
  const [bx, bz] = at(0, -d / 2); B.box(w, .03, .1, MAT.lineWhite, bx, PADY + .03, bz, ry);
}

// ---------- pessoas e bichos ----------
function makePerson(o) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const M = hex => tag(new THREE.MeshLambertMaterial({ color: hex, emissive: new THREE.Color(hex).multiplyScalar(.3) }), CLS.person);
  const skin = M(o.skin), shirt = M(o.shirt), pants = M(o.pants), hair = M(o.hair), shoe = M('#2a2420');
  const B = (parent, w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; };
  const hip = (sx) => { const h = new THREE.Group(); h.position.set(sx, .82, 0); body.add(h); B(h, .21, .78, .23, pants, 0, -.39, 0); B(h, .22, .1, .32, shoe, 0, -.79, .05); return h; };
  const hipL = hip(-.13), hipR = hip(.13);
  const torso = new THREE.Group(); torso.position.y = .82; body.add(torso);
  B(torso, .54, .7, .3, shirt, 0, .35, 0);
  if (o.dress) B(torso, .62, .5, .38, shirt, 0, -.12, 0);
  const sh = (sx) => { const s = new THREE.Group(); s.position.set(sx, .62, 0); torso.add(s); B(s, .16, .3, .18, shirt, 0, -.12, 0); B(s, .13, .38, .15, skin, 0, -.44, 0); return s; };
  const shL = sh(-.36), shR = sh(.36);
  const head = new THREE.Group(); head.position.y = .74; torso.add(head);
  B(head, .36, .38, .34, skin, 0, .2, 0);
  B(head, .4, .13, .38, hair, 0, .43, -.01);
  B(head, .4, .32, .1, hair, 0, .27, -.17);
  if (o.long) { B(head, .44, .9, .13, hair, 0, -.08, -.2); B(head, .08, .55, .3, hair, -.2, .1, -.05); B(head, .08, .55, .3, hair, .2, .1, -.05); }
  if (o.hat) { const hm = M('#d9b86a'); const c = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .05, 10), hm); c.position.y = .47; head.add(c); const t = new THREE.Mesh(new THREE.CylinderGeometry(.2, .22, .2, 8), hm); t.position.y = .57; head.add(t); }
  const hand = new THREE.Group(); hand.position.set(0, -.64, .02); shR.add(hand);
  g.scale.setScalar(o.scale ?? 1.32);
  return { g, body, hipL, hipR, torso, shL, shR, head, hand, items: {}, st: { tc: 0 } };
}
const ME_LOOK = { skin: '#c99a6e', hair: '#22160e', shirt: '#4d8ef5', pants: '#2c3344' };
const makeMe = scale => makePerson({ ...ME_LOOK, scale });
function addItem(P, name, mesh) { mesh.visible = false; P.hand.add(mesh); P.items[name] = mesh; return mesh; }
function personAt(parent, opts, x, z, face = 0, y) { const P = makePerson(opts); P.g.position.set(x, y ?? H(x, z), z); P.g.rotation.y = face; parent.add(P.g); return P; }
const NPC = [['#c99a6e', '#3a3a40', '#d0c3a0', '#3a4150'], ['#8a5a3c', '#2a2420', '#e04a2a', '#2c3344'], ['#e0b48c', '#6b4a2a', '#2e9a52', '#5a4a3a'], ['#6b4126', '#141010', '#efe3c8', '#3a4150'], ['#b07850', '#1b120c', '#e7b25a', '#2a3a5a'], ['#d8a87c', '#5a3a20', '#9b6cff', '#3a3a40']];
const npc = (i, extra = {}) => { const p = NPC[i % NPC.length]; return { skin: p[0], hair: p[1], shirt: p[2], pants: p[3], long: i % 2 === 0, ...extra }; };

function applyPose(P, t, pose, k, walkPhase, walkAmt, sit = 0) {
  const a = walkAmt, ph = walkPhase;
  let hl = Math.sin(ph) * .75 * a, hr = -hl, al = -Math.sin(ph) * .65 * a, ar = -al, alz = -.06, arz = .06;
  let bodyY = Math.abs(Math.cos(ph)) * .07 * a, torsoX = .08 * a, headX = 0, headY = 0;
  const s = Math.sin, K = k;
  switch (pose) {
    case 'wave': arz = lerp(arz, 2.55 + s(t * 9) * .35, K); break;
    case 'read': al = lerp(al, -1.15, K); ar = lerp(ar, -1.15, K); alz = lerp(alz, -.35, K); arz = lerp(arz, .35, K); headX = .4 * K; break;
    case 'point': ar = lerp(ar, -1.45, K); arz = lerp(arz, .15, K); headY = s(t * .9) * .3 * K; break;
    case 'pointUp': ar = lerp(ar, -2.5 + s(t * 2) * .15, K); al = lerp(al, -.2, K); headX = -.35 * K; break;
    case 'type': al = lerp(al, -1.0 + s(t * 17) * .09, K); ar = lerp(ar, -1.0 - s(t * 17) * .09, K); headX = .3 * K; break;
    case 'hammer': ar = lerp(ar, -1.55 + Math.max(0, s(t * 6.5)) * -1.0, K); al = lerp(al, -.9, K); headX = .35 * K; torsoX += .15 * K; break;
    case 'cheer': alz = lerp(alz, -2.7 + s(t * 10) * .12, K); arz = lerp(arz, 2.7 - s(t * 10) * .12, K); bodyY += Math.abs(s(t * 4.2)) * .45 * K; break;
    case 'reach': ar = lerp(ar, -2.75 + s(t * 2.2) * .18, K); al = lerp(al, -.3, K); headX = -.4 * K; bodyY += Math.max(0, s(t * 2.2)) * .08 * K; break;
    case 'talk': ar = lerp(ar, -.9 + s(t * 3.1) * .45, K); al = lerp(al, -.55 + s(t * 2.3 + 1) * .3, K); arz = lerp(arz, .3, K); headY = s(t * 1.3) * .35 * K; break;
    case 'fish': ar = lerp(ar, -1.05, K); al = lerp(al, -1.05, K); alz = lerp(alz, -.25, K); arz = lerp(arz, .25, K); headX = .15 * K; break;
    case 'reel': ar = lerp(ar, -2.2 + s(t * 14) * .1, K); al = lerp(al, -1.6, K); headX = -.2 * K; break;
    case 'sway': headY = s(t * .7) * .25 * K; ar = lerp(ar, s(t * 1.1) * .08, K); break;
    // parado de pé, como quem chegou andando: braços soltos, peso trocando de perna, olhando em volta
    case 'stand': headY = s(t * .45) * .35 * K; hl = lerp(hl, s(t * .8) * .05, K); hr = lerp(hr, -s(t * .8) * .05, K); al = lerp(al, .06 + s(t * 1.2) * .04, K); ar = lerp(ar, .06 - s(t * 1.2) * .04, K); bodyY += Math.abs(s(t * .8)) * .015 * K; break;
    case 'dance': { const b = s(t * 7); alz = lerp(alz, -2.2 - b * .5, K); arz = lerp(arz, 2.2 - b * .5, K); bodyY += Math.abs(b) * .22 * K; headY = s(t * 3.5) * .3 * K; hl = lerp(hl, b * .25, K); hr = lerp(hr, -b * .25, K); break; }
    case 'inspect': ar = lerp(ar, -1.35 + s(t * 1.7) * .08, K); arz = lerp(arz, -.25, K); al = lerp(al, -.7, K); headX = .45 * K; torsoX += .18 * K; headY = s(t * .9) * .2 * K; break;
    case 'phone': ar = lerp(ar, -1.25, K); arz = lerp(arz, -.2, K); headX = .4 * K; break;
    case 'show': ar = lerp(ar, -1.5, K); arz = lerp(arz, -.05, K); headX = .1 * K; break;
    case 'weary': headX = .22 * K; torsoX += .1 * K; al = lerp(al, .08, K); ar = lerp(ar, .08, K); break;
    case 'tired': headX = .5 * K; torsoX += .28 * K; al = lerp(al, .12, K); ar = lerp(ar, .12, K); break;
    case 'give': ar = lerp(ar, -1.4, K); al = lerp(al, -1.3, K); torsoX += .12 * K; break;
    case 'pickLow': torsoX += .55 * K; ar = lerp(ar, -.9, K); al = lerp(al, -.9, K); headX = .3 * K; break;
    case 'roll': { const r2 = Math.max(0, s(t * 3)); ar = lerp(ar, -1 - r2 * .9, K); arz = lerp(arz, .2, K); headX = .3 * K; break; }
    case 'kick': { const kk = P.st.kick ?? 0; hr = lerp(hr, -Math.sin(kk * Math.PI) * 1.3 + .2 * (1 - kk), K); al = lerp(al, -.5, K); arz = lerp(arz, .4, K); break; }
    case 'serve': { const c = P.st.tc ?? 0; ar = lerp(ar, c < .5 ? -2.8 : c < .8 ? lerp(-2.8, -.6, (c - .5) / .3) : -.6, K); al = lerp(al, c < .5 ? -2.4 : -.4, K); break; }
    case 'swing': { const c = P.st.tc ?? 0; const sw = c < .3 ? lerp(.4, -1.6, c / .3) : lerp(-1.6, -.9, clamp((c - .3) / .4)); ar = lerp(ar, -1.1, K); arz = lerp(arz, sw, K); torsoX += .1 * K; break; }
    case 'dribble': { ar = lerp(ar, -.7 + Math.abs(s(t * 6)) * .5, K); arz = lerp(arz, .25, K); break; }
    case 'shoot': { const c = P.st.tc ?? 0; ar = lerp(ar, c < .4 ? -2.2 : -3, K); al = lerp(al, c < .4 ? -2.2 : -2.8, K); headX = -.3 * K; bodyY += Math.sin(clamp(c / .8) * Math.PI) * .5 * K; break; }
    case 'throw': {
      const c = P.st.tc ?? 0;
      const v = c < .35 ? lerp(0, 1.3, c / .35) : c < .5 ? lerp(1.3, -2.4, (c - .35) / .15) : c < 1.1 ? lerp(-2.4, -.2, (c - .5) / .6) : -.2;
      ar = lerp(ar, v, K); al = lerp(al, -.35, K); torsoX += (c > .35 && c < .75 ? .22 : 0) * K; break;
    }
    case 'carry': al = lerp(al, -1.0, K); ar = lerp(ar, -1.0, K); alz = lerp(alz, .32, K); arz = lerp(arz, -.32, K); break;
    case 'wade': al = lerp(al, -.3, K); ar = lerp(ar, -.3, K); alz = lerp(alz, -.6, K); arz = lerp(arz, .6, K); hl *= 1.5; hr *= 1.5; bodyY += Math.abs(s(ph)) * .06 * a; break;
    case 'ride': al = lerp(al, -1.25, K); ar = lerp(ar, -1.25, K); alz = lerp(alz, .14, K); arz = lerp(arz, -.14, K); torsoX = .22 * K; break;
    case 'hoe': { const sw = s(t * 2.6); ar = lerp(ar, -1.4 + sw * .8, K); al = lerp(al, -1.2 + sw * .8, K); arz = lerp(arz, -.25, K); alz = lerp(alz, .25, K); torsoX = (.3 + sw * .15) * K; headX = .2 * K; break; }
    case 'kiss': al = lerp(al, -1.1, K); ar = lerp(ar, -1.1, K); alz = lerp(alz, .5, K); arz = lerp(arz, -.5, K); torsoX = .16 * K; headX = .22 * K; break;
    case 'lift': { const up = Math.max(0, s(t * 2.2)); ar = lerp(ar, -1.2 - up * 1.6, K); al = lerp(al, -1.2 - up * 1.6, K); break; }
    default: break;
  }
  if (sit > 0) { hl = lerp(hl, -1.5, sit); hr = lerp(hr, -1.5, sit); bodyY -= .42 * sit; }
  P.hipL.rotation.x = hl; P.hipR.rotation.x = hr;
  P.shL.rotation.set(al, 0, alz); P.shR.rotation.set(ar, 0, arz);
  P.body.position.y = bodyY; P.torso.rotation.x = torsoX; P.head.rotation.set(headX, headY, 0);
}

// ---------- roteiros: gente que anda entre pontos ----------
// Um roteiro é uma lista de chaves [t, x, z, pose, face]. Cada chave começa um trecho que vai até a próxima:
// se a próxima está em outro lugar, a pessoa anda até lá (com os braços da pose, se for de carregar);
// se está no mesmo lugar, fica parada fazendo a pose e olhando para `face`.
const CARRY_POSES = new Set(['carry', 'tired', 'weary', 'phone']);
function script(x, z, face = 0) {
  const K = [[0, x, z, 'stand', face]];
  let t = 0, cx = x, cz = z;
  const api = {
    K,
    get t() { return t; },
    stay(dur, pose = 'stand', f) { K.push([t, cx, cz, pose, f]); t += dur; return api; },
    until(T, pose = 'stand', f) { if (T > t + 1e-4) api.stay(T - t, pose, f); return api; },
    go(pts, pose = 'none', v = 2.4) {
      for (const [px, pz] of pts) { const d = Math.hypot(px - cx, pz - cz); if (d < 1e-3) continue; K.push([t, cx, cz, pose]); t += d / v; cx = px; cz = pz; }
      return api;
    },
    end(T, pose = 'stand', f) { api.until(T, pose, f); K.push([T, cx, cz, pose, f]); return K; },
  };
  return api;
}
function playKeys(P, K, tc, t, sit = 0) {
  let i = 0; while (i < K.length - 1 && tc >= K[i + 1][0]) i++;
  const a = K[i], b = K[Math.min(i + 1, K.length - 1)];
  const span = b[0] - a[0], k = span > 0 ? clamp((tc - a[0]) / span) : 1;
  const dx = b[1] - a[1], dz = b[2] - a[2], moving = Math.abs(dx) + Math.abs(dz) > 1e-4 && span > 0;
  P.g.position.x = a[1] + dx * k; P.g.position.z = a[2] + dz * k;
  if (moving) {
    const v = Math.hypot(dx, dz) / span;
    P.g.rotation.y = Math.atan2(dx, dz);
    applyPose(P, t, CARRY_POSES.has(a[3]) ? a[3] : 'none', 1, (tc - a[0]) * v * 2.6 + i, clamp(v / 2.2) * (a[3] === 'tired' ? .7 : a[3] === 'weary' ? .88 : 1));
  } else {
    if (a[4] !== undefined) P.g.rotation.y = a[4];
    applyPose(P, t, a[3] || 'stand', 1, 0, 0, sit);
  }
}
// ponto na frente das mãos de alguém (no referencial do pai dele)
const holdAt = (P, out, up = 1.15, fw = .62) => out.set(P.g.position.x + Math.sin(P.g.rotation.y) * fw, up, P.g.position.z + Math.cos(P.g.rotation.y) * fw);
// Onde está um objeto: entradas [t, 'at', x, y, z], [t, 'hold', P, altura], [t, 'on', obj, dx, dy, dz] ou [t, 'gone'].
function track(m, T, tc) {
  let e = null;
  for (const q of T) { if (q[0] <= tc) e = q; else break; }
  if (!e || e[1] === 'gone') { m.visible = false; return; }
  m.visible = true;
  if (e[1] === 'at') { m.position.set(e[2], e[3], e[4]); m.rotation.y = 0; }
  else if (e[1] === 'hold') { holdAt(e[2], m.position, e[3] ?? 1.15, e[4] ?? .62); m.rotation.y = e[2].g.rotation.y; }
  else { m.position.set(e[2].position.x + e[3], e[2].position.y + e[4], e[2].position.z + e[5]); m.rotation.y = 0; m.visible = e[2].visible; }
}
// posição ao longo de uma linha quebrada, de 0 a 1
function along(pts, k) {
  let total = 0; const L = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); total += d; }
  let r = clamp(k) * total;
  for (let i = 0; i < L.length; i++) {
    if (r <= L[i] || i === L.length - 1) { const f = L[i] ? clamp(r / L[i]) : 1, a = pts[i], b = pts[i + 1]; return [lerp(a[0], b[0], f), lerp(a[1], b[1], f), Math.atan2(b[0] - a[0], b[1] - a[1])]; }
    r -= L[i];
  }
  return [pts[0][0], pts[0][1], 0];
}
const polyLen = pts => pts.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);

// a pitbull caramelo
function makeDog() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const M = hex => tag(new THREE.MeshLambertMaterial({ color: hex, emissive: new THREE.Color(hex).multiplyScalar(.3) }), CLS.person);
  const fur = M('#c98b4b'), chest = M('#f1e4cf'), nose = M('#2a1d16');
  const B = (p, w, h, d, m, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = true; p.add(b); return b; };
  B(body, .46, .42, 1.0, fur, 0, .62, 0);
  B(body, .38, .32, .14, chest, 0, .56, .5);
  const head = new THREE.Group(); head.position.set(0, .86, .56); body.add(head);
  B(head, .46, .4, .42, fur, 0, 0, 0); B(head, .28, .2, .28, chest, 0, -.08, .3); B(head, .12, .08, .08, nose, 0, -.02, .45);
  B(head, .1, .14, .08, fur, -.17, .22, -.08); B(head, .1, .14, .08, fur, .17, .22, -.08);
  const legs = [[-.14, .38], [.14, .38], [-.14, -.36], [.14, -.36]].map(([x, z]) => { const l = new THREE.Group(); l.position.set(x, .45, z); body.add(l); B(l, .13, .46, .13, fur, 0, -.22, 0); return l; });
  const tail = new THREE.Group(); tail.position.set(0, .76, -.5); body.add(tail); B(tail, .07, .07, .42, fur, 0, 0, -.2); tail.rotation.x = .6;
  const mouth = new THREE.Group(); mouth.position.set(0, -.12, .5); head.add(mouth);
  g.scale.setScalar(1.05);
  return { g, body, head, legs, tail, mouth, phase: 0 };
}
function animDog(D, t, speed, sit, dt) {
  D.phase += speed * dt * 3.2;
  const a = clamp(speed / 3);
  D.legs.forEach((l, i) => { l.rotation.x = Math.sin(D.phase + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * .8 * a; });
  if (sit > 0) { D.legs[2].rotation.x = D.legs[3].rotation.x = -1.2 * sit; D.body.rotation.x = -.38 * sit; D.body.position.y = -.12 * sit; }
  else { D.body.rotation.x = 0; D.body.position.y = Math.abs(Math.sin(D.phase)) * .08 * a; }
  D.tail.rotation.y = Math.sin(t * (sit ? 14 : 9)) * .7;
  D.head.rotation.x = sit ? -.15 : 0;
}

// veículos
function makeCar(hex) {
  const g = new THREE.Group(), m = cmat(hex, CLS.accent, .3);
  box(g, 4.2, .75, 1.9, m, 0, .68, 0);
  box(g, 2.3, .72, 1.72, m, -.25, 1.38, 0);
  box(g, 2.34, .46, 1.76, MAT.window, -.25, 1.42, 0);
  for (const [x, z] of [[1.35, .86], [1.35, -.86], [-1.35, .86], [-1.35, -.86]]) { const w = cyl(g, .38, .38, .26, MAT.rubber, x, .38, z, 10); w.rotation.x = Math.PI / 2; }
  box(g, .08, .2, 1.4, MAT.lineWhite, 2.1, .78, 0); box(g, .08, .2, 1.4, MAT.red, -2.1, .78, 0);
  return g;
}
function makeMoto(hex = '#e3262b') {
  const g = new THREE.Group(), red = cmat(hex, CLS.accent, .4);
  const wheels = [];
  for (const z of [.78, -.72]) { const w = new THREE.Mesh(new THREE.TorusGeometry(.34, .11, 6, 14), MAT.rubber); w.rotation.y = Math.PI / 2; w.position.set(0, .36, z); w.castShadow = true; g.add(w); wheels.push(w); }
  box(g, .3, .34, 1.1, red, 0, .68, 0);
  box(g, .46, .32, .62, red, 0, .92, .24);
  box(g, .36, .12, .72, MAT.rubber, 0, .94, -.36);
  box(g, .9, .06, .06, MAT.metal, 0, 1.22, .62);
  const fork = cyl(g, .04, .04, .9, MAT.metal, 0, .8, .7); fork.rotation.x = -.35;
  box(g, .2, .16, .1, MAT.lineWhite, 0, 1.02, .82);
  const ex = cyl(g, .06, .07, .8, MAT.metal, .22, .45, -.35); ex.rotation.x = Math.PI / 2;
  return { g, wheels };
}

// Caminhão com a cabine em +x e a caçamba aberta em -x (o piso da caçamba fica a 0,75 do chão).
function makeTruck(hex) {
  const g = new THREE.Group(), m = cmat(hex, CLS.accent, .3), side = cmat('#d6d1c8', CLS.wall, .1);
  box(g, 1.7, 1.7, 2.1, m, 2.75, 1.4, 0); box(g, .06, .75, 1.8, MAT.window, 3.62, 1.75, 0); box(g, 1.2, .5, 2.12, MAT.window, 2.6, 1.95, 0);
  box(g, 4.3, .22, 2.1, MAT.dark, -.35, .64, 0);
  for (const sz of [-1, 1]) box(g, 4.3, .6, .08, side, -.35, 1.05, sz * 1.02);
  box(g, .08, .6, 2.1, side, 1.78, 1.05, 0);
  const wheels = [];
  for (const [x, z] of [[2.7, 1.08], [2.7, -1.08], [-1.4, 1.08], [-1.4, -1.08]]) { const w = new THREE.Group(); w.position.set(x, .45, z); g.add(w); const c = cyl(w, .45, .45, .3, MAT.rubber, 0, 0, 0, 12); c.rotation.x = Math.PI / 2; wheels.push(w); }
  return { g, wheels };
}

// ---------- bandeiras ----------
function makeFlag(code) {
  const g = new THREE.Group(), W = 3, Hh = 1.9, d = .05;
  const P = (w, h, hex, x, y, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), cmat(hex, CLS.accent, .45)); m.position.set(x, y, z); g.add(m); return m; };
  if (code === 'br') {
    P(W, Hh, '#1f9a48', W / 2, 0);
    const dia = new THREE.Group(); dia.position.set(W / 2, 0, .03); dia.scale.set(1.45, .85, 1); g.add(dia);
    const m = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, d), cmat('#ffd21f', CLS.accent, .5)); m.rotation.z = Math.PI / 4; dia.add(m);
    const c = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, d, 14), cmat('#1d3f9a', CLS.accent, .45)); c.rotation.x = Math.PI / 2; c.position.set(W / 2, 0, .06); g.add(c);
  } else if (code === 'pt') {
    // verde e vermelho (2:3) e, sobre a divisa, a esfera armilar amarela com o escudo português por cima
    const cx = W * .4;
    P(cx, Hh, '#0f7a35', cx / 2, 0); P(W - cx, Hh, '#d8202a', cx + (W - cx) / 2, 0);
    const GOLD = cmat('#ffd21f', CLS.accent, .5);
    const arm = new THREE.Mesh(new THREE.TorusGeometry(.5, .06, 5, 20), GOLD); arm.position.set(cx, 0, .05); g.add(arm);
    for (const [ry, sy] of [[.18, .2], [-.18, .2]]) { const b = new THREE.Mesh(new THREE.TorusGeometry(.5, .04, 4, 20), GOLD); b.scale.y = sy; b.position.set(cx, ry, .05); g.add(b); } // as faixas da esfera
    // escudo: borda vermelha com castelos (pontos amarelos), campo branco com as cinco quinas azuis em cruz
    P(.5, .5, '#d8202a', cx, .06, .08);
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(.25, .25, d, 14, 1, false, Math.PI / 2, Math.PI), cmat('#d8202a', CLS.accent, .45)); tip.rotation.x = Math.PI / 2; tip.position.set(cx, -.19, .08); g.add(tip);
    for (const [x, y] of [[-.19, .22], [.19, .22], [-.19, -.08], [.19, -.08], [0, .26], [-.13, -.3], [.13, -.3]]) P(.07, .07, '#ffd21f', cx + x, y, .1);
    P(.3, .38, '#f4f4ef', cx, .02, .1);
    const tipW = new THREE.Mesh(new THREE.CylinderGeometry(.15, .15, d, 12, 1, false, Math.PI / 2, Math.PI), cmat('#f4f4ef', CLS.accent, .45)); tipW.rotation.x = Math.PI / 2; tipW.position.set(cx, -.17, .1); g.add(tipW);
    for (const [x, y] of [[0, .12], [-.09, 0], [0, 0], [.09, 0], [0, -.12]]) P(.07, .08, '#1d3f9a', cx + x, y, .12);
  }
  else if (code === 'us') {
    for (let i = 0; i < 7; i++) P(W, Hh / 7, i % 2 ? '#f4f4ef' : '#c8202f', W / 2, Hh / 2 - (i + .5) * Hh / 7);
    P(W * .42, Hh * .54, '#23306b', W * .21, Hh / 2 - Hh * .27, .03);
  } else {
    // México: verde escuro, branco e vermelho, com o brasão no meio (a águia marrom sobre o nopal, dentro da coroa
    // verde) — é o brasão que a diferencia da bandeira da Itália
    P(W / 3, Hh, '#006847', W / 6, 0); P(W / 3, Hh, '#f4f4ef', W / 2, 0); P(W / 3, Hh, '#ce1126', W * 5 / 6, 0);
    const disc = (r, hex, x, y, z, sy = 1) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d, 16), cmat(hex, CLS.accent, .45)); m.rotation.x = Math.PI / 2; m.scale.z = sy; m.position.set(x, y, z); g.add(m); return m; };
    const wreath = new THREE.Mesh(new THREE.TorusGeometry(.4, .07, 5, 16, Math.PI * 1.2), cmat('#2f7a2a', CLS.accent, .45)); wreath.rotation.z = Math.PI * .9; // arco aberto em cima wreath.position.set(W / 2, -.04, .05); g.add(wreath);
    disc(.3, '#7a4a1e', W / 2, .02, .06, 1.15); // corpo da águia
    P(.62, .16, '#8a5a2a', W / 2, .14, .08); // asas abertas
    P(.12, .14, '#5a3412', W / 2 + .2, .3, .09); // cabeça
    P(.34, .1, '#3f8f3a', W / 2, -.24, .08); // nopal
  }
  return g;
}
const COUNTRIES = [
  { code: 'br', lon: -52, color: '#2fd06a', poly: [[-60, 5], [-50, 2], [-35, -6], [-40, -22], [-53, -33], [-57, -30], [-58, -20], [-65, -10], [-73, -8], [-70, 2]] },
  { code: 'pt', lon: -8, color: '#ff4a4a', poly: [[-10, 42.5], [-6, 42.5], [-6.5, 36.8], [-9.5, 36.8]] },
  { code: 'us', lon: -98, color: '#6aa0ff', poly: [[-124, 48], [-95, 49], [-83, 46], [-70, 45], [-75, 35], [-81, 25], [-90, 29], [-97, 26], [-106, 31], [-117, 32], [-124, 40]] },
  { code: 'mx', lon: -102, color: '#ff9f3a', poly: [[-117, 32], [-106, 31], [-97, 26], [-97, 18], [-87, 21], [-90, 15], [-105, 20], [-112, 30]] },
];
const CONTINENTS = [
  [[-168, 66], [-140, 70], [-95, 72], [-80, 62], [-62, 58], [-55, 50], [-66, 44], [-75, 35], [-81, 25], [-97, 26], [-97, 18], [-87, 15], [-80, 8], [-92, 14], [-105, 20], [-112, 30], [-118, 34], [-124, 40], [-125, 48], [-135, 58], [-150, 60], [-165, 62]],
  [[-55, 82], [-30, 83], [-20, 70], [-45, 60], [-55, 70]],
  [[-80, 8], [-60, 10], [-50, 0], [-35, -6], [-40, -22], [-48, -28], [-58, -38], [-65, -55], [-72, -50], [-73, -35], [-71, -18], [-81, -6]],
  [[-10, 36], [-9, 43], [-2, 48], [-5, 58], [5, 62], [10, 70], [30, 71], [40, 66], [40, 46], [28, 41], [20, 40], [12, 44], [8, 44], [-2, 37]],
  [[-17, 15], [-17, 21], [-8, 35], [10, 37], [32, 31], [43, 12], [51, 11], [40, -15], [35, -25], [20, -35], [12, -17], [9, 4], [-8, 5]],
  [[40, 46], [40, 66], [70, 73], [110, 77], [140, 72], [170, 66], [160, 58], [140, 52], [130, 42], [122, 30], [110, 20], [105, 10], [98, 18], [92, 22], [80, 10], [72, 20], [60, 25], [48, 30], [35, 35]],
  [[114, -22], [130, -12], [142, -11], [153, -27], [146, -39], [135, -34], [115, -34]],
];
function globeTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const x = c.getContext('2d');
  const P = ([lon, lat]) => [(lon + 180) / 360 * 512, (90 - lat) / 180 * 256];
  x.fillStyle = '#1d5fa8'; x.fillRect(0, 0, 512, 256);
  x.strokeStyle = 'rgba(160,200,255,.35)'; x.lineWidth = 1;
  for (let i = 0; i < 12; i++) { x.beginPath(); x.moveTo(i * 512 / 12, 0); x.lineTo(i * 512 / 12, 256); x.stroke(); }
  for (let i = 1; i < 6; i++) { x.beginPath(); x.moveTo(0, i * 256 / 6); x.lineTo(512, i * 256 / 6); x.stroke(); }
  const poly = (pts, fill) => { x.beginPath(); pts.forEach((p, i) => { const [a, b] = P(p); if (i) x.lineTo(a, b); else x.moveTo(a, b); }); x.closePath(); x.fillStyle = fill; x.fill(); };
  for (const pts of CONTINENTS) poly(pts, '#5f9a52');
  COUNTRIES.forEach(k => poly(k.poly, k.color));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// o globo do Mercado Eletrônico, na praça em frente à fábrica
const ME_GLOBE = [21.5, 331.4];

// ---------- os lugares ----------
function buildPlaces(scene, sel, U, lite) {
  const g = new THREE.Group(); scene.add(g);
  const B = makeBatch();
  const r = (() => { let s = 777; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const carCols = ['#d9d6cf', '#3a5f9a', '#2b2b2e', '#9a2b25', '#c7c2b6', '#2f6b4f', '#e2b13c', '#6a7280', '#efefef', '#5b3d8a'];
  const park = (x, z, ry) => { const c = makeCar(carCols[(r() * carCols.length) | 0]); c.position.set(x, PADY, z); c.rotation.y = ry; g.add(c); };
  const parkMoto = (x, z, ry, hex) => { const m = makeMoto(hex); m.g.position.set(x, PADY, z); m.g.rotation.y = ry; g.add(m.g); };

  // Casa no alto do morro: a casinha, a tigela da cachorra e uma cerca na beira do platô
  {
    const y = house(g, 12.5, 29.5, { w: 9, d: 6, h: 2.8, wall: MAT.wallCream });
    cyl(g, .3, .26, .16, MAT.red, 8.5, y + .08, 31.5);
    box(g, .5, .8, .45, MAT.blue, 18.6, y + .4, 30.6);
    let prev = null;
    for (let i = 0; i < 12; i++) {
      const x = -17 + i * 1.8, z = 21 + Math.sin(i) * .3, yy = H(x, z);
      cyl(g, .07, .08, 1, MAT.woodDark, x, yy + .5, z, 5);
      if (prev) { const m = box(g, Math.hypot(x - prev[0], z - prev[1]), .06, .06, MAT.woodDark, (x + prev[0]) / 2, (yy + prev[2]) / 2 + .8, (z + prev[1]) / 2); m.rotation.y = -Math.atan2(z - prev[1], x - prev[0]); m.rotation.z = Math.atan2(yy - prev[2], 1.8); }
      prev = [x, z, yy];
    }
  }

  // Escadas: degraus de pedra com mureta dos dois lados
  {
    const stepM = cmat('#d4d0c6', CLS.stone, .08), wallM = cmat('#9c978d', CLS.stone, .06);
    let acc = 0;
    for (let i = 1; i < pathS.length; i++) {
      const p = pathS[i], q = pathS[i - 1]; if (p.k !== 4) continue;
      acc += Math.hypot(p.x - q.x, p.z - q.z); if (acc < .42) continue; acc = 0;
      const ang = Math.atan2(p.x - q.x, p.z - q.z);
      B.box(2.3, .9, .46, stepM, p.x, p.y - .45, p.z, ang);
      for (const sd of [-1.3, 1.3]) B.box(.26, 1.3, .5, wallM, p.x + Math.cos(ang) * sd, p.y - .3, p.z - Math.sin(ang) * sd, ang);
    }
  }

  // Campus: prédio de dois andares encostado no barranco, com janelas grandes; cada formação acende um cômodo
  {
    const cx = 9, zf = 104, w = 22, d = 10, fh = 4.6, y = PADY + .05, x0 = cx - w / 2, x1 = cx + w / 2, rec = 2.4, wh = 3.4, sill = .6;
    box(g, w + 1.4, .3, d + 1.4, MAT.stone, cx, y, zf - d / 2);
    box(g, w, 2 * fh, d - rec, MAT.wallWhite, cx, y + .15 + fh, zf - rec - (d - rec) / 2);
    box(g, w + .7, .4, d + .7, MAT.roofFlat, cx, y + .15 + 2 * fh + .2, zf - d / 2);
    box(g, w + .7, .5, .3, MAT.blue, cx, y + .15 + 2 * fh - .1, zf + .2);
    roofKit(g, cx, y + .15 + 2 * fh + .4, zf - d / 2, w, d);
    const holes = [{ x: cx - 7, f: 1, w: 4.6 }, { x: cx, f: 1, w: 4.6 }, { x: cx + 7, f: 1, w: 4.6 }, { x: cx - 7, f: 0, w: 4.6 }, { x: cx + 7, f: 0, w: 4.6 }];
    facade(g, MAT.wallWhite, { x0, x1, y0: y + .15, zf, fh, floors: 2, holes, rec, wh, sill });
    const doors = doubleDoor(g, cx, y + .15, zf, 2.6, 3.2);
    box(g, 5, .25, 2.2, MAT.wallWhite, cx, y + 3.75, zf + 1);
    for (const sx of [-2.2, 2.2]) cyl(g, .16, .18, 3.6, MAT.wallWhite, cx + sx, y + 1.95, zf + 1.9);
    const R = holes.map((h, i) => room(g, { x: h.x, w: h.w, fy: y + .15 + h.f * fh, zf, rec, wh, sill, color: CAMPUS_TONES[i] }));
    const F = q => q.fy + .2;
    { const q = R[0]; desk(q.props, q.x + 1.1, F(q), q.zf - 1.1, { w: 1.6, monitor: true, chair: false }); }
    { const q = R[1]; box(q.props, 3, 1.5, .06, MAT.lineWhite, q.x + .4, F(q) + 2.1, q.zf - q.rec + .16); }
    { const q = R[2]; box(q.props, 1.1, 2.6, .6, MAT.dark, q.x + 1.4, F(q) + 1.3, q.zf - 1.5); for (let k = 0; k < 5; k++) box(q.props, .7, .07, .05, MAT.green, q.x + 1.4, F(q) + .5 + k * .45, q.zf - 1.18); }
    { const q = R[3]; box(q.props, 1.8, 2.6, .5, MAT.woodDark, q.x + 1.2, F(q) + 1.3, q.zf - q.rec + .4); for (let k = 0; k < 3; k++) box(q.props, 1.5, .6, .08, [MAT.red, MAT.blue, MAT.gold][k], q.x + 1.2, F(q) + .6 + k * .85, q.zf - q.rec + .68); }
    { const q = R[4]; desk(q.props, q.x + 1.1, F(q), q.zf - 1.1, { w: 1.6, chair: false }); box(q.props, 1.1, .06, .5, cmat('#1e7a3a', CLS.accent, .4), q.x + 1.1, F(q) + .9, q.zf - 1.1); box(q.props, .35, .08, .35, MAT.gold, q.x + 1.1, F(q) + .96, q.zf - 1.1); }
    R.forEach((q) => { q.clone.g.position.set(q.x - 1, F(q), q.zf - 1.1); });
    sel.campus = { rooms: R, cur: 0, poses: ['type', 'talk', 'type', 'read', 'hammer'], doors };
    const fx = -4.5, fz = zf + 3, fy = H(fx, fz); cyl(g, .07, .09, 7, MAT.metal, fx, fy + 3.5, fz);
    box(g, 2, .45, .05, MAT.blue, fx + 1.05, fy + 6.5, fz); box(g, 2, .45, .05, MAT.white, fx + 1.05, fy + 6.05, fz); box(g, 2, .45, .05, MAT.green, fx + 1.05, fy + 5.6, fz);
  }

  // Riacho: pedras soltas na beira e um tronco caído
  {
    for (let i = 0; i < 26; i++) { const x = -40 + i * 3.2 + Math.sin(i) * 1.2, z = streamZ(x) + (i % 2 ? 5.8 : -6) + Math.sin(i * 3) * .5; if (Math.abs(x + 9) < 4) continue; const s = .3 + (i % 3) * .2; const m = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), cmat('#9a948a', CLS.rock, .1)); m.position.set(x, H(x, z) + s * .3, z); m.castShadow = true; g.add(m); }
    const lz = streamZ(16) - 6.5, lg = cyl(g, .3, .34, 5, MAT.woodDark, 16, H(16, lz) + .3, lz); lg.rotation.z = Math.PI / 2; lg.rotation.y = .4;
  }

  // ---------- cidade ----------
  const [h1, h2, h3, h4] = STREETS;
  {
    for (const c of STREETS) for (let x = -48; x < 48; x += 4) if (Math.abs(x) > 5) B.box(1.8, .03, .14, MAT.lineYellow, x, PADY + .03, c);
    for (let z = h1 + 6; z < h4 - 5; z += 4) if (STREETS.every(c => Math.abs(z - c) > 8.6)) B.box(.14, .03, 1.8, MAT.lineYellow, 0, PADY + .03, z);
    // faixas de pedestre: as listras ficam paralelas ao fluxo dos carros, lado a lado no sentido de quem atravessa
    for (const c of STREETS) {
      for (let k = 0; k < 7; k++) B.box(3.4, .03, .5, MAT.lineWhite, 6.4, PADY + .03, c - 2.7 + k * .9); // atravessando a rua (carros em x)
      for (let k = 0; k < 7; k++) { // atravessando a avenida (carros em z)
        if (c < h4) B.box(.5, .03, 3, MAT.lineWhite, -2.7 + k * .9, PADY + .03, c + 6.2);
        if (c > h1) B.box(.5, .03, 3, MAT.lineWhite, -2.7 + k * .9, PADY + .03, c - 6.2);
      }
    }
    // quadras com casas, lojas e prediozinhos; os lugares onde trabalhei ficam reservados
    const RES = [[5, 25, 200, 216], [5, 31, 225, 247], [-29, -5, 262, 276], [8.6, 33.4, 300, 337], [-29, -5, 147, 164], [3, 31, 344, 375]];
    for (const [z0, z1] of [[147, h1 - 5.2], [h1 + 5.2, h2 - 5.2], [h2 + 5.2, h3 - 5.2], [h3 + 5.2, h4 - 5.2], [h4 + 5.2, 373.5]]) {
      fillBlock(B, -47, -5.2, z0, z1, RES, r); fillBlock(B, 5.2, 47, z0, z1, RES, r);
    }
    // estacionamento 1: carros e motos nas vagas; a minha fica na vaga do meio, de frente para a saída
    for (let i = 0; i < 4; i++) { const x = -26 + i * 3.1; stall(B, x, 151.6, 2.9, 5); if (i !== 2) park(x, 151.6, Math.PI / 2); }
    for (const x of [-16.8, -15.4, -14, -12.6, -11.2, -9.8]) { stall(B, x, 157, 1.4, 2.4); if (x === -15.4 || x === -11.2) parkMoto(x, 157, 0, x < -14 ? '#2f6fd8' : '#1c1c1e'); }
    // estacionamento 2, depois do Mercado Eletrônico
    [13, 16.1, 19.2, 22.3, 25.4].forEach((x, i) => { stall(B, x, 348.2, 2.9, 5); if (i !== 1) park(x, 348.2, Math.PI / 2); });
    [19.4, 22.5, 25.6, 28.7].forEach((x, i) => { stall(B, x, 369.8, 2.9, 5, Math.PI); if (i !== 2) park(x, 369.8, -Math.PI / 2); });
    for (const x of [11.2, 12.6, 14, 15.4, 16.8]) { stall(B, x, 368.5, 1.4, 2.4, Math.PI); if (x === 12.6 || x === 16.8) parkMoto(x, 368.5, Math.PI, x < 14 ? '#e2b13c' : '#2b2b2e'); }
    for (let x = 4; x <= 30; x += 1.6) { if (x > 13.2 && x < 15.8) continue; B.cyl(.06, .06, 1.2, MAT.metal, x, PADY + .6, 373.6, 5); }
    for (const [a, b] of [[4, 13.2], [15.8, 30]]) B.box(b - a, .06, .06, MAT.metal, (a + b) / 2, PADY + 1.05, 373.6);
  }

  // Iteraima: escritório de dois andares e, do outro lado da rua, a roça com gente trabalhando
  {
    const cx = 15, zf = h2 - 5.2, w = 18, d = 10, h = 7.4, y = PADY;
    box(g, w, h, d, MAT.wallGreen, cx, y + h / 2, zf - d / 2);
    gable(g, w, d, 2.2, MAT.roofTin, cx, y + h, zf - d / 2);
    box(g, w + .2, .22, .6, MAT.white, cx, y + 3.7, zf + .25);
    for (const ox of [-7, -4, 3.5, 7]) box(g, 2.1, 1.9, .08, MAT.window, cx + ox, y + 1.75, zf + .03);
    for (const ox of [-7, -3.5, 0, 3.5, 7]) box(g, 2.1, 1.9, .08, MAT.window, cx + ox, y + 5.4, zf + .03);
    box(g, 1.7, 2.7, .12, MAT.woodDark, 14, y + 1.35, zf + .05);
    box(g, 4.4, .9, .16, MAT.green, 14, y + 3.15, zf + .12);
    const fx = cx + 10, fz = zf + 1, fy = PADY; cyl(g, .06, .08, 6, MAT.metal, fx, fy + 3, fz);
    box(g, 1.8, .4, .05, MAT.blue, fx + .95, fy + 5.6, fz); box(g, 1.8, .4, .05, MAT.white, fx + .95, fy + 5.2, fz); box(g, 1.8, .4, .05, MAT.green, fx + .95, fy + 4.8, fz);
    const plants = [];
    for (let z = 227.6; z < 245.5; z += 1.4) for (let x = 7; x < 29.5; x += .9) { if (x > 21 && x < 27.5 && z > 239) continue; plants.push({ x: x + (hash2(x, z) - .5) * .2, y: H(x, z), z: z + .45, ry: hash2(z, x) * 6, s: .7 + hash2(x * 3, z) * .5, r: .25, g: .58 + hash2(x, z * 2) * .2, b: .12 }); }
    const pg = new THREE.ConeGeometry(.28, .9, 5); pg.translate(0, .45, 0);
    chunked(scene, pg, tag(new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }), CLS.leaf, leafWind), plants);
    for (let x = 6; x <= 30; x += 1.8) for (const z of [226.5, 246]) if (z > 230 || x < 12 || x > 15) B.cyl(.06, .07, 1.1, MAT.woodDark, x, PADY + .55, z, 5);
    for (let z = 226.5; z <= 246; z += 1.8) for (const x of [6, 30]) B.cyl(.06, .07, 1.1, MAT.woodDark, x, PADY + .55, z, 5);
    const tr = new THREE.Group(); tr.position.set(24, PADY, 243); tr.rotation.y = -.5; g.add(tr);
    box(tr, 2.2, 1, 1.4, MAT.red, 0, 1.1, 0); box(tr, 1, 1, 1.2, MAT.window, -.5, 2, 0);
    for (const [x, z, rr] of [[-.8, .8, .75], [-.8, -.8, .75], [.9, .7, .45], [.9, -.7, .45]]) { const wl = cyl(tr, rr, rr, .35, MAT.rubber, x, rr, z, 10); wl.rotation.x = Math.PI / 2; }
    sel.farmers = [[10, 231, 0], [16.5, 236, 1], [25, 232, 2], [12, 241.5, 3]].map(([x, z, i]) => {
      const P = personAt(g, npc(i + 2, { hat: true, long: false, scale: 1.2 }), x, z, i % 2 ? -1.2 : .9);
      const hoe = new THREE.Group(); box(hoe, .05, 1.5, .05, MAT.woodDark, 0, -.1, .2); box(hoe, .3, .05, .2, MAT.metal, 0, -.85, .3); P.hand.add(hoe);
      return { P, face: P.g.rotation.y, hoe };
    });
  }

  // A&3: prédio de três andares; cada cargo é a janela do meio de um andar
  {
    const cx = -17, zf = h3 - 5.2, w = 22, d = 10, fh = 4.4, y = PADY + .05, x0 = cx - w / 2, x1 = cx + w / 2, rec = 2.8, wh = 3.2, sill = .6;
    box(g, w + 1.4, .3, d + 1.4, MAT.stone, cx, y, zf - d / 2);
    box(g, w, 3 * fh, d - rec, MAT.wallBlue, cx, y + .15 + 1.5 * fh, zf - rec - (d - rec) / 2);
    box(g, w + .6, .4, d + .6, MAT.roofFlat, cx, y + .15 + 3 * fh + .2, zf - d / 2);
    roofKit(g, cx + 3, y + .15 + 3 * fh + .4, zf - d / 2, w - 8, d);
    box(g, 5, 1.4, .25, MAT.orange, cx - 5, y + .15 + 3 * fh + 1.1, zf - .4);
    const holes = [{ x: cx - 7, f: 0, w: 4.6 }, { x: cx, f: 0, w: 4.6 }];
    for (let f = 1; f < 3; f++) for (const ox of [-7, 0, 7]) holes.push({ x: cx + ox, f, w: 4.6 });
    facade(g, MAT.wallWhite, { x0, x1, y0: y + .15, zf, fh, floors: 3, holes, rec, wh, sill });
    for (const hh of holes) if (hh.x !== cx) box(g, hh.w, wh, .06, MAT.window, hh.x, y + .15 + hh.f * fh + sill + wh / 2, zf - .12);
    const doors = doubleDoor(g, cx + 6.5, y + .15, zf, 2.2, 2.8);
    box(g, 3.4, .2, 1.4, MAT.wallWhite, cx + 6.5, y + 3.2, zf + .7);
    const R = [0, 1, 2].map(f => room(g, { x: cx, w: 4.6, fy: y + .15 + f * fh, zf, rec, wh, sill, color: ['#ffe2a8', '#cfe6ff', '#d6f5c6'][f] }));
    const F = q => q.fy + .2, back = q => q.zf - q.rec;
    // estagiário: estudando na mesa, de frente, com a cabeça soltando fumaça
    { const q = R[0]; desk(q.props, cx, F(q), q.zf - 1.05, { w: 1.8 }); box(q.props, .7, .04, .45, MAT.lineWhite, cx, F(q) + .88, q.zf - 1.05); for (let k = 0; k < 3; k++) box(q.props, .5, .1, .4, [MAT.red, MAT.blue, MAT.gold][k], cx + .65, F(q) + .91 + k * .1, q.zf - 1.1); q.clone.g.position.set(cx, F(q), q.zf - 1.85); q.pose = 'read'; q.sit = 1; q.face = 0; }
    // júnior: só eu no computador
    { const q = R[1]; box(q.props, 2.6, .08, .8, MAT.wood, cx, F(q) + .82, back(q) + .55); for (const sx of [-1.2, 1.2]) box(q.props, .08, .82, .7, MAT.woodDark, cx + sx, F(q) + .41, back(q) + .55); box(q.props, 1, .6, .06, MAT.screen, cx, F(q) + 1.2, back(q) + .3); box(q.props, .55, .08, .55, MAT.dark, cx, F(q) + .5, back(q) + 1.45); q.clone.g.position.set(cx, F(q), back(q) + 1.45); q.pose = 'type'; q.sit = 1; q.face = Math.PI; }
    // pleno: de pé, ajudando dois colegas nas telas deles
    {
      const q = R[2]; box(q.props, 4, .08, .8, MAT.wood, cx - .4, F(q) + .82, back(q) + .55); for (const sx of [-2.2, 1.4]) box(q.props, .08, .82, .7, MAT.woodDark, cx + sx, F(q) + .41, back(q) + .55);
      for (const sx of [-1.5, .3]) { box(q.props, .9, .55, .06, MAT.screen, cx + sx, F(q) + 1.18, back(q) + .3); box(q.props, .5, .08, .5, MAT.dark, cx + sx, F(q) + .5, back(q) + 1.45); }
      q.kids = [-1.5, .3].map((sx, i) => { const P = makePerson(npc(i + 1, { scale: .95 })); P.g.position.set(cx + sx, F(q), back(q) + 1.45); P.g.rotation.y = Math.PI; q.props.add(P.g); return P; });
      q.clone.g.position.set(cx + 1.65, F(q), back(q) + 1.75); q.pose = 'point'; q.sit = 0; q.face = -Math.PI / 2 - .5;
    }
    R.forEach((q) => { q.clone.g.rotation.y = q.face; });
    const puffs = Array.from({ length: 9 }, () => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(.42, 1), cmat('#9a9ca3', CLS.foam, .3)); m.visible = false; g.add(m); return m; });
    sel.a3 = { rooms: R, puffs, doors };
  }

  // Mercado Eletrônico: fábrica com telhado em dente de serra, recuada; na praça plana em frente, o globo e as bandeiras
  {
    const cx = 21, zf = 326, w = 22, d = 12, h = 6.4, y = PADY + .05;
    box(g, w, h, d, MAT.wallMetal, cx, y + h / 2, zf - d / 2);
    for (let i = 0; i < 5; i++) {
      const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(d / 5, 0); sh.lineTo(0, 1.9); sh.lineTo(0, 0);
      const geo = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false }); geo.rotateY(-Math.PI / 2); geo.translate(cx + w / 2, y + h, zf - d + i * d / 5);
      const m = new THREE.Mesh(geo, MAT.roofFlat); m.castShadow = true; g.add(m);
      box(g, w - .4, 1.5, .06, MAT.window, cx, y + h + .85, zf - d + i * d / 5 - .02);
    }
    box(g, w + .2, .7, .1, MAT.blue, cx, y + h - .5, zf + .02);
    for (const dx of [5, 9.2]) { box(g, 3.6, 3.8, .1, MAT.dark, cx + dx, y + 1.9, zf + .04); for (let k = 0; k < 6; k++) box(g, 3.6, .05, .04, MAT.metal, cx + dx, y + .4 + k * .6, zf + .1); }
    box(g, 1.5, 2.6, .12, MAT.dark, 12, y + 1.3, zf + .05); box(g, 2.6, .18, 1.2, MAT.wallWhite, 12, y + 2.9, zf + .6);
    box(g, 2.6, 1.4, .08, MAT.window, 15.8, y + 3.2, zf + .04); box(g, 2.6, 1.4, .08, MAT.window, 19.8, y + 3.2, zf + .04);
    const silos = [[cx + 3, zf - 15], [cx + 6, zf - 16]];
    for (const [sx, sz] of silos) { cyl(g, .55, .7, 10, MAT.metal, sx, y + 5, sz, 10); for (let k = 0; k < 3; k++) cyl(g, .62, .62, .4, k % 2 ? MAT.white : MAT.red, sx, y + 7 + k * .9, sz, 10); }
    // canteiros nas pontas da praça
    for (const bx2 of [10.6, 31.4]) { box(g, 1.4, .5, 9, MAT.stone, bx2, PADY + .25, 331.3); }
    // o globo, sempre girando, num pedestal à direita
    const [gx, gz] = ME_GLOBE, gy = PADY;
    cyl(g, 1.25, 1.55, 1.4, MAT.stone, gx, gy + .7, gz, 14);
    const globe = new THREE.Mesh(new THREE.SphereGeometry(2.8, 36, 20), tag(new THREE.MeshLambertMaterial({ map: globeTexture(), emissive: '#0a1a33', emissiveIntensity: .4 }), CLS.accent));
    globe.position.set(gx, gy + 1.4 + 3, gz); globe.rotation.x = .35; globe.castShadow = true; g.add(globe);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.2, .08, 6, 48), MAT.gold); ring.position.copy(globe.position); ring.rotation.set(.35, 0, 0); g.add(ring);
    // as quatro bandeiras hasteadas em volta do globo; a roda é girada para deixar livre o lado de onde eu olho
    const meStop = STOPS.find(s2 => s2.key === 'me'), a0 = Math.atan2(meStop.x - gx, meStop.z - gz) + Math.PI / 4;
    const flags = COUNTRIES.map((k, i) => {
      const a = a0 + i * Math.PI / 2, px = gx + Math.sin(a) * 4, pz = gz + Math.cos(a) * 4, py = PADY;
      cyl(g, .3, .35, .3, MAT.stone, px, py + .15, pz, 8);
      cyl(g, .07, .09, 9.5, MAT.metal, px, py + 4.75, pz); const s2 = cyl(g, .14, .14, .14, MAT.gold, px, py + 9.55, pz); s2.castShadow = false;
      // todas as bandeiras saem do mastro para a direita
      const wrap = new THREE.Group(); wrap.position.set(px + .08, py + 8.6, pz); wrap.scale.set(.8, .8, .8); g.add(wrap);
      const f = makeFlag(k.code); wrap.add(f);
      return { f, i };
    });
    const NPF = 32, puffs = Array.from({ length: NPF }, (_, i) => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(.5, 1), cmat('#d8dade', CLS.foam, .2)); g.add(m); return { m, o: (i >> 1) / (NPF / 2) + (i % 2) * .37, sx: silos[i % 2][0], sz: silos[i % 2][1] }; });
    sel.me = { globe, flags };
    U.push((t) => {
      for (const p of puffs) {
        const k = fract(t * .08 + p.o);
        p.m.position.set(p.sx + k * k * 3.4 + Math.sin(t * .8 + k * 5 + p.sx) * .3 * k, y + 10.2 + k * 6.5, p.sz + k * 1.5);
        p.m.scale.setScalar(Math.max(.001, (.4 + Math.sqrt(k) * 1.7) * sstep(0, .06, k) * (1 - sstep(.7, 1, k))));
      }
    });
  }

  // Parque industrial: vários galpões e fábricas soltos; os galpões dos projetos são abertos
  buildIndustrial(g, B, sel, U);

  // Rua com faixa de pedestre e semáforo
  {
    const zc = 730;
    for (let z = zc - 6.9; z <= zc + 7; z += 1.2) box(g, 5, .03, .6, MAT.lineWhite, 0, PADY + .04, z);
    for (let x = -58; x < 58; x += 5) if (Math.abs(x) > 4) B.box(2.4, .03, .16, MAT.lineYellow, x, PADY + .04, zc);
    const lights = [];
    for (const [x, z] of [[-4, 719.5], [4, 740.5]]) { const yy = PADY; cyl(g, .07, .08, 3, MAT.dark, x, yy + 1.5, z); const head = box(g, .4, .9, .3, MAT.dark, x, yy + 3.2, z); head.castShadow = false; lights.push({ r: box(g, .26, .26, .05, freshMat('#ff3b30', CLS.accent, .2), x, yy + 3.42, z + .17), gr: box(g, .26, .26, .05, freshMat('#30d158', CLS.accent, .2), x, yy + 2.98, z + .17) }); }
    sel.street = { lights };
  }

  // Praça: o pódio numa laje de calçada, passeios retos e as quadras entre eles (basquete, futsal, vôlei e tênis)
  {
    const y = PADY, px = -8, pz = 754;
    const steps = [[0, 1.4, 2.4], [-2.3, .9, 2.2], [2.3, .55, 2.2]];
    steps.forEach(([sx, h, w], k) => { box(g, w, h, 2.4, MAT.wallWhite, px + sx, y + h / 2, pz); box(g, w * .5, h * .4, .05, [MAT.gold, MAT.metal, MAT.orange][k], px + sx, y + h * .55, pz + 1.22); });
    FLOORS.push({ x0: px - 1.2, x1: px + 1.2, z0: pz - 1.2, z1: pz + 1.2, y: y + 1.4 });
    const tro = [];
    const cup = () => { const t = new THREE.Group(); cyl(t, .12, .28, .16, MAT.gold, 0, .08, 0); cyl(t, .06, .06, .34, MAT.gold, 0, .33, 0); cyl(t, .38, .14, .52, MAT.gold, 0, .76, 0, 10); return t; };
    [-15.2, -13.6, -12].forEach((sx) => { box(g, 1, .9, 1, MAT.stone, sx, y + .45, pz - .5); const t = cup(); t.position.set(sx, y + .9, pz - .5); g.add(t); tro.push({ obj: t, base: t.position.clone() }); });
    // ordem dos troféus: 0 Hackatur (centro), 1 Expoferr, 2 NASA
    sel.podium = { list: [tro[1], tro[0], tro[2]], cur: -1, h: 1.1 };
    [[-5, MAT.orange], [-6.8, MAT.green], [5, MAT.blue], [6.8, MAT.gold]].forEach(([fx, m]) => { const x = px + fx, fz = pz - 5.5; cyl(g, .06, .08, 6, MAT.metal, x, y + 3, fz); box(g, 1.7, 1.1, .05, m, x + .9, y + 5.3, fz); });
    // bancos virados para os passeios e postes de luz nas esquinas
    const bench = (x, z, f) => { const b = new THREE.Group(); b.position.set(x, H(x, z), z); b.rotation.y = f; g.add(b); box(b, 2.4, .14, .7, MAT.wood, 0, .5, 0); box(b, 2.4, .6, .1, MAT.wood, 0, .85, -.32); for (const sx of [-1, 1]) box(b, .1, .5, .6, MAT.dark, sx, .25, 0); };
    for (const x of [-30, -12, 12, 30]) { bench(x, 787.2, 0); bench(x + 3, 792.8, Math.PI); }
    for (const x of [-26, -8, 8, 26]) { bench(x, 814.2, 0); bench(x, 819.8, Math.PI); }
    for (const z of [770, 780, 800, 808, 828, 838]) bench(-2.9, z, Math.PI / 2);
    for (const [x, z] of [[2.6, 787], [-2.6, 793], [2.6, 814], [-2.6, 820], [-34, 787], [34, 793], [2.6, 840], [-20, 787], [20, 820]]) { const yy = H(x, z); cyl(g, .07, .1, 4.2, MAT.dark, x, yy + 2.1, z); box(g, .5, .4, .5, MAT.gold, x, yy + 4.3, z); }
    const team = (i, hex, extra = {}) => ({ ...npc(i, { scale: 1.2, long: false }), shirt: hex, ...extra });
    // pessoa que corre atrás de um alvo: anda (com passada) quando o alvo se afasta e olha para `look` quando chega
    const chase = (o, tx, tz, dt, t, look, pose = 'none', k = 4.5) => {
      const p = o.P.g.position, nx = damp(p.x, tx, k, dt), nz = damp(p.z, tz, k, dt), v = Math.hypot(nx - p.x, nz - p.z) / Math.max(dt, 1e-3);
      if (v > .4) o.face = Math.atan2(nx - p.x, nz - p.z); else if (look) o.face = Math.atan2(look.x - nx, look.z - nz);
      p.set(nx, y, nz); o.P.g.rotation.y = angDamp(o.P.g.rotation.y, o.face ?? 0, 10, dt);
      o.ph = (o.ph ?? 0) + v * dt * 2.6;
      applyPose(o.P, t, pose, 1, o.ph, clamp(v / 2.4));
    };
    const ballMesh = (r, hex, cls = CLS.accent) => { const b = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), cmat(hex, cls, .5)); b.castShadow = true; g.add(b); return b; };

    // basquete 2 contra 2: o armador vem quicando, passa, o outro arremessa e a bola cai pela rede
    {
      const X0 = -27, X1 = -5, cx = (X0 + X1) / 2, zc = 776, RIM = 3.05;
      const hoops = [];
      for (const [hx, dir] of [[X0 - .4, 1], [X1 + .4, -1]]) {
        cyl(g, .1, .1, 3.6, MAT.dark, hx, y + 1.8, zc); box(g, .5, .1, .1, MAT.dark, hx + dir * .3, y + 3.5, zc);
        box(g, .08, 1.1, 1.8, MAT.lineWhite, hx + dir * .6, y + RIM + .35, zc); box(g, .09, .45, .6, MAT.orange, hx + dir * .61, y + RIM + .2, zc);
        const rim = new THREE.Mesh(new THREE.TorusGeometry(.3, .045, 6, 16), MAT.orange); rim.rotation.x = Math.PI / 2; rim.position.set(hx + dir * 1, y + RIM, zc); g.add(rim);
        const net = new THREE.Mesh(new THREE.CylinderGeometry(.28, .18, .45, 10, 1, true), cmat('#f2f2ec', CLS.foam, .3)); net.material.side = THREE.DoubleSide; net.position.set(rim.position.x, y + RIM - .24, zc); g.add(net);
        hoops.push({ p: rim.position.clone(), net });
      }
      const A = [0, 1].map(i => ({ P: personAt(g, team(i + 1, '#e04a2a'), cx, zc, 0, y) }));
      const Bt = [0, 1].map(i => ({ P: personAt(g, team(i + 3, '#3f7fe0'), cx, zc, 0, y) }));
      const ball = ballMesh(.22, '#e8762a');
      const hand = new THREE.Vector3(), from = new THREE.Vector3();
      const PER = 6.4;
      U.push((t, dt, zc2) => {
        if (Math.abs(zc2 - zc) > 60) return;
        const n = Math.floor(t / PER), u = t - n * PER, atk = n % 2 ? Bt : A, def = n % 2 ? A : Bt, hp = hoops[n % 2 ? 0 : 1], dir = n % 2 ? -1 : 1, H2 = hp.p.x;
        const [hd, sh] = atk;
        const hT = u < 2.4 ? [lerp(cx - dir * 3, H2 - dir * 6.2, ease(u / 2.4)), zc + 2.4] : [H2 - dir * 5.6, zc + 1.4];
        const sT = u < 2.4 ? [lerp(cx + dir, H2 - dir * 4.6, ease(u / 2.4)), zc - 2.6] : u < 3.6 ? [H2 - dir * 3.6, zc - 1.6] : [H2 - dir * 3.6, zc - 1.6];
        const shooting = u > 3.6 && u < 4.7;
        sh.P.st.tc = (u - 3.6);
        chase(hd, ...hT, dt, t, sh.P.g.position, u < 2.4 ? 'dribble' : u < 3 ? 'give' : 'none');
        chase(sh, ...sT, dt, t, hp.p, shooting ? 'shoot' : u > 3 && u < 3.6 ? 'dribble' : 'none', shooting ? 12 : 4.5);
        // a defesa marca cada um entre ele e a cesta; quem marca o arremessador tenta tocar na bola
        // no fim, quem defendia o armador pega o rebote e vira o armador da próxima jogada (a bola nunca salta)
        def.forEach((d, i) => {
          const m = atk[i].P.g.position;
          if (i === 0 && u > 5.1) chase(d, cx + dir * 3, zc + 2.4, dt, t, hp.p, 'none', 3.2);
          else chase(d, m.x + dir * 1.2, lerp(m.z, zc, .3), dt, t, m, i === 1 && shooting ? 'reach' : 'none', 3.6);
        });
        if (u < 2.4) { holdAt(hd.P, hand, 1, .45); ball.position.set(hand.x, y + .22 + Math.abs(Math.sin(t * 7)) * .85, hand.z); }
        else if (u < 3) { const k = (u - 2.4) / .6; holdAt(hd.P, from, 1.3, .45); holdAt(sh.P, hand, 1.3, .45); ball.position.lerpVectors(from, hand, k); ball.position.y = y + 1.3 + Math.sin(k * Math.PI) * .5; }
        else if (u < 3.9) { holdAt(sh.P, hand, 1, .45); ball.position.set(hand.x, u < 3.6 ? y + .22 + Math.abs(Math.sin(t * 7)) * .85 : y + 2.3 + (u - 3.6) * 2, hand.z); from.copy(ball.position); }
        else if (u < 4.9) { const k = (u - 3.9) / 1; ball.position.lerpVectors(from, hp.p, k); ball.position.y = lerp(from.y, hp.p.y + .15, k) + Math.sin(k * Math.PI) * 2.2; }
        else if (u < 5.3) { const k = (u - 4.9) / .4; ball.position.set(hp.p.x, lerp(hp.p.y, y + .22, k * k), hp.p.z); }
        else {
          const k = ease((u - 5.3) / 1.1); holdAt(def[0].P, hand, 1, .45);
          const bounce = Math.abs(Math.sin((u - 5.3) * 9)) * .6 * (1 - k), dribble = Math.abs(Math.sin(t * 7)) * .85;
          ball.position.set(lerp(hp.p.x, hand.x, k), y + .22 + lerp(bounce, dribble, k), lerp(hp.p.z, hand.z, k));
        }
        hoops.forEach((h) => { h.net.scale.y = h === hp && u > 4.85 && u < 5.25 ? 1.35 : damp(h.net.scale.y, 1, 8, dt); });
      });
    }
    // futsal 3 contra 3 com goleiros: troca de passes rasteiros, chute, defesa ou gol; depois o outro time sai jogando
    {
      const X0 = 5, X1 = 27, cx = (X0 + X1) / 2, zc = 776;
      for (const [gx2, dir] of [[X0, 1], [X1, -1]]) {
        for (const sz of [-1.5, 1.5]) box(g, .12, 1.4, .12, MAT.lineWhite, gx2, y + .7, zc + sz);
        box(g, .12, .12, 3.1, MAT.lineWhite, gx2, y + 1.4, zc);
        box(g, .9, .05, 3, cmat('#d8dade', CLS.foam, .1), gx2 - dir * .45, y + 1.38, zc); box(g, .05, 1.35, 3, cmat('#d8dade', CLS.foam, .1), gx2 - dir * .9, y + .7, zc);
      }
      const teams = [['#f2c935', 0], ['#e9e6dc', 3]].map(([hex, o]) => [0, 1, 2].map(i => ({ P: personAt(g, team(i + o, hex), cx, zc, 0, y) })));
      const keepers = [X0 + .8, X1 - .8].map((x, i) => ({ P: personAt(g, team(5 + i, i ? '#2e9a52' : '#9b6cff'), x, zc, i ? -Math.PI / 2 : Math.PI / 2, y), x }));
      const ball = ballMesh(.2, '#f6f6f0', CLS.flower);
      const SHAPE = [[-4, -3.5], [-1.5, 3.2], [2, -1]];
      const PH = 9, PASS = 1.15;
      const foot = (P, out) => holdAt(P, out, .2, .45);
      const pa = new THREE.Vector3(), pb = new THREE.Vector3();
      U.push((t, dt, zc2) => {
        if (Math.abs(zc2 - zc) > 60) return;
        const n = Math.floor(t / PH), u = t - n * PH, T = n % 2, dir = T ? -1 : 1, goalX = T ? X0 : X1, keeper = keepers[T ? 0 : 1], atk = teams[T], dfd = teams[1 - T];
        const prog = clamp(u / 5.2), goal = n % 3 !== 1, seq = [0, 1, 2, 0, 1];
        const k = Math.min(4, Math.floor(u / PASS)), pu = u - k * PASS;
        const holder = atk[seq[k]], next = atk[seq[Math.min(k + 1, 4)]];
        // atacantes avançam em formação; a defesa recua entre a bola e o gol
        // ninguém sai da quadra: na linha, só os goleiros; os outros ficam até 2,2 antes do gol
        const inX = x => clamp(x, X0 + 2.2, X1 - 2.2), inZ = z => clamp(z, zc - 7.5, zc + 7.5);
        atk.forEach((o, i) => { const s = SHAPE[i]; o.P.st.kick = o === holder && pu < .35 && u < 5.6 ? pu / .35 : i === 1 && u > 5.6 && u < 5.95 ? (u - 5.6) / .35 : 0; chase(o, inX(cx - dir * 5 + dir * prog * 9 + dir * s[0]), inZ(zc + s[1]), dt, t, ball.position, o.P.st.kick > 0 ? 'kick' : 'none', 3); });
        dfd.forEach((o, i) => { const s = SHAPE[i]; chase(o, inX(ball.position.x + dir * (2.4 + i * .8) - (i === 2 ? dir * 4 : 0)), inZ(lerp(ball.position.z, zc + s[1] * .6, .5)), dt, t, ball.position, 'none', 2.4); });
        if (u < 5.75) {
          // passe rasteiro do pé de um para o pé do outro
          foot(holder.P, pa); foot(next.P, pb);
          const kk = clamp((pu - .2) / .8);
          if (k === 4) ball.position.copy(pa); else { ball.position.lerpVectors(pa, pb, ease(kk)); ball.position.y = y + .2; }
          ball.position.y = y + .2;
        } else if (u < 6.5) {
          // chute: no canto (gol) ou em cima do goleiro (defesa)
          const kk = (u - 5.75) / .75, aim = zc + (goal ? (n % 2 ? 1.1 : -1.1) : 0);
          foot(atk[1].P, pa); pb.set(goalX + dir * (goal ? .6 : -.8), y + .55, aim);
          ball.position.lerpVectors(pa, pb, kk); ball.position.y += Math.sin(kk * Math.PI) * .6;
        } else if (goal) { ball.position.set(goalX + dir * .6, y + .2 + Math.abs(Math.sin((u - 6.5) * 7)) * .2 * Math.max(0, 1 - (u - 6.5)), zc + (n % 2 ? 1.1 : -1.1)); }
        else { holdAt(keeper.P, ball.position, 1.2, .5); }
        // saída de bola: rola até o pé de quem começa a próxima jogada
        if (u > 8.2) { const kk = ease((u - 8.2) / .8); foot(teams[1 - T][0].P, pb); pb.y = y + .2; ball.position.lerp(pb, kk); }
        keepers.forEach((kp, i) => {
          const mine = kp === keeper, dive = mine && u > 5.9 && u < 7.2;
          const tz = mine ? (dive ? (goal ? zc - (n % 2 ? 1.1 : -1.1) * .6 : zc) : lerp(zc, ball.position.z, .5)) : zc;
          kp.P.g.position.x = kp.x; kp.P.g.position.z = damp(kp.P.g.position.z, clamp(tz, zc - 1.3, zc + 1.3), 6, dt);
          kp.P.g.rotation.y = i ? -Math.PI / 2 : Math.PI / 2;
          applyPose(kp.P, t, dive ? 'reach' : 'stand', 1, 0, 0);
        });
      });
    }
    // vôlei na areia
    {
      const nx = -15.5, zc = 803;
      for (const sz of [-7.4, 7.4]) cyl(g, .07, .07, 2.7, MAT.metal, nx, y + 1.35, zc + sz);
      box(g, .04, .8, 14.8, cmat('#f2f2ec', CLS.foam, .3), nx, y + 2.2, zc);
      const spots = [[-22, 799.5], [-20.6, 806.6], [-10, 799.2], [-9.2, 806.4]];
      const pl = spots.map(([x, z], i) => ({ P: personAt(g, npc(i + 3, { scale: 1.2 }), x, z, x < nx ? Math.PI / 2 : -Math.PI / 2, y), x, z }));
      const ball = ballMesh(.2, '#f6f2e0', CLS.flower);
      const order = [0, 2, 1, 3];
      U.push((t, dt, zc2) => {
        if (Math.abs(zc2 - zc) > 60) return;
        const per = 1.5, n = Math.floor(t / per), k = (t % per) / per, ia = order[n % 4], ib = order[(n + 1) % 4], a = pl[ia], b = pl[ib];
        const at = (i, tt) => [pl[i].x + Math.sin(tt * 1.3 + i) * .4, pl[i].z + Math.cos(tt + i) * .4];
        const [ax, az] = at(ia, n * per), [bx, bz] = at(ib, (n + 1) * per);
        ball.position.set(lerp(ax, bx, k), y + 2.6 + Math.sin(k * Math.PI) * 3.6, lerp(az, bz, k));
        pl.forEach((p, i) => {
          const hit = (p === a && k < .2) || (p === b && k > .8), jump = hit ? Math.sin((p === a ? k / .2 : (k - .8) / .2) * Math.PI) * .4 : 0;
          const [px, pz] = at(i, t);
          p.P.g.position.set(px, y + Math.max(0, jump), pz);
          applyPose(p.P, t, hit ? 'reach' : 'stand', 1, 0, 0);
        });
      });
    }
    // tênis: rali de fundo de quadra; de vez em quando um saque
    {
      const X0 = 5, X1 = 28, nx = (X0 + X1) / 2, zc = 803;
      for (const sz of [-7.6, 7.6]) cyl(g, .06, .06, 1.1, MAT.metal, nx, y + .55, zc + sz);
      box(g, .04, .75, 15.2, cmat('#f2f2ec', CLS.foam, .25), nx, y + .62, zc); box(g, .06, .08, 15.2, MAT.lineWhite, nx, y + 1.02, zc);
      const racket = () => { const r = new THREE.Group(); box(r, .05, .3, .05, MAT.dark, 0, -.15, 0); const head = new THREE.Mesh(new THREE.TorusGeometry(.2, .03, 5, 12), MAT.red); head.position.y = -.5; head.scale.set(1, 1.25, 1); r.add(head); return r; };
      const pl = [[X0 + 2.4, -1], [X1 - 2.4, 1]].map(([x, s2], i) => { const P = personAt(g, npc(i + 1, { scale: 1.2, shirt: i ? '#f4f4ef' : '#5aa0ff' }), x, zc, s2 < 0 ? Math.PI / 2 : -Math.PI / 2, y); P.hand.add(racket()); return { P, x, z: zc, face: P.g.rotation.y }; });
      const ball = ballMesh(.12, '#d6f03a');
      const SHOT = 1.25;
      const zAt = m => zc + Math.sin(m * 2.1) * 4.6;
      U.push((t, dt, zc2) => {
        if (Math.abs(zc2 - zc) > 60) return;
        const m = Math.floor(t / SHOT), k = (t - m * SHOT) / SHOT, a = pl[m % 2], b = pl[(m + 1) % 2];
        const serve = m % 10 === 0, z0 = zAt(m), z1 = zAt(m + 1);
        // quem vai receber corre para onde a bola vai chegar
        b.z = damp(b.z, z1, 3, dt); a.z = damp(a.z, z0, 2, dt);
        pl.forEach((p, i) => {
          const hitter = p === a;
          p.P.st.tc = hitter ? k * SHOT : 0;
          const pz = p.P.g.position.z, v = Math.abs(p.z - pz) / Math.max(dt, 1e-3);
          p.P.g.position.set(p.x, y, p.z);
          applyPose(p.P, t, hitter && k < .5 ? (serve ? 'serve' : 'swing') : 'stand', 1, t * 9 + i, clamp(v / 2));
        });
        const ax = a.x + (a === pl[0] ? .8 : -.8), bx = b.x + (b === pl[0] ? .8 : -.8), bounce = lerp(ax, bx, .72);
        // saque: joga a bola para cima e bate lá no alto; a bola segue dali até quicar do outro lado
        if (serve && k < .25) ball.position.set(ax, y + 1.2 + Math.sin(k / .25 * Math.PI / 2) * 1.8, z0);
        else if (serve && k < .72) { const q = (k - .25) / .47; ball.position.set(lerp(ax, bounce, q), y + lerp(3, .12, q) + Math.sin(q * Math.PI) * .6, lerp(z0, z1, q * .72)); }
        else if (k < .72) { const q = k / .72; ball.position.set(lerp(ax, bounce, q), y + lerp(1.2, .12, q) + Math.sin(q * Math.PI) * 1.4, lerp(z0, z1, q * .72)); }
        else { const q = (k - .72) / .28; ball.position.set(lerp(bounce, bx, q), y + .12 + Math.sin(q * Math.PI * .5) * 1.1, lerp(z0, z1, .72 + q * .28)); }
      });
    }
    // gente passeando pelos passeios, para lá e para cá
    const routes = [[[-34, 789.2], [34, 789.2]], [[34, 790.8], [-34, 790.8]], [[-34, 816.2], [34, 816.2]], [[30, 817.8], [-30, 817.8]], [[.8, 793], [.8, 845]], [[-.8, 845], [-.8, 820]]];
    sel.walkers = routes.map((pts, i) => ({ P: personAt(g, npc(i + 1, { scale: 1.25 }), pts[0][0], pts[0][1]), pts, o: i * 7.3, v: 1.6 + (i % 3) * .3 }));
    sel.near = (P, zc) => Math.abs(P.g.position.z - zc) < 45;
  }

  // Biblioteca: corredores estreitos entre estantes e mesas de estudo cheias
  {
    const x0 = -28, x1 = 28, z0 = 848, z1 = 908, y = PADY, wallH = 1.8, t = .6;
    const wall = (ax, az, bx, bz) => { const w = Math.abs(bx - ax) || t, d = Math.abs(bz - az) || t; B.box(w, wallH, d, MAT.wallBrick, (ax + bx) / 2, y + wallH / 2, (az + bz) / 2); };
    wall(x0, z0, -2.6, z0); wall(2.6, z0, x1, z0); wall(x0, z1, -2.6, z1); wall(2.6, z1, x1, z1); wall(x0, z0, x0, z1); wall(x1, z0, x1, z1);
    for (let z = z0; z <= z1; z += 10) for (const x of [x0, x1]) B.cyl(.5, .5, wallH + .5, MAT.wallWhite, x, y + (wallH + .5) / 2, z, 10);
    // portal com porta de duas folhas, aberta, nas duas entradas
    for (const zz of [z0, z1]) {
      for (const sx of [-1, 1]) B.box(.36, 3.2, .8, MAT.wallWhite, sx * 2.8, y + 1.6, zz);
      B.box(6, .45, .8, MAT.wallWhite, 0, y + 3.3, zz);
      for (const sx of [-1, 1]) {
        const d = new THREE.Group(); d.position.set(sx * 2.55, y, zz); d.rotation.y = sx * 1.75; g.add(d);
        box(d, 2.4, 2.9, .1, MAT.woodDark, -sx * 1.22, 1.5, 0); box(d, 1, .9, .12, MAT.window, -sx * 1.22, 2.1, 0);
        box(d, .08, .08, .2, MAT.gold, -sx * 2.2, 1.4, .08);
      }
    }
    const bookCols = ['#3f7fe0', '#c8643c', '#2e9a52', '#e7b25a', '#8a5a36', '#e04a2a', '#efe3c8', '#5a9bfc', '#a9c79a', '#f08a24', '#9b6cff'];
    const bookItems = [];
    const shelf = (cx2, cz, len) => {
      B.box(len, 2.4, .9, MAT.woodDark, cx2, y + 1.2, cz);
      for (let lv = 0; lv < 4; lv++) {
        let bx = cx2 - len / 2 + .1;
        while (bx < cx2 + len / 2 - .2) { const w = .12 + r() * .1, h = .38 + r() * .16, c = new THREE.Color(bookCols[(r() * bookCols.length) | 0]); bookItems.push({ x: bx + w / 2, y: y + .22 + lv * .56 + h / 2, z: cz + .47, sx: w, sy: h, sz: .1, r: c.r, g: c.g, b: c.b }); bx += w + .02; }
      }
    };
    for (let k = 0; k < 15; k++) { const cz = 854 + k * 3.3; shelf(8.5, cz, 10.6); shelf(21.5, cz, 10.6); }
    for (const cz of [852.5, 855.8, 859.1, 862.4, 865.7]) { shelf(-20.5, cz, 11); shelf(-9, cz, 9); }
    chunked(scene, new THREE.BoxGeometry(1, 1, 1), tag(new THREE.MeshLambertMaterial({ color: '#ffffff' }), CLS.accent), bookItems);
    // balcão da bibliotecária
    B.box(3, 1, 1, MAT.wood, 6, y + .5, 850.6); personAt(g, npc(4, { scale: 1.15 }), 6, 849.6, 0, y);
    // mesas de estudo
    const students = [];
    const table = (cx2, cz, mine) => {
      B.box(6, .12, 2.4, MAT.wood, cx2, y + 1, cz);
      for (const [sx, sz] of [[-2.8, -1], [2.8, -1], [-2.8, 1], [2.8, 1]]) B.box(.14, 1, .14, MAT.woodDark, cx2 + sx, y + .5, cz + sz);
      for (const lx of [-1.6, 1.6]) { B.cyl(.05, .05, .5, MAT.metal, cx2 + lx, y + 1.3, cz); B.box(.7, .2, .3, cmat('#1e7a3a', CLS.accent, .6), cx2 + lx, y + 1.58, cz); }
      const seats = [[-1.8, -1.7, 0], [0, -1.7, 0], [1.8, -1.7, 0], [-1.8, 1.7, Math.PI], [1.8, 1.7, Math.PI]];
      seats.forEach(([sx, sz, ry], i) => {
        if (mine && sz < 0 && sx !== 0) return;
        B.box(.6, .5, .6, MAT.woodDark, cx2 + sx, y + .25, cz + sz);
        if (mine && sz < 0) return; // a minha cadeira
        if (hash2(cx2 + i, cz) < .22) return;
        const P = makePerson(npc(i + Math.round(cz), { scale: 1.12 })); P.g.position.set(cx2 + sx, y, cz + sz); P.g.rotation.y = ry; g.add(P.g);
        if (hash2(i, cz) < .4) B.box(.5, .04, .35, MAT.screen, cx2 + sx * .9, y + 1.08, cz + sz * .45);
        else B.box(.5, .04, .35, MAT.lineWhite, cx2 + sx * .9, y + 1.08, cz + sz * .45);
        students.push({ P, o: hash2(i, cz) * 9, pose: hash2(i, cz) < .4 ? 'type' : 'read' });
      });
    };
    for (const [cx2, cz] of [[-22, 873], [-22, 885], [-22, 897], [-10, 873], [-10, 897]]) table(cx2, cz, false);
    table(-10, 885, true);
    sel.students = students;
    // os livros dos cursos, em duas pilhas sobre a minha mesa
    const tones = { a: '#7fb0f8', b: '#8fc9a4', c: '#e9c46a', d: '#e59a7c', e: '#c9c2b4' };
    const order = ['a', 'b', 'c', 'd', 'e', 'b', 'c', 'a', 'd', 'e'];
    const books = order.map((tn, i) => {
      const bg = new THREE.Group(); g.add(bg);
      const m = cmat(tones[tn], CLS.accent, .35), page = MAT.lineWhite;
      const left = new THREE.Group(), right = new THREE.Group(); bg.add(left, right);
      box(left, .5, .07, 1.1, m, -.25, 0, 0); box(left, .44, .04, 1.02, page, -.23, .05, 0);
      box(right, .5, .07, 1.1, m, .25, 0, 0); box(right, .44, .04, 1.02, page, .23, .05, 0);
      const base = new THREE.Vector3(i < 5 ? -12.4 : -7.6, y + 1.12 + (i % 5) * .16, 885.4);
      bg.position.copy(base); right.rotation.z = Math.PI; right.position.y = .01;
      // capa por cima do livro fechado, com uma faixa clara de título
      box(bg, .54, .03, 1.14, m, -.25, .085, 0); box(bg, .34, .035, .16, page, -.25, .09, -.22); box(bg, .06, .036, 1.14, cmat(tones[tn], CLS.accent, .1), -.5, .09, 0);
      bg.rotation.y = (hash2(i, 3) - .5) * .4;
      return { g: bg, right, base, ry: bg.rotation.y, k: 0 };
    });
    sel.library = { books, cur: -1, read: new THREE.Vector3(-10, y + 1.12, 884.3) };
  }

  // Palanque lateral: o palco fica à esquerda, virado para a direita, e a plateia em fileiras até debaixo da caixa de texto
  {
    const y = PADY, sy = y + .6, SX0 = -24, SX1 = -11.5, SZ0 = 913, SZ1 = 927.5;
    box(g, SX1 - SX0, .6, SZ1 - SZ0, MAT.wood, (SX0 + SX1) / 2, y + .3, (SZ0 + SZ1) / 2);
    FLOORS.push({ x0: SX0, x1: SX1, z0: SZ0, z1: SZ1, y: sy });
    box(g, 1.4, .3, 1.6, MAT.wood, -11.3, y + .15, 912.4); box(g, 1.6, .3, 1.4, MAT.wood, -12.4, y + .15, 928.3);
    box(g, .9, 1.3, .7, MAT.woodDark, -13.7, sy + .65, 920); box(g, .5, .05, .4, MAT.lineWhite, -13.7, sy + 1.32, 920);
    // telão atrás de mim, virado para a plateia (e um pouco para a câmera)
    const scr = new THREE.Group(); scr.position.set(-21, sy, 916.4); scr.rotation.y = .9; g.add(scr);
    box(scr, 8, 4.8, .3, MAT.dark, 0, 3.2, 0);
    const screenMat = freshMat('#5a9bfc', CLS.accent, .9); box(scr, 7.4, 4.2, .08, screenMat, 0, 3.2, .2);
    for (const sx of [-3.4, 3.4]) box(scr, .3, .8, .3, MAT.dark, sx, .4, 0);
    for (const sz of [913.9, 926.6]) box(g, 1, 2.2, 1, MAT.dark, -23.2, sy + 1.1, sz);
    // fileiras de bancos de frente para o palco
    const aud = [], cols = lite ? 8 : 12, per = lite ? 5 : 6;
    for (let c = 0; c < cols; c++) {
      const bx = -8.4 + c * 2.5;
      B.box(.7, .14, 13.6, MAT.wood, bx, y + .45, 920.2); B.box(.12, .7, 13.6, MAT.woodDark, bx + .4, y + .8, 920.2);
      for (const sz of [913.8, 926.6]) B.box(.6, .45, .12, MAT.dark, bx, y + .22, sz);
      for (let i = 0; i < per; i++) {
        if (hash2(i, c + 4) < .1) continue;
        const P = makePerson(npc(i * 3 + c, { scale: 1.12 })); P.g.position.set(bx, y + .47, 914.4 + i * (11.8 / (per - 1))); P.g.rotation.y = -Math.PI / 2; g.add(P.g); aud.push(P);
      }
    }
    sel.stage = { screenMat, aud };
  }

  // Beira-rio e píer
  {
    const p = PIER;
    box(g, p.x1 - p.x0, .14, p.z1 - p.z0, cmat('#c08a56', CLS.wood, .45), (p.x0 + p.x1) / 2, p.y - .07, (p.z0 + p.z1) / 2);
    for (let zz = p.z0 + .5; zz < p.z1; zz += .9) box(g, p.x1 - p.x0 + .1, .04, .1, MAT.woodDark, (p.x0 + p.x1) / 2, p.y + .01, zz);
    for (let zz = p.z0 + .4; zz < p.z1; zz += 2.2) for (const xx of [p.x0 + .1, p.x1 - .1]) cyl(g, .1, .1, 2.4, MAT.woodDark, xx, p.y - 1.1, zz, 6);
    for (const xx of [p.x0 + .1, p.x1 - .1]) box(g, .06, .06, p.z1 - p.z0, MAT.woodDark, xx, p.y + .55, (p.z0 + p.z1) / 2);
    const bz = RIVER_Z - 15; box(g, 2.4, .12, .7, MAT.wood, -6, H(-6, bz) + .5, bz);
    for (let i = 0; i < 8; i++) { const x = -20 + i * 5, z = RIVER_Z - 19 + Math.sin(i) * 2; if (Math.abs(x) < 4) continue; cyl(g, .07, .08, 1, MAT.woodDark, x, H(x, z) + .5, z, 5); }
  }
  B.flush(g);
}

// ---------- parque industrial ----------
// Fábrica fechada: galpão, silos, tanques ou chaminé. Devolve a boca da chaminé, se tiver.
function factory(B, kind, x, z, w, d, r) {
  const y = PADY, walls = [MAT.wallMetal, MAT.wallBrick, cmat('#d9d2c2', CLS.wall, .05), cmat('#b7c4b0', CLS.wall, .05), cmat('#c9b9a0', CLS.wall, .05)];
  if (kind === 'silos') {
    const n = w > 10 ? 3 : 2;
    for (let i = 0; i < n; i++) { const sx = x - w / 2 + (i + .5) * w / n, hh = 7 + r() * 3; B.cyl(1.5, 1.5, hh, MAT.metal, sx, y + hh / 2, z, 14); const cone = new THREE.ConeGeometry(1.6, 1.2, 14); cone.translate(sx, y + hh + .6, z); B.geo(cone, MAT.roofTin, z); B.box(.15, hh, .15, MAT.dark, sx + 1.55, y + hh / 2, z); }
    B.box(w, 1.2, 2, MAT.wallMetal, x, y + .6, z + d / 2 - 1);
    return null;
  }
  if (kind === 'containers') {
    const cols = ['#c8442c', '#2a7fbf', '#e0a02a', '#2e9a52', '#8a8f99'];
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) B.box(5.8, 2.4, 2.4, cmat(cols[(i * 2 + j + ((x + z) | 0)) % cols.length], CLS.accent, .25), x - 3.2 + i * 6.4, y + 1.2, z - 1.6 + j * 3.2);
    return null;
  }
  if (kind === 'tanks') {
    for (let i = 0; i < 2; i++) { const g2 = new THREE.CylinderGeometry(1.4, 1.4, w - 2, 14); g2.rotateZ(Math.PI / 2); g2.translate(x, y + 1.8, z - d / 4 + i * d / 2.2); B.geo(g2, cmat(i ? '#e9e6dc' : '#d8dade', CLS.wall, .05), z); for (const sx of [-w / 3, w / 3]) B.box(.3, 1.2, 2.2, MAT.dark, x + sx, y + .6, z - d / 4 + i * d / 2.2); }
    return null;
  }
  const h = 5 + r() * 3, wall = walls[(r() * walls.length) | 0];
  B.box(w, h, d, wall, x, y + h / 2, z);
  if (r() < .5) { const rf = gableGeo(w, d, 1.6); rf.translate(x, y + h, z); B.geo(rf, MAT.roofTin, z); }
  else {
    for (let i = 0; i < 4; i++) { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(d / 4, 0); sh.lineTo(0, 1.5); sh.lineTo(0, 0); const geo = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false }); geo.rotateY(-Math.PI / 2); geo.translate(x + w / 2, y + h, z - d / 2 + i * d / 4); B.geo(geo, MAT.roofFlat, z); B.box(w - .4, 1.1, .06, MAT.window, x, y + h + .6, z - d / 2 + i * d / 4 - .02); }
  }
  B.box(w + .1, .5, .1, cmat(AWNING[(r() * AWNING.length) | 0], CLS.accent, .3), x, y + h - .6, z + d / 2 + .02);
  for (let k = 0; k < Math.max(1, Math.floor(w / 6)); k++) { const dx = x - w / 2 + 3 + k * 6; if (dx > x + w / 2 - 2) break; B.box(3.2, 3.4, .1, MAT.dark, dx, y + 1.7, z + d / 2 + .03); for (let q = 0; q < 5; q++) B.box(3.2, .05, .04, MAT.metal, dx, y + .4 + q * .65, z + d / 2 + .09); }
  B.box(w - 2, .9, .08, MAT.window, x, y + h - 1.8, z + d / 2 + .04);
  if (kind === 'chimney') { const cx2 = x + w / 2 - 1.5, cz = z - d / 2 + 1.5, ch = h + 7; B.cyl(.6, .8, ch, MAT.wallBrick, cx2, y + ch / 2, cz, 10); for (let k = 0; k < 2; k++) B.cyl(.66, .66, .5, k ? MAT.white : MAT.red, cx2, y + ch - .6 - k * 1.2, cz, 10); return new THREE.Vector3(cx2, y + ch + .3, cz); }
  return null;
}
function buildIndustrial(g, B, sel, U) {
  const r = (() => { let s = 4242; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const wallM = cmat('#b9b3a8', CLS.wall, .05);
  for (const [a, b] of [[-48, 15], [20, 48]]) B.box(b - a, 1.6, .3, wallM, (a + b) / 2, PADY + .8, 376);
  for (const x of [15, 20]) B.box(.6, 2.6, .6, MAT.stone, x, PADY + 1.3, 376);
  const stacks = [];
  const slot = (kind, x, z, w, d) => { const s = factory(B, kind, x, z, w, d, r); if (s) stacks.push(s); };
  const kinds = ['shed', 'chimney', 'silos', 'shed', 'tanks', 'chimney'];
  for (let i = 0; i < PROJECT_N; i++) {
    const rz = PROJECT_Z(i), s = i % 2 === 0 ? -1 : 1;
    slot(kinds[i], -s * 12, rz - 11.5, 14, 14); // do outro lado da fileira
    if (i > 0) { slot(i % 2 ? 'containers' : 'tanks', s * 12, rz - 37, 14, 10); slot(i % 2 ? 'tanks' : 'containers', -s * 12, rz - 37, 14, 10); }
  }
  for (let z = 392; z < 690; z += 22) for (const sx of [-1, 1]) slot(['shed', 'silos', 'chimney', 'tanks'][((z / 22) | 0) % 4 + (sx > 0 ? 1 : 0) & 3], sx * 39, z, 16, 15);
  // depois do último galpão o parque continua com fábricas e contêineres até a rua
  slot('chimney', -14, 686, 20, 12); slot('containers', 6, 689, 14, 8);
  // fumaça das chaminés
  // fumaça das chaminés: muitas bolinhas bem juntas, que nascem pequenas na boca, crescem subindo e se desfazem
  // no alto (encolhendo), para a coluna parecer contínua em vez de soltar baforadas
  const NP = 18, puffs = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.6, 1), cmat('#cfd2d6', CLS.foam, .2), stacks.length * NP);
  puffs.frustumCulled = false; g.add(puffs);
  const o3 = new THREE.Object3D();
  U.push((t) => {
    let n = 0;
    for (const s of stacks) for (let k = 0; k < NP; k++) {
      const q = fract(t * .07 + k / NP + s.x * .013);
      o3.position.set(s.x + q * q * 4 + Math.sin(t * .8 + q * 5 + s.z) * .3 * q, s.y + q * 8, s.z + q * 1.6 + Math.cos(t * .6 + q * 4) * .2 * q);
      o3.scale.setScalar(Math.max(.001, (.45 + Math.sqrt(q) * 1.9) * sstep(0, .06, q) * (1 - sstep(.7, 1, q))));
      o3.rotation.set(k, t * .15 + k * 1.7, 0); o3.updateMatrix(); puffs.setMatrixAt(n++, o3.matrix);
    }
    puffs.instanceMatrix.needsUpdate = true;
  });

  // Galpões abertos dos projetos. Cada um é um grupo no seu próprio referencial: x de -10 a 10 (+x é o lado de fora
  // do parque, por isso o grupo é espelhado no lado esquerdo) e z de -23 (fundo) a 0 (frente). Eu paro em z = +2.
  const st = [];
  for (let i = 0; i < PROJECT_N; i++) {
    const s = i % 2 === 0 ? -1 : 1, rz = PROJECT_Z(i), tm = cmat(THEME[i], CLS.accent, .4);
    const G = new THREE.Group(); G.position.set(s * 12, PADY, rz - 2); G.scale.x = s; g.add(G);
    const floor = new THREE.Color(THEME[i]).multiplyScalar(.3);
    const fm = box(G, 20.4, .02, 23, cmat(`#${floor.getHexString()}`, CLS.sand, .15), 0, .012, -11.5); fm.castShadow = false;
    for (const [w, d, x, z] of [[20.4, .2, 0, -23], [20.4, .2, 0, 0], [.2, 23, -10.2, -11.5], [.2, 23, 10.2, -11.5]]) box(G, w, .03, d, MAT.lineYellow, x, .03, z);
    for (const sx of [-9.8, 9.8]) { cyl(G, .18, .18, 6.4, MAT.metal, sx, 3.2, -22.6, 6); cyl(G, .14, .14, 6.4, MAT.metal, sx, 3.2, -.4, 6); box(G, .16, .16, 22.4, MAT.metal, sx, 6.4, -11.5); }
    box(G, 20, .9, .4, tm, 0, 6.6, -22.6);
    // sala de verdade: parede do fundo na cor do projeto, rodapé e muretas baixas nas laterais (até a metade)
    const wallC = new THREE.Color(THEME[i]).lerp(new THREE.Color('#f2efe8'), .7), D = makeBatch(), wm = cmat(`#${wallC.getHexString()}`, CLS.wall, .06);
    D.box(20.4, 6.2, .3, wm, 0, 3.1, -23.2); D.box(20.4, .4, .36, MAT.stone, 0, .2, -23.15);
    for (const sx of [-1, 1]) { D.box(.25, 1.1, 12.6, wm, sx * 10.3, .55, -16.6); D.box(.32, .1, 12.6, MAT.stone, sx * 10.3, 1.12, -16.6); }
    D.flush(G);
    st.push({ G, rz });
  }
  const near = (zc, rz) => Math.abs(zc - rz) < 70;
  const person = (G, look, x, z, face = 0) => { const P = makePerson({ scale: 1.15, ...look }); P.g.position.set(x, 0, z); P.g.rotation.y = face; G.add(P.g); return P; };
  const stool = (G, x, z) => { cyl(G, .28, .28, .08, MAT.dark, x, .5, z, 8); cyl(G, .05, .05, .5, MAT.metal, x, .25, z, 5); };
  const tv = (G, x, y, z, w, h, hex) => { box(G, w + .4, h + .4, .3, MAT.dark, x, y, z); const m = freshMat(hex, CLS.accent, .5); box(G, w, h, .06, m, x, y, z + .18); for (const sx of [-w / 3, w / 3]) box(G, .2, y - h / 2, .2, MAT.metal, x + sx, (y - h / 2) / 2, z); return m; };
  const tmpV = new THREE.Vector3();
  // detalhes estáticos, juntados num lote por galpão (poucas malhas)
  const CRATE = cmat('#c08a56', CLS.wood, .2), LEAF = cmat('#3f8f3a', CLS.leaf, .25), POT = cmat('#8a5a36', CLS.wood, .2);
  const BOOKS = ['#c8643c', '#3f7fe0', '#2e9a52', '#e7b25a', '#9b6cff', '#e04a2a'].map(h => cmat(h, CLS.accent, .3));
  const crate = (D, x, y, z, sz = .8) => D.box(sz, sz * .8, sz, CRATE, x, y + sz * .4, z);
  const plant = (D, x, z, h = 1) => { D.cyl(.32, .24, .55, POT, x, .28, z, 8); const lf = new THREE.IcosahedronGeometry(.55 * h, 0); lf.translate(x, .85 + .45 * h, z); D.geo(lf, LEAF, z); };
  const bookcase = (D, x, z, w, levels = 3) => {
    D.box(w, levels * .9 + .2, .7, MAT.woodDark, x, (levels * .9 + .2) / 2, z);
    for (let lv = 0; lv < levels; lv++) for (let bx = x - w / 2 + .2, k = 0; bx < x + w / 2 - .25; k++) { const bw = .16 + hash2(bx, lv) * .1, bh = .45 + hash2(lv, bx) * .25; D.box(bw, bh, .5, BOOKS[(((k + lv * 2 + Math.round(x)) % BOOKS.length) + BOOKS.length) % BOOKS.length], bx + bw / 2, .2 + lv * .9 + bh / 2, z + .12); bx += bw + .03; }
  };
  const wallClock = (G, x, y, z) => { const c = cyl(G, .5, .5, .08, MAT.white, x, y, z, 16); c.rotation.x = Math.PI / 2; box(G, .06, .34, .04, MAT.dark, x, y + .13, z + .06); box(G, .26, .05, .04, MAT.dark, x + .1, y, z + .06); };
  const tableAt = (D, x, z, w, d, h = .8) => { D.box(w, .08, d, MAT.wood, x, h, z); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) D.box(.08, h, .08, MAT.woodDark, x + sx * (w / 2 - .08), h / 2, z + sz * (d / 2 - .08)); };

  // 0. White Label Stock: duas prateleiras e duas equipes de duas pessoas. A primeira descarrega o caminhão na
  //    prateleira 1, a segunda passa tudo para a prateleira 2 e, quando chega o outro caminhão, a primeira equipe
  //    carrega com as caixas da prateleira 2. E começa de novo.
  {
    const { G, rz } = st[0];
    const colX = [-4.2, -.8], shelfZ = [-12, -18.2];
    for (const sz of shelfZ) {
      for (const ux of [-6, -2.5, 1]) for (const dz of [-.55, .55]) box(G, .12, 2.9, .12, MAT.blue, ux, 1.45, sz + dz);
      for (let lv = 0; lv < 3; lv++) box(G, 7.3, .12, 1.3, MAT.orange, -2.5, .14 + lv * 1.36, sz);
    }
    const shelfSlot = (sh, j) => [colX[j % 2], .2 + (j < 2 ? 0 : 1.36) + .35, shelfZ[sh] + .05];
    const bedOff = j => [j < 2 ? -1.8 : -.6, 1.1, j % 2 ? .5 : -.5];
    const boxes = Array.from({ length: 4 }, () => { const m = new THREE.Mesh(new THREE.BoxGeometry(.9, .7, .8), MAT.wood); m.castShadow = true; G.add(m); return m; });
    const tA = makeTruck('#e7b25a'), tB = makeTruck('#3f7fe0'); G.add(tA.g, tB.g);
    const team1 = { shirt: '#f08a24', pants: '#2c3344' }, team2 = { shirt: '#2e9a52', pants: '#3a3a40' };
    const W = [0, 1].map(i => { const home = [3.6 - i * 1.4, -2.8]; const P = person(G, { ...npc(i + 1), ...team1, long: false, hat: true }, ...home, Math.PI); return { P, S: script(...home, Math.PI), home }; });
    const V = [0, 1].map(i => { const home = [-8.4, -13.6 - i * 1.6]; const P = person(G, { ...npc(i + 4), ...team2, long: false }, ...home, Math.PI / 2); return { P, S: script(...home, Math.PI / 2), home }; });
    const BT = boxes.map((_, j) => [[0, 'on', tA.g, ...bedOff(j)]]);
    const tSpot = w => [3.9, -6.6 + w * 1.2], s1 = j => [colX[j % 2], -10.75], s2 = j => [colX[j % 2], -16.95];
    let placed = 0, held = 0;
    // o caminhão A chega de ré (0 a 3 s) e a equipe 1 descarrega
    W.forEach(({ P, S, home }, w) => {
      S.until(3.2 + w * .8);
      for (const j of [w, w + 2]) {
        S.go([tSpot(w)]).stay(.6, 'give', Math.PI / 2); BT[j].push([S.t - .2, 'hold', P]); held = Math.max(held, S.t);
        S.go([s1(j)], 'carry').stay(.6, 'give', Math.PI); BT[j].push([S.t - .2, 'at', ...shelfSlot(0, j)]); placed = Math.max(placed, S.t);
      }
      S.go([home]);
    });
    const LA = held + .5;
    // a equipe 2 passa as caixas para a prateleira de trás, dando a volta pela ponta de dentro
    const T2 = placed + .4; let placed2 = 0;
    V.forEach(({ P, S, home }, w) => {
      S.until(T2 + w * .9);
      for (const j of [w, w + 2]) {
        S.go([[-7.7, -10.75], s1(j)]).stay(.6, 'give', Math.PI); BT[j].push([S.t - .2, 'hold', P]);
        S.go([[-7.7, -10.75], [-7.7, -16.95], s2(j)], 'carry').stay(.6, 'give', Math.PI); BT[j].push([S.t - .2, 'at', ...shelfSlot(1, j)]); placed2 = Math.max(placed2, S.t);
        S.go([[-7.7, -16.95]]);
      }
      S.go([home]);
    });
    // chega o caminhão B e a equipe 1 carrega com as caixas da prateleira 2, dando a volta pela ponta de fora
    const AB = placed2 - 2, T3 = Math.max(AB + 3, placed2) + .3; let loaded = 0;
    W.forEach(({ P, S }, w) => {
      S.until(T3 + w * .9);
      for (const j of [w, w + 2]) {
        S.go([[3.7, -9.6], [3.7, -16.95], s2(j)]).stay(.6, 'give', Math.PI); BT[j].push([S.t - .2, 'hold', P]);
        S.go([[3.7, -16.95], [3.7, -9.6], tSpot(w)], 'carry').stay(.6, 'give', Math.PI / 2); BT[j].push([S.t - .2, 'on', tB.g, ...bedOff(j)]); loaded = Math.max(loaded, S.t);
      }
    });
    W.forEach(({ S, home }) => S.go([home]));
    const LB = loaded + .5, CYC = LB + 4.5;
    W.forEach(o => o.S.end(CYC, 'stand', Math.PI)); V.forEach(o => o.S.end(CYC, 'stand', Math.PI / 2));
    const truckX = (tc, a, l) => tc < a ? 24 : tc < a + 3 ? lerp(24, 7, ease((tc - a) / 3)) : tc < l ? 7 : tc < l + 3 ? lerp(7, 24, ease((tc - l) / 3)) : 24;
    const moveTruck = (T, x) => { const dx = x - T.g.position.x; T.g.position.set(x, 0, -6); T.g.visible = x < 21; T.wheels.forEach((w) => { w.rotation.z -= dx / .45; }); };
    tA.g.position.set(24, 0, -6); tB.g.position.set(24, 0, -6);
    // detalhes do depósito: empilhadeira, paletes com caixas, cones e faixas zebradas na doca, extintor e o
    // computador do controle de estoque
    {
      const D = makeBatch(), yel = cmat('#f2c335', CLS.accent, .35);
      const fx = 7.4, fz = -15.4; // empilhadeira, com o garfo virado para os paletes do fundo
      D.box(1.3, .8, 1.9, yel, fx, .75, fz); D.box(1.2, .5, .6, MAT.dark, fx, 1.35, fz + .6);
      for (const [sx, sz] of [[-.6, -.6], [.6, -.6], [-.6, .7], [.6, .7]]) D.box(.07, 1.6, .07, MAT.dark, fx + sx, 1.95, fz + sz);
      D.box(1.35, .08, 1.45, yel, fx, 2.78, fz + .05);
      for (const sx of [-.45, .45]) { D.box(.1, 2.7, .1, MAT.metal, fx + sx, 1.35, fz - 1.05); D.box(.14, .06, 1.1, MAT.metal, fx + sx * .7, .18, fz - 1.6); }
      for (const [sx, sz] of [[-.68, -.55], [.68, -.55], [-.68, .6], [.68, .6]]) D.cyl(.3, .3, .25, MAT.rubber, fx + sx, .3, fz + sz, 10);
      for (const [px, pz, n] of [[7.6, -20.6, 5], [5, -20.8, 3], [-8.4, -19.6, 4]]) {
        D.box(1.6, .18, 1.4, MAT.wood, px, .09, pz);
        for (let k = 0; k < n; k++) crate(D, px + (k % 2 ? .38 : -.38), .18 + Math.floor(k / 4) * .64, pz + (k % 4 < 2 ? -.32 : .32), .7);
      }
      for (const cz of [-3.5, -8.6]) { D.cyl(.04, .28, .75, MAT.orange, 9.3, .38, cz, 8); D.cyl(.15, .2, .14, MAT.lineWhite, 9.3, .42, cz, 8); }
      for (let k = 0; k < 9; k++) for (const zz of [-4.6, -7.5]) D.box(.32, .03, .2, k % 2 ? MAT.dark : MAT.lineYellow, 5.4 + k * .55, .035, zz);
      D.cyl(.13, .13, .55, MAT.red, -9.45, .45, -1.1, 8); D.box(.12, .14, .12, MAT.dark, -9.45, .8, -1.1);
      desk(G, 7.4, 0, -11.2, { w: 1.6, monitor: true, chair: false });
      for (let k = 0; k < 4; k++) D.box(.45, .3 + k * .35, .05, BOOKS[k], 6 + k * .7, 4 + (.3 + k * .35) / 2, -23); // gráfico de estoque na parede
      D.box(3.4, .06, .05, MAT.dark, 7.05, 3.98, -23);
      D.flush(G);
    }
    U.push((t, dt, zc) => {
      if (!near(zc, rz)) return;
      const tt = t * 1.3, tc = tt % CYC; // o ciclo inteiro roda 30% mais rápido
      moveTruck(tA, truckX(tc, 0, LA)); moveTruck(tB, truckX(tc, AB, LB));
      for (const o of [...W, ...V]) playKeys(o.P, o.S.K, tc, tt);
      boxes.forEach((m, j) => track(m, BT[j], tc));
    });
  }

  // 1. Mocked Payment Gateway: filas nas maquininhas de cartão, as moedas voam para o cesto onde dois conferem com
  //    lupa e, de tempos em tempos, uma maquininha solta fumaça e o mecânico vem consertar.
  {
    const { G, rz } = st[1];
    const LZ = [-6, -11.5, -17], MX = -2, C = 25, PER = 2.5, P0 = 5, P1 = 12.5;
    const scr = LZ.map((z) => {
      box(G, .7, 1.05, .7, MAT.dark, MX, .52, z);
      const head = new THREE.Group(); head.position.set(MX + .08, 1.16, z); head.rotation.z = -.4; G.add(head);
      box(head, .46, .16, .64, cmat('#2b2a2c', CLS.stone, .1), 0, 0, 0);
      const sm = freshMat('#2fbf9a', CLS.accent, .9); box(head, .28, .03, .34, sm, .03, .09, 0);
      for (let q = 0; q < 3; q++) box(G, .7, .02, .1, MAT.lineYellow, MX + 1.4 + q * 1.25, .02, z + .45);
      return sm;
    });
    const BK = [-6.8, -11.5];
    cyl(G, 1.15, .9, .95, cmat('#8a5a36', CLS.wood, .25), BK[0], .48, BK[1], 14);
    cyl(G, 1.02, 1.02, .16, MAT.gold, BK[0], .9, BK[1], 14);
    for (let k = 0; k < 10; k++) { const a = k * 2.4, rr = .3 + (k % 3) * .25, c = cyl(G, .16, .16, .05, MAT.gold, BK[0] + Math.cos(a) * rr, 1.0 + (k % 2) * .04, BK[1] + Math.sin(a) * rr, 10); c.rotation.set((k % 3) * .3, 0, (k % 2) * .4); }
    const lens = () => { const l = new THREE.Group(); box(l, .05, .26, .05, MAT.woodDark, 0, -.13, 0); const ring = new THREE.Mesh(new THREE.TorusGeometry(.17, .035, 6, 14), MAT.metal); ring.position.set(0, -.42, 0); ring.rotation.x = Math.PI / 2; l.add(ring); const gl = new THREE.Mesh(new THREE.CircleGeometry(.15, 12), cmat('#bfe3ff', CLS.window, .7)); gl.position.copy(ring.position); gl.rotation.x = -Math.PI / 2; l.add(gl); return l; };
    const insp = [[-8.5, -10.1], [-8.1, -13.1]].map(([x, z], i) => { const P = person(G, npc(i + 4, { scale: 1.12 }), x, z, Math.atan2(BK[0] - x, BK[1] - z)); P.hand.add(lens()); return { P, f: P.g.rotation.y }; });
    const cust = [];
    LZ.forEach((z, L) => { for (let j = 0; j < 3; j++) cust.push({ P: person(G, npc(L * 3 + j + 1, { scale: 1.12 }), 0, z, -Math.PI / 2), L, j }); });
    const slotX = q => MX + 1.4 + q * 1.25;
    // o mecânico sai da bancada, conserta a maquininha quebrada e volta
    const MH = [-4.6, -2.2];
    box(G, 1.6, .9, .7, MAT.wood, -5.4, .45, -1); box(G, .8, .4, .4, MAT.red, -5.7, 1.1, -1);
    const mech = person(G, { skin: '#8a5a3c', hair: '#1b120c', shirt: '#f08a24', pants: '#2c4a7a' }, ...MH, Math.PI);
    const wrench = new THREE.Group(); box(wrench, .06, .42, .06, MAT.metal, 0, -.22, 0); box(wrench, .2, .08, .06, MAT.metal, 0, -.44, 0); mech.hand.add(wrench);
    // o conserto leva uns 2,5 s depois que ele chega; a fila só volta a andar em P1
    const mechK = LZ.map((z) => {
      const S = script(...MH, Math.PI).until(5.4).go([[-3.4, -3.4], [-3.1, z]], 'none', 3);
      const fix = Math.min(S.t + 2.6, P1 - .3);
      S.until(fix, 'hammer', Math.PI / 2).go([[-3.4, -3.4], MH]);
      return { K: S.end(C, 'stand', Math.PI), fix };
    });
    // detalhes: catracas de fila com corda, caixas eletrônicos e o cofre na parede, a mesa das pilhas de moedas,
    // um cartão gigante pintado no fundo e plantas
    {
      const D = makeBatch(), rope = cmat('#9a2b25', CLS.accent, .3);
      for (const zz of [-8.9, -14.4]) {
        for (const x of [1, 2.6, 4.2]) { D.cyl(.2, .2, .05, MAT.gold, x, .03, zz, 10); D.cyl(.05, .05, 1, MAT.gold, x, .5, zz, 6); D.cyl(.09, .09, .1, MAT.gold, x, 1.02, zz, 8); }
        D.box(3.2, .06, .06, rope, 2.6, .88, zz);
      }
      for (const ax of [-3.4, -1.4]) { D.box(1.3, 2.3, .8, MAT.dark, ax, 1.15, -22.5); D.box(.9, .55, .05, cmat('#2fbf9a', CLS.accent, .8), ax, 1.65, -22.08); D.box(.5, .06, .05, MAT.metal, ax, 1.05, -22.08); D.box(.7, .3, .1, MAT.metal, ax, .75, -22.06); }
      const v = cyl(G, 1.7, 1.7, .32, MAT.metal, 5.6, 2.5, -22.9, 24); v.rotation.x = Math.PI / 2;
      const hub = cyl(G, .32, .32, .3, MAT.gold, 5.6, 2.5, -22.62, 12); hub.rotation.x = Math.PI / 2;
      for (let k = 0; k < 3; k++) { const sp = box(G, 1.8, .12, .1, MAT.gold, 5.6, 2.5, -22.55); sp.rotation.z = k * Math.PI / 3; }
      D.box(3.4, 2.1, .06, cmat('#2fbf9a', CLS.accent, .4), -6.8, 3.9, -23); D.box(3.4, .4, .07, MAT.dark, -6.8, 4.45, -22.98); D.box(.6, .45, .08, MAT.gold, -7.8, 3.6, -22.96);
      tableAt(D, -9, -16.2, 1.4, .9);
      for (let k = 0; k < 5; k++) D.cyl(.15, .15, .12 + k * .06, MAT.gold, -9.4 + (k % 3) * .38, .84 + (.12 + k * .06) / 2, -16.4 + (k > 2 ? .38 : 0), 10);
      plant(D, 9, -21.8, 1.2); plant(D, 9, -1.6); plant(D, -9.2, -21.8, 1.1);
      D.flush(G);
    }
    const coins = LZ.map(() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(.18, .18, .05, 12), MAT.gold); G.add(m); return m; });
    const smoke = Array.from({ length: 9 }, () => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(.34, 0), cmat('#5f6368', CLS.foam, .12)); m.visible = false; G.add(m); return m; });
    U.push((t, dt, zc) => {
      if (!near(zc, rz)) return;
      const cyc = Math.floor(t / C), tc = t - cyc * C, bad = cyc % 3;
      LZ.forEach((z, L) => {
        const down = L === bad, paused = down && tc > P0 && tc < P1;
        const within = !down || tc < P0 ? tc : tc < P1 ? P0 : tc - (P1 - P0);
        const prog = cyc * C - Math.floor((cyc + 2 - L) / 3) * (P1 - P0) + within;
        const idx = Math.floor(prog / PER), u = prog - idx * PER;
        for (const c of cust) {
          if (c.L !== L) continue;
          const q = ((c.j - idx) % 3 + 3) % 3, P = c.P;
          if (!paused && u > 1.9) {
            const k = (u - 1.9) / .6;
            const pts = q === 0 ? [[slotX(0), z], [slotX(0) + .3, z + 1.15], [slotX(2), z + 1.15], [slotX(2), z]] : [[slotX(q), z], [slotX(q - 1), z]];
            const [x, zz, f] = along(pts, k);
            P.g.position.set(x, 0, zz); P.g.rotation.y = f;
            applyPose(P, t, 'none', 1, k * polyLen(pts) * 2.6 + c.j, 1);
          } else {
            P.g.position.set(slotX(q), 0, z); P.g.rotation.y = -Math.PI / 2;
            applyPose(P, t + c.j, q === 0 && !paused && u > .2 && u < 1.5 ? 'type' : 'stand', 1, 0, 0);
          }
        }
        const ck = (u - 1.0) / .75, cm = coins[L];
        cm.visible = !paused && ck > 0 && ck < 1;
        if (cm.visible) { cm.position.set(lerp(MX, BK[0], ck), lerp(1.4, 1.1, ck) + Math.sin(ck * Math.PI) * 2.3, lerp(z, BK[1], ck)); cm.rotation.set(t * 9, 0, t * 6); }
        const red = down && tc > P0 && tc < mechK[L].fix;
        scr[L].color.set(red ? (Math.floor(t * 4) % 2 ? '#ff4a4a' : '#5a1010') : '#2fbf9a'); scr[L].emissive.copy(scr[L].color).multiplyScalar(.9);
      });
      // fumaça saindo da maquininha quebrada
      const sz = LZ[bad], FIX = mechK[bad].fix, smoking = tc > P0 && tc < FIX + .8;
      smoke.forEach((m, j) => {
        const k = fract(t * .5 + j / smoke.length);
        m.visible = smoking && (tc < FIX || k > (tc - FIX) / .8);
        m.position.set(MX + Math.sin(t * 1.7 + j * 2) * .3 + k * .6, 1.4 + k * 2.6, sz + Math.cos(t + j) * .25);
        m.scale.setScalar(.4 + k * 1.5); m.rotation.set(t + j, t * .6, 0);
      });
      playKeys(mech, mechK[bad].K, tc, t);
      insp.forEach((o, i) => { o.P.g.rotation.y = o.f + Math.sin(t * .4 + i * 2) * .35; applyPose(o.P, t + i * 1.3, 'inspect', 1, 0, 0); });
    });
  }

  // 2. Storyweaver: mesa de RPG; o mestre (de costas) olha o notebook enquanto, no telão, as cartas se enfrentam.
  //    Os jogadores conversam, rolam o d20 e mexem as miniaturas no tabuleiro.
  {
    const { G, rz } = st[2];
    const TX = -1.5, TZ = -12, TY = 1.03;
    box(G, 5.4, .16, 3, MAT.woodDark, TX, .95, TZ);
    for (const [sx, sz] of [[-2.5, -1.3], [2.5, -1.3], [-2.5, 1.3], [2.5, 1.3]]) box(G, .15, .9, .15, MAT.woodDark, TX + sx, .45, TZ + sz);
    const CELL = .55, cell = (a, b) => [TX - 1.65 + a * CELL, TZ - .8 + b * CELL];
    for (let a = 0; a < 7; a++) for (let b = 0; b < 3; b++) { const [x, z] = cell(a, b); box(G, .53, .03, .53, (a + b) % 2 ? cmat('#3b2d5c', CLS.accent, .2) : cmat('#cdbbf0', CLS.accent, .3), x, TY + .02, z); }
    // notebook do mestre, com a tela virada para ele (e para a câmera)
    box(G, 1, .04, .66, MAT.dark, TX, TY + .02, TZ + .95);
    const lid = new THREE.Group(); lid.position.set(TX, TY + .04, TZ + .64); lid.rotation.x = -.22; G.add(lid);
    box(lid, 1, .66, .04, MAT.dark, 0, .33, 0);
    const lapScr = freshMat('#9b6cff', CLS.accent, .9); box(lid, .9, .56, .02, lapScr, 0, .34, .03);
    const lapRows = Array.from({ length: 4 }, (_, k) => box(lid, .6 - (k % 2) * .2, .05, .02, MAT.lineWhite, -.1, .52 - k * .11, .045));
    const master = person(G, { skin: '#c99a6e', hair: '#22160e', shirt: '#5b3d8a', pants: '#2c3344' }, TX, TZ + 2.05, Math.PI); stool(G, TX, TZ + 2.05);
    const seats = [[TX - 1.2, TZ - 2.05, 0], [TX + 1.2, TZ - 2.05, 0], [TX - 3.45, TZ, Math.PI / 2], [TX + 3.45, TZ, -Math.PI / 2]];
    const players = seats.map(([x, z, f], i) => { stool(G, x, z); return person(G, npc(i + 2, { scale: 1.12 }), x, z, f); });
    const minis = [MAT.gold, MAT.blue, MAT.red, MAT.green].map((m) => { const mm = new THREE.Group(); const c = new THREE.Mesh(new THREE.ConeGeometry(.15, .42, 6), m); c.position.y = .21; mm.add(c); const h = new THREE.Mesh(new THREE.SphereGeometry(.1, 6, 4), m); h.position.y = .46; mm.add(h); mm.traverse(o => { o.castShadow = true; }); G.add(mm); return mm; });
    const die = new THREE.Mesh(new THREE.IcosahedronGeometry(.2, 0), cmat('#ff6f91', CLS.accent, .6)); die.castShadow = true; G.add(die);
    // telão dos jogadores com as cartas
    const tvM = tv(G, TX, 3.9, -21.6, 8, 4.4, '#20123c');
    const card = (hex) => { const c = new THREE.Group(); box(c, 1.5, 2.1, .05, MAT.gold, 0, 0, 0); box(c, 1.26, 1.2, .06, cmat(hex, CLS.accent, .5), 0, .25, 0); const bar = box(c, 1.1, .16, .07, cmat('#7ee36b', CLS.accent, .6), 0, -.65, 0); c.userData.bar = bar; c.position.z = -21.3; G.add(c); return c; };
    const cards = [card('#5aa0ff'), card('#ff6f91')];
    const starShape = new THREE.Shape(); for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2, rr = k % 2 ? .25 : .7; const x = Math.sin(a) * rr, y = Math.cos(a) * rr; if (k) starShape.lineTo(x, y); else starShape.moveTo(x, y); }
    const star = new THREE.Mesh(new THREE.ShapeGeometry(starShape), freshMat('#ffe08a', CLS.flower, 1)); star.position.set(TX, 3.9, -21.2); G.add(star);
    const cellOf = (m, n) => [Math.floor(hash2(m * 7 + 1, n * 3) * 7), Math.floor(hash2(m * 5, n * 11 + 2) * 3)];
    // detalhes de taverna: tapete, estante de livros de regras, baú do tesouro, prateleira de poções, estandartes,
    // espadas cruzadas com escudo e tochas acesas
    const flames = [];
    {
      const D = makeBatch();
      const rug = box(G, 8.4, .03, 6.4, cmat('#6e2b1a', CLS.sand, .15), TX, .03, TZ); rug.castShadow = false;
      box(G, 7.6, .035, 5.6, cmat('#a8742a', CLS.sand, .2), TX, .035, TZ).castShadow = false;
      box(G, 7.2, .04, 5.2, cmat('#6e2b1a', CLS.sand, .15), TX, .04, TZ).castShadow = false;
      bookcase(D, -8.2, -22.3, 2.8, 3);
      D.box(1.5, .8, .95, MAT.wood, 7, .4, -19.6); D.box(1.54, .34, .99, MAT.woodDark, 7, .97, -19.6);
      for (const sx of [-.5, .5]) D.box(.1, 1.16, 1.02, MAT.gold, 7 + sx, .58, -19.6);
      for (let k = 0; k < 6; k++) D.cyl(.13, .13, .04, MAT.gold, 6.1 + hash2(k, 2) * 1.8, .03, -18.7 + hash2(2, k) * .6, 10);
      D.box(.55, 1.9, 1.8, MAT.woodDark, 9.5, .95, -14);
      const POTS = ['#e04a2a', '#2fbf9a', '#9b6cff', '#f2c335'].map(h => cmat(h, CLS.accent, .7));
      for (let lv = 0; lv < 2; lv++) for (let k = 0; k < 4; k++) { D.cyl(.12, .14, .3, POTS[(k + lv) % 4], 9.3, .55 + lv * .8, -14.6 + k * .4, 8); D.cyl(.04, .04, .12, MAT.woodDark, 9.3, .76 + lv * .8, -14.6 + k * .4, 5); }
      for (const [bx, hex] of [[-8.6, '#5b3d8a'], [8.4, '#9a2b25']]) { D.box(1.3, 2.8, .05, cmat(hex, CLS.accent, .35), bx, 3.9, -23); D.box(1.4, .1, .1, MAT.gold, bx, 5.35, -22.98); D.box(.5, .5, .06, MAT.gold, bx, 4.1, -22.96); }
      for (const a of [-.65, .65]) { const sw = box(G, .12, 2.2, .06, MAT.metal, 5.6, 3.6, -22.94); sw.rotation.z = a; const hl = box(G, .45, .1, .08, MAT.woodDark, 5.6 - Math.sin(a) * -.85, 3.6 - Math.cos(a) * .85, -22.92); hl.rotation.z = a; }
      const sh = cyl(G, .7, .7, .1, cmat('#2a7fbf', CLS.accent, .35), 5.6, 3.5, -22.86, 14); sh.rotation.x = Math.PI / 2;
      for (const [x, z] of [[-9.2, -7.6], [9.2, -7.6]]) {
        D.cyl(.07, .1, 2.1, MAT.dark, x, 1.05, z, 6); D.cyl(.22, .12, .26, MAT.dark, x, 2.2, z, 8);
        const fl = new THREE.Mesh(new THREE.ConeGeometry(.2, .55, 7), freshMat('#ffb347', CLS.flower, 1)); fl.position.set(x, 2.55, z); G.add(fl); flames.push(fl);
      }
      D.flush(G);
    }
    U.push((t, dt, zc) => {
      if (!near(zc, rz)) return;
      // cartas: uma avança, bate na outra e as duas voltam; a cada rodada quem ataca troca
      const R = 3.6, n = Math.floor(t / R), c = t - n * R, atk = n % 2;
      cards.forEach((cd, i) => {
        const home = TX + (i ? 2.4 : -2.4), dir = i ? -1 : 1, me = i === atk;
        const rush = me ? (c < 1 ? 0 : c < 1.4 ? ease((c - 1) / .4) : c < 2 ? 1 - ease((c - 1.4) / .6) : 0) : 0;
        const hitK = !me && c > 1.4 && c < 2 ? 1 - (c - 1.4) / .6 : 0;
        cd.position.x = home + dir * rush * 1.55 - dir * hitK * .5 + (hitK ? Math.sin(t * 60) * .08 : 0);
        cd.position.y = 3.9 + Math.sin(t * 1.6 + i * 2) * .1;
        cd.rotation.z = dir * -rush * .25 + (hitK ? Math.sin(t * 40) * .08 : 0);
        cd.userData.bar.scale.x = .35 + .65 * fract(-(n + i) * .23 + .99);
      });
      const sk = c > 1.35 && c < 1.9 ? (c - 1.35) / .55 : -1;
      star.visible = sk >= 0; if (sk >= 0) { star.scale.setScalar(.4 + Math.sin(sk * Math.PI) * 1.1); star.rotation.z = sk * 2; }
      tvM.emissive.set(sk >= 0 && sk < .4 ? '#5a3a8a' : '#140a26');
      // jogadores: um de cada vez rola o dado ou move a miniatura; os outros conversam
      const A = 2.8, m = Math.floor(t / A), u = t - m * A, who = m % 4, act = Math.floor(m / 4) % 2 ? 'mini' : 'roll';
      players.forEach((P, i) => {
        let pose = (i + m) % 3 === 0 ? 'talk' : 'stand';
        if (i === who) pose = act === 'roll' ? (u < .7 ? 'roll' : u > 1.8 && m % 3 === 0 ? 'cheer' : 'stand') : (u < 1.2 ? 'give' : 'stand');
        applyPose(P, t + i, pose, 1, 0, 0, 1);
      });
      const thrower = players[who].g.position;
      if (act === 'roll') {
        const tx2 = TX + Math.sin(m * 1.7) * 1.2, tz2 = TZ + Math.cos(m * 2.3) * .5;
        const k = clamp((u - .6) / 1.1);
        die.position.set(lerp(thrower.x, tx2, k), TY + .2 + Math.abs(Math.sin(k * Math.PI * 3)) * (1 - k) * .9 + (k === 0 ? .5 : 0), lerp(thrower.z, tz2, k));
        die.rotation.set(t * 11 * (1 - k), t * 8 * (1 - k), 0);
      }
      minis.forEach((mm, i) => {
        const steps = Math.floor((m - 5 - i) / 8) + 1; // quantas vezes essa miniatura já andou
        const [a0, b0] = cellOf(i, steps), [a1, b1] = cellOf(i, steps + 1);
        const moving = act === 'mini' && who === i, k = moving ? clamp((u - .3) / .9) : 1;
        const [x0, z0] = cell(a0, b0), [x1, z1] = moving ? cell(a1, b1) : cell(a0, b0);
        mm.position.set(lerp(x0, x1, ease(k)), TY + .03 + Math.sin(k * Math.PI) * .5, lerp(z0, z1, ease(k)));
      });
      applyPose(master, t, m % 4 === 3 ? 'talk' : 'type', 1, 0, 0, 1);
      lapRows.forEach((rw, k) => { rw.scale.x = .4 + .6 * fract(t * .3 + k * .37); });
      flames.forEach((fl, k) => { const f = 1 + Math.sin(t * 13 + k * 2) * .12 + Math.sin(t * 7.3 + k) * .1; fl.scale.set(1 / f, f, 1 / f); fl.rotation.y = t * 2; });
    });
  }

  // 3. White Label Utility List: linha de produção. Alguém cansado pega papel na pilha e leva para quem está no
  //    computador; essa pessoa digita tudo no sistema e passa o papel para a última, que o tritura.
  {
    const { G, rz } = st[3];
    const C = 10, PILE = [-7.7, -13.2], DESK = [-1.4, -13.5], SH = [2.1, -13.5];
    // a pilha de papel: uma torre bem alta num palete, com outras torres atrás e folhas soltas no topo e no chão
    const PILE_H = 3.1;
    box(G, 1.5, .12, 1.7, MAT.wood, PILE[0], .06, PILE[1]);
    const pile = box(G, 1.1, PILE_H, 1.35, MAT.lineWhite, PILE[0], .12 + PILE_H / 2, PILE[1]);
    const pileTop = new THREE.Group(); G.add(pileTop);
    for (let k = 0; k < 4; k++) { const sh = box(pileTop, .55, .02, .7, MAT.lineWhite, (k % 2 ? .12 : -.1), k * .03, (k - 1.5) * .12); sh.rotation.y = (k - 1.5) * .35; }
    {
      const D = makeBatch(), edge = cmat('#d9d4c4', CLS.stone, .05);
      for (const [x, z, h] of [[-9.1, -12.4, 2.4], [-9.1, -14, 3.6], [-7.8, -15, 1.7], [-9.2, -10.8, 1.2]]) {
        D.box(1.25, .12, 1.4, MAT.wood, x, .06, z);
        D.box(1.05, h, 1.25, MAT.lineWhite, x, .12 + h / 2, z);
        for (let y = .5; y < h; y += .55) D.box(1.07, .03, 1.27, edge, x, .12 + y, z); // lotes amarrados
      }
      for (let y = .5; y < PILE_H; y += .55) D.box(1.12, .03, 1.37, edge, PILE[0] - .01, .12 + y, PILE[1]);
      for (const [x, z, r] of [[-6.9, -14.3, .4], [-7.2, -11.9, -.7], [-8.3, -11.6, 1.1]]) { const g2 = new THREE.BoxGeometry(.5, .02, .66); g2.rotateY(r); g2.translate(x, .02, z); D.geo(g2, MAT.lineWhite, z); }
      D.flush(G);
    }
    box(G, 2.6, .08, 1, MAT.wood, DESK[0], .82, DESK[1]); for (const sx of [-1.2, 1.2]) box(G, .08, .82, .9, MAT.woodDark, DESK[0] + sx, .41, DESK[1]);
    box(G, 1.1, .7, .06, MAT.dark, DESK[0] + .3, 1.25, DESK[1] - .38); box(G, .1, .3, .1, MAT.dark, DESK[0] + .3, .98, DESK[1] - .38);
    const scrM = freshMat('#e8eef8', CLS.accent, .6); box(G, 1, .6, .02, scrM, DESK[0] + .3, 1.25, DESK[1] - .345);
    const rows = Array.from({ length: 5 }, (_, k) => { const rw = box(G, .8, .06, .02, cmat('#5aa0ff', CLS.accent, .7), DESK[0] + .3, 1.47 - k * .11, DESK[1] - .33); rw.castShadow = false; return rw; });
    box(G, .7, .05, .3, MAT.dark, DESK[0] + .3, .88, DESK[1] + .1);
    // triturador: cesto embaixo e a cabeça com a fenda em cima
    box(G, .9, .8, .7, MAT.wallMetal, SH[0], .4, SH[1]); box(G, 1, .3, .8, MAT.dark, SH[0], .95, SH[1]); box(G, .7, .03, .08, MAT.metal, SH[0], 1.11, SH[1]);
    const binM = box(G, .9, .35, .55, cmat('#cfd2d6', CLS.stone, .1), SH[0], .18, SH[1] + .75);
    const A = person(G, { skin: '#d8a87c', hair: '#5a3a20', shirt: '#8a8f99', pants: '#3a3a40' }, -6.5, -12.7, -Math.PI / 2);
    stool(G, DESK[0] + .3, DESK[1] + 1.05);
    const Bp = person(G, npc(1, { scale: 1.12 }), DESK[0] + .3, DESK[1] + 1.05, Math.PI);
    const Cp = person(G, npc(2, { scale: 1.12, long: false }), .9, -12.6, -Math.PI / 2);
    const give = [-3.1, -12.7], toDesk = Math.atan2(DESK[0] - .7 - give[0], DESK[1] - give[1]);
    const AK = script(-6.5, -12.7, -Math.PI / 2).stay(.5, 'weary', -Math.PI / 2).stay(1, 'reach', -Math.PI / 2).go([give], 'weary', 1.7).stay(.7, 'give', toDesk).go([[-6.5, -12.7]], 'weary', 1.7).end(C, 'weary', -Math.PI / 2);
    const tGive = AK[4][0] + .5, toSh = Math.atan2(SH[0] - .9, SH[1] - -12.6);
    const CK = script(.9, -12.6, -Math.PI / 2).until(7.3, 'stand', -Math.PI / 2).stay(.6, 'give', -Math.PI / 2).stay(.3, 'stand', toSh).stay(.8, 'give', toSh).end(C, 'stand', -Math.PI / 2);
    const paper = new THREE.Mesh(new THREE.BoxGeometry(.5, .02, .66), MAT.lineWhite); paper.castShadow = true; G.add(paper);
    const PT = [[0, 'gone'], [.9, 'at', PILE[0] + .3, .12 + PILE_H + .05, PILE[1]], [1.3, 'hold', A, .95, .45], [tGive, 'at', DESK[0] - .7, .88, DESK[1] + .1], [7.3, 'fly'], [7.9, 'hold', Cp, 1.1, .5], [8.5, 'at', SH[0], 1.18, SH[1]], [9.1, 'gone']];
    const strips = Array.from({ length: 8 }, () => { const m = new THREE.Mesh(new THREE.BoxGeometry(.05, .02, .45), MAT.lineWhite); G.add(m); return m; });
    const flyA = new THREE.Vector3(), flyB = new THREE.Vector3();
    // o resto do escritório: duas fileiras de mesas no fundo (de costas para a câmera) e uma na frente (de frente),
    // com gente digitando, lendo, falando ao telefone e conversando; uma mesa vazia, de quem saiu para o café
    const STAFF = [];
    {
      const spots = [
        [-1.6, -17.8, 1], [.6, -17.8, 1], [2.8, -17.8, 0], [-1.6, -20.6, 1], [.6, -20.6, 1], [2.8, -20.6, 1],
        [-5.6, -8.4, 1], [-2.2, -8.4, 1], [4.6, -8.4, 1],
      ];
      spots.forEach(([x, z, who], i) => {
        const back = z < -12, ry = back ? Math.PI : 0, sz = z + (back ? 1 : -1) * .85;
        desk(G, x, 0, z, { w: 1.6, ry, monitor: true, chair: false });
        if (i % 3 === 0) box(G, .4, .14, .5, MAT.lineWhite, x - .5, .93, z); // papelada na mesa
        if (i % 4 === 1) cyl(G, .07, .07, .14, MAT.white, x + .55, .93, z, 6); // caneca
        stool(G, x, sz);
        if (!who) return;
        STAFF.push({ P: person(G, npc(i + 3, { scale: 1.1, long: i % 2 === 0 }), x, sz, back ? Math.PI : 0), off: i * 1.7, i });
      });
    }
    const STAFF_POSES = ['type', 'type', 'read', 'type', 'phone', 'type', 'talk', 'inspect'];
    // detalhes de escritório: arquivos de aço no fundo, o quadro com a lista (a "utility list") e os itens já
    // marcados, caixas de papel esperando, impressora, bebedouro, lixeira de reciclagem do picotado e relógio
    {
      const D = makeBatch(), blueM = cmat('#5aa0ff', CLS.accent, .5), okM = cmat('#7ee36b', CLS.accent, .6);
      for (const x of [-8.6, -7.3, 5.6, 6.9, 8.2]) { D.box(1.2, 2.2, .9, MAT.wallMetal, x, 1.1, -22.4); for (let k = 0; k < 3; k++) { D.box(1.1, .04, .05, MAT.dark, x, .73 + k * .7, -21.93); D.box(.3, .06, .07, MAT.metal, x, .5 + k * .7, -21.92); } }
      D.box(6.4, 3.2, .08, MAT.lineWhite, -.6, 3.5, -22.98); D.box(6.6, .14, .14, MAT.metal, -.6, 1.88, -22.9);
      for (let k = 0; k < 6; k++) { D.box(3.8 - (k % 3) * .6, .14, .05, blueM, -.1 - (k % 3) * .3, 4.65 - k * .44, -22.9); D.box(.28, .28, .05, k < 3 ? okM : MAT.dark, -3.1, 4.65 - k * .44, -22.9); }
      for (const [x, z, n] of [[-9, -17.6, 3], [-8.4, -19.8, 2], [-6.9, -18.7, 1]]) for (let k = 0; k < n; k++) crate(D, x, k * .64, z, .8);
      tableAt(D, -4.4, -19.4, 1.6, .9); D.box(1, .45, .7, MAT.wallMetal, -4.4, 1.07, -19.4); D.box(.6, .03, .4, MAT.lineWhite, -4.4, 1.31, -19.25); D.box(.7, .08, .3, MAT.dark, -4.4, 1.1, -19.02);
      D.box(.6, 1.1, .6, MAT.white, 7, .55, -17.4); D.cyl(.26, .26, .6, cmat('#8fd0ff', CLS.window, .5), 7, 1.4, -17.4, 10);
      D.box(1, .9, .9, blueM, 4.2, .45, -15.6); for (let k = 0; k < 5; k++) D.box(.06, .03, .4, MAT.lineWhite, 3.9 + k * .15, .92, -15.6 + (k % 2) * .1);
      plant(D, 9, -1.8); plant(D, -9.2, -1.8, 1.1);
      D.flush(G);
      wallClock(G, 5.2, 4.6, -22.98);
    }
    U.push((t, dt, zc) => {
      if (!near(zc, rz)) return;
      const tc = t % C, cyc = Math.floor(t / C);
      playKeys(A, AK, tc, t); playKeys(Cp, CK, tc, t);
      applyPose(Bp, t, tc > 7 && tc < 7.6 ? 'give' : 'type', 1, 0, 0, 1);
      for (const o of STAFF) applyPose(o.P, t + o.off, STAFF_POSES[(Math.floor((t + o.off) / 3.5) + o.i) % STAFF_POSES.length], 1, 0, 0, 1);
      Bp.g.rotation.y = tc > 6.9 && tc < 7.7 ? Math.PI - .9 : Math.PI;
      const e = PT.filter(q => q[0] <= tc).pop();
      if (e[1] === 'fly') {
        const k = (tc - 7.3) / .6; flyA.set(DESK[0] - .7, .88, DESK[1] + .1); holdAt(Cp, flyB, 1.1, .5);
        paper.visible = true; paper.position.lerpVectors(flyA, flyB, k); paper.position.y += Math.sin(k * Math.PI) * .7; paper.rotation.y = k * 2;
      } else track(paper, PT, tc);
      if (e[1] === 'at' && e[2] === SH[0]) { const k = clamp((tc - 8.5) / .6); paper.position.y = 1.18 - k * .3; paper.scale.z = 1 - k * .9; } else paper.scale.z = 1;
      strips.forEach((m, j) => {
        const k = (tc - 8.6 - j * .06) / .9;
        m.visible = k > 0 && k < 1;
        m.position.set(SH[0] - .3 + j * .085, lerp(.8, .4, k), SH[1] + .42 + k * .3);
        m.rotation.set(.3 + Math.sin(t * 8 + j) * .3, 0, Math.sin(t * 6 + j) * .4);
      });
      const typing = tc > tGive + .2 && tc < 7;
      rows.forEach((rw, k) => { rw.visible = typing ? (tc - tGive) / (7 - tGive) * 6 > k + .5 : tc >= 7 && tc < 9; });
      binM.scale.y = .6 + .4 * fract(cyc * .13);
      const h = 1 - (cyc % 10) * .015 - (tc > 1.3 ? .015 : 0); pile.scale.y = h; pile.position.y = .12 + PILE_H * h / 2; pileTop.position.set(PILE[0], .14 + PILE_H * h, PILE[1]);
    });
  }

  // 4. Eventure: a festa lá dentro e a fila na entrada. Cada um paga pelo celular (saem moedinhas), mostra o
  //    ingresso ao segurança e entra; depois de dançar, sai pela frente e volta para o fim da fila.
  {
    const { G, rz } = st[4];
    const X0 = -9.5, X1 = 2.5, Z0 = -22, Z1 = -10.5;
    // pista de dança
    const tiles = [];
    for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) { const m = freshMat('#ff6f91', CLS.accent, .5); box(G, 2.35, .04, 2.3, m, -7.5 + a * 2.45, .05, -19.6 + b * 2.35); tiles.push(m); }
    // cerca baixa com a entrada à direita e a saída na frente
    const rail = (ax, az, bx, bz) => {
      const w = Math.abs(bx - ax) || .08, d = Math.abs(bz - az) || .08, n = Math.max(1, Math.round(Math.max(w, d) / 1.5));
      box(G, w, .08, d, MAT.metal, (ax + bx) / 2, .9, (az + bz) / 2);
      for (let k = 0; k <= n; k++) cyl(G, .05, .05, .9, MAT.metal, lerp(ax, bx, k / n), .45, lerp(az, bz, k / n), 5);
    };
    rail(X0, Z0, X1, Z0); rail(X0, Z0, X0, Z1); rail(X0, Z1, -6, Z1); rail(-4.4, Z1, X1, Z1); rail(X1, Z0, X1, -13.9); rail(X1, -12.1, X1, Z1);
    // DJ, caixas de som e o varal de luzes
    box(G, 3, 1, .9, MAT.dark, -3.5, .5, -21); box(G, 2.6, .06, .7, cmat('#9b6cff', CLS.accent, .7), -3.5, 1.03, -21);
    for (const sx of [-6.6, -.4]) { box(G, .9, 1.8, .8, MAT.dark, sx, .9, -21.2); cyl(G, .28, .28, .05, MAT.metal, sx, 1.2, -20.78, 10).rotation.x = Math.PI / 2; }
    const dj = person(G, npc(5, { scale: 1.12, hat: true }), -3.5, -21.9, 0);
    const bulbs = [];
    for (const [ax, az, bx, bz] of [[X0, Z0, X1, Z0], [X0, Z1, X1, Z1]]) {
      for (const [px, pz] of [[ax, az], [bx, bz]]) cyl(G, .07, .07, 3.4, MAT.dark, px, 1.7, pz, 5);
      for (let k = 0; k < 14; k++) { const f = (k + .5) / 14, m = new THREE.Mesh(new THREE.SphereGeometry(.12, 6, 4), freshMat('#ffd166', CLS.accent, .9)); m.position.set(lerp(ax, bx, f), 3.25 - Math.sin(f * Math.PI) * .4, lerp(az, bz, f)); G.add(m); bulbs.push(m); }
    }
    const extra = [[-1.6, -18.6], [-7.2, -15.6]].map(([x, z], i) => ({ P: person(G, npc(i + 3, { scale: 1.12 }), x, z, Math.PI * .8), o: i * 1.7 }));
    const guard = person(G, { skin: '#6b4126', hair: '#141010', shirt: '#1c1c1e', pants: '#1c1c1e' }, 3.45, -11.5, 2.7);
    const RING = [
      { p: [6.6, -13], f: -Math.PI / 2, k: 'q' }, { p: [5.3, -13], f: -Math.PI / 2, k: 'q' }, { p: [4.0, -13], f: -Math.PI / 2, k: 'front' },
      { p: [.4, -14.6], k: 'party', via: [[2.5, -13], [1.4, -13.4]] }, { p: [-2.4, -18.4], k: 'party' }, { p: [-6.4, -18], k: 'party' }, { p: [-6.2, -13.4], k: 'party' },
      { p: [-5.2, -8.9], k: 'out', via: [[-5.2, -10.5]] }, { p: [1.8, -8.7], k: 'out' }, { p: [7.9, -10.6], k: 'out' },
    ];
    const NR = RING.length, PER = 4.2, V = 2.4;
    const legs = RING.map((sl, i) => { const nx = RING[(i + 1) % NR]; const pts = [sl.p, ...(nx.via ?? []), nx.p]; return { pts, d: polyLen(pts) / V }; });
    const guests = Array.from({ length: 9 }, (_, j) => {
      const P = person(G, npc(j + 2, { scale: 1.12 }), 0, 0);
      const ph = new THREE.Group(); box(ph, .14, .26, .03, MAT.dark, 0, -.1, .08); box(ph, .11, .2, .01, freshMat('#5a9bfc', CLS.accent, .9), 0, -.1, .1); ph.rotation.x = -1.2; P.hand.add(ph);
      return { P, ph, j };
    });
    const coins = Array.from({ length: 5 }, () => { const m = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, .04, 10), MAT.gold); m.rotation.x = Math.PI / 2; G.add(m); return m; });
    // detalhes da festa: bar com garrafas e bartender, globo espelhado girando sobre a pista, portal de entrada
    // na cor do evento e cachos de balões
    let disco, bartender;
    {
      const D = makeBatch(), BOT = ['#2e9a52', '#c8643c', '#f2c935', '#5aa0ff', '#9b6cff'].map(h => cmat(h, CLS.accent, .7));
      D.box(5, 1.1, 1.1, MAT.woodDark, 6.6, .55, -19.4); D.box(5.3, .1, 1.35, MAT.wood, 6.6, 1.15, -19.4); D.box(5, .12, .1, cmat('#ff6f91', CLS.accent, .8), 6.6, .9, -18.84);
      for (let k = 0; k < 4; k++) { D.cyl(.26, .26, .06, MAT.dark, 4.8 + k * 1.2, .82, -18.2, 8); D.cyl(.05, .05, .8, MAT.metal, 4.8 + k * 1.2, .4, -18.2, 5); }
      for (const yy of [1.9, 2.9]) { D.box(5, .1, .5, MAT.wood, 6.6, yy, -22.7); for (let k = 0; k < 9; k++) D.cyl(.1, .12, .42, BOT[(k + (yy > 2 ? 2 : 0)) % 5], 4.5 + k * .52, yy + .27, -22.7, 6); }
      for (let k = 0; k < 3; k++) D.cyl(.08, .08, .2, MAT.lineWhite, 5.4 + k * 1.3, 1.3, -19.3, 6);
      for (const zz of [-14.05, -11.95]) D.box(.22, 3, .22, cmat('#ff6f91', CLS.accent, .5), 2.5, 1.5, zz);
      D.box(.3, .55, 2.5, cmat('#ff6f91', CLS.accent, .6), 2.5, 3.2, -13); D.box(.32, .14, 1.6, MAT.gold, 2.5, 3.2, -13);
      const BAL = ['#ff6f91', '#ffd166', '#5aa0ff', '#7ee36b', '#9b6cff'].map(h => cmat(h, CLS.accent, .55));
      for (const [bx, bz] of [[9.2, -22], [-9.7, -8.6], [3.4, -22.2]]) for (let k = 0; k < 5; k++) {
        const ox = Math.sin(k * 2.3) * .45, oz = Math.cos(k * 2.3) * .3, hy = 2.5 + (k % 3) * .35;
        D.cyl(.015, .015, hy, MAT.lineWhite, bx + ox * .5, hy / 2, bz + oz * .5, 4);
        const bg = new THREE.SphereGeometry(.32, 8, 6); bg.scale(1, 1.2, 1); bg.translate(bx + ox, hy + .3, bz + oz); D.geo(bg, BAL[k], bz);
      }
      D.box(.03, 1.2, .03, MAT.metal, -3.8, 5.6, -16.1);
      D.flush(G);
      disco = new THREE.Mesh(new THREE.IcosahedronGeometry(.55, 1), tag(new THREE.MeshLambertMaterial({ color: '#dfe6f2', emissive: '#556070', flatShading: true }), CLS.foam));
      disco.position.set(-3.8, 4.8, -16.1); G.add(disco);
      bartender = person(G, { skin: '#c99a6e', hair: '#141010', shirt: '#1c1c1e', pants: '#2c3344' }, 6.6, -20.5, 0);
    }
    U.push((t, dt, zc) => {
      if (!near(zc, rz)) return;
      disco.rotation.y = t * .9; disco.material.emissive.setHSL(fract(t * .15), .5, .35);
      bartender.g.rotation.y = Math.sin(t * .5) * .4; applyPose(bartender, t, Math.floor(t / 3) % 2 ? 'give' : 'sway', 1, 0, 0);
      const idx = Math.floor(t / PER), u = t - idx * PER;
      let front = null;
      for (const gu of guests) {
        const s = (gu.j + idx) % NR, sl = RING[s], leg = legs[s], walk0 = PER - leg.d, P = gu.P;
        if (u >= walk0) {
          const k = (u - walk0) / leg.d, [x, z, f] = along(leg.pts, k);
          P.g.position.set(x, 0, z); P.g.rotation.y = f;
          applyPose(P, t, s <= 1 || s === 9 ? 'phone' : 'none', 1, k * leg.d * V * 2.6 + gu.j, 1);
        } else {
          P.g.position.set(sl.p[0], 0, sl.p[1]);
          if (sl.f !== undefined) P.g.rotation.y = sl.f;
          let pose = 'stand';
          if (sl.k === 'q') pose = 'phone';
          else if (sl.k === 'front') { pose = u < 1.1 ? 'phone' : 'show'; front = { P, u }; }
          else if (sl.k === 'party') { pose = 'dance'; P.g.rotation.y = Math.sin(t * .8 + gu.j) * .8 + Math.PI * .85; }
          applyPose(P, t + gu.j * .37, pose, 1, 0, 0);
        }
        gu.ph.visible = s <= 2 || s === 9;
      }
      // moedinhas saindo do celular de quem está pagando
      coins.forEach((m, i) => {
        const k = front ? (front.u - .1 - i * .18) / .8 : -1;
        m.visible = k > 0 && k < 1;
        if (m.visible) { holdAt(front.P, m.position, 1.35, .45); m.position.y += k * 1.4; m.position.x += Math.sin(i * 2.1) * .25 * k; m.rotation.z = t * 8; m.scale.setScalar(1 - k * .5); }
      });
      // segurança: confere o celular e libera a entrada
      const gp = front ? (front.u > 1.1 && front.u < 2 ? 'inspect' : front.u >= 2 ? 'point' : 'stand') : 'stand';
      guard.g.rotation.y = gp === 'point' ? 2.2 : 2.7;
      applyPose(guard, t, gp, 1, 0, 0);
      applyPose(dj, t, 'dance', .5, 0, 0);
      extra.forEach(o => { o.P.g.rotation.y = Math.PI * .8 + Math.sin(t * .6 + o.o) * .6; applyPose(o.P, t + o.o, 'dance', 1, 0, 0); });
      const beat = Math.floor(t * 2.2);
      tiles.forEach((m, i) => { const on = (i + beat) % 3 === 0; m.emissive.set(on ? ['#ff6f91', '#5aa0ff', '#ffd166', '#7ee36b'][(i + beat) % 4] : '#1a0f18'); });
      bulbs.forEach((b, j) => { b.material.emissive.set((Math.floor(t * 3) + j) % 3 ? '#ffd166' : '#3a2a10'); });
    });
  }

  // 5. VestMentor: sala de aula; cada um resolve questões no computador e a TV mostra o aproveitamento por matéria.
  {
    const { G, rz } = st[5];
    const tvM = tv(G, -1.2, 3.9, -21.6, 9, 4.6, '#0e1c33');
    const SUBJ = ['#e04a2a', '#3f7fe0', '#f2c335', '#2e9a52', '#f08a24', '#9b6cff'];
    // o gráfico ocupa a tela inteira (9 x 4.6, centrada em x -1.2, y 3.9), com uma margem pequena
    const SLOT = 8.2 / SUBJ.length, BASE = 1.9, X0 = -1.2 - 4.1 + SLOT / 2;
    const bars = SUBJ.map((hex, k) => { const b = box(G, SLOT * .76, 1, .08, cmat(hex, CLS.accent, .7), X0 + k * SLOT, BASE + .5, -21.35); b.castShadow = false; return { b, h: 1, goal: 1 }; });
    box(G, 8.4, .05, .09, MAT.lineYellow, -1.2, BASE + 2.8, -21.34); // linha da meta
    const teacher = person(G, { skin: '#b07850', hair: '#1b120c', shirt: '#efe3c8', pants: '#3a4150', long: true }, -7.6, -19.6, .5);
    // detalhes de sala de aula: mesa da professora com globo, maçã e livros, estante, mochilas ao lado das
    // mesas, quadro de avisos, tabela periódica, relógio e plantas
    {
      const D = makeBatch();
      tableAt(D, -8.3, -21.7, 2.4, 1, .82);
      const gl = new THREE.Mesh(new THREE.SphereGeometry(.28, 12, 8), tag(new THREE.MeshLambertMaterial({ map: globeTexture(), emissive: '#0a1a33', emissiveIntensity: .4 }), CLS.accent)); gl.position.set(-9.1, 1.32, -21.7); G.add(gl);
      D.cyl(.1, .14, .14, MAT.dark, -9.1, .93, -21.7, 8);
      const ap = new THREE.SphereGeometry(.13, 8, 6); ap.translate(-7.6, .99, -21.5); D.geo(ap, MAT.red, -21.5);
      for (let k = 0; k < 3; k++) D.box(.5, .1, .7, BOOKS[k + 1], -8.3, .91 + k * .1, -21.8);
      bookcase(D, 8, -22.3, 3, 3);
      const BAG = ['#e04a2a', '#3f7fe0', '#2e9a52', '#f08a24', '#9b6cff', '#e7b25a'].map(h => cmat(h, CLS.accent, .3));
      let k = 0;
      for (const z of [-11.8, -16.2]) for (const x of [-5.6, -1.2, 3.2]) { D.box(.45, .55, .3, BAG[k % 6], x + 1.65, .28, z + 1.2); D.box(.35, .2, .06, MAT.dark, x + 1.65, .3, z + 1.36); k++; }
      D.box(2.6, 1.8, .06, cmat('#b8885a', CLS.wood, .2), 6.4, 4.5, -23); for (let q = 0; q < 4; q++) D.box(.7, .55, .05, [MAT.lineWhite, MAT.yellow, cmat('#ff9fb2', CLS.accent, .4), MAT.lineWhite][q], 5.8 + (q % 2) * 1.2, 4.85 - Math.floor(q / 2) * .7, -22.95);
      const PT = ['#ff9f7a', '#ffd166', '#7ee36b', '#5aa0ff', '#c9a7ff'].map(h => cmat(h, CLS.accent, .4));
      for (let a = 0; a < 9; a++) for (let b = 0; b < 4; b++) { if (b < 2 && a > 0 && a < 8) continue; D.box(.24, .24, .04, PT[(a + b) % 5], -9.4 + a * .28, 5.4 - b * .28, -22.98); }
      plant(D, 9.2, -1.8, 1.1); plant(D, -9.2, -1.8);
      D.flush(G);
      wallClock(G, 4.2, 5.2, -22.98);
    }
    const desks = [];
    for (const z of [-11.8, -16.2]) for (const x of [-5.6, -1.2, 3.2]) {
      box(G, 2.8, .08, .9, MAT.wood, x, .78, z); for (const sx of [-1.3, 1.3]) box(G, .08, .78, .8, MAT.woodDark, x + sx, .39, z);
      box(G, 1, .62, .05, MAT.dark, x, 1.2, z - .3);
      const m = freshMat('#cfe6ff', CLS.accent, .7); box(G, .9, .52, .02, m, x, 1.2, z - .27);
      stool(G, x, z + 1.05);
      const P = person(G, npc(desks.length + 1, { scale: 1.1 }), x, z + 1.05, Math.PI);
      desks.push({ P, m, o: desks.length * 1.37 });
    }
    U.push((t, dt, zc) => {
      if (!near(zc, rz)) return;
      desks.forEach((d, i) => {
        // cada questão leva uns segundos; ao responder a tela pisca verde (acertou) ou vermelha (errou)
        const q = Math.floor((t + d.o) / 3.4), u = t + d.o - q * 3.4, ok = hash2(i, q) > .28;
        d.m.color.set(u > 2.8 ? (ok ? '#7ee36b' : '#ff6b5a') : '#cfe6ff'); d.m.emissive.copy(d.m.color).multiplyScalar(.7);
        const hand = hash2(q, i * 3) > .86 && u < 2;
        applyPose(d.P, t + d.o, hand ? 'pointUp' : u > 2.8 && ok && hash2(i * 2, q) > .7 ? 'cheer' : 'type', 1, 0, 0, 1);
      });
      const per = Math.floor(t / 4);
      bars.forEach((o, k) => { o.goal = 1.2 + hash2(k, per) * 2.8; o.h = damp(o.h, o.goal, 2, dt); o.b.scale.y = o.h; o.b.position.y = BASE + o.h / 2; });
      tvM.emissive.set('#0e1c33');
      applyPose(teacher, t, Math.floor(t / 5) % 2 ? 'point' : 'talk', 1, 0, 0);
      teacher.g.rotation.y = Math.floor(t / 5) % 2 ? -.6 : .5;
    });
  }
}

// ---------- barco ----------
function buildBoat(scene) {
  // canoa de madeira: casco afinado nas pontas, borda escura e dois bancos
  const g = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(-2.9, 0); shape.quadraticCurveTo(-1.7, -.8, 0, -.8); shape.quadraticCurveTo(1.7, -.8, 2.9, 0); shape.quadraticCurveTo(1.7, .8, 0, .8); shape.quadraticCurveTo(-1.7, .8, -2.9, 0);
  const outer = new THREE.ExtrudeGeometry(shape, { depth: .6, bevelEnabled: false }); outer.rotateX(-Math.PI / 2);
  const hull = new THREE.Mesh(outer, tag(new THREE.MeshLambertMaterial({ map: MAT.wood.map, color: '#d39a5e', emissive: '#5a3416', side: THREE.DoubleSide }), CLS.wood)); hull.position.y = -.25; g.add(hull);
  const inner = new THREE.Mesh(new THREE.ShapeGeometry(shape), cmat('#d8a46c', CLS.wood, .45)); inner.rotation.x = -Math.PI / 2; inner.scale.set(.9, .82, 1); inner.position.y = .2; g.add(inner);
  const ring = new THREE.Shape(shape.getPoints(24)), hole = new THREE.Path(shape.getPoints(24).map(p => p.clone().multiply(new THREE.Vector2(.92, .82))).reverse());
  ring.holes.push(hole);
  const rim = new THREE.Mesh(new THREE.ExtrudeGeometry(ring, { depth: .1, bevelEnabled: false }), cmat('#8a5530', CLS.wood, .35)); rim.rotation.x = -Math.PI / 2; rim.scale.set(1.02, 1.05, 1); rim.position.y = .3; g.add(rim);
  for (const sx of [-1, 1]) box(g, .45, .1, 1.4, MAT.woodDark, sx, .55, 0);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  scene.add(g);
  return g;
}
function rod() {
  const r = new THREE.Group();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(.018, .035, 2.6, 5), tag(new THREE.MeshLambertMaterial({ color: '#3a2a1c' }), CLS.wood)); m.position.y = 1.3; r.add(m);
  r.rotation.x = 1.05; r.userData.tip = new THREE.Vector3(0, 2.6, 0);
  return r;
}
// coração gordinho, com borda arredondada, centrado na origem
function heartGeo() {
  const s = new THREE.Shape();
  s.moveTo(0, -.58); s.bezierCurveTo(-.14, -.4, -.66, -.12, -.66, .22); s.bezierCurveTo(-.66, .56, -.22, .68, 0, .38); s.bezierCurveTo(.22, .68, .66, .56, .66, .22); s.bezierCurveTo(.66, -.12, .14, -.4, 0, -.58);
  const g = new THREE.ExtrudeGeometry(s, { depth: .14, bevelEnabled: true, bevelThickness: .09, bevelSize: .07, bevelSegments: 3, curveSegments: 24 });
  g.center();
  return g;
}
const easeOutBack = x => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2; };

// ---------- ascii + tilt shift ----------
const GLYPHS = " .'`,:;-~=+*oOsS$%&8#@/\\|_^v\u2014";
const GI = Object.fromEntries([...GLYPHS].map((c, i) => [c, i]));
const gg = c => GI[c].toFixed(1);
function buildAtlas() {
  const tw = 64, th = 120, c = document.createElement('canvas');
  c.width = tw * GLYPHS.length; c.height = th;
  const x = c.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = 'bold 100px "DejaVu Sans Mono", Menlo, Consolas, monospace';
  [...GLYPHS].forEach((ch, i) => { if (ch === '\u2014') x.fillRect(i * tw, th * .44, tw, th * .12); else x.fillText(ch, (i + .5) * tw, th * .52); });
  const t = new THREE.CanvasTexture(c); t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.anisotropy = 8; t.flipY = false;
  return t;
}
const asciiFrag = /* glsl */`
precision highp float;
uniform sampler2D uScene, uAtlas; uniform vec2 uGrid; uniform float uTime, uN;
in vec2 vUv; out vec4 outColor;
float h21(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float vn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y); }
float lum(vec3 c){ return dot(c,vec3(.25,.6,.15)); }
vec3 grade(vec3 c){
  c = max(c,0.); c = c/(1.+c*.12); c = pow(c,vec3(1./2.2));
  c = mix(c,c*c*(3.-2.*c),.5);
  float l = lum(c); c = mix(vec3(l),c,1.28);
  return clamp(c,0.,1.);
}
void main(){
  vec2 g = vUv*uGrid, cell = floor(g), cuv = (cell+.5)/uGrid;
  ivec2 sz = textureSize(uScene,0);
  float lodC = log2(float(sz.x)/uGrid.x)+.05;
  vec3 col = grade(textureLod(uScene,cuv,lodC).rgb);
  float cls = floor(texelFetch(uScene,ivec2(cuv*vec2(sz)),0).a*16.+.5);
  float L = lum(col);
  vec2 e = 1./uGrid;
  float lx0=lum(grade(textureLod(uScene,cuv-vec2(e.x,0),lodC).rgb)), lx1=lum(grade(textureLod(uScene,cuv+vec2(e.x,0),lodC).rgb));
  float ly0=lum(grade(textureLod(uScene,cuv-vec2(0,e.y),lodC).rgb)), ly1=lum(grade(textureLod(uScene,cuv+vec2(0,e.y),lodC).rgb));
  vec2 grad = vec2(lx1-lx0,(ly1-ly0)*.55); float mag = length(grad);
  float a4 = mod(atan(grad.y,grad.x)+.3927,3.14159)/.7854;
  float edgeG = a4<1.?${gg('|')}:a4<2.?${gg('\\')}:a4<3.?${gg('\u2014')}:${gg('/')};
  float w = vn(cell*vec2(.05,.09)+vec2(-uTime*.28,uTime*.07))*2.-1.;
  float gl = ${gg('.')};
  if(cls<1.5){        // capim
    gl = L<.12?${gg('.')}:L<.2?${gg(':')}:(w<-.2?${gg('\\')}:w>.2?${gg('/')}:${gg('|')});
  } else if(cls<2.5){ // folhas
    gl = L<.12?${gg('.')}:L<.24?${gg(':')}:L<.38?${gg('*')}:L<.5?${gg('+')}:${gg('o')};
  } else if(cls<3.5){ // flores, confete
    gl = L<.34?${gg(':')}:L<.55?${gg('*')}:L<.76?${gg('%')}:${gg('#')};
  } else if(cls<4.5){ // pedra, metal
    gl = L<.22?${gg(':')}:L<.42?${gg('=')}:${gg('#')};
    if(mag>.16) gl = edgeG;
  } else if(cls<5.5){ // estrada, asfalto, concreto
    gl = L<.14?${gg('.')}:L<.26?${gg(':')}:L<.42?${gg('=')}:${gg('~')};
  } else if(cls<6.5){ // cores de destaque
    gl = L<.1?${gg(':')}:L<.24?${gg('=')}:${gg('#')};
    if(mag>.2 && L>.1) gl = edgeG;
  } else if(cls<7.5){ // madeira
    gl = L<.14?${gg(':')}:(mag>.1?edgeG:(L<.34?${gg('|')}:${gg('#')}));
  } else if(cls<8.5){ // areia, chão
    gl = L<.3?${gg(':')}:L<.6?${gg(';')}:${gg('=')};
  } else if(cls<9.5){ // água
    gl = L<.2?${gg('-')}:L<.42?(w>0.?${gg('~')}:${gg('-')}):L<.7?${gg('~')}:${gg('=')};
  } else if(cls<10.5){ // espuma, gotas, garças
    gl = L<.6?${gg('*')}:L<.82?${gg('%')}:${gg('#')};
  } else if(cls<11.5){ // gente e bichos
    gl = L<.22?${gg('&')}:L<.5?${gg('$')}:${gg('@')};
  } else if(cls<12.5){ // telhado
    gl = L<.3?${gg('=')}:L<.55?${gg('\u2014')}:${gg('#')};
    if(mag>.22) gl = edgeG;
  } else if(cls<13.5){ // cupinzeiro, rocha
    gl = L<.12?${gg('.')}:L<.26?${gg(':')}:L<.42?${gg('%')}:${gg('#')};
    if(mag>.2) gl = edgeG;
  } else if(cls<14.5){ // parede
    gl = L<.25?${gg(':')}:L<.5?${gg('=')}:L<.78?${gg('#')}:${gg('8')};
    if(mag>.18) gl = edgeG;
  } else { // janela
    gl = L<.3?${gg(':')}:L<.6?${gg('+')}:${gg('#')};
  }
  vec2 gv = g-cell, dx = dFdx(g), dy = dFdy(g);
  float ink = smoothstep(.12,.78,textureGrad(uAtlas,vec2((gl+gv.x)/uN,1.-gv.y),dx/uN,dy).r);
  vec3 blur = grade(textureLod(uScene,vUv,lodC+1.2).rgb);
  outColor = vec4(mix(blur*.3,col*1.36+.014,ink),1.);
}`;
const tiltFrag = /* glsl */`
precision highp float;
uniform sampler2D uA; uniform vec2 uRes; uniform float uFocus, uBlur, uBand;
in vec2 vUv; out vec4 outColor;
void main(){
  float dy = abs(vUv.y-uFocus);
  float r = pow(smoothstep(uBand,uBand+.3,dy),1.6)*uBlur;
  if(r<.2){ outColor = vec4(texture(uA,vUv).rgb,1.); return; }
  vec3 c = vec3(0.);
  float lod = max(log2(r/4.),0.);
  for(int i=0;i<32;i++){
    float t = float(i)+.5, a = t*2.39996, rr = sqrt(t/32.)*r;
    c += textureLod(uA,vUv+vec2(cos(a),sin(a))*rr/uRes,lod).rgb;
  }
  outColor = vec4(c/32.,1.);
}`;

// ---------- o mundo ----------
export async function createWorld(canvas, { lite = false, reduced = false } = {}) {
  seed = 23;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', alpha: false });
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x0a0d14, 1);

  const scene = new THREE.Scene();
  const sun = new THREE.DirectionalLight('#ffe7c4', 3.2);
  sun.castShadow = true; sun.shadow.mapSize.set(lite ? 1024 : 2048, lite ? 1024 : 2048);
  sun.shadow.bias = -.0006; sun.shadow.normalBias = .03;
  const hemi = new THREE.HemisphereLight('#efe6d8', '#5d6a36', 1.25);
  scene.add(sun, sun.target, hemi);

  const tl = new THREE.TextureLoader();
  const tex = (n, rx = 1, ry = 1) => { const t = tl.load(`/world/assets/tex/${n}.jpg`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return t; };
  mats({ planks: tex('weathered_planks', 1, 1), slate: tex('castle_wall_slates', 1, 1) });
  await buildFields();
  const warm = { value: 0 };
  scene.add(await buildTerrain(lite), buildWater(warm));
  await yieldFrame();
  buildGrass(scene, lite); await yieldFrame();
  buildFlowers(scene, lite);
  const RZ = RIVER_Z;
  buildTrees(scene, tex('bark_brown_02', 1, 2), lite, [
    // morro de casa
    [-12, 6, 'ipe', 1.1], [-3, 2, 'caju', 1.1], [26, 8, 'green', 1.1], [-22, 22, 'caju', 1], [24, 30, 'ipe', 1], [-14, 30, 'buriti', 1], [34, 20, 'caju', 1],
    [-18, 62, 'caju', 1], [-28, 58, 'ipe', 1], [32, 66, 'green', 1], [-10, 82, 'buriti', 1], [34, 96, 'ipe', 1.1], [-16, 102, 'ipeRoxo', 1],
    [16, 128, 'buriti', 1.1], [-26, 126, 'buriti', 1], [30, 124, 'buriti', 1],
    // parque da praça: as árvores ficam na parte de baixo, depois das quadras
    [-24, 828, 'ipe', 1.05], [-12, 838, 'green', 1], [14, 830, 'green', 1], [25, 838, 'ipeRoxo', 1], [-32, 832, 'caju', 1], [33, 826, 'green', 1],
    [7, 841, 'ipe', .95], [-34, 800, 'buriti', 1], [35, 804, 'green', 1], [-6, 828, 'green', .9],
    // beira-rio
    [-12, RZ - 11, 'ipe', 1.15], [12, RZ - 15, 'buriti', 1.1], [22, RZ - 9, 'ipeRoxo', 1],
  ]);
  await yieldFrame();
  const sel = {}, U = [];
  buildPlaces(scene, sel, U, lite);

  // eu, a cachorra, a moto, minha noiva e meu pai
  const me = makeMe(1.32);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(.16, 8, 6), cmat('#d6f03a', CLS.accent, .6)); ball.castShadow = true; scene.add(ball);
  const myRod = addItem(me, 'rod', rod());
  scene.add(me.g);
  const dog = makeDog(); scene.add(dog.g);
  const DOG_HOME = new THREE.Vector3(6.5, 0, 33);
  dog.g.position.set(DOG_HOME.x, H(DOG_HOME.x, DOG_HOME.z), DOG_HOME.z);
  const moto = makeMoto(); scene.add(moto.g);
  // cada corrida de moto começa e termina numa vaga; `rev` quando saio de ré da vaga
  const RIDE_P = RIDES.map(([a, b], i) => {
    const ta = pathCurve.getTangentAt(a / pathLen), prev = i ? pathCurve.getTangentAt(RIDES[i - 1][1] / pathLen) : null;
    return { a, b, pa: pathCurve.getPointAt(a / pathLen), ta, pb: pathCurve.getPointAt(b / pathLen), tb: pathCurve.getTangentAt(b / pathLen), rev: !!prev && prev.dot(ta) < -.2 };
  });
  const fiancee = personAt(scene, { skin: '#b07850', hair: '#160e09', shirt: '#e2553a', pants: '#e2553a', long: true, dress: true, scale: 1.24 }, 2.5, RZ - 9, -Math.PI / 2);
  const hGeo = heartGeo(), hMat = cmat('#ff2e63', CLS.accent, .85);
  const hearts = [0, 1, 2].map(() => { const h = new THREE.Mesh(hGeo, hMat); h.visible = false; scene.add(h); return h; });
  const boat = buildBoat(scene);
  const dad = makePerson({ skin: '#6b4126', hair: '#f2f2f0', shirt: '#2e9a52', pants: '#3a3a40', scale: 1.32 });
  const dadRod = addItem(dad, 'rod', rod()); dadRod.visible = true;
  boat.add(dad.g); dad.g.position.set(1, .25, -.05);
  const lineMat = tag(new THREE.MeshBasicMaterial({ color: '#f4f4ef' }), CLS.foam);
  const mkLine = () => { const l = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, 1, 4), lineMat); const b = new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 6), MAT.red); scene.add(l, b); return { l, b }; };
  const lines = [mkLine(), mkLine()];
  const fish = new THREE.Mesh(new THREE.SphereGeometry(.3, 10, 6), cmat('#e8c25a', CLS.accent, .5)); fish.scale.set(1.6, .7, .6); fish.visible = false; scene.add(fish);

  // balão de fala no palanque: três pontinhos pulando
  const bubble = new THREE.Group(); bubble.visible = false; scene.add(bubble);
  {
    const bm = tag(new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.5, 1.45), side: THREE.DoubleSide }), CLS.foam);
    const s = new THREE.Shape(); const w = 1.5, h = .75, rr = .35;
    s.moveTo(-w + rr, -h); s.lineTo(-.5, -h); s.lineTo(-.95, -h - .55); s.lineTo(-.05, -h); s.lineTo(w - rr, -h); s.quadraticCurveTo(w, -h, w, -h + rr); s.lineTo(w, h - rr); s.quadraticCurveTo(w, h, w - rr, h);
    s.lineTo(-w + rr, h); s.quadraticCurveTo(-w, h, -w, h - rr); s.lineTo(-w, -h + rr); s.quadraticCurveTo(-w, -h, -w + rr, -h);
    bubble.add(new THREE.Mesh(new THREE.ShapeGeometry(s), bm));
    bubble.userData.dots = [-.65, 0, .65].map((x) => { const d = new THREE.Mesh(new THREE.SphereGeometry(.17, 8, 6), MAT.dark); d.position.set(x, 0, .05); bubble.add(d); return d; });
  }

  // partículas: gotas d'água, confete e pétalas (as pétalas só no campo aberto, perto de casa)
  const mkParts = (n, geo, mat) => { const im = new THREE.InstancedMesh(geo, mat, n); im.frustumCulled = false; im.count = 0; scene.add(im); return im; };
  const drops = mkParts(180, new THREE.IcosahedronGeometry(.07, 0), tag(new THREE.MeshBasicMaterial({ color: new THREE.Color(1.4, 1.5, 1.6) }), CLS.foam));
  const dropS = []; let dropAcc = 0;
  const confetti = mkParts(320, new THREE.PlaneGeometry(.2, .12), tag(new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide }), CLS.flower));
  const confS = []; let confAcc = 0;
  const CONF = ['#ff3d6e', '#ffd166', '#5aa0ff', '#7ee36b', '#9b6cff', '#ffffff', '#ff8a3d'].map(h => new THREE.Color(h).multiplyScalar(1.4));
  const petals = mkParts(110, new THREE.PlaneGeometry(.11, .11), tag(new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.25, .3), side: THREE.DoubleSide }), CLS.flower));
  const petalS = Array.from({ length: 110 }, () => [rnd(), rnd(), rnd(), rnd()]);

  // vida no rio: aguapés boiando e peixes pulando perto do barco
  {
    const pads = [];
    for (let k = 0; k < 900; k++) {
      const cx2 = [-30, -18, 14, 26, -8, 36][k % 6], cz = RZ + [17, 107, 37, 99, 119, 63][k % 6];
      const x = cx2 + (hash2(k, 1) - .5) * 9, z = cz + (hash2(1, k) - .5) * 5;
      if (landD(x, z) > -.5) continue;
      const c = hash2(k, 7) < .12 ? [.75, .55, .95] : [.22 + hash2(k, 3) * .15, .5 + hash2(k, 4) * .2, .16];
      pads.push({ x, y: .03, z, ry: hash2(k, 9) * 6, s: .8 + hash2(k, 5) * .8, r: c[0], g: c[1], b: c[2] });
    }
    const pg = new THREE.CircleGeometry(.32, 6); pg.rotateX(-Math.PI / 2);
    chunked(scene, pg, tag(new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }), CLS.leaf, leafWind), pads);
  }
  const jumpers = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(.26, 8, 6), cmat('#d8c27a', CLS.accent, .5)); m.scale.set(1.7, .7, .6); scene.add(m); return m; });

  // carros andando na rua antes da praça
  const traffic = [];
  [['#d9d6cf', 1, -50], ['#3a5f9a', 1, -24], ['#9a2b25', 1, 12], ['#e2b13c', -1, 40], ['#2f6b4f', -1, 14], ['#6a7280', -1, -20]].forEach(([hex, dir, x]) => {
    const c = makeCar(hex); c.rotation.y = dir > 0 ? 0 : Math.PI; const z = dir > 0 ? 726.5 : 733.5; c.position.set(x, PADY, z); scene.add(c);
    traffic.push({ c, dir, x, v: 7, z });
  });

  // câmera ortográfica e passes
  const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 1, 500);
  const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter });
  const art = new THREE.WebGLRenderTarget(4, 4, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false });
  const vtx = `in vec3 position; in vec2 uv; out vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy,0.,1.); }`;
  const ascii = new THREE.RawShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: vtx, fragmentShader: asciiFrag, depthTest: false, depthWrite: false,
    uniforms: { uScene: { value: rt.texture }, uAtlas: { value: buildAtlas() }, uGrid: { value: new THREE.Vector2(200, 100) }, uTime: time, uN: { value: GLYPHS.length } } });
  const tilt = new THREE.RawShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: vtx, fragmentShader: tiltFrag, depthTest: false, depthWrite: false,
    uniforms: { uA: { value: art.texture }, uRes: { value: new THREE.Vector2(4, 4) }, uFocus: { value: .5 }, uBlur: { value: 14 }, uBand: { value: .34 } } });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), ascii); quad.frustumCulled = false;
  const post = new THREE.Scene(); post.add(quad); const postCam = new THREE.Camera();

  const EL = EL_DEG * Math.PI / 180, R = 200;
  const view = { w: 4, h: 4, k: 20, Wv: 30, wide: true };
  function resize(w, h, { k = 20, cell = 3, wide = true } = {}) {
    const dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.25 : 1.5);
    Object.assign(view, { w, h, k, Wv: w / k, wide });
    renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
    const bw = Math.round(w * dpr), bh = Math.round(h * dpr);
    rt.setSize(Math.round(bw * (lite ? .8 : 1)), Math.round(bh * (lite ? .8 : 1))); art.setSize(bw, bh);
    ascii.uniforms.uGrid.value.set(Math.round(w / cell), Math.round(h / (cell * 2)));
    tilt.uniforms.uRes.value.set(bw, bh); tilt.uniforms.uBlur.value = 12 * bh / 1000;
    const hw = w / k / 2, hh = h / k / 2;
    Object.assign(camera, { left: -hw, right: hw, top: hh, bottom: -hh }); camera.updateProjectionMatrix();
    const sh = Math.max(hw, hh / Math.sin(EL)) + 8;
    Object.assign(sun.shadow.camera, { left: -sh, right: sh, top: sh, bottom: -sh, near: 5, far: 240 }); sun.shadow.camera.updateProjectionMatrix();
  }

  // estado
  let zProvider = () => CZ[0];
  const S = { enterT: 0, enterKey: null, target: 0, s: 0, v: 0, phase: 0, face: 0, y: H(STOPS[0].x, STOPS[0].z), stop: 0, idleK: 0, still: 0, seat: 0, boatOut: 0, catchT: -1, nextCatch: 0, camX: 0, zc: CZ[0], sitK: 0, lastFace: 0, wheel: 0 };
  const restV = new THREE.Vector3(), camT = new THREE.Vector3(), tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(), tmp3 = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), o3 = new THREE.Object3D();
  const SUN = [[0, '#ffd2a0', 2.9, '#dfe6f2', -44, 46, 6], [.3, '#fff1dc', 3.3, '#efe6d8', -26, 56, 24], [.72, '#ffe0b4', 3.1, '#f1e0c8', -18, 48, 22], [1, '#ffb070', 3, '#f6c8a0', -40, 30, 18]];
  const cA = new THREE.Color(), cB = new THREE.Color();
  function sunAt(p) {
    let i = 0; while (i < SUN.length - 2 && p > SUN[i + 1][0]) i++;
    const a = SUN[i], b = SUN[i + 1], t = clamp((p - a[0]) / (b[0] - a[0]));
    sun.color.copy(cA.set(a[1]).lerp(cB.set(b[1]), t)); sun.intensity = lerp(a[2], b[2], t);
    hemi.color.copy(cA.set(a[3]).lerp(cB.set(b[3]), t));
    return [lerp(a[4], b[4], t), lerp(a[5], b[5], t), lerp(a[6], b[6], t)];
  }
  const boatHome = new THREE.Vector3(0, 0, PIER.z1 + 3), boatAway = new THREE.Vector3(2, 0, END_Z);
  const seatLocal = new THREE.Vector3(-1, .25, -.05);
  const THROWS = [[-9, -6], [-6, 1], [-12, -2], [-14, -8], [-10, 3]];
  // a casa ocupa x 8..17, z 23.5..29.5 (com o beiral, um pouco mais); a cachorra contorna pela quina da frente
  const DOG_CORNER = [6.3, 31.6];
  const behindHouse = b => b.x < 7.4 && b.z < 31.2;
  const me0 = STOPS.find(s => s.key === 'me');
  const IDLE = {
    home: { pose: 'throw', face: 0 }, campus: { pose: 'none', face: Math.PI }, iteraima: { pose: 'wave', face: 0 }, a3: { pose: 'none', face: Math.PI },
    me: { pose: 'point', face: Math.atan2(ME_GLOBE[0] - me0.x, ME_GLOBE[1] - me0.z) }, podium: { pose: 'cheer', face: 0 }, library: { pose: 'read', face: 0 }, stage: { pose: 'talk', face: Math.PI / 2 },
    pier: { pose: 'kiss', face: Math.PI / 2 }, boat: { pose: 'fish', face: 0 },
  };
  // nos galpões estou a pé, parado na frente, olhando o que acontece lá dentro
  for (let i = 0; i < PROJECT_N; i++) IDLE[`p${i}`] = { pose: 'stand', face: Math.PI + (i % 2 === 0 ? .35 : -.35) };

  // Prédios em que eu entro: ando da parada até a porta, ela abre, eu sumo lá dentro e só depois apareço na janela.
  // `S.enterT` conta o tempo desde que comecei a entrar (e volta a zero, mais rápido, quando saio).
  const DOORS = { campus: { door: [9, 104.4], dur: 1.7 }, a3: { door: [-10.5, 275.2], dur: .8 } };
  const insideT = name => (S.enterKey === name ? S.enterT - DOORS[name].dur : -9);
  function doorSwing(doors, name, dt) {
    const it = insideT(name), open = sstep(-.65, -.2, it) * (1 - sstep(.25, .7, it));
    for (const d of doors) { d.userData.k = damp(d.userData.k ?? 0, open, 10, dt); d.rotation.y = d.userData.sx * d.userData.k * 1.4; }
  }
  function roomLight(r, on, dt) {
    r.k = damp(r.k, on ? 1 : 0, 5, dt);
    r.backMat.color.copy(r.dim).lerp(r.lit, r.k); r.backMat.emissive.copy(r.dim).lerp(r.lit, r.k).multiplyScalar(.15 + .85 * r.k);
    r.glass.visible = r.k < .5;
  }
  function selAnimate(t, dt, key, idleK, zc) {
    const near = z => Math.abs(z - zc) < 50;
    // campus: depois que eu entro pela porta, o cômodo escolhido acende e eu apareço nele
    {
      const s = sel.campus, inside = insideT('campus') > .35;
      doorSwing(s.doors, 'campus', dt);
      s.rooms.forEach((r, i) => {
        roomLight(r, i === s.cur && inside, dt);
        r.clone.g.visible = i === s.cur && inside && r.k > .3;
        if (r.clone.g.visible) { r.clone.g.rotation.y = s.poses[i] === 'talk' ? -.5 : 0; applyPose(r.clone, t, s.poses[i], 1, 0, 0); }
      });
    }
    // A&3: depois que eu entro, os andares acendem um de cada vez, de baixo para cima:
    // estudando (com fumaça), no computador e ajudando os colegas
    if (near(266)) {
      const s = sel.a3, it = insideT('a3');
      doorSwing(s.doors, 'a3', dt);
      s.rooms.forEach((r, f) => {
        roomLight(r, it > .35 + f * .55, dt);
        r.clone.g.visible = r.k > .3;
        r.kids?.forEach((P, j) => applyPose(P, t + j * 1.7, 'type', 1, 0, 0, 1));
        if (r.clone.g.visible) applyPose(r.clone, t, r.pose, 1, 0, 0, r.sit);
      });
      const c = s.rooms[0].clone, smoking = c.g.visible;
      if (smoking) { c.g.updateMatrixWorld(true); c.head.getWorldPosition(tmp); }
      s.puffs.forEach((m, j) => {
        m.visible = smoking; if (!smoking) return;
        const k = fract(t * .45 + j / s.puffs.length);
        m.position.set(tmp.x + Math.sin(t * 2.3 + j * 2) * .35 + k * .3, tmp.y + .45 + k * 1.7, tmp.z + .25);
        m.scale.setScalar(.6 + k * 1.6); m.rotation.set(t + j, t * .7, 0);
      });
    }
    // troféus
    const pd = sel.podium;
    pd.list.forEach((it, i) => {
      const on = i === pd.cur ? 1 : 0;
      it.k = damp(it.k ?? 0, on, 7, dt);
      it.obj.position.set(it.base.x, it.base.y + it.k * pd.h + (on ? Math.sin(t * 3) * .06 : 0), it.base.z);
      it.obj.rotation.y += dt * it.k * 2.2;
    });
    // livros: o escolhido sai da pilha e vem para a minha frente, fechado, com a capa virada para cima
    const lb = sel.library;
    lb.books.forEach((b, i) => {
      const on = i === lb.cur;
      b.k = clamp(b.k + (on ? dt / .9 : -dt / .6));
      const k = ease(b.k);
      b.g.position.lerpVectors(b.base, lb.read, k); b.g.position.y += Math.sin(k * Math.PI) * 1.1 + k * .12;
      b.g.rotation.y = lerp(b.ry, 0, k); b.g.rotation.x = lerp(0, .45, k);
    });
    if (near(885)) sel.students.forEach((s) => { applyPose(s.P, t + s.o, s.pose, 1, 0, 0, 1); s.P.head.rotation.y = Math.sin(t * .3 + s.o) * .3; });
    // Mercado Eletrônico: o globo gira sem parar e as bandeiras tremulam
    const me2 = sel.me;
    me2.globe.rotation.y += dt * .35;
    me2.flags.forEach(({ f, i }) => { f.rotation.y = Math.sin(t * 2.4 + i) * .22; f.scale.x = 1 + Math.sin(t * 5 + i) * .04; });
    // palanque
    sel.stage.screenMat.color.setHSL(fract(t * .05) * .3 + .55, .7, .6); sel.stage.screenMat.emissive.copy(sel.stage.screenMat.color).multiplyScalar(.8);
    if (near(930)) sel.stage.aud.forEach((P, i) => applyPose(P, t + i, 'sway', key === 'stage' ? 1 : .4, 0, 0, 1));
    // lavradores: trabalham; acenam quando eu paro ali
    const wave = key === 'iteraima' && idleK > .5;
    sel.farmers.forEach((F, i) => {
      const dx = me.g.position.x - F.P.g.position.x, dz = me.g.position.z - F.P.g.position.z;
      F.P.g.rotation.y = angDamp(F.P.g.rotation.y, wave ? Math.atan2(dx, dz) : F.face, 4, dt);
      F.hoe.visible = !wave;
      applyPose(F.P, t + i * .7, wave ? 'wave' : 'hoe', 1, 0, 0);
    });
    // gente passeando pelos passeios da praça: vai até a ponta e volta
    if (near(805)) sel.walkers.forEach((W, i) => {
      const [[ax, az], [bx, bz]] = W.pts, L = Math.hypot(bx - ax, bz - az), q = ((t + W.o) * W.v) % (2 * L), back = q > L, f = back ? 2 - q / L : q / L;
      const x = lerp(ax, bx, f), z = lerp(az, bz, f);
      W.P.g.position.set(x, H(x, z), z); W.P.g.rotation.y = Math.atan2((bx - ax) * (back ? -1 : 1), (bz - az) * (back ? -1 : 1));
      applyPose(W.P, t, 'none', 0, (t + W.o) * W.v * 2.6, 1);
    });
  }

  function trafficStep(dt, crossing) {
    for (const dir of [1, -1]) {
      const lane = traffic.filter(c => c.dir === dir).sort((a, b) => dir * (b.x - a.x));
      lane.forEach((car, i) => {
        let want = 7;
        const front = car.x + dir * 2.2, stopX = -dir * 4.4;
        if (crossing && dir * (stopX - front) > -.2) want = Math.min(want, Math.max(0, dir * (stopX - front)) * 1.6);
        const ahead = lane[i - 1];
        if (ahead) want = Math.min(want, Math.max(0, (dir * (ahead.x - car.x) - 5.6) * 1.4));
        car.v = damp(car.v, want, 3, dt);
        car.x += dir * car.v * dt;
        if (dir * car.x > 62) { const last = lane[lane.length - 1]; car.x = Math.min(-62, dir * last.x - 8) * dir; car.v = 7; }
        car.c.position.set(car.x, PADY, car.z);
      });
    }
    sel.street.lights.forEach((L) => { L.r.material.emissive.set(crossing ? '#3a0a08' : '#ff3b30'); L.gr.material.emissive.set(crossing ? '#30d158' : '#0a2a10'); });
  }

  function frame(t, dt, draw = true) {
    time.value = t;
    const zc = zProvider();
    S.zc = zc;
    S.target = sForZ(zc);
    // andar: persegue o ponto que a rolagem pede, com velocidade de caminhada (ou de moto)
    const lockBoat = S.seat > .02 && S.target < pathLen - .05;
    const goal = lockBoat ? pathLen : S.target;
    if (Math.abs(goal - S.s) > 160) { S.s = goal; S.v = 0; }
    const ride = RIDE_P.find(r => S.s > r.a + .2 && S.s < r.b - .2), mounted = !!ride;
    const far = Math.abs(goal - S.s), vmax = Math.min(60, 16 + Math.max(0, far - 20) * .9) * (mounted ? 1.6 : 1);
    const want = clamp((goal - S.s) * 3.2, -vmax, vmax);
    S.v = damp(S.v, want, reduced ? 30 : 8, dt);
    if (reduced) S.v = (goal - S.s) / Math.max(dt, .016) * .25;
    S.s = clamp(S.s + S.v * dt, 0, pathLen);
    const speed = Math.abs(S.v), walkAmt = clamp(speed / 2.2) * (mounted ? 0 : 1);
    S.phase += Math.min(speed, 22) * dt * 2.3 + Math.max(0, speed - 22) * dt * .6;
    S.still = speed < .25 ? S.still + dt : 0;
    let near = 0; for (let i = 0; i < STOP_S.length; i++) if (Math.abs(STOP_S[i] - S.s) < Math.abs(STOP_S[near] - S.s)) near = i;
    const atStop = Math.abs(STOP_S[near] - S.s) < .8 && S.still > .2;
    S.idleK = damp(S.idleK, atStop ? 1 : 0, 5, dt);
    if (atStop || Math.abs(STOP_S[S.stop] - S.s) > 4) S.stop = near;
    const key = STOP_KEYS[S.stop], idle = IDLE[key];
    const u = S.s / pathLen, p = pathCurve.getPointAt(u), tg = pathCurve.getTangentAt(u);
    const walkFace = Math.atan2(tg.x * Math.sign(S.v || 1), tg.z * Math.sign(S.v || 1));
    if (speed > .3) S.lastFace = walkFace;
    // a cachorra e a bolinha (só quando estou em casa)
    const fetching = key === 'home' && S.idleK > .4;
    const FT = 5, tc = t % FT, cyc = Math.floor(t / FT), th = THROWS[cyc % THROWS.length];
    const ballTo = tmp2.set(STOPS[0].x + th[0], 0, STOPS[0].z + th[1]); ballTo.y = H(ballTo.x, ballTo.z) + .16;
    let faceTarget = S.idleK > .5 ? idle.face : walkFace;
    if (fetching) faceTarget = Math.atan2(ballTo.x - p.x, ballTo.z - p.z);
    if (mounted) {
      // saindo de ré da vaga: o nariz da moto continua para dentro até eu manobrar
      const tf = Math.atan2(tg.x, tg.z);
      faceTarget = ride.rev && S.s - ride.a < 2.4 ? tf + Math.PI : tf;
      if (S.v < 0) faceTarget += Math.PI;
    }
    S.face = angDamp(S.face, faceTarget, speed > .3 ? 12 : 5, dt);
    const ps = pathS[Math.round(u * NS)];
    let gy = Math.max(H(p.x, p.z), floorAt(p.x, p.z));
    if (ps.k === 4) gy = ps.y; // nos degraus
    S.y = damp(S.y, gy, 14, dt);

    // barco: embarcar no fim do píer e sair para o meio do rio
    const atEnd = S.s > pathLen - .06 && S.target >= pathLen - .05;
    S.seat = damp(S.seat, atEnd ? 1 : (S.boatOut < .03 ? 0 : S.seat), 5, dt);
    S.boatOut = clamp(S.boatOut + dt * (S.seat > .95 ? .34 : -.5));
    const bo = sstep(0, 1, S.boatOut);
    boat.position.lerpVectors(boatHome, boatAway, bo);
    boat.position.y = Math.sin(t * 1.3) * .06 - .02;
    boat.rotation.set(Math.sin(t * 1.1) * .03, lerp(-Math.PI / 2, 0, bo), Math.sin(t * .9) * .025);
    boat.updateMatrixWorld();
    const seatW = seatLocal.clone().applyMatrix4(boat.matrixWorld);
    const hop = Math.sin(clamp(S.seat) * Math.PI) * .6;
    // pescaria: de tempos em tempos sai um peixe; meu pai também pega os dele (sozinho, antes de eu embarcar, ou alternando comigo)
    const fishing = zc > RIVER_Z - 40 && !(S.seat > .05 && S.seat < .95);
    if (fishing) {
      if (!S.nextCatch) S.nextCatch = t + 2.5;
      if (t > S.nextCatch) { const both = S.seat > .95 && S.boatOut > .9; S.catches = (S.catches ?? 0) + 1; S.catchWho = both && S.catches % 2 ? 1 : 0; S.catchT = t; S.nextCatch = t + 6 + rnd() * 4; }
    } else S.nextCatch = 0;

    // moto: andando comigo ou parada na vaga onde a última corrida terminou
    if (mounted) {
      moto.g.position.set(p.x, gy, p.z); moto.g.rotation.y = S.face;
      S.wheel += S.v * dt / .36; moto.wheels.forEach((w) => { w.rotation.x = S.wheel; });
    } else {
      let P0 = RIDE_P[0].pa, T0 = RIDE_P[0].ta;
      for (const r of RIDE_P) if (S.s >= r.b - .2) { P0 = r.pb; T0 = r.tb; }
      moto.g.position.set(P0.x, PADY, P0.z); moto.g.rotation.y = Math.atan2(T0.x, T0.z);
    }
    let px = lerp(p.x, seatW.x, S.seat), pz = lerp(p.z, seatW.z, S.seat), py = lerp(S.y, seatW.y, S.seat) + hop;
    if (mounted) { px -= Math.sin(S.face) * .25; pz -= Math.cos(S.face) * .25; py = gy + .36; }
    // entrar no prédio (Formação e A&3): da parada até a porta; na saída, o caminho inverso
    const goIn = !!DOORS[key] && S.idleK > .5 && !mounted;
    if (goIn) S.enterKey = key;
    const BD = DOORS[S.enterKey];
    if (BD && !goIn && Math.hypot(p.x - BD.door[0], p.z - BD.door[1]) > 12) S.enterT = 0; // já fui longe: saio direto
    S.enterT = BD ? clamp(S.enterT + (goIn ? dt : -dt * 2.5), 0, BD.dur + 1.6) : 0;
    const walkIn = BD && S.enterT > 0 ? ease(clamp(S.enterT / BD.dur)) : 0, doorWalk = walkIn > 0 && walkIn < 1;
    if (walkIn > 0) {
      px = lerp(px, BD.door[0], walkIn); pz = lerp(pz, BD.door[1], walkIn); py = lerp(py, PADY + .2, walkIn);
      const f = Math.atan2(BD.door[0] - p.x, BD.door[1] - p.z);
      if (doorWalk) S.face = goIn ? f : f + Math.PI;
      S.phase += dt * 5.6 * (doorWalk ? 1 : 0);
    }
    me.g.position.set(px, py, pz);
    me.g.rotation.y = S.seat > .5 ? angDamp(me.g.rotation.y, boat.rotation.y, 8, dt) : S.face;
    me.g.visible = !(walkIn > .985);

    // pose
    const catching = S.catchT >= 0 && t - S.catchT < 2.6, iCatch = catching && S.catchWho === 1, dadCatch = catching && S.catchWho === 0;
    const wet = !mounted && S.seat < .1 && landD(p.x, p.z) < .1;
    const library = key === 'library';
    S.sitK = damp(S.sitK, library && S.idleK > .6 ? 1 : 0, 5, dt);
    me.st.tc = tc;
    let pose = idle.pose, k = S.idleK, sit = S.seat;
    if (S.seat > .5) { pose = iCatch ? 'reel' : 'fish'; k = 1; }
    else if (mounted) { pose = 'ride'; k = 1; sit = .85; }
    else if (wet) { pose = 'wade'; k = 1; }
    else if (library) sit = S.sitK;
    if (fetching) pose = 'throw';
    applyPose(me, t, pose, doorWalk ? 0 : k, S.phase, doorWalk ? 1 : walkAmt, sit);
    myRod.visible = S.seat > .6;

    // balão de fala no palanque
    const talking = key === 'stage' && S.idleK > .5;
    bubble.visible = talking;
    if (talking) {
      bubble.position.set(me.g.position.x + 1.9, me.g.position.y + 4.3, me.g.position.z + .2);
      bubble.quaternion.copy(camera.quaternion);
      bubble.userData.dots.forEach((d, i) => { d.position.y = Math.max(0, Math.sin(t * 6 - i * .8)) * .22; });
    }

    // a cachorra
    {
      const rest = restV.set(p.x + 1.5, 0, p.z + 1);
      let pos, faceTo, spd = 0, sitK = 1, inMouth = false;
      if (fetching) {
        // se a bola cai atrás da casa, ela contorna pela quina da frente em vez de atravessar a parede
        const route = behindHouse(ballTo) ? [[rest.x, rest.z], DOG_CORNER, [ballTo.x, ballTo.z]] : [[rest.x, rest.z], [ballTo.x, ballTo.z]];
        const run = (pts, k2) => { const [x, z, f] = along(pts, k2); pos = tmp3.set(x, 0, z); faceTo = tmp.set(x + Math.sin(f) * 3, 0, z + Math.cos(f) * 3); spd = 6; sitK = 0; };
        if (tc < .45) { pos = rest; faceTo = ballTo; }
        else if (tc < 1.9) run(route, ease((tc - .45) / 1.45));
        else if (tc < 3.3) { run(route.slice().reverse(), ease((tc - 1.9) / 1.4)); inMouth = true; }
        else { pos = rest; faceTo = me.g.position; }
      } else {
        pos = DOG_HOME; const dxm = me.g.position.x - DOG_HOME.x, dzm = me.g.position.z - DOG_HOME.z;
        faceTo = Math.hypot(dxm, dzm) < 40 ? me.g.position : tmp.set(DOG_HOME.x, 0, DOG_HOME.z + 5);
      }
      const prev = dog.g.position.clone();
      dog.g.position.x = damp(dog.g.position.x, pos.x, fetching ? 30 : 3, dt); dog.g.position.z = damp(dog.g.position.z, pos.z, fetching ? 30 : 3, dt);
      dog.g.position.y = H(dog.g.position.x, dog.g.position.z);
      const mv = prev.distanceTo(dog.g.position) / Math.max(dt, .001);
      if (mv > 1) spd = mv;
      dog.g.rotation.y = angDamp(dog.g.rotation.y, Math.atan2(faceTo.x - dog.g.position.x, faceTo.z - dog.g.position.z), 8, dt);
      animDog(dog, t, spd, spd > 1 ? 0 : sitK, dt);
      ball.visible = fetching;
      if (fetching) {
        if (tc < .45 || tc > 4.6) { me.hand.updateMatrixWorld(true); ball.position.setFromMatrixPosition(me.hand.matrixWorld); }
        else if (tc < 1.35) { const k2 = (tc - .45) / .9; me.hand.updateMatrixWorld(true); tmp.setFromMatrixPosition(me.hand.matrixWorld); ball.position.lerpVectors(tmp, ballTo, k2); ball.position.y += Math.sin(k2 * Math.PI) * (behindHouse(ballTo) ? 5.2 : 3.5); }
        else if (inMouth) { dog.mouth.updateMatrixWorld(true); ball.position.setFromMatrixPosition(dog.mouth.matrixWorld); }
        else if (tc < 1.9) { ball.position.copy(ballTo); ball.position.y += Math.abs(Math.sin((tc - 1.35) * 9)) * .3 * (1.9 - tc); }
        else { ball.position.set(rest.x + .4, H(rest.x, rest.z) + .16, rest.z + .6); }
      }
    }

    // noiva: beijo no começo do píer; depois acena
    const kiss = key === 'pier' && S.idleK > .6 && S.seat < .1;
    const dfx = me.g.position.x - fiancee.g.position.x, dfz = me.g.position.z - fiancee.g.position.z, dF = Math.hypot(dfx, dfz);
    fiancee.g.rotation.y = angDamp(fiancee.g.rotation.y, dF < 30 ? Math.atan2(dfx, dfz) : 0, 4, dt);
    applyPose(fiancee, t + 1.3, kiss ? 'kiss' : dF < 14 && dF > 3 ? 'wave' : 'sway', 1, 0, 0);
    // corações: surgem entre as duas cabeças com um pulo, sobem balançando e somem; sempre de frente para a câmera
    const midX = (me.g.position.x + fiancee.g.position.x) / 2, midZ = (me.g.position.z + fiancee.g.position.z) / 2, headY = Math.max(me.g.position.y, fiancee.g.position.y) + 2.7;
    S.kissK = damp(S.kissK ?? 0, kiss ? 1 : 0, 4, dt);
    hearts.forEach((h, i) => {
      h.visible = S.kissK > .02;
      if (!h.visible) return;
      const hk = fract(t * .4 + i / 3), grow = hk < .16 ? easeOutBack(hk / .16) : 1, fade = 1 - sstep(.7, 1, hk);
      const beat = 1 + Math.max(0, Math.sin(t * 9 + i)) * .1;
      h.scale.setScalar(Math.max(.001, (i ? .62 : 1) * grow * fade * beat * S.kissK));
      h.position.set(midX + Math.sin(hk * 6 + i * 2.1) * .5 * hk + (i - 1) * .3, headY + hk * 3.4, midZ);
      h.quaternion.copy(camera.quaternion); h.rotateZ(Math.sin(t * 2.2 + i * 1.7) * .2);
    });
    // pai: pescando; acena quando o filho embarca
    const dadWave = S.seat > .5 && S.seat < .97;
    applyPose(dad, t + .7, dadWave ? 'wave' : dadCatch ? 'reel' : 'fish', 1, 0, 0, 1);
    dad.g.rotation.y = 0;

    // linhas de pesca
    for (const [r, i] of [[dadRod, 0], [myRod, 1]]) {
      const L = lines[i], vis = r.visible && (i === 0 || S.seat > .6);
      L.l.visible = L.b.visible = vis; if (!vis) continue;
      r.updateMatrixWorld(); const tip = r.userData.tip.clone().applyMatrix4(r.matrixWorld);
      const mine = catching && S.catchWho === i, reel = mine ? clamp((t - S.catchT) / 1.2) : 0;
      tmp.set(tip.x + 1.6 * (1 - reel), .02 + Math.sin(t * 2 + i) * .04, tip.z + (2.4 - reel * 2));
      tmp.y = lerp(tmp.y, tip.y - .6, reel);
      L.b.position.copy(tmp);
      tmp2.subVectors(tip, tmp); const len = tmp2.length();
      L.l.position.copy(tmp).addScaledVector(tmp2, .5); L.l.scale.set(1, len, 1); L.l.quaternion.setFromUnitVectors(up, tmp2.normalize());
      if (mine) {
        const k2 = clamp((t - S.catchT - .5) / 1.6), who = i === 1 ? me.g.position : dad.g.getWorldPosition(tmp3);
        fish.visible = k2 > 0 && k2 < 1;
        fish.position.set(lerp(L.b.position.x, who.x, k2), lerp(0, 1.6, Math.sin(k2 * Math.PI)) + lerp(0, who.y + 1.2, k2), lerp(L.b.position.z + .6, who.z + .4, k2));
        fish.rotation.z = t * 9;
      }
    }
    if (!catching) fish.visible = false;

    jumpers.forEach((m, i) => {
      const per = 4.5 + i * 1.3, k = ((t + i * 2.1) % per) / 1.1;
      m.visible = k < 1;
      const cx2 = boat.position.x + [-7, 9, 3][i], cz = boat.position.z + [5, -3, 9][i];
      m.position.set(cx2 + k * 2.2, Math.sin(k * Math.PI) * 1.4 - .1, cz); m.rotation.z = (.5 - k) * 2.2;
      if (k > .95 && k < 1) for (let q = 0; q < 2; q++) dropS.push({ p: new THREE.Vector3(m.position.x, .05, cz), v: new THREE.Vector3((rnd() - .5) * 2, 2 + rnd() * 2, (rnd() - .5) * 2), life: .8 });
    });
    selAnimate(t, dt, key, S.idleK, zc);
    for (const f of U) f(t, dt, zc);
    trafficStep(dt, me.g.position.z > 714 && me.g.position.z < 746 && Math.abs(me.g.position.x) < 6);

    // gotas: atravessando o riacho, segurando o short
    if (wet && speed > .3) dropAcc += dt * 90;
    while (dropAcc > 1) { dropAcc--; dropS.push({ p: new THREE.Vector3(px + (rnd() - .5) * .6, .05, pz + (rnd() - .5) * .6), v: new THREE.Vector3((rnd() - .5) * 2.4, 2.5 + rnd() * 2.6, (rnd() - .5) * 2.4), life: 1 }); if (dropS.length > 180) dropS.shift(); }
    // confete no pódio
    if (key === 'podium' && S.idleK > .5) confAcc += dt * 90;
    const pod = STOPS.find(s => s.key === 'podium');
    while (confAcc > 1) { confAcc--; confS.push({ p: new THREE.Vector3(pod.x + (rnd() - .5) * 14, 11 + rnd() * 3, pod.z + (rnd() - .5) * 10), v: new THREE.Vector3((rnd() - .5) * .8, -1.6 - rnd(), (rnd() - .5) * .8), r: rnd() * 6, c: CONF[(rnd() * CONF.length) | 0] }); if (confS.length > 320) confS.shift(); }
    let n = 0;
    for (const d of dropS) { d.v.y -= 12 * dt; d.p.addScaledVector(d.v, dt); d.life -= dt; if (d.life > 0 && d.p.y > -.1) { o3.position.copy(d.p); o3.rotation.set(0, 0, 0); o3.scale.setScalar(1); o3.updateMatrix(); drops.setMatrixAt(n++, o3.matrix); } }
    drops.count = n; drops.instanceMatrix.needsUpdate = true;
    n = 0;
    for (const c of confS) {
      c.p.addScaledVector(c.v, dt); c.p.x += Math.sin(t * 3 + c.r) * dt * .8; c.r += dt * 4;
      const floor = H(c.p.x, c.p.z) + .05; if (c.p.y < floor) c.p.y = floor;
      o3.position.copy(c.p); o3.rotation.set(c.r, c.r * .7, c.r * 1.3); o3.scale.setScalar(1); o3.updateMatrix(); confetti.setMatrixAt(n, o3.matrix); confetti.setColorAt(n, c.c); n++;
    }
    confetti.count = n; confetti.instanceMatrix.needsUpdate = true; if (confetti.instanceColor) confetti.instanceColor.needsUpdate = true;

    // câmera: o centro da tela é o z que a rolagem pede
    const camXt = view.wide ? 0 : clamp(me.g.position.x, -24 + view.Wv / 2, 24 - view.Wv / 2);
    S.camX = damp(S.camX, camXt, reduced ? 30 : 3, dt);
    camT.set(S.camX, .5, zc);
    camera.position.set(camT.x, camT.y + Math.sin(EL) * R, camT.z + Math.cos(EL) * R);
    camera.lookAt(camT); camera.updateMatrixWorld();

    // pétalas de ipê no ar: só no campo aberto, perto de casa
    const open = 1 - sstep(110, 150, zc);
    petals.count = Math.round(110 * open);
    if (petals.count) {
      petalS.forEach((s, i) => {
        const k2 = fract(s[0] + t * (.012 + s[3] * .01)), x = camT.x - 30 + k2 * 60 + Math.sin(t * .6 + s[1] * 9) * .5, z = zc - 20 + s[2] * 40;
        o3.position.set(x, H(x, z) + 1 + s[1] * 5 + Math.sin(t * .9 + s[3] * 12) * .35, z);
        o3.rotation.set(t + s[0] * 9, t * .7, s[1]); o3.scale.setScalar(.8 + s[3] * .8); o3.updateMatrix(); petals.setMatrixAt(i, o3.matrix);
      });
      petals.instanceMatrix.needsUpdate = true;
    }

    // sol: da manhã em casa ao pôr do sol no rio
    const prog = clamp(zc / END_Z), off = sunAt(prog);
    warm.value = sstep(.82, 1, prog);
    sun.position.set(camT.x + off[0], camT.y + off[1], camT.z + off[2]); sun.target.position.copy(camT); sun.target.updateMatrixWorld();

    if (!draw) return;
    renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera);
    quad.material = ascii; renderer.setRenderTarget(art); renderer.render(post, postCam);
    quad.material = tilt; renderer.setRenderTarget(null); renderer.render(post, postCam);
  }

  let raf = 0, clock = 0, last = performance.now(), running = true, firstFrame = true;
  const loop = (now) => {
    const dt = clamp((now - last) / 1000, 0, .1); last = now;
    if (running) { clock += reduced ? dt * .35 : dt; frame(clock, firstFrame ? .5 : dt); firstFrame = false; }
    raf = requestAnimationFrame(loop);
  };

  return {
    stops: STOP_KEYS,
    start() { last = performance.now(); raf = requestAnimationFrame(loop); },
    resize,
    // função que devolve o z do mundo no centro da tela (vem da rolagem da página)
    setZProvider(fn) { zProvider = fn; },
    // z no centro da tela com a página no topo
    setTopZ(z) { homeEnd = Math.max(CZ[0] + DWELL, z + 3); },
    select(key, idx) { if (sel[key]) sel[key].cur = idx; },
    // depuração: avança a simulação sem desenhar (para capturas em navegador sem GPU)
    settle(sec = 4) { for (let k = 0; k < sec / .05; k++) { clock += .05; frame(clock, .05, false); } frame(clock, .05, true); },
    debug: () => ({ zc: S.zc, s: S.s, target: S.target, len: pathLen, seat: S.seat, boatOut: S.boatOut, boat: boat.position.toArray(), camX: S.camX, me: me.g.position.toArray(), homeEnd, key: STOP_KEYS[S.stop], idleK: S.idleK, rides: RIDES }),
    pause(v) { running = !v; },
    dispose() { cancelAnimationFrame(raf); renderer.dispose(); },
  };
}
