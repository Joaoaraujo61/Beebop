/**
 * utils/constants.js
 * Concentra constantes reutilizáveis do Beebop: configuração da iTunes Search API,
 * categorias, opções de ordenação, chaves de armazenamento e limites de validação.
 * Nenhuma lógica de negócio deve residir aqui — apenas valores fixos.
 */

/** Configuração base para consumo da iTunes Search API (services/itunesApi.js). */
export const API_CONFIG = Object.freeze({
  BASE_URL: 'https://itunes.apple.com',
  SEARCH_ENDPOINT: '/search',
  LOOKUP_ENDPOINT: '/lookup',
  COUNTRY: 'BR',
  DEFAULT_LIMIT: 50,
});

/** Tipos de entidade suportados pela API, usados nos filtros de busca. */
export const ENTITY_TYPES = Object.freeze({
  SONG: 'song',
  ALBUM: 'album',
  ARTIST: 'musicArtist',
});

/** Categorias exibidas nos filtros de Explorar/Busca. */
export const SEARCH_CATEGORIES = Object.freeze([
  { id: 'all', label: 'Tudo', entity: null },
  { id: 'song', label: 'Músicas', entity: ENTITY_TYPES.SONG },
  { id: 'album', label: 'Álbuns', entity: ENTITY_TYPES.ALBUM },
  { id: 'artist', label: 'Artistas', entity: ENTITY_TYPES.ARTIST },
]);

/** Opções de ordenação disponíveis nas listagens de resultados. */
export const SORT_OPTIONS = Object.freeze([
  { id: 'relevance', label: 'Relevância' },
  { id: 'name-asc', label: 'Nome (A-Z)' },
  { id: 'name-desc', label: 'Nome (Z-A)' },
  { id: 'date-desc', label: 'Mais recentes' },
  { id: 'date-asc', label: 'Mais antigos' },
]);

/** Configuração padrão de paginação (ver utils/pagination.js). */
export const PAGINATION_CONFIG = Object.freeze({
  ITEMS_PER_PAGE: 20,
  MAX_VISIBLE_PAGES: 5,
  DEFAULT_PAGE: 1,
});

/** Chaves usadas para persistência em localStorage. */
export const STORAGE_KEYS = Object.freeze({
  SAVED_ITEMS: 'beebop_saved_items',
  USER: 'beebop_user',
  PLAYLISTS: 'beebop_playlists',
  SEARCH_HISTORY: 'beebop_search_history',
});

/** Limites usados em utils/validators.js. */
export const VALIDATION_LIMITS = Object.freeze({
  MIN_SEARCH_LENGTH: 2,
  MAX_SEARCH_LENGTH: 100,
  MIN_PASSWORD_LENGTH: 8,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
});

/** Capa neutra usada pelos cards (Track/Album) quando o item não possui artwork real. */
export const PLACEHOLDER_COVER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23222'/%3E%3Ctext x='50%25' y='55%25' font-size='110' fill='%23555' text-anchor='middle' dominant-baseline='middle'%3E%E2%99%AA%3C/text%3E%3C/svg%3E";

/** Rótulos de páginas da aplicação, úteis para navegação/breadcrumbs. */
export const ROUTES = Object.freeze({
  HOME: 'inicio',
  EXPLORE: 'explorar',
  SONG: 'musica',
  ALBUM: 'album',
  ARTIST: 'artista',
  PLAYLIST: 'playlist',
  PROFILE: 'perfil',
  SAVED: 'salvos',
  LOGIN: 'login',
  REGISTER: 'cadastro',
});