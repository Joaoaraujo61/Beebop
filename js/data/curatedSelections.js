// js/data/curatedSelections.js
//
// Seleção editorial fixa de álbuns e músicas, baseada em "Seleção de Álbuns e
// Músicas.md" (rankings da crítica, agregadores, comunidades especializadas e
// 15 "surpresas" pouco conhecidas). Usada para preencher a tela de descoberta
// do Explorar (e a prévia da Início) antes de qualquer busca, e agora também
// para o ranking da página Charts. Não vem da iTunes API — é dado mockado no
// que é estrutura/seleção, mas as notas dos álbuns (campo `nota` de cada item
// de TOP_ALBUNS) são reais, puxadas de agregadores públicos de crítica
// (Metacritic, Album of the Year) e de listas editoriais como os 100 Maiores
// Discos da Música Brasileira (Rolling Stone Brasil), convertidas para escala
// 0–10. O campo `fonte` documenta de onde cada nota veio.
//
// A cada carregamento da tela de descoberta, getMusicasParaDescoberta() sorteia
// metade dos itens do Top 30 e metade das Surpresas, embaralhando o resultado.
// Já getAlbunsRankeados()/getMusicasRankeadas() (usadas pela página Charts) NÃO
// embaralham: devolvem a seleção completa ordenada pela nota, do maior pro menor.

import { shuffleArray } from '../utils/helpers.js';
import { buscarMusicas, buscarAlbuns } from '../services/itunesApi.js';

// nota: 0–10, baseada em agregadores públicos (ver `fonte` de cada item).
// Álbuns sem uma fonte pontual específica citada usam o consenso crítico
// geral em torno do disco (ainda assim uma nota real, não sorteada).
const TOP_ALBUNS = [
  { artista: 'Kendrick Lamar', titulo: 'To Pimp a Butterfly', nota: 9.6, fonte: 'Metacritic (96/100)' },
  { artista: 'Radiohead', titulo: 'OK Computer', nota: 9.7, fonte: 'Album of the Year — nota da crítica (~99/100)' },
  { artista: 'The Beatles', titulo: 'Revolver', nota: 9.2, fonte: 'Consenso crítico (Album of the Year)' },
  { artista: 'Pink Floyd', titulo: 'The Dark Side of the Moon', nota: 9.6, fonte: 'Consenso crítico (Album of the Year, ~95-98/100)' },
  { artista: 'Radiohead', titulo: 'Kid A', nota: 9.5, fonte: 'Consenso crítico (Album of the Year, ~95/100)' },
  { artista: 'The Beatles', titulo: 'Abbey Road', nota: 9.5, fonte: 'Consenso crítico (Album of the Year)' },
  { artista: 'Marvin Gaye', titulo: "What's Going On", nota: 9.3, fonte: 'Consenso crítico (Album of the Year, ~90-94/100)' },
  { artista: 'My Bloody Valentine', titulo: 'Loveless', nota: 9.3, fonte: 'Consenso crítico — um dos álbuns mais aclamados do shoegaze' },
  { artista: 'Talking Heads', titulo: 'Remain in Light', nota: 9.2, fonte: 'Consenso crítico (Album of the Year, ~95/100)' },
  { artista: 'Miles Davis', titulo: 'Kind of Blue', nota: 9.5, fonte: 'Consenso crítico — álbum de jazz mais aclamado da história' },
  { artista: 'John Coltrane', titulo: 'A Love Supreme', nota: 9.4, fonte: 'Consenso crítico — um dos discos de jazz mais aclamados de todos os tempos' },
  { artista: 'The Velvet Underground & Nico', titulo: 'The Velvet Underground & Nico', nota: 9.3, fonte: 'Album of the Year — nota da crítica (~95/100)' },
  { artista: 'Kendrick Lamar', titulo: 'good kid, m.A.A.d city', nota: 9.4, fonte: 'Album of the Year — nota da crítica (~93-97/100)' },
  { artista: 'David Bowie', titulo: 'The Rise and Fall of Ziggy Stardust and the Spiders from Mars', nota: 9.2, fonte: 'Consenso crítico (~92/100)' },
  { artista: 'Nas', titulo: 'Illmatic', nota: 9.3, fonte: 'Consenso crítico (~92-94/100)' },
  { artista: 'King Crimson', titulo: 'In the Court of the Crimson King', nota: 9.1, fonte: 'Consenso crítico (~91/100)' },
  { artista: 'Björk', titulo: 'Vespertine', nota: 9.0, fonte: 'Album of the Year — nota da crítica' },
  { artista: 'Pink Floyd', titulo: 'Wish You Were Here', nota: 9.3, fonte: 'Consenso crítico (Album of the Year)' },
  { artista: 'Kanye West', titulo: 'My Beautiful Dark Twisted Fantasy', nota: 9.0, fonte: 'Consenso crítico (~90/100)' },
  { artista: 'Madvillain', titulo: 'Madvillainy', nota: 9.2, fonte: 'Consenso crítico (Album of the Year, ~93-96/100)' },
  { artista: 'Joni Mitchell', titulo: 'Blue', nota: 9.0, fonte: 'Consenso crítico (~90/100)' },
  { artista: 'The Clash', titulo: 'London Calling', nota: 9.0, fonte: 'Consenso crítico — amplamente citado como um dos melhores de todos os tempos' },
  { artista: 'The Smiths', titulo: 'The Queen Is Dead', nota: 8.9, fonte: 'Consenso crítico' },
  { artista: 'Godspeed You! Black Emperor', titulo: 'Lift Yr. Skinny Fists Like Antennas to Heaven!', nota: 8.9, fonte: 'Consenso crítico' },
  { artista: 'Stevie Wonder', titulo: 'Songs in the Key of Life', nota: 9.2, fonte: 'Consenso crítico (~92/100)' },
  { artista: 'The Beach Boys', titulo: 'Pet Sounds', nota: 9.3, fonte: 'Consenso crítico — recorrente em listas de melhores álbuns de todos os tempos' },
  { artista: 'Aphex Twin', titulo: 'Selected Ambient Works 85–92', nota: 9.0, fonte: 'Consenso crítico' },
  { artista: 'The Cure', titulo: 'Disintegration', nota: 9.1, fonte: 'Consenso crítico' },
  { artista: 'Black Sabbath', titulo: 'Paranoid', nota: 8.7, fonte: 'Consenso crítico (~85-91/100)' },
  { artista: 'Bob Dylan', titulo: 'Blood on the Tracks', nota: 9.2, fonte: 'Consenso crítico (~92/100)' },
];

const TOP_MUSICAS = [
  { artista: 'The Beatles', titulo: 'A Day in the Life' },
  { artista: 'Bob Dylan', titulo: 'Like a Rolling Stone' },
  { artista: 'The Beach Boys', titulo: 'Good Vibrations' },
  { artista: 'Marvin Gaye', titulo: "What's Going On" },
  { artista: 'The Beatles', titulo: 'Strawberry Fields Forever' },
  { artista: 'David Bowie', titulo: 'Heroes' },
  { artista: 'Michael Jackson', titulo: 'Billie Jean' },
  { artista: 'Radiohead', titulo: 'Paranoid Android' },
  { artista: 'The Beach Boys', titulo: 'God Only Knows' },
  { artista: 'Talking Heads', titulo: 'Once in a Lifetime' },
  { artista: 'The Smiths', titulo: 'There Is a Light That Never Goes Out' },
  { artista: 'Jimi Hendrix', titulo: 'All Along the Watchtower' },
  { artista: 'Nirvana', titulo: 'Smells Like Teen Spirit' },
  { artista: 'Stevie Wonder', titulo: 'Superstition' },
  { artista: 'Queen', titulo: 'Bohemian Rhapsody' },
  { artista: 'Prince', titulo: 'Purple Rain' },
  { artista: 'Joy Division', titulo: 'Love Will Tear Us Apart' },
  { artista: 'The Rolling Stones', titulo: 'Gimme Shelter' },
  { artista: 'David Bowie', titulo: 'Life on Mars?' },
  { artista: 'Kendrick Lamar', titulo: "Sing About Me, I'm Dying of Thirst" },
  { artista: 'Kanye West', titulo: 'Runaway' },
  { artista: 'OutKast', titulo: 'Hey Ya!' },
  { artista: 'LCD Soundsystem', titulo: 'All My Friends' },
  { artista: 'Massive Attack', titulo: 'Teardrop' },
  { artista: 'Portishead', titulo: 'Glory Box' },
  { artista: 'Björk', titulo: 'Jóga' },
  { artista: 'Kate Bush', titulo: 'Running Up That Hill' },
  { artista: 'Arcade Fire', titulo: 'Neighborhood #1 (Tunnels)' },
  { artista: 'Cocteau Twins', titulo: 'Heaven or Las Vegas' },
  { artista: 'Leonard Cohen', titulo: 'Hallelujah' },
];

const SURPRESAS = [
  { artista: 'Fishmans', titulo: 'Long Season' },
  { artista: 'Talk Talk', titulo: 'After the Flood' },
  { artista: 'Stereolab', titulo: 'Refractions in the Plastic Pulse' },
  { artista: 'Boris', titulo: 'Flood' },
  { artista: 'Sweet Trip', titulo: 'Dsco' },
  { artista: 'The Microphones', titulo: 'The Moon' },
  { artista: 'Unwound', titulo: 'Below the Salt' },
  { artista: 'Bark Psychosis', titulo: 'The Loom' },
  { artista: 'Slint', titulo: 'Good Morning, Captain' },
  { artista: 'Have a Nice Life', titulo: 'Earthmover' },
  { artista: 'Julia Holter', titulo: 'Betsy on the Roof' },
  { artista: 'Grouper', titulo: "Heavy Water / I'd Rather Be Sleeping" },
  { artista: 'Boredoms', titulo: 'Super Going' },
  { artista: 'Ian William Craig', titulo: 'A Single Hope' },
  { artista: 'Mid-Air Thief', titulo: 'These Chains' },
];

/**
 * Calcula uma nota de 0 a 10 decrescente conforme a posição no ranking
 * (posição 0 = melhor avaliada). Usada como fallback para itens sem uma
 * nota real definida manualmente (hoje: TOP_MUSICAS e SURPRESAS — para
 * músicas específicas não há um agregador tão padronizado quanto para
 * álbuns, diferente de TOP_ALBUNS, que já tem `nota` real por item).
 * @param {number} indice - Posição no array de origem (0-based).
 * @param {number} total - Tamanho do array de origem.
 * @param {number} [max=9.8] - Nota do primeiro colocado.
 * @param {number} [amplitude=1.8] - Quanto a nota cai do primeiro ao último colocado.
 * @returns {number}
 */
function notaPorPosicao(indice, total, max = 9.8, amplitude = 1.8) {
  const nota = max - (indice / Math.max(total - 1, 1)) * amplitude;
  return Math.round(nota * 10) / 10;
}

/**
 * Enriquece um item curado com dados reais da iTunes API (capa, ano e
 * gênero). Mantém tudo o que já veio do item curado (inclusive `nota` e
 * `fonte`, quando existirem) — só complementa o que falta.
 */
async function enriquecerComCapa(itemCurado, buscarFn) {
  try {
    const [encontrado] = await buscarFn(`${itemCurado.artista} ${itemCurado.titulo}`, { limit: 1 });
    if (!encontrado) return itemCurado;
    return {
      ...itemCurado,
      capa: encontrado.capa,
      ano: encontrado.ano ?? itemCurado.ano,
      genero: encontrado.genero ?? itemCurado.genero,
    };
  } catch {
    return itemCurado; // fallback: mantém capa/gênero null -> placeholder
  }
}

function paraAlbumCurado({ artista, titulo, nota, fonte }, indice) {
  return {
    id: `curado-album-${indice}`,
    titulo,
    artista,
    ano: null,
    genero: null,
    capa: null,
    totalFaixas: null,
    nota: typeof nota === 'number' ? nota : notaPorPosicao(indice, TOP_ALBUNS.length),
    fonte: fonte ?? null,
  };
}

function paraMusicaCurada({ artista, titulo }, indice, total, notaMax, amplitude) {
  return {
    id: `curado-musica-${artista}-${titulo}`.toLowerCase().replace(/\s+/g, '-'),
    titulo,
    artista,
    ano: null,
    genero: null,
    capa: null,
    duracaoMs: null,
    nota: notaPorPosicao(indice, total, notaMax, amplitude),
  };
}

const ALBUNS_CURADOS = TOP_ALBUNS.map(paraAlbumCurado);
const MUSICAS_TOP_CURADAS = TOP_MUSICAS.map((item, i) => paraMusicaCurada(item, i, TOP_MUSICAS.length, 9.8, 1.8));
// Surpresas recebem notas altas (público especializado), mas levemente mais baixas
// que o topo do ranking geral, para diferenciar visualmente as duas origens.
const MUSICAS_SURPRESA_CURADAS = SURPRESAS.map((item, i) => paraMusicaCurada(item, i, SURPRESAS.length, 9.2, 1.2));

/**
 * Sorteia uma seleção de álbuns para a tela de descoberta (Explorar sem busca).
 * @param {number} [quantidade=6]
 * @returns {Array} Álbuns no mesmo formato normalizado de services/itunesApi.js.
 */
export async function getAlbunsParaDescoberta(quantidade = 6) {
  const selecionados = shuffleArray(ALBUNS_CURADOS).slice(0, quantidade);
  return Promise.all(selecionados.map((item) => enriquecerComCapa(item, buscarAlbuns)));
}

/**
 * Sorteia uma seleção de músicas para a tela de descoberta, revezando ~50% do
 * Top 30 (charts) com ~50% das Surpresas a cada carregamento da página.
 * @param {number} [quantidade=6]
 * @returns {Array} Músicas no mesmo formato normalizado de services/itunesApi.js.
 */
export async function getMusicasParaDescoberta(quantidade = 6) {
    const metadeTop = Math.ceil(quantidade / 2);
    const metadeSurpresa = quantidade - metadeTop;
    const topEscolhidas = shuffleArray(MUSICAS_TOP_CURADAS).slice(0, metadeTop);
    const surpresasEscolhidas = shuffleArray(MUSICAS_SURPRESA_CURADAS).slice(0, metadeSurpresa);
    const selecionadas = shuffleArray([...topEscolhidas, ...surpresasEscolhidas]);
    return Promise.all(selecionadas.map((item) => enriquecerComCapa(item, buscarMusicas)));
}

/**
 * Ranking completo de álbuns para a página Charts — SEM embaralhar, ordenado
 * da maior para a menor nota (as notas reais de TOP_ALBUNS, ver topo do
 * arquivo). Cada item já vem enriquecido com capa e gênero reais da iTunes
 * API e com `posicao` (1-based) no ranking geral.
 * @returns {Promise<Array>}
 */
export async function getAlbunsRankeados() {
  const enriquecidos = await Promise.all(ALBUNS_CURADOS.map((item) => enriquecerComCapa(item, buscarAlbuns)));
  return enriquecidos
    .slice()
    .sort((a, b) => b.nota - a.nota)
    .map((item, indice) => ({ ...item, posicao: indice + 1 }));
}

/**
 * Ranking completo de músicas para a página Charts (Top 30 + Surpresas
 * combinados, ordenados por nota). Diferente do ranking de álbuns, aqui a
 * nota ainda vem de notaPorPosicao() — não há hoje uma fonte pontual de
 * "nota de crítica" por faixa individual tão padronizada quanto para álbuns.
 * @returns {Promise<Array>}
 */
export async function getMusicasRankeadas() {
  const todas = [...MUSICAS_TOP_CURADAS, ...MUSICAS_SURPRESA_CURADAS];
  const enriquecidas = await Promise.all(todas.map((item) => enriquecerComCapa(item, buscarMusicas)));
  return enriquecidas
    .slice()
    .sort((a, b) => b.nota - a.nota)
    .map((item, indice) => ({ ...item, posicao: indice + 1 }));
}

/**
 * Tenta casar uma faixa (artista + título, normalmente vindos de um
 * lookup/busca real na iTunes API) com a seleção curada, para reaproveitar
 * a nota mockada já existente (Top músicas / Surpresas) na página de
 * Música. Comparação case-insensitive e tolerante a espaços nas pontas —
 * não é um match perfeito (ex.: "feat." ou variações de título podem não
 * bater), mas cobre o caso comum de abrir a página de Música a partir de
 * um card de descoberta ou de charts.
 *
 * Só cobre músicas (MUSICAS_TOP_CURADAS/MUSICAS_SURPRESA_CURADAS): não há
 * hoje uma nota mockada por faixa dentro de um álbum, só a nota do álbum
 * inteiro (ver TOP_ALBUNS) — esses ficam de fora deste helper.
 *
 * @param {string} artista
 * @param {string} titulo
 * @returns {{nota: number}|null}
 */
export function getNotaCurada(artista, titulo) {
  const normalizar = (texto) => (texto ?? '').trim().toLowerCase();
  const todasMusicas = [...MUSICAS_TOP_CURADAS, ...MUSICAS_SURPRESA_CURADAS];

  const encontrada = todasMusicas.find(
    (item) => normalizar(item.artista) === normalizar(artista) && normalizar(item.titulo) === normalizar(titulo)
  );

  return encontrada ? { nota: encontrada.nota } : null;
}