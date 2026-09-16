// js/components/musicCard.js
//
// Card de música reutilizável para a página inicial (e futuramente
// outras páginas). Usa apenas os campos que já fazem sentido dado o
// estado atual do projeto (título, artista, capa opcional, subtítulo
// opcional) e o estado de reprodução vindo de appState.js.
//
// Não depende de nenhuma API real: quando js/services/itunesApi.js
// existir, basta passar os dados retornados por ela no mesmo formato.
//
// `rating` e `rank` são opcionais (usados hoje pelo pódio da página
// Charts) e retrocompatíveis: se não forem passados, o card renderiza
// exatamente como antes. Ambos reaproveitam classes que já existiam em
// components.css (.music-card__rating já estava definida e sem uso).

import { appState } from '../store/appState.js';

/**
 * @param {Object} track
 * @param {string} track.id - identificador único da faixa
 * @param {string} track.title - título da música
 * @param {string} track.artist - nome do artista
 * @param {string} [track.cover] - URL da capa (se ausente, usa placeholder)
 * @param {string} [track.subtitle] - rótulo secundário (ex: "Destaque", "Sugestão")
 * @param {number} [track.rating] - nota de 0 a 10 (mostra o badge de estrela)
 * @param {number} [track.rank] - posição no ranking (1 mostra uma coroa em vez do número)
 */
export function renderMusicCard(track) {
  const card = document.createElement('article');
  card.className = 'music-card';
  card.dataset.trackId = track.id;

  const coverMarkup = track.cover
    ? `<img class="music-card__cover" src="${track.cover}" alt="Capa de ${track.title}" />`
    : `<div class="music-card__cover music-card__cover--placeholder">
         <i class="fa-solid fa-compact-disc" aria-hidden="true"></i>
       </div>`;

  const rankMarkup = track.rank
    ? `<span class="music-card__rank">${
        track.rank === 1 ? '<i class="fa-solid fa-crown" aria-hidden="true"></i>' : track.rank
      }</span>`
    : '';

  const ratingMarkup = typeof track.rating === 'number'
    ? `<span class="music-card__rating"><i class="fa-solid fa-star" aria-hidden="true"></i> ${track.rating.toFixed(1)}</span>`
    : '';

  card.innerHTML = `
    <div class="music-card__cover-wrap">
      ${coverMarkup}
      ${rankMarkup}
      <button class="music-card__play" type="button" aria-label="Reproduzir ${track.title}">
        <i class="fa-solid fa-play" aria-hidden="true"></i>
      </button>
      <div class="music-card__eq" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
      ${ratingMarkup}
    </div>
    <div class="music-card__info">
      <p class="music-card__title">${track.title}</p>
      <p class="music-card__artist">${track.artist}</p>
      ${track.subtitle ? `<p class="music-card__subtitle">${track.subtitle}</p>` : ''}
    </div>
  `;

  const playBtn = card.querySelector('.music-card__play');
  const playIcon = playBtn.querySelector('i');
  let stoppingTimeout = null;

  playBtn.addEventListener('click', () => {
    appState.togglePlay(track.id);
  });

  // Sincroniza a aparência do card com o estado global de reprodução.
  // Ao pausar, o equalizador não corta na hora: a barra termina o ciclo
  // atual (classe "is-stopping", 1 iteração da mesma animação já
  // existente) e só depois desaparece — sensação de "acomodar", não de
  // desligar. Nenhum estado novo é criado, só reaproveitado o appState.
  appState.subscribe((state) => {
    const isActive = state.playingId === track.id;

    if (isActive) {
      clearTimeout(stoppingTimeout);
      card.classList.remove('is-stopping');
      card.classList.add('is-playing');
    } else if (card.classList.contains('is-playing') || card.classList.contains('is-stopping')) {
      card.classList.remove('is-playing');
      card.classList.add('is-stopping');
      clearTimeout(stoppingTimeout);
      stoppingTimeout = window.setTimeout(() => {
        card.classList.remove('is-stopping');
      }, 950);
    }

    playIcon.className = isActive ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    playBtn.setAttribute('aria-label', `${isActive ? 'Pausar' : 'Reproduzir'} ${track.title}`);
  });

  return card;
}