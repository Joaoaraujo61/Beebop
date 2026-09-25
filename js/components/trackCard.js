// js/components/TrackCard.js
//
// Componente reutilizável de card de música (faixa). Usado em Início, Explorar,
// Álbum, Artista, Playlist e Salvos — qualquer página que precise listar faixas.
// Recebe uma faixa já normalizada (mesma forma usada por services/itunesApi.js
// e por js/data/curatedSelections.js) e devolve apenas o HTML do card; a página
// que o usa decide onde inserir esse HTML e chama attachTrackCardEvents depois.
//
// Navegação: clicar no card (fora do botão de favoritar) abre
// pages/Musica/musica.html com id/título/artista na URL — ver
// attachTrackCardEvents.

import { formatDuration } from '../utils/formatters.js';
import { PLACEHOLDER_COVER } from '../utils/constants.js';

/**
 * Renderiza o HTML de um card de música.
 * @param {object} track - { id, titulo, artista, ano, capa, duracaoMs, nota }
 * @param {{saved?: boolean}} [opcoes] - `saved` marca o coração como ativo.
 * @returns {string} Markup do card.
 */
export function renderTrackCard(track, { saved = false } = {}) {
  const capa = track.capa || PLACEHOLDER_COVER;
  const temNota = typeof track.nota === 'number';
  const nota = temNota
    ? `<span class="track_rating"><i class="fa-solid fa-star"></i> ${track.nota.toFixed(1)}</span>`
    : '';
  const meta = [track.ano, track.duracaoMs ? formatDuration(track.duracaoMs) : null]
    .filter(Boolean)
    .join(' · ');

  return `
    <article class="track_card" data-id="${track.id}">
      <img class="track_cover" src="${capa}" alt="Capa de ${track.titulo}">
      <div class="track_info">
        <div class="track_title_row">
          <span class="track_title">${track.titulo}</span>
          ${nota}
        </div>
        <span class="track_artist">${track.artista}</span>
        ${meta ? `<span class="track_year">${meta}</span>` : ''}
      </div>
      <button class="track_like${saved ? ' track_like--active' : ''}" aria-label="Favoritar ${track.titulo}" data-id="${track.id}">
        <i class="fa-solid fa-heart"></i>
      </button>
    </article>`;
}

/**
 * Liga o clique do coração de cada card de música renderizado dentro de `root`
 * a um callback (tipicamente store/appState.js -> toggleSavedItem), e o
 * clique no restante do card à navegação para a página de Música.
 * @param {HTMLElement} root - Elemento que contém os cards (ex: o grid).
 * @param {Array} tracks - Lista de faixas correspondente aos cards renderizados.
 * @param {(track: object) => void} onToggle - Chamado com a faixa ao favoritar/desfavoritar.
 */
export function attachTrackCardEvents(root, tracks, onToggle) {
  root.querySelectorAll('.track_like').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation(); // não deixa o clique "vazar" pro listener de navegação do card
      const track = tracks.find((item) => String(item.id) === btn.dataset.id);
      if (!track) return;
      onToggle(track);
      btn.classList.toggle('track_like--active');
    });
  });

  root.querySelectorAll('.track_card').forEach((card) => {
    card.addEventListener('click', () => {
      const track = tracks.find((item) => String(item.id) === card.dataset.id);
      if (!track) return;
      const params = new URLSearchParams({
        id: String(track.id),
        titulo: track.titulo,
        artista: track.artista,
      });
      window.location.href = `../Musica/musica.html?${params.toString()}`;
    });
  });
}