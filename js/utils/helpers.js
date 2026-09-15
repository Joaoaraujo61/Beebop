/**
 * utils/helpers.js
 * Funções auxiliares genéricas, sem responsabilidade específica de negócio.
 * Podem ser usadas por qualquer página, componente ou service do Beebop.
 */

/**
 * Cria uma versão "debounced" de uma função, atrasando sua execução até que
 * um intervalo de tempo tenha passado sem novas chamadas. Útil para o campo de busca.
 * @param {Function} fn - Função a ser executada.
 * @param {number} [delay=300] - Atraso em milissegundos.
 * @returns {Function} Função debounced.
 */
export function debounce(fn, delay = 300) {
  let timeoutId;
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Cria uma versão "throttled" de uma função, limitando sua execução a uma
 * vez por intervalo de tempo. Útil para eventos de scroll (ex: scroll infinito).
 * @param {Function} fn
 * @param {number} [limit=200] - Intervalo mínimo em milissegundos entre execuções.
 * @returns {Function} Função throttled.
 */
export function throttle(fn, limit = 200) {
  let waiting = false;
  return function throttled(...args) {
    if (waiting) return;
    fn.apply(this, args);
    waiting = true;
    setTimeout(() => { waiting = false; }, limit);
  };
}

/**
 * Gera um identificador único simples, útil para itens de playlist locais.
 * @returns {string} Identificador único.
 */
export function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Cria uma cópia profunda de um objeto/array serializável.
 * @param {*} value
 * @returns {*} Cópia profunda do valor.
 */
export function deepClone(value) {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

/**
 * Verifica se um valor está "vazio" (null, undefined, string vazia, array ou objeto vazios).
 * @param {*} value
 * @returns {boolean}
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' || Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Agrupa itens de um array a partir de uma chave ou função seletora.
 * @param {Array} items
 * @param {string|Function} key - Nome da propriedade ou função (item) => chave.
 * @returns {Object<string, Array>} Objeto com os itens agrupados.
 */
export function groupBy(items, key) {
  const selector = typeof key === 'function' ? key : (item) => item[key];
  return items.reduce((groups, item) => {
    const groupKey = selector(item);
    (groups[groupKey] ||= []).push(item);
    return groups;
  }, {});
}

/**
 * Embaralha um array sem alterar o original (algoritmo Fisher-Yates).
 * Útil para playlists/reprodução aleatória.
 * @param {Array} items
 * @returns {Array} Novo array embaralhado.
 */
export function shuffleArray(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Restringe um número a um intervalo mínimo e máximo.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Lê o valor de um parâmetro da query string da URL atual.
 * @param {string} param - Nome do parâmetro (ex: 'q', 'page').
 * @returns {string|null}
 */
export function getQueryParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

/**
 * Atualiza (ou remove) um parâmetro da query string sem recarregar a página.
 * @param {string} param
 * @param {string|null} value - Se null/undefined, remove o parâmetro.
 */
export function setQueryParam(param, value) {
  const url = new URL(window.location.href);
  if (value === null || value === undefined || value === '') {
    url.searchParams.delete(param);
  } else {
    url.searchParams.set(param, value);
  }
  window.history.replaceState({}, '', url);
}

/**
 * Aguarda de forma assíncrona por um determinado tempo. Útil em testes/mocks.
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Converte uma lista de { label, value } (value de 0 a 1) num polígono
 * regular (N eixos, um por item) pronto pra virar um <polygon points="">
 * de SVG — mesma ideia de um radar chart, com N lados. Usado pelo card
 * "DNA Musical" (Perfil) para representar gêneros favoritos.
 * NOTA: css/components.css já tem os estilos deste card prontos; falta
 * apenas js/pages/Perfil/perfil.js consumir esta função com dados reais
 * (ver README para mais detalhes sobre este ponto pendente).
 * @param {Array<{label: string, value: number}>} items
 * @param {{centerX: number, centerY: number, radius: number}} geometry
 * @returns {string} String de pontos "x,y x,y ..." pronta para um <polygon>.
 */
export function buildRadarPoints(items, { centerX, centerY, radius }) {
  const step = (Math.PI * 2) / items.length;
  return items
    .map((item, index) => {
      // Começa no topo (-90°) e gira no sentido horário.
      const angle = index * step - Math.PI / 2;
      const r = radius * clamp(item.value, 0, 1);
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

/**
 * Mesmo ângulo/raio de buildRadarPoints(), mas devolve pontos {x,y,label}
 * (para posicionar os rótulos de cada eixo do radar).
 * @param {Array<{label: string, value: number}>} items
 * @param {{centerX: number, centerY: number, radius: number}} geometry
 * @returns {Array<{label: string, x: number, y: number}>}
 */
export function buildRadarLabelPositions(items, { centerX, centerY, radius }) {
  const step = (Math.PI * 2) / items.length;
  return items.map((item, index) => {
    const angle = index * step - Math.PI / 2;
    return {
      label: item.label,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });
}