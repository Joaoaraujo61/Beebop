// js/pages/Explorar/explorar.js

import { buscarMusicas, buscarAlbuns, buscarArtistas, buscarTudo } from '../../services/itunesApi.js';
import {
  getState,
  setSearchTerm,
  setFilter,
  setLoading,
  setError,
  toggleSavedItem
} from '../../store/appState.js';
import { debounce } from '../../utils/helpers.js';
import { validateSearchTerm, sanitizeInput } from '../../utils/validators.js';
import { paginate, getPaginationInfo, getPageRange } from '../../utils/pagination.js';
import { renderTrackCard, attachTrackCardEvents } from '../../components/trackCard.js';
import { renderAlbumCard, attachAlbumCardEvents } from '../../components/albumCard.js';
import { renderArtistCard } from '../../components/artistCard.js';
import { getMusicasParaDescoberta, getAlbunsParaDescoberta } from '../../data/curatedSelections.js';

const generos = [
  'Todos os gêneros', 'Pop', 'Rock', 'Hip-Hop', 'K-pop', 'Jazz', 'Indie', 'MPB'
];

const ITENS_POR_PAGINA = 6;
const ITENS_MUSICAS_DESCOBERTA = 6;
const ITENS_ALBUNS_DESCOBERTA = 10;

function renderGeneroTabs(generoAtivo) {
  return generos
    .map((genero) => `
      <button class="explorar_chip${genero === generoAtivo ? ' explorar_chip--active' : ''}" data-genero="${genero}">
        ${genero}
      </button>`)
    .join('');
}

function renderPagerMarkup(secao, totalItems, currentPage, itemsPerPage) {
  const totalPages = getPaginationInfo(totalItems, currentPage, itemsPerPage).totalPages;
  if (totalPages <= 1) return '';

  const range = getPageRange(currentPage, totalPages);
  const botoes = range
    .map((pagina) => `
      <button class="explorar_pager_btn${pagina === currentPage ? ' explorar_pager_btn--active' : ''}"
        data-secao="${secao}" data-pagina="${pagina}">${pagina}</button>`)
    .join('');

  return `<div class="explorar_pager" data-pager="${secao}">${botoes}</div>`;
}

function buildShellMarkup(state) {
  const termoAtual = state.searchTerm ?? '';
  const categoriaAtiva = state.filters.category ?? 'all';
  const generoAtivo = state.filters.genero ?? generos[0];

  return `
    <div class="explorar_intro">
      <h1>Explorar</h1>
      <p>Encontre qualquer faixa do catálogo · por som, por nome ou por verso</p>

      <div class="explorar_search">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" placeholder="Busque músicas, artistas, álbuns ou letras..." value="${termoAtual}" />
      </div>
      <p class="explorar_search_error" hidden></p>
      <p class="explorar_status" hidden></p>

      <div class="explorar_tabs">
        <button class="explorar_tab${categoriaAtiva === 'all' ? ' explorar_tab--active' : ''}" data-tab="all">Tudo</button>
        <button class="explorar_tab${categoriaAtiva === 'song' ? ' explorar_tab--active' : ''}" data-tab="song">Músicas</button>
        <button class="explorar_tab${categoriaAtiva === 'album' ? ' explorar_tab--active' : ''}" data-tab="album">Álbuns</button>
        <button class="explorar_tab${categoriaAtiva === 'artist' ? ' explorar_tab--active' : ''}" data-tab="artist">Artistas</button>
      </div>

      <div class="explorar_genres">
        ${renderGeneroTabs(generoAtivo)}
      </div>
    </div>

    <div class="explorar_section" data-section="musicas">
      <h2>Músicas em Alta</h2>
      <div class="track_grid"></div>
    </div>

    <div class="explorar_section" data-section="albuns">
      <h2>Álbuns</h2>
      <div class="album_grid"></div>
    </div>

    <div class="explorar_section" data-section="artistas" hidden>
      <h2>Artistas</h2>
      <div class="artist_grid"></div>
    </div>
  `;
}

export function initExplorarPage({ header } = {}) {
  const container = document.getElementById('results-container');

  if (!container) {
    console.warn('#results-container não encontrado na página de Explorar.');
    return;
  }

  // Resultados completos desta página (antes do filtro de gênero e da paginação).
  // Ficam locais porque combinam três formatos diferentes (músicas/álbuns/artistas),
  // enquanto store/appState.js guarda o que é realmente compartilhado entre páginas:
  // termo de busca, categoria/gênero ativos, loading e erro.
  let resultadoMusicas = [];
  let resultadoAlbuns = [];
  let resultadoArtistas = [];
  let paginaMusicas = 1;
  let paginaAlbuns = 1;
  let modoDescoberta = true; // true = mostrando a seleção curada (sem busca ativa)

  container.classList.add('explorar');
  container.innerHTML = buildShellMarkup(getState());

  const el = {
    tabs: container.querySelectorAll('.explorar_tab'),
    chips: container.querySelectorAll('.explorar_chip'),
    searchInput: container.querySelector('.explorar_search input'),
    searchError: container.querySelector('.explorar_search_error'),
    status: container.querySelector('.explorar_status'),
    musicasSection: container.querySelector('[data-section="musicas"]'),
    albunsSection: container.querySelector('[data-section="albuns"]'),
    artistasSection: container.querySelector('[data-section="artistas"]'),
    musicasGrid: container.querySelector('.track_grid'),
    albunsGrid: container.querySelector('.album_grid'),
    artistasGrid: container.querySelector('.artist_grid'),
  };

  function mostrarStatus(texto) {
    el.status.hidden = !texto;
    el.status.textContent = texto ?? '';
  }

  function removerPager(secao) {
    const pager = container.querySelector(`[data-pager="${secao}"]`);
    if (pager) pager.remove();
  }

  function generoFiltrado(lista) {
    const genero = getState().filters.genero;
    if (!genero || genero === generos[0]) return lista;
    return lista.filter((item) => item.genero === genero);
  }

  // --- Modo descoberta: sem busca ativa, mostra a seleção curada (Top charts + Surpresas) ---
  async function renderDescoberta() {
    modoDescoberta = true;  
    mostrarStatus('Carregando sugestões...');

    const musicas = await getMusicasParaDescoberta(ITENS_MUSICAS_DESCOBERTA);
    const albuns = await getAlbunsParaDescoberta(ITENS_ALBUNS_DESCOBERTA);
    const savedIds = new Set(getState().savedItems.map((item) => String(item.id)));

    el.musicasSection.querySelector('h2').textContent = 'Músicas em Alta';
    el.albunsSection.querySelector('h2').textContent = 'Álbuns';
    el.musicasSection.hidden = false;
    el.albunsSection.hidden = false;
    el.artistasSection.hidden = true;

    el.musicasGrid.innerHTML = musicas.map((m) => renderTrackCard(m, { saved: savedIds.has(String(m.id)) })).join('');
    el.albunsGrid.innerHTML = albuns.map((a) => renderAlbumCard(a, { saved: savedIds.has(String(a.id)) })).join('');

    removerPager('musicas');
    removerPager('albuns');

    attachTrackCardEvents(el.musicasGrid, musicas, toggleSavedItem);
    attachAlbumCardEvents(el.albunsGrid, albuns, toggleSavedItem);

    mostrarStatus(null);
  }

  // --- Modo busca: consulta a iTunes API de acordo com a categoria (tab) ativa ---
  async function executarBusca(termoBruto) {
    const termo = sanitizeInput(termoBruto);
    const { valid, message } = validateSearchTerm(termo);
    el.searchError.hidden = valid;
    el.searchError.textContent = valid ? '' : message;
    if (!valid) return;

    modoDescoberta = false;
    setSearchTerm(termo);
    setLoading(true);
    mostrarStatus('Buscando...');

    const categoria = getState().filters.category ?? 'all';

    try {
      if (categoria === 'song') {
        resultadoMusicas = await buscarMusicas(termo);
        resultadoAlbuns = [];
        resultadoArtistas = [];
      } else if (categoria === 'album') {
        resultadoAlbuns = await buscarAlbuns(termo);
        resultadoMusicas = [];
        resultadoArtistas = [];
      } else if (categoria === 'artist') {
        resultadoArtistas = await buscarArtistas(termo);
        resultadoMusicas = [];
        resultadoAlbuns = [];
      } else {
        const combinado = await buscarTudo(termo, { limit: 12 });
        resultadoMusicas = combinado.musicas;
        resultadoAlbuns = combinado.albuns;
        resultadoArtistas = combinado.artistas;
      }

      paginaMusicas = 1;
      paginaAlbuns = 1;
      setLoading(false);
      mostrarStatus(null);
      renderSecoesBusca();
    } catch (erro) {
      setError(erro.message);
      mostrarStatus('Não foi possível buscar agora. Tente novamente.');
    }
  }

  const executarBuscaDebounced = debounce(executarBusca, 400);

  function renderSecoesBusca() {
    const categoria = getState().filters.category ?? 'all';
    const mostrarMusicas = categoria === 'all' || categoria === 'song';
    const mostrarAlbuns = categoria === 'all' || categoria === 'album';
    const mostrarArtistas = categoria === 'all' || categoria === 'artist';

    el.musicasSection.querySelector('h2').textContent = 'Músicas';
    el.albunsSection.querySelector('h2').textContent = 'Álbuns';

    el.musicasSection.hidden = !mostrarMusicas || resultadoMusicas.length === 0;
    el.albunsSection.hidden = !mostrarAlbuns || resultadoAlbuns.length === 0;
    el.artistasSection.hidden = !mostrarArtistas || resultadoArtistas.length === 0;

    renderMusicas();
    renderAlbuns();
    renderArtistas();

    const nadaEncontrado =
      resultadoMusicas.length === 0 && resultadoAlbuns.length === 0 && resultadoArtistas.length === 0;
    mostrarStatus(nadaEncontrado ? `Nenhum resultado para "${getState().searchTerm}".` : null);
  }

  function renderMusicas() {
    const filtradas = generoFiltrado(resultadoMusicas);
    const pagina = paginate(filtradas, paginaMusicas, ITENS_POR_PAGINA);
    const savedIds = new Set(getState().savedItems.map((item) => String(item.id)));

    el.musicasGrid.innerHTML = pagina.map((track) => renderTrackCard(track, { saved: savedIds.has(String(track.id)) })).join('');

    removerPager('musicas');
    el.musicasSection.insertAdjacentHTML(
      'beforeend',
      renderPagerMarkup('musicas', filtradas.length, paginaMusicas, ITENS_POR_PAGINA)
    );

    attachTrackCardEvents(el.musicasGrid, filtradas, toggleSavedItem);
    attachPagerHandlers();
  }

  function renderAlbuns() {
    const filtrados = generoFiltrado(resultadoAlbuns);
    const pagina = paginate(filtrados, paginaAlbuns, ITENS_POR_PAGINA);
    const savedIds = new Set(getState().savedItems.map((item) => String(item.id)));

    el.albunsGrid.innerHTML = pagina.map((album) => renderAlbumCard(album, { saved: savedIds.has(String(album.id)) })).join('');

    removerPager('albuns');
    el.albunsSection.insertAdjacentHTML(
      'beforeend',
      renderPagerMarkup('albuns', filtrados.length, paginaAlbuns, ITENS_POR_PAGINA)
    );

    attachAlbumCardEvents(el.albunsGrid, filtrados, toggleSavedItem);
    attachPagerHandlers();
  }

  function renderArtistas() {
    el.artistasGrid.innerHTML = resultadoArtistas.map(renderArtistCard).join('');
  }

  // Liga os botões de página de cada grid (musicas/albuns) sem refazer a requisição
  function attachPagerHandlers() {
    container.querySelectorAll('.explorar_pager_btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pagina = Number(btn.dataset.pagina);
        if (btn.dataset.secao === 'musicas') {
          paginaMusicas = pagina;
          renderMusicas();
        } else {
          paginaAlbuns = pagina;
          renderAlbuns();
        }
      });
    });
  }

  function attachEvents() {
    el.tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        el.tabs.forEach((t) => t.classList.remove('explorar_tab--active'));
        tab.classList.add('explorar_tab--active');
        setFilter('category', tab.dataset.tab);

        const termo = getState().searchTerm;
        if (termo) executarBusca(termo);
      });
    });

    el.chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        el.chips.forEach((c) => c.classList.remove('explorar_chip--active'));
        chip.classList.add('explorar_chip--active');
        setFilter('genero', chip.dataset.genero);
        if (!modoDescoberta) {
          paginaMusicas = 1;
          paginaAlbuns = 1;
          renderSecoesBusca();
        }
      });
    });

    el.searchInput.addEventListener('input', (event) => {
      const termo = event.target.value;
      if (termo.trim().length === 0) {
        el.searchError.hidden = true;
        setSearchTerm('');
        renderDescoberta();
        return;
      }
      executarBuscaDebounced(termo);
    });
  }

  attachEvents();

  // Se já existe um termo salvo no store (ex: veio do header do Início), busca de
  // imediato; caso contrário, mostra a seleção curada (Top charts + Surpresas).
  const termoInicial = getState().searchTerm;
  if (termoInicial) {
    executarBusca(termoInicial);
  } else {
    renderDescoberta();
  }
}