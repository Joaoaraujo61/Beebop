// js/pages/Explorar/explorar.js

import {
  buscarMusicas,
  buscarAlbuns,
  buscarArtistas,
  buscarTudo,
  buscarGenerosMusicais,
} from '../../services/itunesApi.js';
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
import { renderArtistCard, attachArtistCardEvents } from '../../components/artistCard.js';
import {
  getMusicasParaDescoberta,
  getMusicasPorGenero,
  getAlbunsParaDescoberta,
  getArtistasParaDescoberta,
} from '../../data/curatedSelections.js';

// Lista estática só como fallback: usada se buscarGenerosMusicais() falhar
// (rede indisponível, ou o endpoint de gêneros da Apple não liberar CORS —
// ver o comentário em services/itunesApi.js). Assim que a API responde, a
// lista real assume o lugar desta.
const GENEROS_FALLBACK = [
  'Todos os gêneros', 'Pop', 'Rock', 'Hip-Hop', 'K-pop', 'Jazz', 'Indie', 'MPB'
];

const ITENS_POR_PAGINA = 6;
const ITENS_MUSICAS_DESCOBERTA = 6;
const ITENS_ALBUNS_DESCOBERTA = 10;
const ITENS_ARTISTAS_DESCOBERTA = 8;

function renderGeneroTabs(generos, generoAtivo) {
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

function buildShellMarkup(state, generos) {
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
        ${renderGeneroTabs(generos, generoAtivo)}
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

    <div class="explorar_section" data-section="artistas">
      <h2>Artistas</h2>
      <div class="artist_grid"></div>
    </div>
  `;
}

// Comparação de gênero tolerante a maiúsculas e acentos
// ("R&B/Soul" === "r&b/soul", "Eletrônica" === "eletronica").
function normalizarGenero(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function renderVazio(texto) {
  return `<p class="explorar_vazio">${texto}</p>`;
}

export function initExplorarPage({ header } = {}) {
  const container = document.getElementById('results-container');

  if (!container) {
    console.warn('#results-container não encontrado na página de Explorar.');
    return;
  }

  // Gêneros: começa com o fallback estático (a tela não pode ficar sem
  // chips nenhum enquanto a API responde) e é substituído por
  // carregarGeneros() assim que (e se) a lista real chegar.
  let generos = [...GENEROS_FALLBACK];

  // Resultados completos desta página (antes do filtro de gênero e da paginação).
  // Ficam locais porque combinam formatos diferentes (músicas/álbuns/artistas),
  // enquanto store/appState.js guarda o que é realmente compartilhado entre páginas:
  // termo de busca, categoria/gênero ativos, loading e erro.
  let resultadoMusicas = [];
  let resultadoAlbuns = [];
  let resultadoArtistas = [];
  let paginaMusicas = 1;
  let paginaAlbuns = 1;
  let modoDescoberta = true; // true = mostrando a seleção curada (sem busca ativa)

  // Seleção curada completa (antes do filtro de gênero). Guardada pra que
  // trocar o chip de gênero em modo descoberta só refiltre, sem nova requisição.
  let descobertaMusicas = [];
  let descobertaAlbuns = [];
  let descobertaArtistas = [];
  // Músicas curadas do gênero escolhido no chip (ver getMusicasPorGenero);
  // vazio quando o filtro está em "Todos os gêneros".
  let descobertaMusicasGenero = [];

  container.classList.add('explorar');
  container.innerHTML = buildShellMarkup(getState(), generos);

  const el = {};

  function atualizarReferenciasDom() {
    el.tabs = container.querySelectorAll('.explorar_tab');
    el.chips = container.querySelectorAll('.explorar_chip');
    el.searchInput = container.querySelector('.explorar_search input');
    el.searchError = container.querySelector('.explorar_search_error');
    el.status = container.querySelector('.explorar_status');
    el.musicasSection = container.querySelector('[data-section="musicas"]');
    el.albunsSection = container.querySelector('[data-section="albuns"]');
    el.artistasSection = container.querySelector('[data-section="artistas"]');
    el.musicasGrid = container.querySelector('.track_grid');
    el.albunsGrid = container.querySelector('.album_grid');
    el.artistasGrid = container.querySelector('.artist_grid');
  }

  atualizarReferenciasDom();

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
    const alvo = normalizarGenero(genero);
    return lista.filter((item) => normalizarGenero(item.genero) === alvo);
  }

  function generoAtivoEhTodos() {
    const genero = getState().filters.genero;
    return !genero || genero === generos[0];
  }

  function unicosPorId(lista) {
    const vistos = new Set();
    return lista.filter((item) => {
      const chave = String(item.id);
      if (vistos.has(chave)) return false;
      vistos.add(chave);
      return true;
    });
  }

  async function carregarMusicasDoGenero() {
    descobertaMusicasGenero = generoAtivoEhTodos()
      ? []
      : await getMusicasPorGenero(getState().filters.genero, ITENS_MUSICAS_DESCOBERTA);
  }

  // Em modo descoberta (sem busca ativa) não há requisição nova ao trocar
  // de aba — só decide quais das três seções já carregadas ficam visíveis.
  function aplicarVisibilidadeDescoberta() {
    const categoria = getState().filters.category ?? 'all';
    el.musicasSection.hidden = !(categoria === 'all' || categoria === 'song');
    el.albunsSection.hidden = !(categoria === 'all' || categoria === 'album');
    el.artistasSection.hidden = !(categoria === 'all' || categoria === 'artist');
  }

  // --- Modo descoberta: sem busca ativa, mostra a seleção curada (Top charts + Surpresas) ---
  async function renderDescoberta() {
    modoDescoberta = true;
    mostrarStatus('Carregando sugestões...');

    [descobertaMusicas, descobertaAlbuns, descobertaArtistas] = await Promise.all([
      getMusicasParaDescoberta(ITENS_MUSICAS_DESCOBERTA),
      getAlbunsParaDescoberta(ITENS_ALBUNS_DESCOBERTA),
      getArtistasParaDescoberta(ITENS_ARTISTAS_DESCOBERTA),
    ]);

    await carregarMusicasDoGenero();
    desenharDescoberta();
    mostrarStatus(null);
  }

  // Desenha a seleção curada já carregada aplicando o filtro de gênero ativo.
  function desenharDescoberta() {
    const savedIds = new Set(getState().savedItems.map((item) => String(item.id)));
    const musicas = unicosPorId([...descobertaMusicasGenero, ...generoFiltrado(descobertaMusicas)]);
    const albuns = generoFiltrado(descobertaAlbuns);
    const artistas = generoFiltrado(descobertaArtistas);

    el.musicasSection.querySelector('h2').textContent = 'Músicas em Alta';
    el.albunsSection.querySelector('h2').textContent = 'Álbuns';
    el.artistasSection.querySelector('h2').textContent = 'Artistas';

    el.musicasGrid.innerHTML = musicas.length
      ? musicas.map((m) => renderTrackCard(m, { saved: savedIds.has(String(m.id)) })).join('')
      : renderVazio('Nenhuma música deste gênero nas sugestões.');
    el.albunsGrid.innerHTML = albuns.length
      ? albuns.map((a) => renderAlbumCard(a, { saved: savedIds.has(String(a.id)) })).join('')
      : renderVazio('Nenhum álbum deste gênero nas sugestões.');
    el.artistasGrid.innerHTML = artistas.length
      ? artistas.map(renderArtistCard).join('')
      : renderVazio('Nenhum artista deste gênero nas sugestões.');

    removerPager('musicas');
    removerPager('albuns');

    attachTrackCardEvents(el.musicasGrid, musicas, toggleSavedItem);
    attachAlbumCardEvents(el.albunsGrid, albuns, toggleSavedItem);
    attachArtistCardEvents(el.artistasGrid, artistas);

    aplicarVisibilidadeDescoberta();
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
    el.artistasSection.querySelector('h2').textContent = 'Artistas';

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

    el.musicasGrid.innerHTML = pagina.length
      ? pagina.map((track) => renderTrackCard(track, { saved: savedIds.has(String(track.id)) })).join('')
      : renderVazio('Nenhuma música deste gênero.');

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

    el.albunsGrid.innerHTML = pagina.length
      ? pagina.map((album) => renderAlbumCard(album, { saved: savedIds.has(String(album.id)) })).join('')
      : renderVazio('Nenhum álbum deste gênero.');

    removerPager('albuns');
    el.albunsSection.insertAdjacentHTML(
      'beforeend',
      renderPagerMarkup('albuns', filtrados.length, paginaAlbuns, ITENS_POR_PAGINA)
    );

    attachAlbumCardEvents(el.albunsGrid, filtrados, toggleSavedItem);
    attachPagerHandlers();
  }

  function renderArtistas() {
    const filtrados = generoFiltrado(resultadoArtistas);

    el.artistasGrid.innerHTML = filtrados.length
      ? filtrados.map(renderArtistCard).join('')
      : renderVazio('Nenhum artista deste gênero.');

    attachArtistCardEvents(el.artistasGrid, filtrados);
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

  function attachTabEvents() {
    el.tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        el.tabs.forEach((t) => t.classList.remove('explorar_tab--active'));
        tab.classList.add('explorar_tab--active');
        setFilter('category', tab.dataset.tab);

        const termo = getState().searchTerm;
        if (termo) {
          executarBusca(termo);
        } else {
          // Sem busca ativa: as três seções já foram carregadas pela
          // descoberta, só muda o que fica visível — sem nova requisição.
          aplicarVisibilidadeDescoberta();
        }
      });
    });
  }

  function attachChipEvents() {
    el.chips.forEach((chip) => {
      chip.addEventListener('click', async () => {
        el.chips.forEach((c) => c.classList.remove('explorar_chip--active'));
        chip.classList.add('explorar_chip--active');
        setFilter('genero', chip.dataset.genero);

        paginaMusicas = 1;
        paginaAlbuns = 1;

        // O filtro vale nos dois modos: em descoberta refiltra a seleção
        // curada já carregada (e traz as músicas curadas do gênero); em
        // busca refiltra os resultados da consulta.
        if (modoDescoberta) {
          await carregarMusicasDoGenero();
          desenharDescoberta();
        } else {
          renderSecoesBusca();
        }
      });
    });
  }

  function attachSearchEvents() {
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

  // Busca a lista real de gêneros na iTunes API (ver
  // services/itunesApi.js) e substitui o fallback estático nos chips —
  // sem perder o gênero já selecionado, se ele também existir na lista
  // nova. Falha (rede, CORS do endpoint de gêneros) é silenciosa: o
  // fallback estático continua funcionando normalmente.
  async function carregarGeneros() {
    try {
      const lista = await buscarGenerosMusicais();
      if (!lista.length) return;

      generos = ['Todos os gêneros', ...lista];
      const generoAtivo = getState().filters.genero ?? generos[0];
      const genresContainer = container.querySelector('.explorar_genres');
      genresContainer.innerHTML = renderGeneroTabs(generos, generos.includes(generoAtivo) ? generoAtivo : generos[0]);

      el.chips = container.querySelectorAll('.explorar_chip');
      attachChipEvents();
    } catch {
      // mantém GENEROS_FALLBACK — Explorar segue funcional sem a lista real.
    }
  }

  attachTabEvents();
  attachChipEvents();
  attachSearchEvents();
  carregarGeneros();

  // Se já existe um termo salvo no store (ex: veio do header do Início), busca de
  // imediato; caso contrário, mostra a seleção curada (Top charts + Surpresas).
  const termoInicial = getState().searchTerm;
  if (termoInicial) {
    executarBusca(termoInicial);
  } else {
    renderDescoberta();
  }
}