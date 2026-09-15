// services/itunesApi.js
//
// Serviço central de acesso à API pública do iTunes (Search + Lookup).
// Todas as páginas (Explorar, Album, Artista, Musica, Charts...) devem
// consumir a API através deste arquivo, em vez de dar fetch direto —
// assim mudanças de endpoint, normalização de dados ou tratamento de
// erro ficam num único lugar.
//
// Docs oficiais: https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/

const BASE_URL = 'https://itunes.apple.com';

// País usado por padrão nas buscas (afeta disponibilidade/preço/catálogo).
const DEFAULT_COUNTRY = 'BR';

/**
 * Monta a URL e faz a requisição para a API do iTunes.
 * @param {string} endpoint - '/search' ou '/lookup'
 * @param {Object} params - query params a enviar
 * @returns {Promise<Array>} results da resposta
 */
async function request(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);

  Object.entries(params).forEach(([chave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') {
      url.searchParams.set(chave, valor);
    }
  });

  let response;
  try {
    response = await fetch(url.toString());
  } catch (erro) {
    // Falha de rede/CORS. A API do iTunes já libera CORS (*) na maioria
    // dos casos, mas algumas redes/navegadores podem bloquear — se isso
    // acontecer de forma consistente, considere passar por um proxy.
    throw new Error(`Não foi possível conectar à API do iTunes: ${erro.message}`);
  }

  if (!response.ok) {
    throw new Error(`Erro na API do iTunes: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.results ?? [];
}

/**
 * Aumenta a resolução da capa retornada pelo iTunes.
 * Por padrão a API devolve artworkUrl100 (100x100) — trocamos o
 * trecho "100x100" pelo tamanho desejado.
 */
function capaEmAltaResolucao(url, tamanho = 600) {
  if (!url) return '';
  return url.replace(/\d+x\d+bb\.(jpg|png)/, `${tamanho}x${tamanho}bb.$1`);
}

function normalizarFaixa(item) {
  return {
    id: item.trackId,
    titulo: item.trackName,
    artista: item.artistName,
    artistaId: item.artistId,
    album: item.collectionName,
    albumId: item.collectionId,
    ano: item.releaseDate ? new Date(item.releaseDate).getFullYear() : null,
    genero: item.primaryGenreName,
    capa: capaEmAltaResolucao(item.artworkUrl100),
    preview: item.previewUrl,
    duracaoMs: item.trackTimeMillis,
    numeroFaixa: item.trackNumber,
    explicito: item.trackExplicitness === 'explicit',
    linkItunes: item.trackViewUrl
  };
}

function normalizarAlbum(item) {
  return {
    id: item.collectionId,
    titulo: item.collectionName,
    artista: item.artistName,
    artistaId: item.artistId,
    ano: item.releaseDate ? new Date(item.releaseDate).getFullYear() : null,
    genero: item.primaryGenreName,
    capa: capaEmAltaResolucao(item.artworkUrl100),
    totalFaixas: item.trackCount,
    linkItunes: item.collectionViewUrl
  };
}

function normalizarArtista(item) {
  return {
    id: item.artistId,
    nome: item.artistName,
    genero: item.primaryGenreName,
    linkItunes: item.artistLinkUrl
  };
}

/**
 * Busca faixas (músicas) pelo termo informado.
 * @param {string} termo
 * @param {{limit?: number, country?: string}} opcoes
 */
export async function buscarMusicas(termo, { limit = 20, country = DEFAULT_COUNTRY } = {}) {
  if (!termo?.trim()) return [];
  const resultados = await request('/search', {
    term: termo,
    media: 'music',
    entity: 'song',
    limit,
    country
  });
  return resultados.map(normalizarFaixa);
}

/**
 * Busca álbuns pelo termo informado.
 */
export async function buscarAlbuns(termo, { limit = 20, country = DEFAULT_COUNTRY } = {}) {
  if (!termo?.trim()) return [];
  const resultados = await request('/search', {
    term: termo,
    media: 'music',
    entity: 'album',
    limit,
    country
  });
  return resultados.map(normalizarAlbum);
}

/**
 * Busca artistas pelo termo informado.
 */
export async function buscarArtistas(termo, { limit = 20, country = DEFAULT_COUNTRY } = {}) {
  if (!termo?.trim()) return [];
  const resultados = await request('/search', {
    term: termo,
    media: 'music',
    entity: 'musicArtist',
    limit,
    country
  });
  return resultados.map(normalizarArtista);
}

/**
 * Busca combinada — usada na página Explorar (aba "Tudo").
 * Dispara as três buscas em paralelo.
 */
export async function buscarTudo(termo, { limit = 8, country = DEFAULT_COUNTRY } = {}) {
  const [musicas, albuns, artistas] = await Promise.all([
    buscarMusicas(termo, { limit, country }),
    buscarAlbuns(termo, { limit, country }),
    buscarArtistas(termo, { limit, country })
  ]);
  return { musicas, albuns, artistas };
}

/**
 * Busca um álbum específico pelo collectionId, já trazendo suas faixas.
 * Usada na página Album.
 * @param {number|string} collectionId
 */
export async function buscarAlbumPorId(collectionId, { country = DEFAULT_COUNTRY } = {}) {
  const resultados = await request('/lookup', {
    id: collectionId,
    entity: 'song',
    country
  });

  // O lookup por collectionId com entity=song retorna o próprio álbum
  // como primeiro item, seguido das faixas.
  const [album, ...faixas] = resultados;

  return {
    album: album ? normalizarAlbum(album) : null,
    faixas: faixas.map(normalizarFaixa)
  };
}

/**
 * Busca um artista específico pelo artistId, já trazendo seus álbuns.
 * Usada na página Artista.
 * @param {number|string} artistId
 */
export async function buscarArtistaPorId(artistId, { country = DEFAULT_COUNTRY } = {}) {
  const resultados = await request('/lookup', {
    id: artistId,
    entity: 'album',
    country
  });

  const [artista, ...albuns] = resultados;

  return {
    artista: artista ? normalizarArtista(artista) : null,
    albuns: albuns.map(normalizarAlbum)
  };
}

/**
 * Busca uma faixa específica pelo trackId.
 * @param {number|string} trackId
 */
export async function buscarMusicaPorId(trackId, { country = DEFAULT_COUNTRY } = {}) {
  const resultados = await request('/lookup', { id: trackId, country });
  return resultados[0] ? normalizarFaixa(resultados[0]) : null;
}

/**
 * Lookup genérico, caso alguma página precise de um entity diferente
 * dos já cobertos acima (ex.: 'album', 'song', 'musicArtist', 'musicVideo').
 */
export async function lookupPorId(id, { entity, country = DEFAULT_COUNTRY } = {}) {
  return request('/lookup', { id, entity, country });
} 