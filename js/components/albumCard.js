// js/components/AlbumCard.js
//
// Componente reutilizável de card de álbum. Usado em Explorar, Artista, Playlist
// e Salvos. Segue o mesmo padrão de TrackCard.js: função pura de render + uma
// função separada para ligar os eventos do coração.

import { PLACEHOLDER_COVER } from '../utils/constants.js';

/**
 * Renderiza o HTML de um card de álbum.
 * @param {object} album - { id, titulo, artista, ano, capa, totalFaixas, nota }
 * @param {{saved?: boolean}} [opcoes]
 * @returns {string} Markup do card.
 */
export function renderAlbumCard(album, { saved = false } = {}) {
  const capa = album.capa || PLACEHOLDER_COVER;
  const temNota = typeof album.nota === 'number';
  const nota = temNota
    ? `<span class="album_rating"><i class="fa-solid fa-star"></i> ${album.nota.toFixed(1)}</span>`
    : '';
  const faixasInfo = album.totalFaixas ? `${album.totalFaixas} faixas` : '';

  return `
    <article class="album_card" data-id="${album.id}">
      <img class="album_cover" src="${capa}" alt="Capa de ${album.titulo}">
      <div class="album_info">
        <div class="album_title_row">
          <span class="album_title">${album.titulo}</span>
          ${nota}
        </div>
        <span class="album_artist">${album.artista}${faixasInfo ? ` · ${faixasInfo}` : ''}</span>
      </div>
      <button class="track_like${saved ? ' track_like--active' : ''}" aria-label="Favoritar ${album.titulo}" data-id="${album.id}">
        <i class="fa-solid fa-heart"></i>
      </button>
    </article>`;
}

/**
 * Liga o clique do coração de cada card de álbum renderizado dentro de `root`
 * a um callback (tipicamente store/appState.js -> toggleSavedItem).
 * @param {HTMLElement} root
 * @param {Array} albums
 * @param {(album: object) => void} onToggle
 */
export function attachAlbumCardEvents(root, albums, onToggle) {
  root.querySelectorAll('.track_like').forEach((btn) => {
    btn.addEventListener('click', () => {
      const album = albums.find((item) => String(item.id) === btn.dataset.id);
      if (!album) return;
      onToggle(album);
      btn.classList.toggle('track_like--active');
    });
  });
}