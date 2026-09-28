// js/services/avaliacoesService.js
//
// Avaliações (nota de 0 a 10) por usuário, 100% client-side em
// localStorage — sem backend, como o resto do projeto. Uma nota por
// usuário por item: avaliar de novo substitui a anterior.
//
// Formato salvo (chave STORAGE_KEY):
// {
//   "album:1440841908": { "marina.wav": 9, "otavio_dsc": 8 },
//   "musica:1440841909": { ... }
// }
//
// `tipo` é livre ('album' | 'musica'...), igual ao comentariosService.
// O identificador do usuário vem de extrairIdentidadeUsuario()
// (comentariosService.js), a partir do appState.user.

const STORAGE_KEY = 'beebop_ratings';

function carregarTodos() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function salvarTodos(dados) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
  } catch {
    // Armazenamento indisponível — segue só em memória nesta sessão.
  }
}

function chave(tipo, id) {
  return `${tipo}:${id}`;
}

/** Nota que um usuário deu ao item (ou null se ainda não avaliou). */
export function obterNota(tipo, id, usuarioId) {
  const notas = carregarTodos()[chave(tipo, id)] ?? {};
  return typeof notas[usuarioId] === 'number' ? notas[usuarioId] : null;
}

/**
 * Define (ou remove, com `nota = null`) a nota de um usuário para o item.
 * @param {string} tipo
 * @param {string|number} id
 * @param {string} usuarioId
 * @param {number|null} nota - 0 a 10
 */
export function definirNota(tipo, id, usuarioId, nota) {
  const todos = carregarTodos();
  const k = chave(tipo, id);
  const notas = { ...(todos[k] ?? {}) };

  if (nota === null) {
    delete notas[usuarioId];
  } else {
    notas[usuarioId] = Math.min(10, Math.max(0, nota));
  }

  todos[k] = notas;
  salvarTodos(todos);
}

/** Média e total de avaliações locais do item. */
export function resumoAvaliacoes(tipo, id) {
  const valores = Object.values(carregarTodos()[chave(tipo, id)] ?? {}).filter(
    (n) => typeof n === 'number'
  );
  if (!valores.length) return { media: null, total: 0 };
  const soma = valores.reduce((acc, n) => acc + n, 0);
  return { media: Math.round((soma / valores.length) * 10) / 10, total: valores.length };
}