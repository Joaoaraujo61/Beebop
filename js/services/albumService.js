// js/services/albumService.js
//
// Este arquivo não existia em nenhuma das duas versões originais do
// projeto: js/pages/Album/album.js já importava `albumService` (com o
// contrato getAlbumById/isMockId), mas o serviço em si nunca chegou a
// ser criado — a página de Álbum quebraria ao carregar. Este serviço
// fecha essa lacuna, combinando:
//
//  - Um álbum "mock" fixo (id 'mock-1'), para a página nunca abrir em
//    branco quando não há "?id=" na URL — mesma ideia descrita no
//    comentário original de album.js.
//  - Uma busca real via services/itunesApi.js (buscarAlbumPorId) quando
//    o id informado é um collectionId numérico da iTunes API, permitindo
//    testar a página com álbuns reais: album.html?id=<collectionId>.

import { buscarAlbumPorId } from './itunesApi.js';

const MOCK_ALBUM = {
  id: 'mock-1',
  externalId: null,
  title: 'Beebop Sessions Vol. 1',
  artist: 'Beebop House Band',
  artistId: 'mock-artist-1',
  genre: 'Indie',
  year: 2024,
  imageUrl: '',
  rating: 8.6,
  ratingCount: 42,
  tracks: [
    { id: 'mock-track-1', trackNumber: 1, title: 'Abertura', artistCredit: null, durationMs: 198000, rating: 8.9, previewUrl: null },
    { id: 'mock-track-2', trackNumber: 2, title: 'Segundo Ato', artistCredit: null, durationMs: 231000, rating: 8.2, previewUrl: null },
    { id: 'mock-track-3', trackNumber: 3, title: 'Fecho', artistCredit: null, durationMs: 176000, rating: 8.7, previewUrl: null },
  ],
};

/** Verifica se um id pertence ao conjunto de álbuns mockados (MVP). */
function isMockId(id) {
  return typeof id === 'string' && id.startsWith('mock-');
}

/**
 * Normaliza o resultado de buscarAlbumPorId (services/itunesApi.js) para
 * o formato consumido por pages/Album/album.js.
 */
function fromItunesLookup({ album, faixas }) {
  if (!album) return null;
  return {
    id: String(album.id),
    externalId: album.id,
    title: album.titulo,
    artist: album.artista,
    artistId: album.artistaId,
    genre: album.genero,
    year: album.ano,
    imageUrl: album.capa,
    rating: null, // A iTunes Search API não fornece nota média do álbum.
    ratingCount: null,
    tracks: faixas.map((faixa) => ({
      id: String(faixa.id),
      trackNumber: faixa.numeroFaixa,
      title: faixa.titulo,
      artistCredit: faixa.artista !== album.artista ? faixa.artista : null,
      durationMs: faixa.duracaoMs,
      rating: null,
      previewUrl: faixa.preview,
    })),
  };
}

export const albumService = {
  isMockId,

  /**
   * Busca um álbum pelo id. Ids no formato "mock-*" retornam o álbum de
   * demonstração; qualquer outro valor é tratado como collectionId da
   * iTunes API.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async getAlbumById(id) {
    if (isMockId(id)) {
      return id === MOCK_ALBUM.id ? MOCK_ALBUM : null;
    }

    try {
      const resultado = await buscarAlbumPorId(id);
      return fromItunesLookup(resultado);
    } catch (erro) {
      console.error('Falha ao buscar álbum na iTunes API:', erro);
      return null;
    }
  },
};
