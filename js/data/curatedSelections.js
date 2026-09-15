// js/data/curatedSelections.js
//
// Seleção editorial fixa de álbuns e músicas, baseada em "Seleção de Álbuns e
// Músicas.md" (rankings da crítica, agregadores, comunidades especializadas e
// 15 "surpresas" pouco conhecidas). Usada SOMENTE para preencher a tela de
// descoberta do Explorar (e a prévia da Início) antes de qualquer busca —
// não vem da iTunes API. É dado mockado, apenas para exibição no MVP.
//
// A cada carregamento da página, getMusicasParaDescoberta() sorteia metade
// dos itens do Top 30 e metade das Surpresas, embaralhando o resultado.

import { shuffleArray } from '../utils/helpers.js';
import { buscarMusicas, buscarAlbuns } from '../services/itunesApi.js';

const TOP_ALBUNS = [
  { artista: 'Kendrick Lamar', titulo: 'To Pimp a Butterfly' },
  { artista: 'Radiohead', titulo: 'OK Computer' },
  { artista: 'The Beatles', titulo: 'Revolver' },
  { artista: 'Pink Floyd', titulo: 'The Dark Side of the Moon' },
  { artista: 'Radiohead', titulo: 'Kid A' },
  { artista: 'The Beatles', titulo: 'Abbey Road' },
  { artista: 'Marvin Gaye', titulo: "What's Going On" },
  { artista: 'My Bloody Valentine', titulo: 'Loveless' },
  { artista: 'Talking Heads', titulo: 'Remain in Light' },
  { artista: 'Miles Davis', titulo: 'Kind of Blue' },
  { artista: 'John Coltrane', titulo: 'A Love Supreme' },
  { artista: 'The Velvet Underground & Nico', titulo: 'The Velvet Underground & Nico' },
  { artista: 'Kendrick Lamar', titulo: 'good kid, m.A.A.d city' },
  { artista: 'David Bowie', titulo: 'The Rise and Fall of Ziggy Stardust and the Spiders from Mars' },
  { artista: 'Nas', titulo: 'Illmatic' },
  { artista: 'King Crimson', titulo: 'In the Court of the Crimson King' },
  { artista: 'Björk', titulo: 'Vespertine' },
  { artista: 'Pink Floyd', titulo: 'Wish You Were Here' },
  { artista: 'Kanye West', titulo: 'My Beautiful Dark Twisted Fantasy' },
  { artista: 'Madvillain', titulo: 'Madvillainy' },
  { artista: 'Joni Mitchell', titulo: 'Blue' },
  { artista: 'The Clash', titulo: 'London Calling' },
  { artista: 'The Smiths', titulo: 'The Queen Is Dead' },
  { artista: 'Godspeed You! Black Emperor', titulo: 'Lift Yr. Skinny Fists Like Antennas to Heaven!' },
  { artista: 'Stevie Wonder', titulo: 'Songs in the Key of Life' },
  { artista: 'The Beach Boys', titulo: 'Pet Sounds' },
  { artista: 'Aphex Twin', titulo: 'Selected Ambient Works 85–92' },
  { artista: 'The Cure', titulo: 'Disintegration' },
  { artista: 'Black Sabbath', titulo: 'Paranoid' },
  { artista: 'Bob Dylan', titulo: 'Blood on the Tracks' },
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
 * (posição 0 = melhor avaliada), só para dar o efeito visual de "avaliação".
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

async function enriquecerComCapa(itemCurado, buscarFn) {
  try {
    const [encontrado] = await buscarFn(`${itemCurado.artista} ${itemCurado.titulo}`, { limit: 1 });
    if (!encontrado) return itemCurado;
    return { ...itemCurado, capa: encontrado.capa, ano: encontrado.ano ?? itemCurado.ano };
  } catch {
    return itemCurado; // fallback: mantém capa null -> placeholder
  }
}

function paraAlbumCurado({ artista, titulo }, indice) {
  return {
    id: `curado-album-${indice}`,
    titulo,
    artista,
    ano: null,
    genero: null,
    capa: null,
    totalFaixas: null,
    nota: notaPorPosicao(indice, TOP_ALBUNS.length),
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