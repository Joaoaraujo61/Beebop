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
//
// `previewUrl`: se vier preenchido, o botão de play toca os 30s de
// prévia de verdade (o mesmo campo que a página de Álbum já usa,
// segundo o contexto do projeto). Sem previewUrl, o botão fica
// desabilitado — antes disso, o card "tocava" só visualmente (equalizer
// ligava sem nenhum áudio), o que não faz mais sentido agora que existe
// reprodução real.
//
// Navegação: clicar em qualquer parte do card fora do botão de play
// abre pages/Musica/musica.html com id/título/artista na URL — a
// página de Música usa isso para buscar a faixa (via itunesApi, com
// fallback por nome quando o id é o de um item da seleção curada, que
// não é um trackId real da iTunes API).

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
 * @param {string} [track.previewUrl] - URL do preview de 30s (iTunes API). Sem isso, o play fica desabilitado.
 */
export function renderMusicCard(track) {
  const card = document.createElement('article');
  card.className = 'music-card music-card--clickable';
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

  const previewUrl = track.previewUrl || track.preview;
  const hasPreview = Boolean(previewUrl);

  card.innerHTML = `
    <div class="music-card__cover-wrap">
      ${coverMarkup}
      ${rankMarkup}
      <button
        class="music-card__play"
        type="button"
        aria-label="Reproduzir ${track.title}"
        ${hasPreview ? '' : 'disabled title="Prévia indisponível"'}
      >
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

  // Elemento de áudio real, criado só se houver preview (evita requisição
  // desnecessária pra faixas sem prévia). Não é anexado ao DOM — só
  // precisa existir em memória pra tocar.
  const audio = hasPreview ? new Audio(previewUrl) : null;
  if (audio) {
    audio.preload = 'none';

    // Prévia chegou ao fim sozinha (os ~30s do preview da iTunes API):
    // reaproveita o mesmo togglePlay do clique manual, então tudo o que
    // já reage a appState.playingId (ícone, equalizer, outros cards)
    // volta ao normal sem lógica duplicada.
    audio.addEventListener('ended', () => {
      if (appState.playingId === track.id) {
        appState.togglePlay(track.id);
      }
    });
  }

  playBtn.addEventListener('click', (event) => {
    event.stopPropagation(); // não deixa o clique "vazar" pro listener de navegação do card
    appState.togglePlay(track.id);
  });

  // Clique em qualquer outra parte do card abre a página de Música.
  card.addEventListener('click', () => {
    const params = new URLSearchParams({
      id: String(track.id),
      titulo: track.title,
      artista: track.artist,
    });
    window.location.href = `../Musica/musica.html?${params.toString()}`;
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

    // Controla o áudio de verdade: toca quando este card vira o
    // "playingId" global, pausa (e volta pro início) quando deixa de ser
    // — assim, ao apertar play de novo, a prévia recomeça do zero em vez
    // de continuar de onde parou.
    if (!audio) return;

    if (isActive) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Autoplay bloqueado ou erro de rede: desfaz o estado "tocando"
        // pra não deixar o card preso num equalizer sem som nenhum.
        if (appState.playingId === track.id) {
          appState.togglePlay(track.id);
        }
      });
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  });

  return card;
}