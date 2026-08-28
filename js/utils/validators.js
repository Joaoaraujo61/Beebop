// js/utils/validators.js
//
// Regras de validação puras (sem tocar no DOM), para serem reaproveitadas
// por qualquer formulário do projeto — hoje usadas por Login e CriarConta.
//
// RECURSO NÃO ENCONTRADO: a documentação do projeto não define um valor
// mínimo de caracteres para senha. Usamos 8 como padrão razoável e comum
// em formulários de cadastro; está isolado em uma constante para ser
// fácil de ajustar depois, caso exista uma regra oficial diferente.
export const MIN_PASSWORD_LENGTH = 8;

/** Campo obrigatório: não pode ser vazio (nem só espaços). */
export function isRequired(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Formato de e-mail simples para validação client-side.
 * Não substitui validação/verificação real no servidor (que este
 * projeto ainda não possui — ver services/itunesApi.js, hoje vazio
 * e dedicado só a música, sem endpoints de autenticação).
 */
export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

/** Senha com o tamanho mínimo definido em MIN_PASSWORD_LENGTH. */
export function isValidPassword(value) {
  return typeof value === 'string' && value.length >= MIN_PASSWORD_LENGTH;
}

/** Confirmação de senha: os dois valores precisam ser idênticos. */
export function passwordsMatch(password, confirmPassword) {
  return password === confirmPassword;
}
