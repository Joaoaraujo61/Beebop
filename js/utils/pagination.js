/**
 * utils/pagination.js
 * Concentra a lógica de paginação: cálculo do número de páginas, divisão dos
 * resultados por página e controle dos índices de exibição. Usado por
 * store/appState.js e pelos componentes de listagem/paginação.
 */

import { PAGINATION_CONFIG } from './constants.js';

/**
 * Calcula o número total de páginas a partir da quantidade de itens.
 * @param {number} totalItems - Total de resultados encontrados.
 * @param {number} [itemsPerPage=PAGINATION_CONFIG.ITEMS_PER_PAGE]
 * @returns {number} Total de páginas (mínimo 1).
 */
export function calculateTotalPages(totalItems, itemsPerPage = PAGINATION_CONFIG.ITEMS_PER_PAGE) {
  if (!Number.isFinite(totalItems) || totalItems <= 0) return 1;
  return Math.max(1, Math.ceil(totalItems / itemsPerPage));
}

/**
 * Garante que um número de página esteja dentro do intervalo válido.
 * @param {number} page - Página desejada.
 * @param {number} totalPages - Total de páginas disponíveis.
 * @returns {number} Página validada, entre 1 e totalPages.
 */
export function clampPage(page, totalPages) {
  if (!Number.isFinite(page)) return PAGINATION_CONFIG.DEFAULT_PAGE;
  return Math.min(Math.max(page, 1), Math.max(totalPages, 1));
}

/**
 * Retorna a fatia de itens correspondente à página atual.
 * @param {Array} items - Lista completa de resultados.
 * @param {number} currentPage - Página atual (1-based).
 * @param {number} [itemsPerPage=PAGINATION_CONFIG.ITEMS_PER_PAGE]
 * @returns {Array} Subconjunto de itens da página solicitada.
 */
export function paginate(items, currentPage, itemsPerPage = PAGINATION_CONFIG.ITEMS_PER_PAGE) {
  const totalPages = calculateTotalPages(items.length, itemsPerPage);
  const page = clampPage(currentPage, totalPages);
  const startIndex = (page - 1) * itemsPerPage;
  return items.slice(startIndex, startIndex + itemsPerPage);
}

/**
 * Monta informações de exibição para o componente de paginação
 * (ex: "Mostrando 21–40 de 132 resultados").
 * @param {number} totalItems
 * @param {number} currentPage
 * @param {number} [itemsPerPage=PAGINATION_CONFIG.ITEMS_PER_PAGE]
 * @returns {{currentPage: number, totalPages: number, startIndex: number, endIndex: number, totalItems: number}}
 */
export function getPaginationInfo(totalItems, currentPage, itemsPerPage = PAGINATION_CONFIG.ITEMS_PER_PAGE) {
  const totalPages = calculateTotalPages(totalItems, itemsPerPage);
  const page = clampPage(currentPage, totalPages);
  const startIndex = totalItems === 0 ? 0 : (page - 1) * itemsPerPage + 1;
  const endIndex = Math.min(page * itemsPerPage, totalItems);
  return { currentPage: page, totalPages, startIndex, endIndex, totalItems };
}

/**
 * Calcula o intervalo de números de página a exibir no componente de navegação,
 * centralizando a página atual sempre que possível.
 * @param {number} currentPage
 * @param {number} totalPages
 * @param {number} [maxVisible=PAGINATION_CONFIG.MAX_VISIBLE_PAGES]
 * @returns {number[]} Lista de números de página a exibir.
 */
export function getPageRange(currentPage, totalPages, maxVisible = PAGINATION_CONFIG.MAX_VISIBLE_PAGES) {
  const page = clampPage(currentPage, totalPages);
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, page - half);
  const end = Math.min(totalPages, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Indica se existe uma próxima/anterior página, útil para habilitar/desabilitar botões.
 * @param {number} currentPage
 * @param {number} totalPages
 * @returns {{hasNext: boolean, hasPrevious: boolean}}
 */
export function getPaginationControls(currentPage, totalPages) {
  const page = clampPage(currentPage, totalPages);
  return { hasNext: page < totalPages, hasPrevious: page > 1 };
}