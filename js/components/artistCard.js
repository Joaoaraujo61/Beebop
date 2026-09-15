// js/components/ArtistCard.js
//
// Componente reutilizável de card de artista. Usado em Explorar e em qualquer
// outra página que liste artistas (ex.: resultados de busca, seção de artistas
// relacionados na página Artista).

/**
 * Renderiza o HTML de um card de artista.
 * @param {object} artista - { id, nome, genero }
 * @returns {string} Markup do card.
 */
export function renderArtistCard(artista) {
  return `
    <article class="artist_card" data-id="${artista.id}">
      <span class="artist_name">${artista.nome}</span>
      ${artista.genero ? `<span class="artist_genre">${artista.genero}</span>` : ''}
    </article>`;
}