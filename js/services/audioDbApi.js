// js/services/audioDbApi.js
//
// Busca a foto de artista na TheAudioDB (https://www.theaudiodb.com).
// - Chave de teste pública "123" (a antiga "2" agora responde 404): sem cadastro,
//   limitada a ~30 requisições por minuto.
// - A busca é por NOME (o iTunes e a AudioDB não compartilham IDs).
// - Pra produção, use uma chave própria (Patreon do TheAudioDB) e troque API_KEY.

const API_KEY = '123';
const BASE_URL = `https://www.theaudiodb.com/api/v1/json/${API_KEY}`;
const CACHE_PREFIX = 'audiodb:artist:';
const INTERVALO_MS = 2100; // ~28 req/min, dentro do limite da chave gratuita

// Cache em memória: guarda a promise, então chamadas repetidas
// (ou simultâneas) do mesmo artista viram uma única requisição.
const memoria = new Map();

// Fila com intervalo mínimo entre requisições, pra respeitar o limite da chave gratuita.
// As fotos vão aparecendo aos poucos; depois de buscadas, vêm do cache na hora.
const fila = [];
let processando = false;

function enfileirar(tarefa) {
  return new Promise((resolve) => {
    fila.push({ tarefa, resolve });
    processarFila();
  });
}

async function processarFila() {
  if (processando) return;
  processando = true;

  while (fila.length) {
    const { tarefa, resolve } = fila.shift();
    try {
      resolve(await tarefa());
    } catch {
      resolve(null);
    }
    if (fila.length) await new Promise((r) => setTimeout(r, INTERVALO_MS));
  }

  processando = false;
}

function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function lerCache(chave) {
  try {
    return localStorage.getItem(CACHE_PREFIX + chave); // null = nunca buscou; '' = buscou e não achou
  } catch {
    return null;
  }
}

function gravarCache(chave, valor) {
  try {
    localStorage.setItem(CACHE_PREFIX + chave, valor ?? '');
  } catch {
    /* localStorage indisponível/cheio: segue sem cache persistente */
  }
}

async function requisitar(nome) {
  const url = `${BASE_URL}/search.php?s=${encodeURIComponent(nome)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`AudioDB respondeu ${res.status}`);

  const data = await res.json();
  const artistas = data.artists ?? []; // a API devolve { artists: null } quando não acha

  // Prefere o resultado com o mesmo nome (evita foto de artista errado).
  const alvo = normalizar(nome);
  const artista = artistas.find((a) => normalizar(a.strArtist) === alvo);

  return artista?.strArtistThumb || null;
}

/**
 * Devolve a URL da foto do artista ou null se não houver.
 * Nunca lança erro: em falha de rede/limite, devolve null (o card mantém as iniciais).
 * @param {string} nome - Nome do artista.
 * @returns {Promise<string|null>}
 */
export function buscarImagemArtista(nome) {
  if (!nome) return Promise.resolve(null);

  const chave = normalizar(nome);
  if (memoria.has(chave)) return memoria.get(chave);

  const emCache = lerCache(chave);
  if (emCache !== null) {
    const resultado = Promise.resolve(emCache || null);
    memoria.set(chave, resultado);
    return resultado;
  }

  const promessa = enfileirar(async () => {
    const url = await requisitar(nome);
    gravarCache(chave, url); // só grava quando a requisição funcionou
    return url;
  }).then((url) => {
    if (url === null && lerCache(chave) === null) memoria.delete(chave); // falha: permite tentar de novo depois
    return url;
  });

  memoria.set(chave, promessa);
  return promessa;
}