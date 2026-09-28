// js/pages/Album/album.js
//
// Página de detalhe de um álbum, seguindo o mesmo padrão da página de
// Música (js/pages/Musica/musica.js) e reaproveitando as classes que já
// existem em components.css (.album-hero, .track-row, .album-sidebar...).
// Recebe a identificação do álbum pela URL:
//   ?id=<collectionId ou id curado>&titulo=<título>&artista=<artista>
//
// - `id` numérico (collectionId real da iTunes API): lookup direto
//   (buscarAlbumPorId) — traz o álbum + todas as faixas.
// - Qualquer outro id (ex.: "curado-album-3", da seleção editorial de
//   js/data/curatedSelections.js, que não tem collectionId real), ou se o
//   lookup falhar: busca por "artista + título" e usa o melhor resultado.
//
// Nota do badge: mesma lógica da página de Música — a nota real vem da
// seleção curada (getNotaAlbumCurada); sem match, usa a média das
// avaliações locais (avaliacoesService); sem nenhuma das duas, o badge
// fica oculto (nunca inventa número).
//
// Avaliar: nota de 0 a 10 por usuário logado, em 5 estrelas com meia
// estrela (cada estrela = 2 pontos), salva em localStorage.
// Salvar: mesmo mecanismo de favoritos do resto do projeto
// (appState.toggleFavorite -> savedItems -> localStorage).
// Comentários: componente reutilizável js/components/comentarios.js.

import { buscarAlbumPorId, buscarAlbuns } from '../../services/itunesApi.js';
import { getNotaAlbumCurada, getNotaCurada } from '../../data/curatedSelections.js';
import { getState, subscribe, togglePlay, toggleFavorite, isFavorite } from '../../store/appState.js';
import { formatDuration } from '../../utils/formatters.js';
import { renderComentarios } from '../../components/comentarios.js';
import { extrairIdentidadeUsuario } from '../../services/comentariosService.js';
import { obterNota, definirNota, resumoAvaliacoes } from '../../services/avaliacoesService.js';

export function initAlbumPage({ header } = {}) {
  const container = document.getElementById('results-container');
  if (!container) {
    console.warn('#results-container não encontrado na página de Álbum.');
    return;
  }

  container.classList.add('album-page');
  container.innerHTML = '<p class="album-page__status">Carregando álbum...</p>';

  const params = new URLSearchParams(window.location.search);
  const idParam = params.get('id') ?? params.get('albumId') ?? params.get('collectionId');
  const tituloParam = params.get('titulo');
  const artistaParam = params.get('artista');

  if (!idParam && !(tituloParam && artistaParam)) {
    container.innerHTML = renderErro('Nenhum álbum informado.');
    return;
  }

  carregarAlbum({ idParam, tituloParam, artistaParam })
    .then((dados) => {
      if (!dados?.album) {
        container.innerHTML = renderErro('Não foi possível encontrar esse álbum.');
        return;
      }
      renderPagina(container, dados.album, dados.faixas);
    })
    .catch(() => {
      container.innerHTML = renderErro('Não foi possível carregar esse álbum agora. Tente novamente.');
    });
}

async function carregarAlbum({ idParam, tituloParam, artistaParam }) {
  if (idParam && /^\d+$/.test(idParam)) {
    const dados = await buscarAlbumPorId(idParam);
    if (dados.album) return dados;
  }

  if (artistaParam && tituloParam) {
    const [encontrado] = await buscarAlbuns(`${artistaParam} ${tituloParam}`, { limit: 1 });
    if (encontrado) return buscarAlbumPorId(encontrado.id);
  }

  return null;
}

function renderPagina(container, album, faixas) {
  const notaCurada = getNotaAlbumCurada(album.artista, album.titulo);
  const meta = [album.genero, album.ano].filter(Boolean).join(' · ');
  const faixasComPreview = faixas.filter((f) => f.preview);

  const artistaMarkup = album.artistaId
    ? `<a class="album-hero__artist" href="../Artista/artista.html?id=${album.artistaId}">${escaparHtml(album.artista)}</a>`
    : `<span class="album-hero__artist">${escaparHtml(album.artista)}</span>`;

  container.innerHTML = `
    <div class="album-hero">
      <div class="album-hero__cover-wrap">
        ${album.capa
          ? `<img class="album-hero__cover" src="${album.capa}" alt="Capa de ${escaparHtml(album.titulo)}" />`
          : `<div class="album-hero__cover album-hero__cover--placeholder"><i class="fa-solid fa-compact-disc" aria-hidden="true"></i></div>`}
      </div>
      <div class="album-hero__info">
        <span class="album-hero__eyebrow">Álbum</span>
        <h1 class="album-hero__title">${escaparHtml(album.titulo)}</h1>
        ${artistaMarkup}
        ${meta ? `<p class="album-hero__meta">${escaparHtml(meta)}</p>` : ''}
        <div class="album-hero__actions">
          <button class="hero__btn hero__btn--primary album-hero__play" type="button" ${faixasComPreview.length ? '' : 'disabled title="Prévia indisponível"'}>
            <i class="fa-solid fa-play" aria-hidden="true"></i>Prévia
          </button>
          <button class="hero__btn hero__btn--ghost album-hero__favorite" type="button"></button>
          <button class="album-hero__icon-btn album-hero__share" type="button" aria-label="Compartilhar">
            <i class="fa-solid fa-share-nodes" aria-hidden="true"></i>
          </button>
        </div>
        <p class="album-hero__share-status" hidden></p>
      </div>
      <div class="album-hero__rating" data-badge hidden></div>
    </div>

    <section class="album-tracks">
      <h2 class="album-section__title">Faixas</h2>
      <ul class="track-list">
        ${faixas.map((f) => renderFaixa(f, album)).join('') || '<li class="album-page__empty">Nenhuma faixa encontrada.</li>'}
      </ul>
    </section>

    <div class="album-content">
      <div class="album-tracklist" data-comentarios></div>

      <aside class="album-sidebar">
        <div class="album-sidebar__card">
          <h3 class="album-sidebar__title">Plataformas</h3>
          <div class="musica-plataformas">
            ${album.linkItunes ? `<a href="${album.linkItunes}" target="_blank" rel="noopener" aria-label="Ouvir na Apple Music"><i class="fa-brands fa-itunes" aria-hidden="true"></i></a>` : ''}
            <a href="https://open.spotify.com/search/${encodeURIComponent(`${album.artista} ${album.titulo}`)}" target="_blank" rel="noopener" aria-label="Buscar no Spotify"><i class="fa-brands fa-spotify" aria-hidden="true"></i></a>
            <a href="https://www.deezer.com/search/${encodeURIComponent(`${album.artista} ${album.titulo}`)}" target="_blank" rel="noopener" aria-label="Buscar no Deezer"><i class="fa-solid fa-music" aria-hidden="true"></i></a>
            <a href="https://soundcloud.com/search?q=${encodeURIComponent(`${album.artista} ${album.titulo}`)}" target="_blank" rel="noopener" aria-label="Buscar no SoundCloud"><i class="fa-brands fa-soundcloud" aria-hidden="true"></i></a>
          </div>
        </div>

        <div class="album-sidebar__card">
          <h3 class="album-sidebar__title">Sobre</h3>
          <span class="album-sidebar__label">Artista</span>
          <span class="album-sidebar__value">${escaparHtml(album.artista)}</span>
          ${album.genero ? `<span class="album-sidebar__label">Gênero</span><span class="album-sidebar__value">${escaparHtml(album.genero)}</span>` : ''}
          ${album.ano ? `<span class="album-sidebar__label">Lançamento</span><span class="album-sidebar__value">${album.ano}</span>` : ''}
          ${album.totalFaixas ? `<span class="album-sidebar__label">Faixas</span><span class="album-sidebar__value">${album.totalFaixas}</span>` : ''}
        </div>

        <div class="album-sidebar__card">
          <h3 class="album-sidebar__title">Avalie este álbum</h3>
          <div class="album-avalie" data-avalie>
            ${[1, 2, 3, 4, 5]
              .map((n) => `<button class="album-avalie__star" type="button" data-indice="${n}" aria-label="Dar nota ${n * 2} de 10"><i class="fa-regular fa-star" aria-hidden="true"></i></button>`)
              .join('')}
          </div>
          <p class="album-avalie__status" data-avalie-status></p>
          <p class="album-avalie__media" data-avalie-media></p>
        </div>
      </aside>
    </div>
  `;

  const comentariosEl = renderComentarios({
    tipo: 'album',
    id: album.id,
    placeholder: 'O que você achou desse álbum?',
  });
  container.querySelector('[data-comentarios]').appendChild(comentariosEl);

  attachEventosHero(container, album);
  attachEventosFaixas(container, faixas, faixasComPreview);
  attachAvaliacao(container, album, notaCurada);
}

function renderFaixa(faixa, album) {
  const notaFaixa = getNotaCurada(faixa.artista, faixa.titulo);
  const credito = faixa.artista && faixa.artista !== album.artista ? faixa.artista : '';
  const temPreview = Boolean(faixa.preview);

  return `
    <li class="track-row track-row--link" data-id="${faixa.id}">
      <span class="track-row__number">${faixa.numeroFaixa ?? ''}</span>
      <button class="track-row__play" type="button" aria-label="Reproduzir ${escaparHtml(faixa.titulo)}" ${temPreview ? '' : 'disabled title="Prévia indisponível"'}>
        <i class="fa-solid fa-play" aria-hidden="true"></i>
      </button>
      <div class="track-row__title-wrap">
        <span class="track-row__title">${escaparHtml(faixa.titulo)}</span>
        ${credito ? `<span class="track-row__credit">${escaparHtml(credito)}</span>` : ''}
      </div>
      ${notaFaixa
        ? `<span class="track-row__rating"><i class="fa-solid fa-star" aria-hidden="true"></i> ${notaFaixa.nota.toFixed(1)}</span>`
        : '<span class="track-row__rating track-row__rating--empty">—</span>'}
      <span class="track-row__duration">${faixa.duracaoMs ? formatDuration(faixa.duracaoMs) : ''}</span>
    </li>
  `;
}

/* ---------------------------------------------------------------------- */
/* Hero: prévia, salvar, compartilhar                                      */
/* ---------------------------------------------------------------------- */

function attachEventosHero(container, album) {
  const favBtn = container.querySelector('.album-hero__favorite');
  const shareBtn = container.querySelector('.album-hero__share');
  const shareStatus = container.querySelector('.album-hero__share-status');

  function pintarFavorito() {
    const salvo = isFavorite(album.id);
    favBtn.classList.toggle('is-favorite', salvo);
    favBtn.innerHTML = `<i class="fa-${salvo ? 'solid' : 'regular'} fa-heart" aria-hidden="true"></i> ${salvo ? 'Salvo' : 'Salvar'}`;
    favBtn.setAttribute('aria-pressed', String(salvo));
  }

  pintarFavorito();
  favBtn.addEventListener('click', () => {
    toggleFavorite(album);
    pintarFavorito();
  });

  shareBtn.addEventListener('click', async () => {
    const url = window.location.href;
    shareStatus.hidden = false;
    try {
      await navigator.clipboard.writeText(url);
      shareStatus.textContent = 'Link copiado!';
    } catch {
      shareStatus.textContent = url;
    }
  });
}

/* ---------------------------------------------------------------------- */
/* Faixas: reprodução das prévias + navegação para a página de Música      */
/* ---------------------------------------------------------------------- */

function attachEventosFaixas(container, faixas, faixasComPreview) {
  const heroPlay = container.querySelector('.album-hero__play');
  const linhas = container.querySelectorAll('.track-row');

  // Um único <audio> para a página toda: só uma prévia toca por vez,
  // sincronizada com appState.playingId (mesmo padrão de musicCard.js).
  const audio = new Audio();
  audio.preload = 'none';
  let tocandoId = null;

  audio.addEventListener('ended', () => {
    if (tocandoId !== null && getState().playingId === tocandoId) togglePlay(tocandoId);
  });

  linhas.forEach((linha) => {
    const faixa = faixas.find((f) => String(f.id) === linha.dataset.id);
    if (!faixa) return;

    linha.querySelector('.track-row__play').addEventListener('click', (event) => {
      event.stopPropagation();
      if (faixa.preview) togglePlay(faixa.id);
    });

    linha.addEventListener('click', () => {
      const params = new URLSearchParams({
        id: String(faixa.id),
        titulo: faixa.titulo,
        artista: faixa.artista,
      });
      window.location.href = `../Musica/musica.html?${params.toString()}`;
    });
  });

  heroPlay.addEventListener('click', () => {
    const atual = faixasComPreview.find((f) => f.id === getState().playingId);
    const alvo = atual ?? faixasComPreview[0];
    if (alvo) togglePlay(alvo.id);
  });

  subscribe((state) => {
    const ativa = faixasComPreview.find((f) => f.id === state.playingId) ?? null;

    linhas.forEach((linha) => {
      const ativaNaLinha = Boolean(ativa) && String(ativa.id) === linha.dataset.id;
      linha.classList.toggle('is-playing', ativaNaLinha);
      linha.querySelector('.track-row__play i').className = `fa-solid fa-${ativaNaLinha ? 'pause' : 'play'}`;
    });

    heroPlay.innerHTML = `<i class="fa-solid fa-${ativa ? 'pause' : 'play'}" aria-hidden="true"></i>${ativa ? 'Pausar' : 'Prévia'}`;

    // Só mexe no áudio quando a faixa ativa realmente muda — o subscribe
    // dispara a cada mudança do appState (ex.: salvar o álbum), e não
    // pode reiniciar a prévia por isso.
    const idAtivo = ativa ? ativa.id : null;
    if (idAtivo === tocandoId) return;

    tocandoId = idAtivo;
    if (ativa) {
      audio.src = ativa.preview;
      audio.currentTime = 0;
      audio.play().catch(() => {
        if (getState().playingId === ativa.id) togglePlay(ativa.id);
      });
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  });
}

/* ---------------------------------------------------------------------- */
/* Avaliação: 5 estrelas com meia estrela (0–10), por usuário logado       */
/* ---------------------------------------------------------------------- */

function attachAvaliacao(container, album, notaCurada) {
  const wrap = container.querySelector('[data-avalie]');
  const statusEl = container.querySelector('[data-avalie-status]');
  const mediaEl = container.querySelector('[data-avalie-media]');
  const badgeEl = container.querySelector('[data-badge]');
  const estrelas = wrap.querySelectorAll('.album-avalie__star');

  function usuario() {
    return extrairIdentidadeUsuario(getState().user);
  }

  let notaAtual = usuario() ? obterNota('album', album.id, usuario().id) : null;

  // valor 0–10: cada estrela vale 2 pontos; meia estrela vale 1.
  function pintar(valor) {
    estrelas.forEach((btn) => {
      const i = Number(btn.dataset.indice);
      const icone = btn.querySelector('i');
      if (valor >= i * 2) icone.className = 'fa-solid fa-star';
      else if (valor === i * 2 - 1) icone.className = 'fa-solid fa-star-half-stroke';
      else icone.className = 'fa-regular fa-star';
    });
  }

  function valorDoClique(btn, event) {
    const rect = btn.getBoundingClientRect();
    const metadeEsquerda = event.clientX - rect.left < rect.width / 2;
    const i = Number(btn.dataset.indice);
    return metadeEsquerda ? i * 2 - 1 : i * 2;
  }

  function atualizarTextos(mensagem) {
    const resumo = resumoAvaliacoes('album', album.id);

    if (mensagem) statusEl.textContent = mensagem;
    else if (notaAtual !== null) statusEl.textContent = `Sua nota: ${notaAtual}/10 (clique na mesma nota para remover)`;
    else if (usuario()) statusEl.textContent = 'Clique nas estrelas para avaliar.';
    else statusEl.textContent = 'Faça login para avaliar.';

    mediaEl.textContent = resumo.total
      ? `Comunidade Beebop: ${resumo.media.toFixed(1)} · ${resumo.total} avaliaç${resumo.total === 1 ? 'ão' : 'ões'}`
      : 'Ainda sem avaliações da comunidade.';

    // Badge do hero: prioridade para a nota real da seleção curada; sem
    // ela, a média local; sem nenhuma, fica oculto.
    if (notaCurada) {
      badgeEl.hidden = false;
      badgeEl.innerHTML = `
        <span class="album-hero__rating-value"><i class="fa-solid fa-star" aria-hidden="true"></i> ${notaCurada.nota.toFixed(1)}</span>
        <span class="album-hero__rating-count">nota da seleção Beebop</span>`;
    } else if (resumo.total) {
      badgeEl.hidden = false;
      badgeEl.innerHTML = `
        <span class="album-hero__rating-value"><i class="fa-solid fa-star" aria-hidden="true"></i> ${resumo.media.toFixed(1)}</span>
        <span class="album-hero__rating-count">${resumo.total} avaliaç${resumo.total === 1 ? 'ão' : 'ões'}</span>`;
    } else {
      badgeEl.hidden = true;
    }
  }

  estrelas.forEach((btn) => {
    btn.addEventListener('mousemove', (event) => pintar(valorDoClique(btn, event)));

    btn.addEventListener('click', (event) => {
      const user = usuario();
      if (!user) {
        atualizarTextos('Faça login para avaliar.');
        return;
      }

      const valor = valorDoClique(btn, event);
      if (valor === notaAtual) {
        notaAtual = null;
        definirNota('album', album.id, user.id, null);
      } else {
        notaAtual = valor;
        definirNota('album', album.id, user.id, valor);
      }

      pintar(notaAtual ?? 0);
      atualizarTextos();
    });
  });

  wrap.addEventListener('mouseleave', () => pintar(notaAtual ?? 0));

  pintar(notaAtual ?? 0);
  atualizarTextos();
}

/* ---------------------------------------------------------------------- */

// Escapa &, <, > e " antes de inserir texto vindo de API externa no innerHTML.
function escaparHtml(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderErro(mensagem) {
  return `
    <div class="album-page__error">
      <p>${mensagem}</p>
      <a href="../Explorar/explorar.html">Voltar para Explorar</a>
    </div>
  `;
}