// components/Header/Header.js

import { appState } from '../store/appState.js';
import { logout } from '../services/authService.js';
import { renderNav } from './nav.js';

export function renderHeader({ onSearch, initialQuery = '', activePage } = {}) {
  const header = document.createElement('header');
  header.className = 'header';

  header.innerHTML = `
    <div class="header__logo_nav">
      <a href="/index.html"><img src="../../../assets/beebop.png"></a>

      <button
        class="header__burger"
        type="button"
        aria-label="Abrir menu"
        aria-expanded="false"
        aria-controls="header-nav"
      >
        <i class="fa-solid fa-bars" aria-hidden="true"></i>
      </button>
    </div>
    <form class="header__search_form">
      <input
        type="text"
        class="header__search_input"
        placeholder="Buscar músicas, álbuns, artistas..."
        value="${initialQuery}"
      />
      <i class="fa-solid fa-magnifying-glass" style="color: rgb(156, 163, 175);"></i>
    </form>
    <div class="header_login"></div>
`;

  // Nav agora é um componente à parte (ver components/Nav/Nav.js) — se a
  // página já souber qual link deve estar ativo no momento de criar o
  // header, passa `activePage` aqui; senão, dá pra marcar depois com
  // applyActiveNavLink(header, 'explorar') (ver explorar.js).
  const logoNav = header.querySelector('.header__logo_nav');
  const nav = renderNav({ activePage });
  logoNav.appendChild(nav);

  // Eventos ficam encapsulados aqui dentro — a página não precisa
  // saber COMO o header funciona, só o QUE ele faz (callback)
  const form = header.querySelector('.header__search_form');
  const input = header.querySelector('.header__search_input');
  const loginArea = header.querySelector('.header_login');

  const burger = header.querySelector('.header__burger');

  if (burger && nav) {
    const fecharMenu = () => {
      header.classList.remove('is-menu-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Abrir menu');
      burger.querySelector('i').className = 'fa-solid fa-bars';
    };

    burger.addEventListener('click', () => {
      const aberto = header.classList.toggle('is-menu-open');
      burger.setAttribute('aria-expanded', String(aberto));
      burger.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
      burger.querySelector('i').className = aberto ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', fecharMenu);
    });

    // Em telas grandes, se o usuário abriu o menu no celular e depois
    // girou/redimensionou, o drawer some pelo CSS — mas a classe ficaria
    // pendurada. Limpa ao voltar pro breakpoint desktop.
    const mq = window.matchMedia('(min-width: 901px)');
    mq.addEventListener('change', (event) => {
      if (event.matches) fecharMenu();
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input.value.trim();
    if (query && typeof onSearch === 'function') {
      onSearch(query);
    }
  });

  // Reflete appState.user na área de conta do header. appState.subscribe
  // já chama o listener imediatamente com o estado atual (ver
  // store/appState.js), então isso cobre tanto a renderização inicial
  // quanto login/logout feitos nesta mesma aba.
  appState.subscribe((state) => renderLoginArea(loginArea, state.user));

  // Login/logout feito em OUTRA aba não passa pelo appState desta aba —
  // só chega via localStorage. Esse listener cobre esse caso.
  window.addEventListener('storage', (event) => {
    if (event.key === 'beebop_user') {
      renderLoginArea(loginArea, appState.getState().user);
    }
  });

  return header;
}

/** Renderiza "Entrar/Criar Conta" (deslogado) ou "Olá, {nome}/Sair" (logado). */
function renderLoginArea(loginArea, user) {
  if (user) {
    const label = user.nome || user.usuario || '';
    const initial = label.trim().charAt(0).toUpperCase() || '?';

    loginArea.innerHTML = `
      <a href="#" class="header_logout" title="Sair">Sair</a>
      <a href="../Perfil/perfil.html" class="header_profile" title="${label}">
        <span class="header_profile__avatar">${initial}</span>
      </a>
    `;
    loginArea.querySelector('.header_logout').addEventListener('click', (event) => {
      event.preventDefault();
      logout();
      window.location.href = '../Inicio/inicio.html';
    });
  } else {
    loginArea.innerHTML = `
      <a href="../Login/login.html">Entrar</a>
      <a href="../CriarConta/criar_conta.html" class="header_account">Criar Conta</a>
    `;
  }
}