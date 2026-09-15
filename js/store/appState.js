/**
 * store/appState.js
 *
 * Estado compartilhado da aplicação Beebop. Este arquivo é o resultado da
 * consolidação de duas implementações que evoluíram em paralelo:
 *
 *  - Uma parte (busca, filtros, ordenação, paginação, itens salvos e
 *    usuário autenticado) cobre o fluxo de Início/Explorar.
 *  - Outra parte (reprodução — playingId — e favoritos de álbum) cobre o
 *    fluxo de Início (splash) e Álbum.
 *
 * Como as duas páginas de Álbum/Início esperavam um objeto `appState` com
 * métodos (`appState.togglePlay(id)`, `appState.subscribe(cb)`, etc.),
 * mantemos essa API de objeto — além das funções nomeadas equivalentes —
 * para não exigir reescrever os componentes que já consomem esse formato
 * (musicCard.js, album.js). Ambas as formas operam sobre o mesmo estado
 * único definido abaixo.
 */

import { PAGINATION_CONFIG, SEARCH_CATEGORIES, SORT_OPTIONS, STORAGE_KEYS } from '../utils/constants.js';
import { calculateTotalPages, clampPage } from '../utils/pagination.js';
import { deepClone } from '../utils/helpers.js';

/** Estado inicial padrão da aplicação. */
function createInitialState() {
  return {
    // --- busca / listagem (Início, Explorar) ---
    searchTerm: '',
    filters: {
      category: SEARCH_CATEGORIES[0].id, // 'all'
    },
    sortBy: SORT_OPTIONS[0].id, // 'relevance'
    currentPage: PAGINATION_CONFIG.DEFAULT_PAGE,
    itemsPerPage: PAGINATION_CONFIG.ITEMS_PER_PAGE,
    results: [],
    totalItems: 0,
    totalPages: 1,
    loading: false,
    error: null,
    savedItems: loadFromStorage(STORAGE_KEYS.SAVED_ITEMS, []),
    user: loadFromStorage(STORAGE_KEYS.USER, null),

    // --- reprodução / favoritos (Início splash, Álbum) ---
    playingId: null,
  };
}

/** Lê um valor persistido do localStorage com fallback seguro. */
function loadFromStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/** Persiste um valor no localStorage, ignorando falhas silenciosamente. */
function saveToStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Armazenamento indisponível (ex: modo privado); estado em memória segue válido.
  }
}

let state = createInitialState();
const listeners = new Set();

/** Notifica todos os inscritos com uma cópia imutável do estado atual. */
function notify() {
  const snapshot = getState();
  listeners.forEach((listener) => listener(snapshot));
}

/**
 * Retorna uma cópia do estado atual (evita mutação externa direta).
 * @returns {object} Cópia profunda do estado.
 */
export function getState() {
  return deepClone(state);
}

/**
 * Inscreve um listener para ser notificado imediatamente e a cada mudança.
 * @param {(state: object) => void} listener
 * @returns {() => void} Função para cancelar a inscrição.
 */
export function subscribe(listener) {
  listeners.add(listener);
  listener(getState());
  return () => listeners.delete(listener);
}

/**
 * Atualiza parcialmente o estado (shallow merge no nível raiz) e notifica os inscritos.
 * @param {object} partialState
 */
function setState(partialState) {
  state = { ...state, ...partialState };
  notify();
}

/* ---------------------------------------------------------------------- */
/* Busca / listagem                                                        */
/* ---------------------------------------------------------------------- */

/** Define o termo de busca atual e reinicia a paginação. */
export function setSearchTerm(term) {
  setState({ searchTerm: term, currentPage: PAGINATION_CONFIG.DEFAULT_PAGE });
}

/** Define/atualiza os filtros ativos (ex: categoria) e reinicia a paginação. */
export function setFilter(key, value) {
  setState({ filters: { ...state.filters, [key]: value }, currentPage: PAGINATION_CONFIG.DEFAULT_PAGE });
}

/** Define o critério de ordenação e reinicia a paginação. */
export function setSort(sortBy) {
  setState({ sortBy, currentPage: PAGINATION_CONFIG.DEFAULT_PAGE });
}

/** Define a página atual, validando-a contra o total de páginas disponível. */
export function setPage(page) {
  setState({ currentPage: clampPage(page, state.totalPages) });
}

/**
 * Define os resultados de uma busca/listagem e recalcula a paginação.
 * @param {Array} results - Itens normalizados vindos de services/itunesApi.js.
 * @param {number} [totalItems] - Total de itens encontrados (default: results.length).
 */
export function setResults(results, totalItems = results.length) {
  const totalPages = calculateTotalPages(totalItems, state.itemsPerPage);
  setState({
    results,
    totalItems,
    totalPages,
    currentPage: clampPage(state.currentPage, totalPages),
    loading: false,
    error: null,
  });
}

/** Sinaliza início/fim de carregamento (ex: enquanto aguarda a iTunes Search API). */
export function setLoading(loading) {
  setState({ loading, error: loading ? null : state.error });
}

/** Registra uma mensagem de erro e encerra o carregamento. */
export function setError(error) {
  setState({ error, loading: false });
}

/** Restaura busca, filtros, ordenação e resultados ao estado inicial. */
export function resetSearchState() {
  const { savedItems, user, playingId } = state;
  setState({
    searchTerm: '',
    filters: createInitialState().filters,
    sortBy: SORT_OPTIONS[0].id,
    currentPage: PAGINATION_CONFIG.DEFAULT_PAGE,
    results: [],
    totalItems: 0,
    totalPages: 1,
    loading: false,
    error: null,
    savedItems,
    user,
    playingId,
  });
}

/**
 * Adiciona ou remove um item salvo (Salvos/Favoritos), persistindo em localStorage.
 * Usado tanto para faixas (Início/Explorar) quanto para álbuns (Álbum).
 * @param {{id: string|number}} item - Item com identificador único.
 */
export function toggleSavedItem(item) {
  const exists = state.savedItems.some((saved) => saved.id === item.id);
  const savedItems = exists
    ? state.savedItems.filter((saved) => saved.id !== item.id)
    : [...state.savedItems, item];

  saveToStorage(STORAGE_KEYS.SAVED_ITEMS, savedItems);
  setState({ savedItems });
}

/** Indica se um item (faixa ou álbum) já está salvo/favoritado. */
export function isSavedItem(id) {
  return state.savedItems.some((saved) => String(saved.id) === String(id));
}

/**
 * Define o usuário autenticado (Login/Cadastro) e persiste a sessão localmente.
 * @param {object|null} user - Dados do usuário, ou null para logout.
 */
export function setUser(user) {
  saveToStorage(STORAGE_KEYS.USER, user);
  setState({ user });
}

/* ---------------------------------------------------------------------- */
/* Reprodução (equalizador visual dos cards / página de Álbum)             */
/* ---------------------------------------------------------------------- */

/**
 * Alterna o estado de "reprodução" de uma faixa. Clicar na faixa já ativa
 * pausa; clicar em outra troca o card ativo. Não há elemento <audio> real
 * conectado por padrão — quem precisa de áudio de verdade (ver
 * pages/Album/album.js) observa este mesmo campo via subscribe().
 */
export function togglePlay(id) {
  setState({ playingId: state.playingId === id ? null : id });
}

/* ---------------------------------------------------------------------- */
/* Favoritos (Álbum) — reaproveita savedItems/toggleSavedItem acima        */
/* ---------------------------------------------------------------------- */

/** Alterna o favorito de um álbum (mesmo mecanismo de toggleSavedItem). */
export function toggleFavorite(album) {
  toggleSavedItem({ ...album, tipo: album.tipo ?? 'album' });
}

/** Indica se um álbum (pelo id/externalId) está favoritado. */
export function isFavorite(id) {
  return isSavedItem(id);
}

/* ---------------------------------------------------------------------- */
/* API em formato de objeto — compatibilidade com páginas/componentes      */
/* escritos como `import { appState } from '.../appState.js'` e chamadas   */
/* `appState.metodo(...)` (Início splash, musicCard.js, Álbum).            */
/* ---------------------------------------------------------------------- */

export const appState = {
  getState,
  subscribe,
  setSearchTerm,
  setFilter,
  setSort,
  setPage,
  setResults,
  setLoading,
  setError,
  resetSearchState,
  toggleSavedItem,
  isSavedItem,
  setUser,
  togglePlay,
  toggleFavorite,
  isFavorite,
  get playingId() {
    return state.playingId;
  },
};
