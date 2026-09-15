// js/pages/Album/album.js

import { albumService } from '../../services/albumService.js';
import { reviewService } from '../../services/reviewService.js';
import { appState } from '../../store/appState.js';
import { formatDuration, formatDateLong, formatRating } from '../../utils/formatters.js';

export function initAlbumPage({ header }) {
  const container = document.getElementById('results-container');
  const params = new URLSearchParams(window.location.search);
  // Sem "?id=" na URL: cai no álbum mock-1, só pra a página nunca abrir
  // em branco. Ver README da resposta final sobre como testar com um
  // álbum real da iTunes (?id=<collectionId>).
  const albumId = params.get('id') || 'mock-1';

  renderLoading(container);
  loadAlbum(container, albumId);
}

function renderLoading(container) {
  container.innerHTML = `
    <div class="album-page">
      <p class="album-page__status" role="status">Carregando álbum…</p>
    </div>
  `;
}

function renderError(container, albumId) {
  container.innerHTML = `
    <div class="album-page">
      <div class="album-page__error">
        <p>Não foi possível carregar este álbum agora.</p>
        <button class="hero__btn hero__btn--primary" type="button" id="album-retry">Tentar novamente</button>
      </div>
    </div>
  `;
  container.querySelector('#album-retry').addEventListener('click', () => {
    renderLoading(container);
    loadAlbum(container, albumId);
  });
}

async function loadAlbum(container, albumId) {
  try {
    const album = await albumService.getAlbumById(albumId);
    if (!album) {
      renderError(container, albumId);
      return;
    }
    await renderAlbum(container, album);
  } catch (err) {
    console.error('Falha ao carregar álbum:', err);
    renderError(container, albumId);
  }
}

async function renderAlbum(container, album) {
  const albumKey = album.externalId ?? album.id;
  const isMock = albumService.isMockId(album.id) || !album.externalId;
  const ratingText = formatRating(album.rating);
  const firstPlayableTrack = album.tracks[0];

  container.innerHTML = `
    <div class="album-page">
      ${isMock ? `<p class="album-page__demo-flag">Dados de demonstração (MVP) — sem integração real com a iTunes API para este álbum.</p>` : ''}

      <section class="album-hero">
        <div class="album-hero__cover-wrap">
          ${album.imageUrl
            ? `<img class="album-hero__cover" src="${album.imageUrl}" alt="Capa de ${album.title}" />`
            : `<div class="album-hero__cover album-hero__cover--placeholder"><i class="fa-solid fa-compact-disc" aria-hidden="true"></i></div>`}
        </div>
        <div class="album-hero__info">
          <p class="album-hero__eyebrow">Álbum</p>
          <h1 class="album-hero__title">${album.title}</h1>
          <a class="album-hero__artist" href="../Artista/artista.html?id=${encodeURIComponent(album.artistId ?? '')}">${album.artist}</a>
          <p class="album-hero__meta">${[album.genre, album.year].filter(Boolean).join(' · ') || 'Informações indisponíveis'}</p>
          <div class="album-hero__actions">
            <button class="hero__btn hero__btn--primary album-hero__play" type="button" ${firstPlayableTrack ? '' : 'disabled'}>
              <i class="fa-solid fa-play" aria-hidden="true"></i> Prévia
            </button>
            <button class="album-hero__icon-btn album-hero__favorite" type="button" aria-label="Favoritar ${album.title}">
              <i class="fa-solid fa-heart" aria-hidden="true"></i>
            </button>
            <button class="album-hero__icon-btn album-hero__share" type="button" aria-label="Compartilhar ${album.title}">
              <i class="fa-solid fa-share-nodes" aria-hidden="true"></i>
            </button>
          </div>
          <p class="album-hero__share-status" role="status" aria-live="polite"></p>
        </div>
        ${ratingText ? `
          <div class="album-hero__rating">
            <span class="album-hero__rating-value"><i class="fa-solid fa-star" aria-hidden="true"></i> ${ratingText}</span>
            ${album.ratingCount ? `<span class="album-hero__rating-count">${album.ratingCount} votos</span>` : ''}
          </div>
        ` : ''}
      </section>

      <div class="album-content">
        <section class="album-tracklist" aria-label="Faixas do álbum">
          <h2 class="album-section__title">Faixas</h2>
          ${album.tracks.length ? `
            <ol class="track-list">
              ${album.tracks.map((track) => renderTrackRow(track)).join('')}
            </ol>
          ` : `<p class="album-page__empty">Nenhuma faixa encontrada para este álbum.</p>`}
        </section>

        <aside class="album-sidebar">
          <div class="album-sidebar__card">
            <h3 class="album-sidebar__title">Sobre</h3>
            <p class="album-sidebar__label">Artista</p>
            <a class="album-sidebar__value album-sidebar__artist-link" href="../Artista/artista.html?id=${encodeURIComponent(album.artistId ?? '')}">${album.artist}</a>
            <p class="album-sidebar__label">Gênero</p>
            <p class="album-sidebar__value">${album.genre ?? 'Não informado'}</p>
            <p class="album-sidebar__label">Faixas</p>
            <p class="album-sidebar__value">${album.tracks.length}</p>
          </div>
        </aside>
      </div>

      <section class="album-comments" aria-label="Comentários">
        <h2 class="album-section__title">Comentários</h2>
        <div class="album-comments__list" id="album-comments-list">
          <p class="album-page__status" role="status">Carregando comentários…</p>
        </div>
      </section>
    </div>
  `;

  wireHero(container, album, albumKey, firstPlayableTrack);
  wireTrackList(container, album);
  loadComments(container, album);
}

function renderTrackRow(track) {
  const durationText = formatDuration(track.durationMs);
  const ratingText = formatRating(track.rating);

  return `
    <li class="track-row" data-track-id="${track.id}">
      <span class="track-row__number">${track.trackNumber ?? ''}</span>
      <button class="track-row__play" type="button" aria-label="Reproduzir ${track.title}">
        <i class="fa-solid fa-play" aria-hidden="true"></i>
      </button>
      <div class="track-row__title-wrap">
        <span class="track-row__title">${track.title}</span>
        ${track.artistCredit ? `<span class="track-row__credit">${track.artistCredit}</span>` : ''}
      </div>
      ${ratingText ? `<span class="track-row__rating"><i class="fa-solid fa-star" aria-hidden="true"></i> ${ratingText}</span>` : `<span class="track-row__rating track-row__rating--empty">—</span>`}
      <span class="track-row__duration">${durationText}</span>
    </li>
  `;
}

function wireHero(container, album, albumKey, firstPlayableTrack) {
  const favBtn = container.querySelector('.album-hero__favorite');
  favBtn.addEventListener('click', () => appState.toggleFavorite(album));
  appState.subscribe(() => {
    favBtn.classList.toggle('is-favorite', albumKey != null && appState.isFavorite(albumKey));
  });

  const playBtn = container.querySelector('.album-hero__play');
  if (firstPlayableTrack) {
    playBtn.addEventListener('click', () => appState.togglePlay(firstPlayableTrack.id));
    appState.subscribe((state) => {
      const isActive = state.playingId === firstPlayableTrack.id;
      playBtn.classList.toggle('is-playing', isActive);
      playBtn.innerHTML = isActive
        ? '<i class="fa-solid fa-pause" aria-hidden="true"></i> Prévia'
        : '<i class="fa-solid fa-play" aria-hidden="true"></i> Prévia';
    });
  }

  const shareBtn = container.querySelector('.album-hero__share');
  const shareStatus = container.querySelector('.album-hero__share-status');
  shareBtn.addEventListener('click', async () => {
    const shareData = {
      title: `${album.title} — ${album.artist}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        shareStatus.textContent = 'Link copiado!';
        window.setTimeout(() => { shareStatus.textContent = ''; }, 2500);
      }
    } catch {
      // Usuário cancelou o share nativo, ou clipboard indisponível —
      // não é um erro para reportar, só não faz nada.
    }
  });
}

function wireTrackList(container, album) {
  // <audio> real, compartilhado por todas as faixas desta página —
  // só é usado quando a faixa tem previewUrl (álbum vindo da iTunes de
  // verdade). Para faixas mock (previewUrl null), o botão continua
  // alternando o estado visual, igual ao padrão já usado nos cards da
  // Home (musicCard.js) — sem fingir um áudio que não existe.
  const audio = document.createElement('audio');
  audio.preload = 'none';
  container.appendChild(audio);

  const tracksById = new Map(album.tracks.map((t) => [t.id, t]));

  audio.addEventListener('ended', () => {
    if (appState.playingId) appState.togglePlay(appState.playingId);
  });

  container.querySelectorAll('.track-row__play').forEach((btn) => {
    const row = btn.closest('.track-row');
    const trackId = row.dataset.trackId;
    btn.addEventListener('click', () => appState.togglePlay(trackId));
  });

  appState.subscribe((state) => {
    container.querySelectorAll('.track-row').forEach((row) => {
      const trackId = row.dataset.trackId;
      const isActive = state.playingId === trackId;
      row.classList.toggle('is-playing', isActive);
      const icon = row.querySelector('.track-row__play i');
      icon.className = isActive ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    });

    const activeTrack = tracksById.get(state.playingId);
    if (activeTrack && activeTrack.previewUrl) {
      if (audio.src !== activeTrack.previewUrl) audio.src = activeTrack.previewUrl;
      audio.play().catch(() => {
        // Autoplay bloqueado pelo navegador — o estado visual já
        // reflete "tocando", o usuário pode clicar de novo se preciso.
      });
    } else if (!state.playingId || !tracksById.has(state.playingId)) {
      audio.pause();
    }
  });
}

async function loadComments(container, album) {
  const listEl = container.querySelector('#album-comments-list');
  const albumKey = album.id; // reviews mock são ligadas ao id mock do álbum
  const reviews = await reviewService.getReviewsByAlbum(albumKey);

  if (!reviews.length) {
    listEl.innerHTML = `<p class="album-page__empty">Ainda não há comentários por aqui.</p>`;
    return;
  }

  listEl.innerHTML = reviews.map((review) => `
    <article class="comment-row">
      <div class="comment-row__avatar" aria-hidden="true">${review.userName.slice(0, 1).toUpperCase()}</div>
      <div class="comment-row__body">
        <p class="comment-row__head">
          <span class="comment-row__author">${review.userName}</span>
          <span class="comment-row__rating"><i class="fa-solid fa-star" aria-hidden="true"></i> ${formatRating(review.rating)}</span>
        </p>
        <p class="comment-row__text">${review.comment}</p>
        <p class="comment-row__date">${formatDateLong(review.createdAt)}</p>
      </div>
    </article>
  `).join('');
}
