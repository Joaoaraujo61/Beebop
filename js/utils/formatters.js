/**
 * utils/formatters.js
 * Reúne funções puras de apresentação/formatação de dados exibidos na interface:
 * duração de músicas, datas, preços e textos. Não acessa API nem estado global.
 */

/**
 * Formata duração em milissegundos para o formato mm:ss.
 * @param {number} milliseconds - Duração em ms (ex: trackTimeMillis da iTunes API).
 * @returns {string} Duração formatada, ex: "3:45". Retorna "--:--" se inválido.
 */
export function formatDuration(milliseconds) {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return '--:--';
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Formata uma data (string ISO ou Date) para o padrão brasileiro dd/mm/aaaa.
 * @param {string|Date} date - Data de lançamento (ex: releaseDate da iTunes API).
 * @param {object} [options] - Opções do Intl.DateTimeFormat.
 * @returns {string} Data formatada ou string vazia se inválida.
 */
export function formatDate(date, options = { day: '2-digit', month: '2-digit', year: 'numeric' }) {
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', options).format(parsed);
}

/**
 * Formata apenas o ano de uma data, útil para cards de álbum.
 * @param {string|Date} date
 * @returns {string} Ano com 4 dígitos ou string vazia se inválido.
 */
export function formatYear(date) {
  const parsed = date instanceof Date ? date : new Date(date);
  return Number.isNaN(parsed.getTime()) ? '' : String(parsed.getFullYear());
}

/**
 * Formata um valor monetário conforme moeda informada pela iTunes API.
 * @param {number} price - Valor numérico (ex: trackPrice, collectionPrice).
 * @param {string} [currency='USD'] - Código da moeda (ex: 'USD', 'BRL').
 * @returns {string} Valor formatado, ex: "R$ 4,90". Retorna "Grátis" para 0.
 */
export function formatPrice(price, currency = 'USD') {
  if (!Number.isFinite(price)) return '';
  if (price === 0) return 'Grátis';
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(price);
  } catch {
    return `${price.toFixed(2)} ${currency}`;
  }
}

/**
 * Trunca um texto adicionando reticências quando excede o tamanho máximo.
 * @param {string} text
 * @param {number} [maxLength=60]
 * @returns {string}
 */
export function truncateText(text, maxLength = 60) {
  if (typeof text !== 'string') return '';
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
}

/**
 * Capitaliza a primeira letra de um texto.
 * @param {string} text
 * @returns {string}
 */
export function capitalize(text) {
  if (typeof text !== 'string' || text.length === 0) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Formata o nome do gênero musical (ex: "Hip-Hop/Rap" -> "Hip-Hop / Rap").
 * @param {string} genre
 * @returns {string}
 */
export function formatGenre(genre) {
  if (typeof genre !== 'string') return '';
  return genre.replace(/\//g, ' / ');
}

/**
 * Aumenta a resolução padrão das capas retornadas pela iTunes API (ex: 100x100 -> 600x600).
 * @param {string} artworkUrl - URL original (artworkUrl100).
 * @param {number} [size=600] - Tamanho desejado em pixels.
 * @returns {string} URL com resolução ajustada, ou string vazia se inválida.
 */
export function formatArtworkUrl(artworkUrl, size = 600) {
  if (typeof artworkUrl !== 'string' || artworkUrl.length === 0) return '';
  return artworkUrl.replace(/\/\d+x\d+bb\.(jpg|png)/, `/${size}x${size}bb.$1`);
}

/**
 * Formata contagens (ex: número de faixas, seguidores) com sufixos k/M.
 * @param {number} count
 * @returns {string}
 */
export function formatCount(count) {
  if (!Number.isFinite(count)) return '0';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
  return String(count);
}

/**
 * Formata uma nota/avaliação (0 a 10, por exemplo 8.666) para uma casa
 * decimal (ex: "8.7"). Usado nos cards e na página de Álbum/Comentários.
 * @param {number} value
 * @returns {string|null} Nota formatada, ou null se não houver nota.
 */
export function formatRating(value) {
  if (value == null || Number.isNaN(value)) return null;
  return Number(value).toFixed(1);
}

/**
 * Formata uma data (string ISO) por extenso, em português (ex:
 * "12 de agosto de 2026"). Complementa formatDate() (que usa dd/mm/aaaa)
 * para contextos mais editoriais, como comentários/reviews.
 * @param {string} isoString
 * @returns {string}
 */
export function formatDateLong(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}