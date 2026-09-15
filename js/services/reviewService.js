// js/services/reviewService.js
//
// Assim como albumService.js, este serviço era importado por
// pages/Album/album.js mas nunca existiu em nenhuma das duas versões
// originais. O projeto não tem backend/API de comentários (só a iTunes
// Search API, dedicada a música) — então este serviço é deliberadamente
// um mock: comentários fixos apenas para o álbum de demonstração
// ('mock-1'), e uma lista vazia para álbuns reais (iTunes), já que não
// existe onde armazenar reviews de verdade ainda.
//
// Próximo passo natural (fora do escopo desta consolidação): persistir
// comentários em localStorage por álbum, reaproveitando o padrão já
// usado em store/appState.js (toggleSavedItem) para favoritos.

const MOCK_REVIEWS = {
  'mock-1': [
    {
      id: 'review-1',
      userName: 'Marina',
      rating: 9,
      comment: 'A faixa de abertura é ótima pra ouvir no fone indo pro trabalho.',
      createdAt: '2026-03-02T10:00:00Z',
    },
    {
      id: 'review-2',
      userName: 'Diego',
      rating: 8,
      comment: 'Produção caprichada, mas o álbum é curto — queria mais faixas.',
      createdAt: '2026-02-18T10:00:00Z',
    },
  ],
};

export const reviewService = {
  /**
   * Retorna os comentários de um álbum. Álbuns fora do conjunto mockado
   * retornam lista vazia (sem comentários), já que não há persistência
   * real de reviews neste MVP.
   * @param {string} albumId
   * @returns {Promise<Array>}
   */
  async getReviewsByAlbum(albumId) {
    return MOCK_REVIEWS[albumId] ?? [];
  },
};
