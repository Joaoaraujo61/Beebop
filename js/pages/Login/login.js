// js/pages/Login/login.js

import { isRequired, isValidEmail } from '../../utils/validators.js';

export function initLoginPage({ header }) {
  // "header" já vem pronto, injetado pelo app.js

  const container = document.getElementById('results-container');

  container.innerHTML = `
    <div class="auth-shell">
      <section class="auth-shell__form">
        <div class="auth-card">
          <h1 class="auth-card__title">Login</h1>
          <p class="auth-card__subtitle">Tudo que você precisa para começar</p>

          <form class="auth-form" novalidate>
            <div class="auth-form__field">
              <label class="auth-form__label" for="login-identifier">E-mail ou usuário</label>
              <div class="auth-form__input-wrap">
                <i class="fa-solid fa-user" aria-hidden="true"></i>
                <input
                  class="auth-form__input"
                  type="text"
                  id="login-identifier"
                  name="identifier"
                  placeholder="seuemail@exemplo.com ou usuário"
                  autocomplete="username"
                  aria-describedby="login-identifier-error"
                  required
                />
              </div>
              <p class="auth-form__error" id="login-identifier-error" role="alert"></p>
            </div>

            <div class="auth-form__field">
              <label class="auth-form__label" for="login-password">Senha</label>
              <div class="auth-form__input-wrap">
                <i class="fa-solid fa-lock" aria-hidden="true"></i>
                <input
                  class="auth-form__input"
                  type="password"
                  id="login-password"
                  name="password"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  aria-describedby="login-password-error"
                  required
                />
              </div>
              <p class="auth-form__error" id="login-password-error" role="alert"></p>
            </div>

            <p class="auth-form__status" role="status" aria-live="polite"></p>

            <button class="auth-form__submit" type="submit">Entrar</button>

            <div class="auth-social">
              <span class="auth-social__divider">ou continue com</span>
              <div class="auth-social__row">
                <button type="button" class="auth-social__btn" disabled title="Em breve" aria-label="Continuar com Google (em breve)">
                  <i class="fa-brands fa-google" aria-hidden="true"></i>
                </button>
                <button type="button" class="auth-social__btn" disabled title="Em breve" aria-label="Continuar com iTunes (em breve)">
                  <i class="fa-brands fa-itunes" aria-hidden="true"></i>
                </button>
                <button type="button" class="auth-social__btn" disabled title="Em breve" aria-label="Continuar com Spotify (em breve)">
                  <i class="fa-brands fa-spotify" aria-hidden="true"></i>
                </button>
              </div>
            </div>

            <p class="auth-switch">
              Ainda não tem conta?
              <a href="../CriarConta/criar_conta.html">Crie sua conta</a>
            </p>
          </form>
        </div>
      </section>

      <aside class="auth-shell__brand" aria-hidden="true">
        <img class="auth-shell__logo" src="../../../assets/beebop_grande.png" alt="" />
      </aside>
    </div>
  `;

  setupLoginForm(container);

  // Quando handleSearch/appState de busca existirem de fato, conectar aqui:
  // header.setOnSearch(handleSearch);
}

/**
 * Liga a validação client-side ao formulário de login.
 *
 * Não existe endpoint/serviço de autenticação no projeto (o único
 * serviço, js/services/itunesApi.js, ainda está vazio e é dedicado a
 * busca de música, não a contas de usuário). Por isso o envio nunca
 * chega a "logar" ninguém de verdade — só confirmamos que os dados
 * passaram na validação, sem fingir uma sessão que não existe.
 */
function setupLoginForm(container) {
  const form = container.querySelector('.auth-form');
  const identifierInput = form.querySelector('#login-identifier');
  const passwordInput = form.querySelector('#login-password');
  const statusEl = form.querySelector('.auth-form__status');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const identifierValid = validateField(
      identifierInput,
      validateIdentifier(identifierInput.value),
      identifierInput.value.includes('@')
        ? 'Digite um e-mail válido.'
        : 'Informe seu e-mail ou usuário.'
    );
    const passwordValid = validateField(
      passwordInput,
      isRequired(passwordInput.value),
      'Informe sua senha.'
    );

    statusEl.classList.remove('is-success', 'is-error');

    if (identifierValid && passwordValid) {
      statusEl.textContent =
        'Dados válidos! (Integração com o servidor ainda não existe neste projeto.)';
      statusEl.classList.add('is-success');
    } else {
      statusEl.textContent = 'Revise os campos destacados abaixo.';
      statusEl.classList.add('is-error');
    }
  });

  // Revalida um campo assim que o usuário corrige, sem esperar novo submit.
  identifierInput.addEventListener('input', () => {
    if (identifierInput.getAttribute('aria-invalid') === 'true') {
      validateField(identifierInput, validateIdentifier(identifierInput.value), '');
    }
  });
  passwordInput.addEventListener('input', () => {
    if (passwordInput.getAttribute('aria-invalid') === 'true') {
      validateField(passwordInput, isRequired(passwordInput.value), '');
    }
  });
}

/**
 * O campo aceita e-mail OU usuário (spec: "Login: E-mail ou Usuário e
 * Senha"). Só cobramos o formato de e-mail quando o texto parece um
 * e-mail (contém "@"); caso contrário, tratamos como nome de usuário
 * e exigimos apenas que não esteja vazio.
 */
function validateIdentifier(value) {
  if (!isRequired(value)) return false;
  return value.includes('@') ? isValidEmail(value) : true;
}

/**
 * Aplica (ou limpa) o estado de erro de um campo: mensagem, aria-invalid
 * e a classe visual usada em css/components.css (.auth-form__field--invalid).
 * Retorna se o campo é válido, para simplificar a checagem no submit.
 */
function validateField(input, isValid, message) {
  const field = input.closest('.auth-form__field');
  const errorEl = field.querySelector('.auth-form__error');

  field.classList.toggle('auth-form__field--invalid', !isValid);
  input.setAttribute('aria-invalid', String(!isValid));
  errorEl.textContent = isValid ? '' : message;

  return isValid;
}
