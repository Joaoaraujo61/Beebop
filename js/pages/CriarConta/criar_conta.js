// js/pages/CriarConta/criar_conta.js

import {
  isRequired,
  isValidEmail,
  isValidPassword,
  passwordsMatch,
  MIN_PASSWORD_LENGTH,
} from '../../utils/validators.js';

export function initCadastroPage({ header }) {
  // "header" já vem pronto, injetado pelo app.js

  const container = document.getElementById('results-container');

  container.innerHTML = `
    <div class="auth-shell">
      <section class="auth-shell__form">
        <div class="auth-card">
          <h1 class="auth-card__title">Crie sua conta no BeeBop</h1>
          <p class="auth-card__subtitle">Tudo que você precisa para começar</p>

          <form class="auth-form" novalidate>
            <div class="auth-form__field">
              <label class="auth-form__label" for="cadastro-nome">Nome Completo</label>
              <div class="auth-form__input-wrap">
                <i class="fa-solid fa-id-card" aria-hidden="true"></i>
                <input
                  class="auth-form__input"
                  type="text"
                  id="cadastro-nome"
                  name="nome"
                  placeholder="Digite seu nome completo"
                  autocomplete="name"
                  aria-describedby="cadastro-nome-error"
                  required
                />
              </div>
              <p class="auth-form__error" id="cadastro-nome-error" role="alert"></p>
            </div>

            <div class="auth-form__field">
              <label class="auth-form__label" for="cadastro-email">E-mail</label>
              <div class="auth-form__input-wrap">
                <i class="fa-solid fa-envelope" aria-hidden="true"></i>
                <input
                  class="auth-form__input"
                  type="email"
                  id="cadastro-email"
                  name="email"
                  placeholder="seuemail@exemplo.com"
                  autocomplete="email"
                  aria-describedby="cadastro-email-error"
                  required
                />
              </div>
              <p class="auth-form__error" id="cadastro-email-error" role="alert"></p>
            </div>

            <div class="auth-form__field">
              <label class="auth-form__label" for="cadastro-usuario">Nome de Usuário</label>
              <div class="auth-form__input-wrap">
                <i class="fa-solid fa-at" aria-hidden="true"></i>
                <input
                  class="auth-form__input"
                  type="text"
                  id="cadastro-usuario"
                  name="usuario"
                  placeholder="seu_usuario"
                  autocomplete="username"
                  aria-describedby="cadastro-usuario-error"
                  required
                />
              </div>
              <p class="auth-form__error" id="cadastro-usuario-error" role="alert"></p>
            </div>

            <div class="auth-form__field">
              <label class="auth-form__label" for="cadastro-senha">Senha</label>
              <div class="auth-form__input-wrap">
                <i class="fa-solid fa-lock" aria-hidden="true"></i>
                <input
                  class="auth-form__input"
                  type="password"
                  id="cadastro-senha"
                  name="senha"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  aria-describedby="cadastro-senha-error"
                  required
                />
              </div>
              <p class="auth-form__error" id="cadastro-senha-error" role="alert"></p>
            </div>

            <div class="auth-form__field">
              <label class="auth-form__label" for="cadastro-confirmar-senha">Confirmar Senha</label>
              <div class="auth-form__input-wrap">
                <i class="fa-solid fa-lock" aria-hidden="true"></i>
                <input
                  class="auth-form__input"
                  type="password"
                  id="cadastro-confirmar-senha"
                  name="confirmarSenha"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  aria-describedby="cadastro-confirmar-senha-error"
                  required
                />
              </div>
              <p class="auth-form__error" id="cadastro-confirmar-senha-error" role="alert"></p>
            </div>

            <p class="auth-form__status" role="status" aria-live="polite"></p>

            <button class="auth-form__submit" type="submit">Criar Conta</button>

            <div class="auth-social">
              <span class="auth-social__divider">ou cadastre-se com</span>
              <div class="auth-social__row">
                <button type="button" class="auth-social__btn" disabled title="Em breve" aria-label="Cadastrar com Google (em breve)">
                  <i class="fa-brands fa-google" aria-hidden="true"></i>
                </button>
                <button type="button" class="auth-social__btn" disabled title="Em breve" aria-label="Cadastrar com iTunes (em breve)">
                  <i class="fa-brands fa-itunes" aria-hidden="true"></i>
                </button>
                <button type="button" class="auth-social__btn" disabled title="Em breve" aria-label="Cadastrar com Spotify (em breve)">
                  <i class="fa-brands fa-spotify" aria-hidden="true"></i>
                </button>
              </div>
            </div>

            <p class="auth-switch">
              Já tem conta?
              <a href="../Login/login.html">Faça login</a>
            </p>
          </form>
        </div>
      </section>

      <aside class="auth-shell__brand" aria-hidden="true">
        <img class="auth-shell__logo" src="../../../assets/beebop_grande.png" alt="" />
      </aside>
    </div>
  `;

  setupCadastroForm(container);

  // Quando handleSearch/appState de busca existirem de fato, conectar aqui:
  // header.setOnSearch(handleSearch);
}

/**
 * Liga a validação client-side ao formulário de cadastro.
 *
 * Assim como no Login, não existe endpoint/serviço de contas no projeto
 * (js/services/itunesApi.js está vazio e é só para busca de música).
 * O envio válido não cria uma conta de verdade — só confirma que os
 * dados passaram nas regras de js/utils/validators.js.
 */
function setupCadastroForm(container) {
  const form = container.querySelector('.auth-form');
  const nomeInput = form.querySelector('#cadastro-nome');
  const emailInput = form.querySelector('#cadastro-email');
  const usuarioInput = form.querySelector('#cadastro-usuario');
  const senhaInput = form.querySelector('#cadastro-senha');
  const confirmarSenhaInput = form.querySelector('#cadastro-confirmar-senha');
  const statusEl = form.querySelector('.auth-form__status');

  const passwordHint = `Use pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;

  function runValidation() {
    const nomeValid = validateField(nomeInput, isRequired(nomeInput.value), 'Informe seu nome completo.');
    const emailValid = validateField(
      emailInput,
      isRequired(emailInput.value) && isValidEmail(emailInput.value),
      'Digite um e-mail válido.'
    );
    const usuarioValid = validateField(usuarioInput, isRequired(usuarioInput.value), 'Escolha um nome de usuário.');
    const senhaValid = validateField(senhaInput, isValidPassword(senhaInput.value), passwordHint);
    const confirmarValid = validateField(
      confirmarSenhaInput,
      isRequired(confirmarSenhaInput.value) && passwordsMatch(senhaInput.value, confirmarSenhaInput.value),
      'As senhas não coincidem.'
    );

    return nomeValid && emailValid && usuarioValid && senhaValid && confirmarValid;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    statusEl.classList.remove('is-success', 'is-error');

    if (runValidation()) {
      statusEl.textContent =
        'Dados válidos! (Integração com o servidor ainda não existe neste projeto.)';
      statusEl.classList.add('is-success');
    } else {
      statusEl.textContent = 'Revise os campos destacados abaixo.';
      statusEl.classList.add('is-error');
    }
  });

  // Revalida cada campo assim que o usuário digita de novo, sem esperar
  // um novo submit — só depois que ele já tentou enviar uma vez.
  [nomeInput, emailInput, usuarioInput, senhaInput, confirmarSenhaInput].forEach((input) => {
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') {
        runValidation();
      }
    });
  });
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
