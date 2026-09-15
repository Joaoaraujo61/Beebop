/**
 * utils/validators.js
 * Reúne validações de dados fornecidos pelo usuário: campos de busca e
 * formulários de Login/Cadastro. Cada validador retorna um resultado
 * padronizado { valid, message } para facilitar o uso na interface.
 */

import { VALIDATION_LIMITS } from './constants.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_.]+$/;

/**
 * Tamanho mínimo de senha usado pelas validações "simples" abaixo
 * (isValidPassword). Mantido como alias de VALIDATION_LIMITS.MIN_PASSWORD_LENGTH
 * para não duplicar a regra — só existe para preservar a API que
 * Login/CriarConta já usam.
 */
export const MIN_PASSWORD_LENGTH = VALIDATION_LIMITS.MIN_PASSWORD_LENGTH;

/**
 * Validações "simples" (retornam boolean, não {valid, message}), usadas
 * pelos formulários de Login e CriarConta para validação campo-a-campo
 * em tempo real. Coexistem com as validações "ricas" (validateEmail,
 * validatePassword, etc.) usadas pelo fluxo de busca/cadastro completo
 * mais abaixo neste arquivo — ambas fazem sentido conforme o padrão de
 * cada formulário.
 */

/** Campo obrigatório: não pode ser vazio (nem só espaços). */
export function isRequired(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Formato de e-mail simples para validação client-side. */
export function isValidEmail(value) {
  return EMAIL_REGEX.test(String(value).trim());
}

/** Senha com o tamanho mínimo definido em MIN_PASSWORD_LENGTH. */
export function isValidPassword(value) {
  return typeof value === 'string' && value.length >= MIN_PASSWORD_LENGTH;
}

/** Confirmação de senha: os dois valores precisam ser idênticos. */
export function passwordsMatch(password, confirmPassword) {
  return password === confirmPassword;
}

/**
 * Cria um resultado de validação padronizado.
 * @param {boolean} valid
 * @param {string} [message='']
 * @returns {{valid: boolean, message: string}}
 */
function result(valid, message = '') {
  return { valid, message };
}

/**
 * Valida o termo digitado no campo de busca.
 * @param {string} term
 * @returns {{valid: boolean, message: string}}
 */
export function validateSearchTerm(term) {
  const trimmed = typeof term === 'string' ? term.trim() : '';
  if (trimmed.length === 0) {
    return result(false, 'Digite algo para buscar.');
  }
  if (trimmed.length < VALIDATION_LIMITS.MIN_SEARCH_LENGTH) {
    return result(false, `A busca deve ter pelo menos ${VALIDATION_LIMITS.MIN_SEARCH_LENGTH} caracteres.`);
  }
  if (trimmed.length > VALIDATION_LIMITS.MAX_SEARCH_LENGTH) {
    return result(false, `A busca deve ter no máximo ${VALIDATION_LIMITS.MAX_SEARCH_LENGTH} caracteres.`);
  }
  return result(true);
}

/**
 * Valida um endereço de e-mail.
 * @param {string} email
 * @returns {{valid: boolean, message: string}}
 */
export function validateEmail(email) {
  const trimmed = typeof email === 'string' ? email.trim() : '';
  if (trimmed.length === 0) return result(false, 'Informe seu e-mail.');
  if (!EMAIL_REGEX.test(trimmed)) return result(false, 'Informe um e-mail válido.');
  return result(true);
}

/**
 * Valida uma senha para o Cadastro (mínimo de caracteres, letra e número).
 * @param {string} password
 * @returns {{valid: boolean, message: string}}
 */
export function validatePassword(password) {
  if (typeof password !== 'string' || password.length === 0) {
    return result(false, 'Informe uma senha.');
  }
  if (password.length < VALIDATION_LIMITS.MIN_PASSWORD_LENGTH) {
    return result(false, `A senha deve ter pelo menos ${VALIDATION_LIMITS.MIN_PASSWORD_LENGTH} caracteres.`);
  }
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return result(false, 'A senha deve conter letras e números.');
  }
  return result(true);
}

/**
 * Valida se a confirmação de senha corresponde à senha informada.
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {{valid: boolean, message: string}}
 */
export function validatePasswordConfirmation(password, confirmPassword) {
  if (password !== confirmPassword) {
    return result(false, 'As senhas não coincidem.');
  }
  return result(true);
}

/**
 * Valida um nome de usuário para o Cadastro/Perfil.
 * @param {string} username
 * @returns {{valid: boolean, message: string}}
 */
export function validateUsername(username) {
  const trimmed = typeof username === 'string' ? username.trim() : '';
  if (trimmed.length < VALIDATION_LIMITS.MIN_USERNAME_LENGTH) {
    return result(false, `O nome de usuário deve ter pelo menos ${VALIDATION_LIMITS.MIN_USERNAME_LENGTH} caracteres.`);
  }
  if (trimmed.length > VALIDATION_LIMITS.MAX_USERNAME_LENGTH) {
    return result(false, `O nome de usuário deve ter no máximo ${VALIDATION_LIMITS.MAX_USERNAME_LENGTH} caracteres.`);
  }
  if (!USERNAME_REGEX.test(trimmed)) {
    return result(false, 'Use apenas letras, números, ponto e underline.');
  }
  return result(true);
}

/**
 * Remove tags HTML e espaços extras de uma entrada de texto, prevenindo
 * problemas simples de injeção ao exibir dados fornecidos pelo usuário.
 * @param {string} input
 * @returns {string}
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * Valida o formulário de Login como um todo.
 * @param {{email: string, password: string}} formData
 * @returns {{valid: boolean, errors: Object<string, string>}}
 */
export function validateLoginForm({ email, password }) {
  const errors = {};
  const emailResult = validateEmail(email);
  if (!emailResult.valid) errors.email = emailResult.message;

  if (typeof password !== 'string' || password.length === 0) {
    errors.password = 'Informe sua senha.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Valida o formulário de Cadastro como um todo.
 * @param {{username: string, email: string, password: string, confirmPassword: string}} formData
 * @returns {{valid: boolean, errors: Object<string, string>}}
 */
export function validateRegisterForm({ username, email, password, confirmPassword }) {
  const errors = {};

  const usernameResult = validateUsername(username);
  if (!usernameResult.valid) errors.username = usernameResult.message;

  const emailResult = validateEmail(email);
  if (!emailResult.valid) errors.email = emailResult.message;

  const passwordResult = validatePassword(password);
  if (!passwordResult.valid) errors.password = passwordResult.message;

  const confirmationResult = validatePasswordConfirmation(password, confirmPassword);
  if (passwordResult.valid && !confirmationResult.valid) {
    errors.confirmPassword = confirmationResult.message;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}