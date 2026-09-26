// js/services/comentariosService.js
//
// Persistência client-side de comentários (Música e Álbum), 100% em
// localStorage — sem backend, como o resto do projeto hoje. Substitui a
// parte de "avaliação" que antes era só visual (ver o antigo bloco
// "Avalie esta música" de pages/Musica/musica.js): a nota agora é
// opcional, anexada ao próprio comentário, e fica de fato salva.
//
// Formato salvo em localStorage (chave STORAGE_KEY):
// {
//   "musica:1440841909": [
//     { id, usuarioId, usuarioNome, texto, nota, data, curtidas, curtidoPor: [], respostas: [] },
//     ...
//   ],
//   "album:1440841908": [ ... ]
// }
//
// `tipo` é livre (hoje: 'musica' | 'album') — qualquer string funciona,
// desde que a página que usa o componente seja consistente com o `id`
// que passa (ver js/components/comentarios.js).
//
// Identidade do autor: usa appState.user (login simulado do projeto).
// Como o formato exato do objeto de usuário depende de como
// pages/Login/login.js e pages/CriarConta/criar_conta.js montam esse
// objeto — arquivos que eu não tinha ao escrever isso — a extração do
// nome/identificador aqui tenta alguns nomes de campo comuns
// (nome/usuario/username/email) e cai para "Visitante" se nenhum bater.
// Ajuste extrairIdentidadeUsuario() abaixo se os campos reais do seu
// projeto tiverem outro nome.

const STORAGE_KEY = 'beebop_comments';

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
    // Armazenamento indisponível (ex: modo privado) — segue só em
    // memória pra essa sessão, como o resto do projeto já faz.
  }
}

function chave(tipo, id) {
  return `${tipo}:${id}`;
}

/**
 * Extrai um par {id, nome} do objeto de usuário do appState, tolerando
 * nomes de campo diferentes (ver nota no topo do arquivo).
 * @param {object} user
 */
export function extrairIdentidadeUsuario(user) {
  if (!user) return null;
  const id = user.id ?? user.usuario ?? user.username ?? user.email ?? null;
  const nome = user.usuario ?? user.username ?? user.nome ?? user.email ?? 'visitante';
  return id ? { id, nome } : null;
}

/** Lista os comentários de nível superior de um item (faixa ou álbum). */
export function listarComentarios(tipo, id) {
  const todos = carregarTodos();
  return todos[chave(tipo, id)] ?? [];
}

/**
 * Adiciona um comentário novo (sempre no topo da lista).
 * @param {string} tipo
 * @param {string|number} id
 * @param {{usuarioId: string, usuarioNome: string, texto: string, nota?: number|null}} dados
 */
export function adicionarComentario(tipo, id, { usuarioId, usuarioNome, texto, nota = null }) {
  const todos = carregarTodos();
  const k = chave(tipo, id);
  const lista = todos[k] ?? [];

  const comentario = {
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    usuarioId,
    usuarioNome,
    texto,
    nota: typeof nota === 'number' && !Number.isNaN(nota) ? nota : null,
    data: new Date().toISOString(),
    curtidas: 0,
    curtidoPor: [],
    respostas: [],
  };

  todos[k] = [comentario, ...lista];
  salvarTodos(todos);
  return comentario;
}

/** Curte/descurte um comentário para um usuário (1 curtida por usuário). */
export function alternarCurtida(tipo, id, comentarioId, usuarioId) {
  const todos = carregarTodos();
  const k = chave(tipo, id);
  const lista = todos[k] ?? [];

  const atualizada = lista.map((c) => {
    if (c.id !== comentarioId) return c;
    const jaCurtiu = c.curtidoPor.includes(usuarioId);
    const curtidoPor = jaCurtiu
      ? c.curtidoPor.filter((u) => u !== usuarioId)
      : [...c.curtidoPor, usuarioId];
    return { ...c, curtidoPor, curtidas: curtidoPor.length };
  });

  todos[k] = atualizada;
  salvarTodos(todos);
  return atualizada.find((c) => c.id === comentarioId) ?? null;
}

/**
 * Adiciona uma resposta a um comentário (um único nível — sem respostas
 * de respostas, pra manter a interface simples).
 */
export function adicionarResposta(tipo, id, comentarioId, { usuarioId, usuarioNome, texto }) {
  const todos = carregarTodos();
  const k = chave(tipo, id);
  const lista = todos[k] ?? [];

  const resposta = {
    id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    usuarioId,
    usuarioNome,
    texto,
    data: new Date().toISOString(),
  };

  const atualizada = lista.map((c) =>
    c.id === comentarioId ? { ...c, respostas: [...c.respostas, resposta] } : c
  );

  todos[k] = atualizada;
  salvarTodos(todos);
  return resposta;
}