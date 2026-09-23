// js/services/authService.js
/**
 * Serviço de autenticação SIMULADA, 100% local (sem backend).
 *
 * Mantém uma "tabela" de contas cadastradas em localStorage, na chave
 * 'beebop_users' (lista de usuários). A sessão ativa continua sendo
 * responsabilidade de store/appState.js (appState.setUser), que já
 * persiste em 'beebop_user' — este serviço só chama esse método em vez
 * de duplicar a lógica de sessão.
 *
 * IMPORTANTE: o "hash" usado aqui é só para não gravar a senha em texto
 * puro no localStorage. NÃO é criptografia de verdade — é uma simulação
 * client-side, não deve ser tratada como segurança real.
 *
 * TODO: mover USERS_STORAGE_KEY para STORAGE_KEYS em utils/constants.js
 * (ex: STORAGE_KEYS.USERS = 'beebop_users') para ficar junto das demais
 * chaves de localStorage do projeto. Não fiz isso aqui porque ainda não
 * tenho o conteúdo atual de constants.js.
 */

import { appState } from '../store/appState.js';

const USERS_STORAGE_KEY = 'beebop_users';

/** Lê a lista de contas cadastradas. */
function getUsers() {
  try {
    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Persiste a lista de contas cadastradas. */
function saveUsers(users) {
  try {
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // localStorage indisponível (ex: modo privado) — cadastro não persiste nesta sessão.
  }
}

/**
 * "Hash" simples (djb2) só para não deixar a senha em texto puro no
 * localStorage. Repetível/determinístico de propósito (sem salt) porque
 * isso é só uma simulação local, não um sistema de contas real.
 */
function hashPassword(password) {
  let hash = 5381;
  for (let i = 0; i < password.length; i++) {
    hash = (hash * 33) ^ password.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

function normalize(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function findUserByIdentifier(users, identifier) {
  const value = normalize(identifier);
  return users.find(
    (u) => normalize(u.email) === value || normalize(u.usuario) === value
  );
}

/** Remove o hash da senha antes de expor o usuário para UI/appState. */
function toPublicUser(user) {
  const { senhaHash, ...publicUser } = user;
  return publicUser;
}

/**
 * Cadastra uma nova conta.
 * @param {{nome: string, email: string, usuario: string, senha: string}} dados
 * @returns {{ok: true, user: object} | {ok: false, error: string, field?: string}}
 */
export function registerUser({ nome, email, usuario, senha }) {
  const users = getUsers();

  if (findUserByIdentifier(users, email)) {
    return { ok: false, error: 'Já existe uma conta com esse e-mail.', field: 'email' };
  }
  if (findUserByIdentifier(users, usuario)) {
    return { ok: false, error: 'Esse nome de usuário já está em uso.', field: 'usuario' };
  }

  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    nome,
    email,
    usuario,
    senhaHash: hashPassword(senha),
    criadoEm: new Date().toISOString(),
  };

  saveUsers([...users, newUser]);

  return { ok: true, user: toPublicUser(newUser) };
}

/**
 * Autentica com e-mail OU usuário + senha.
 * @param {{identifier: string, senha: string}} dados
 * @returns {{ok: true, user: object} | {ok: false, error: string}}
 */
export function loginUser({ identifier, senha }) {
  const users = getUsers();
  const found = findUserByIdentifier(users, identifier);

  if (!found || found.senhaHash !== hashPassword(senha)) {
    return { ok: false, error: 'E-mail/usuário ou senha incorretos.' };
  }

  return { ok: true, user: toPublicUser(found) };
}

/** Efetiva o login: grava a sessão em appState (que persiste em 'beebop_user'). */
export function loginAndPersist(user) {
  appState.setUser(user);
}

/** Encerra a sessão atual. */
export function logout() {
  appState.setUser(null);
}

/** Usuário logado atualmente (ou null). */
export function getCurrentUser() {
  return appState.getState().user;
}

/** Atalho para checar se há sessão ativa. */
export function isLoggedIn() {
  return getCurrentUser() !== null;
}
