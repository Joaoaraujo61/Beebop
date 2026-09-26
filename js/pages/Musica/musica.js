// js/pages/Musica/musica.js
//
// Página de detalhe de uma faixa, aberta ao clicar em um musicCard ou
// trackCard (ver js/components/musicCard.js e trackCard.js). Recebe a
// identificação da faixa pela URL:
//   ?id=<trackId ou id curado>&titulo=<título>&artista=<artista>
//
// - Se `id` for um trackId numérico real da iTunes API, busca direto por
//   ele (buscarMusicaPorId) — mais preciso, traz álbum/gênero/prévia.
// - Caso contrário (ex.: id "curado-musica-..." vindo da seleção
//   editorial de js/data/curatedSelections.js, que não tem trackId real)
//   ou se o lookup por id falhar, cai para uma busca por "artista +
//   título" na iTunes API e usa o melhor resultado.
//
// Nota (avaliação): não existe hoje uma nota real por faixa vinda de
// backend — a única nota mockada disponível é a da seleção curada
// (js/data/curatedSelections.js). getNotaCurada() tenta casar a faixa
// carregada com essa seleção; sem match, a página simplesmente não
// mostra nenhum badge de nota (em vez de inventar um número).
//
// Letra: a busca do lado da Genius (título/artista -> id da música lá)
// passa por js/services/geniusApi.js, que por sua vez depende de um
// proxy serverless próprio (ver /api/genius-search.js) — a Genius API
// não aceita chamada direta do navegador (exige token + não libera
// CORS). O TEXTO da letra nunca passa pelo nosso código: quem renderiza
// é o widget oficial de embed da própria Genius, carregado a partir de
// genius.com dentro da seção "Letra".

import { buscarMusicaPorId, buscarMusicas } from '../../services/itunesApi.js';
import { buscarLetraGenius, buscarLetraLyricsOvh } from '../../services/geniusApi.js';
import { getNotaCurada } from '../../data/curatedSelections.js';
import { getState, subscribe, toggleSavedItem, isSavedItem, togglePlay } from '../../store/appState.js';

export function initMusicaPage({ header } = {}) {
  const container = document.getElementById('results-container');
  if (!container) {
    console.warn('#results-container não encontrado na página de Música.');
    return;
  }

  container.classList.add('musica-page');
  container.innerHTML = '<p class="musica-page__status">Carregando música...</p>';

  const params = new URLSearchParams(window.location.search);
  const idParam = params.get('id');
  const tituloParam = params.get('titulo');
  const artistaParam = params.get('artista');

  if (!idParam && !(tituloParam && artistaParam)) {
    container.innerHTML = renderErro('Nenhuma música informada.');
    return;
  }

  carregarFaixa({ idParam, tituloParam, artistaParam })
    .then((faixa) => {
      if (!faixa) {
        container.innerHTML = renderErro('Não foi possível encontrar essa música.');
        return;
      }
      renderPagina(container, faixa);
    })
    .catch(() => {
      container.innerHTML = renderErro('Não foi possível carregar essa música agora. Tente novamente.');
    });
}

/**
 * Resolve a faixa a partir dos parâmetros da URL. Prioriza um lookup
 * direto por trackId (mais preciso); cai para busca por nome quando o
 * id não é numérico (item curado) ou o lookup falha/não encontra nada.
 */
async function carregarFaixa({ idParam, tituloParam, artistaParam }) {
  if (idParam && /^\d+$/.test(idParam)) {
    const faixa = await buscarMusicaPorId(idParam);
    if (faixa) return faixa;
  }

  if (artistaParam && tituloParam) {
    const [resultado] = await buscarMusicas(`${artistaParam} ${tituloParam}`, { limit: 1 });
    return resultado ?? null;
  }

  return null;
}

function renderPagina(container, faixa) {
  const notaCurada = getNotaCurada(faixa.artista, faixa.titulo);
  const salvo = isSavedItem(faixa.id);
  const termoBusca = encodeURIComponent(`${faixa.artista} ${faixa.titulo}`);

  container.innerHTML = `
    <div class="musica-hero">
      <div class="musica-hero__cover-wrap">
        ${faixa.capa
          ? `<img class="musica-hero__cover" src="${faixa.capa}" alt="Capa de ${faixa.titulo}" />`
          : `<div class="musica-hero__cover musica-hero__cover--placeholder"><i class="fa-solid fa-compact-disc" aria-hidden="true"></i></div>`}
      </div>
      <div class="musica-hero__info">
        <span class="musica-hero__eyebrow">Música</span>
        <h1 class="musica-hero__title">${faixa.titulo}</h1>
        <span class="musica-hero__artist">${faixa.artista}</span>
        <div class="musica-hero__actions">
          <button class="musica-hero__play" type="button" ${faixa.preview ? '' : 'disabled title="Prévia indisponível"'}>
            <i class="fa-solid fa-play" aria-hidden="true"></i> Prévia
          </button>
          <button class="musica-hero__icon-btn musica-hero__favorite${salvo ? ' is-favorite' : ''}" type="button" aria-label="Favoritar">
            <i class="fa-solid fa-heart" aria-hidden="true"></i>
          </button>
          <button class="musica-hero__icon-btn musica-hero__share" type="button" aria-label="Compartilhar">
            <i class="fa-solid fa-share-nodes" aria-hidden="true"></i>
          </button>
        </div>
        <p class="musica-hero__share-status" hidden></p>
      </div>
      ${notaCurada
        ? `<div class="musica-hero__rating">
             <span class="musica-hero__rating-value"><i class="fa-solid fa-star" aria-hidden="true"></i> ${notaCurada.nota.toFixed(1)}</span>
             <span class="musica-hero__rating-count">nota da seleção Beebop</span>
           </div>`
        : ''}
    </div>

    <div class="musica-content">
      <div class="musica-main">
        <section class="musica-letra">
          <h2 class="musica-section__title">
            Letra
            <button class="musica-letra__traduzir" type="button" disabled title="Tradução ainda não disponível">Traduzir</button>
          </h2>
          <div class="musica-letra__body" data-letra>
            <p class="musica-page__status">Buscando letra na Genius...</p>
          </div>
        </section>
      </div>

      <aside class="musica-sidebar">
        <div class="musica-sidebar__card">
          <h3 class="musica-sidebar__title">Plataformas</h3>
          <div class="musica-plataformas">
            ${faixa.linkItunes ? `<a href="${faixa.linkItunes}" target="_blank" rel="noopener" aria-label="Ouvir na Apple Music"><i class="fa-brands fa-itunes" aria-hidden="true"></i></a>` : ''}
            <a href="https://open.spotify.com/search/${termoBusca}" target="_blank" rel="noopener" aria-label="Buscar no Spotify"><i class="fa-brands fa-spotify" aria-hidden="true"></i></a>
            <a href="https://www.deezer.com/search/${termoBusca}" target="_blank" rel="noopener" aria-label="Buscar no Deezer"><i class="fa-solid fa-music" aria-hidden="true"></i></a>
            <a href="https://soundcloud.com/search?q=${termoBusca}" target="_blank" rel="noopener" aria-label="Buscar no SoundCloud"><i class="fa-brands fa-soundcloud" aria-hidden="true"></i></a>
          </div>
        </div>

        <div class="musica-sidebar__card">
          <h3 class="musica-sidebar__title">Sobre</h3>
          <span class="musica-sidebar__label">Artista</span>
          <span class="musica-sidebar__value">${faixa.artista}</span>
          ${faixa.genero ? `<span class="musica-sidebar__label">Gênero</span><span class="musica-sidebar__value">${faixa.genero}</span>` : ''}
          ${faixa.ano ? `<span class="musica-sidebar__label">Lançamento</span><span class="musica-sidebar__value">${faixa.ano}</span>` : ''}
          ${faixa.album ? `<span class="musica-sidebar__label">Álbum</span><span class="musica-sidebar__value">${faixa.album}</span>` : ''}
        </div>

        <div class="musica-sidebar__card">
          <h3 class="musica-sidebar__title">Avalie esta música</h3>
          <div class="musica-avalie" data-avalie>
            ${[1, 2, 3, 4, 5]
              .map((n) => `<button class="musica-avalie__star" type="button" data-valor="${n}" aria-label="Dar nota ${n}"><i class="fa-regular fa-star" aria-hidden="true"></i></button>`)
              .join('')}
          </div>
          <p class="musica-avalie__status">Sua avaliação ajuda a comunidade Beebop.</p>
        </div>
      </aside>
    </div>
  `;

  attachEventosHero(container, faixa);
  attachEventosAvalie(container);
  carregarLetra(container, faixa);
}

function attachEventosHero(container, faixa) {
  const playBtn = container.querySelector('.musica-hero__play');
  const favBtn = container.querySelector('.musica-hero__favorite');
  const shareBtn = container.querySelector('.musica-hero__share');
  const shareStatus = container.querySelector('.musica-hero__share-status');

  // Mesmo padrão de reprodução real de musicCard.js: <audio> em memória,
  // sincronizado com appState.playingId (equalizer/ícones de outros
  // cards continuam reagindo normalmente a essa mesma faixa).
  const audio = faixa.preview ? new Audio(faixa.preview) : null;
  if (audio) {
    audio.preload = 'none';
    audio.addEventListener('ended', () => {
      if (getState().playingId === faixa.id) togglePlay(faixa.id);
    });
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (audio) togglePlay(faixa.id);
    });

    subscribe((state) => {
      const ativo = audio && state.playingId === faixa.id;
      playBtn.innerHTML = `<i class="fa-solid fa-${ativo ? 'pause' : 'play'}" aria-hidden="true"></i> ${ativo ? 'Pausar' : 'Prévia'}`;

      if (!audio) return;
      if (ativo) {
        audio.currentTime = 0;
        audio.play().catch(() => {
          if (getState().playingId === faixa.id) togglePlay(faixa.id);
        });
      } else {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }

  if (favBtn) {
    favBtn.addEventListener('click', () => {
      toggleSavedItem(faixa);
      favBtn.classList.toggle('is-favorite', isSavedItem(faixa.id));
    });
  }

  if (shareBtn && shareStatus) {
    shareBtn.addEventListener('click', async () => {
      const url = window.location.href;
      try {
        await navigator.clipboard.writeText(url);
        shareStatus.hidden = false;
        shareStatus.textContent = 'Link copiado!';
      } catch {
        shareStatus.hidden = false;
        shareStatus.textContent = url;
      }
    });
  }
}

// Avaliação por estrelas: só interface por enquanto (visual + feedback de
// texto). Não persiste em lugar nenhum — assim como reviewService.js é um
// mock hoje (comentários fixos, só para o álbum "mock-1", conforme o
// contexto do projeto), não existe ainda um serviço real de avaliação por
// FAIXA para gravar essa nota. Fica marcado como pendência abaixo.
function attachEventosAvalie(container) {
  const wrap = container.querySelector('[data-avalie]');
  const status = container.querySelector('.musica-avalie__status');
  if (!wrap || !status) return;

  let notaEscolhida = 0;
  const botoes = wrap.querySelectorAll('.musica-avalie__star');

  function pintarEstrelas(ate) {
    botoes.forEach((btn) => {
      const valor = Number(btn.dataset.valor);
      btn.querySelector('i').className = valor <= ate ? 'fa-solid fa-star' : 'fa-regular fa-star';
    });
  }

  botoes.forEach((btn) => {
    const valor = Number(btn.dataset.valor);

    btn.addEventListener('mouseenter', () => pintarEstrelas(valor));
    btn.addEventListener('mouseleave', () => pintarEstrelas(notaEscolhida));

    btn.addEventListener('click', () => {
      notaEscolhida = valor;
      pintarEstrelas(valor);
      // TODO: persistir a avaliação quando existir um serviço de reviews
      // por faixa (hoje reviewService.js cobre só álbuns, em modo mock).
      status.textContent = `Você avaliou com ${valor} estrela${valor > 1 ? 's' : ''}.`;
    });
  });
}

// Busca o id da faixa na Genius (via proxy — ver js/services/geniusApi.js)
// e, se encontrado, carrega o widget OFICIAL de embed da própria Genius
// para renderizar a letra. O texto da letra nunca passa pelo nosso
// código/estado — só o id público da música na Genius.
async function carregarLetra(container, faixa) {
  const letraBody = container.querySelector('[data-letra]');
  if (!letraBody) return;

  const [genius, lyricsOvh] = await Promise.all([
    buscarLetraGenius(faixa.artista, faixa.titulo),
    buscarLetraLyricsOvh(faixa.artista, faixa.titulo),
  ]);

  const linkGenius = genius
    ? `<a class="musica-letra__genius-link" href="${genius.geniusUrl}" target="_blank" rel="noopener">
         Ver letra completa na Genius <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
       </a>`
    : '';

  if (!lyricsOvh) {
    letraBody.innerHTML = `
      <p class="musica-letra__indisponivel">
        Letra não encontrada.${genius ? ' Você ainda pode tentar na Genius pelo link abaixo.' : ' Isso pode acontecer se a lyrics.ovh não tiver essa faixa, ou se o proxy da Genius (ver js/services/geniusApi.js e /api/genius-search.js) ainda não estiver publicado.'}
      </p>
      ${linkGenius}
    `;
    return;
  }

  // A letra da lyrics.ovh vem como texto puro com \n. Convertemos para
  // <br> depois de escapar HTML — nunca inserimos o texto cru no
  // innerHTML (evita que algum caractere da letra vire markup).
   const letraHtml = escaparHtml(lyricsOvh.letra).replace(/\n/g, '<br>');

  letraBody.innerHTML = `
    <div class="musica-letra__collapse is-collapsed" data-letra-collapse>
      <p class="musica-letra__texto">${letraHtml}</p>
    </div>
    <button class="musica-letra__toggle" type="button" data-letra-toggle hidden aria-label="Ver letra completa">
      <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
    </button>
    ${linkGenius}
  `;

  attachEventosLetraToggle(container);

  function attachEventosLetraToggle(container) {
  const collapseEl = container.querySelector('[data-letra-collapse]');
  const toggleBtn = container.querySelector('[data-letra-toggle]');
  if (!collapseEl || !toggleBtn) return;

  const cabeInteira = collapseEl.scrollHeight <= collapseEl.clientHeight + 4;
  if (cabeInteira) {
    collapseEl.classList.remove('is-collapsed');
    return;
  }

  toggleBtn.hidden = false;

  toggleBtn.addEventListener('click', () => {
    const aindaColapsado = collapseEl.classList.toggle('is-collapsed');
    const expandido = !aindaColapsado;
    toggleBtn.classList.toggle('is-expanded', expandido);
    toggleBtn.setAttribute('aria-label', expandido ? 'Recolher letra' : 'Ver letra completa');
  });
}
}

// Escapa &, <, > e " antes de inserir texto de terceiros no innerHTML.
// A letra vem de uma API externa — mesmo sendo "só texto", é conteúdo
// não confiável e não pode virar markup por acidente.
function escaparHtml(texto) {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderErro(mensagem) {
  return `
    <div class="musica-page__error">
      <p>${mensagem}</p>
      <a href="../Explorar/explorar.html">Voltar para Explorar</a>
    </div>
  `;
}