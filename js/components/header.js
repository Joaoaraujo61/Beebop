// components/Header/Header.js

import { appState } from '../store/appState.js';
import { logout } from '../services/authService.js';

export function renderHeader({ onSearch, initialQuery = '' } = {}) {
  const header = document.createElement('header');
  header.className = 'header';

  header.innerHTML = `
      <div class="header__logo_nav">
        <a href="/index.html"><img src="../../../assets/beebop.png"></a>
        <nav class="header__nav ">
          <a id="inicio_nav" href="../Inicio/inicio.html">Inicio</a>
          <a id="explorar_nav" href="../Explorar/explorar.html">Explorar</a>
          <a id="charts_nav" href="../Charts/charts.html">Charts</a>
           <a id="news_nav" href="../Noticias/noticias.html">Notícias</a>
        </nav>
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

  // Eventos ficam encapsulados aqui dentro — a página não precisa
  // saber COMO o header funciona, só o QUE ele faz (callback)
  const form = header.querySelector('.header__search_form');
  const input = header.querySelector('.header__search_input');
  const loginArea = header.querySelector('.header_login');

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