// components/Header/Header.js

import { appState } from '../store/appState.js';
import { logout } from '../services/authService.js';
import { buscarTudo } from '../services/itunesApi.js';
import { debounce } from '../utils/helpers.js';
import { renderNav } from './nav.js';

const LIMITE_POR_TIPO = 4;   // quantos itens de cada tipo (música/álbum/artista) pedir na API
const LIMITE_TOTAL = 6;      // quantos itens no total aparecem no dropdown

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
    <div class="header__search_wrap">
      <form class="header__search_form" autocomplete="off">
        <input
          type="text"
          class="header__search_input"
          placeholder="Buscar músicas, álbuns, artistas..."
          value="${initialQuery}"
          role="combobox"
          aria-expanded="false"
          aria-controls="header-search-results"
          aria-autocomplete="list"
        />
        <i class="fa-solid fa-magnifying-glass" style="color: rgb(156, 163, 175);"></i>
      </form>
      <div class="header__search_results" id="header-search-results" hidden></div>
    </div>
    <div class="header_login"></div>
`;

  // Nav é um componente à parte (ver components/Nav/Nav.js) — se a página
  // já souber qual link deve estar ativo no momento de criar o header,
  // passa `activePage` aqui; senão, dá pra marcar depois com
  // applyActiveNavLink(header, 'explorar') (ver explorar.js).
  const logoNav = header.querySelector('.header__logo_nav');
  const nav = renderNav({ activePage });
  logoNav.appendChild(nav);

  // Eventos ficam encapsulados aqui dentro — a página não precisa
  // saber COMO o header funciona, só o QUE ele faz (callback)
  const searchWrap = header.querySelector('.header__search_wrap');
  const form = header.querySelector('.header__search_form');
  const input = header.querySelector('.header__search_input');
  const resultsBox = header.querySelector('.header__search_results');
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

  // --- Dropdown de resultados rápidos -------------------------------
  // Enquanto digita, busca uma amostra pequena (LIMITE_TOTAL itens,
  // combinando música/álbum/artista via buscarTudo — mesma função que
  // explorar.js usa pra busca completa) e mostra num dropdown abaixo do
  // campo. Cada item é um atalho; "ver todos os resultados" no fim da
  // lista dispara a busca completa de verdade (mesmo fluxo do submit).

  let ultimaBuscaId = 0; // evita que uma resposta antiga (mais lenta) sobrescreva uma mais nova

  function fecharDropdown() {
    resultsBox.hidden = true;
    resultsBox.innerHTML = '';
    input.setAttribute('aria-expanded', 'false');
  }

  function abrirDropdown() {
    resultsBox.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function escaparHtml(texto = '') {
    return String(texto)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderItemHtml(item, tipo) {
    const titulo = escaparHtml(item.titulo ?? item.nome ?? '');
    const subtitulo = escaparHtml(item.artista ?? (tipo === 'artista' ? 'Artista' : ''));
    const capa = item.capa || item.imagem || '';
    const iconePorTipo = { musica: 'fa-music', album: 'fa-record-vinyl', artista: 'fa-user' };

    return `
      <button
        type="button"
        class="header__search_result"
        data-tipo="${tipo}"
        data-id="${escaparHtml(item.id)}"
        data-titulo="${titulo}"
        data-artista="${escaparHtml(item.artista ?? '')}"
      >
        ${capa
          ? `<img class="header__search_result__cover" src="${capa}" alt="" />`
          : `<span class="header__search_result__cover header__search_result__cover--placeholder"><i class="fa-solid ${iconePorTipo[tipo] ?? 'fa-music'}" aria-hidden="true"></i></span>`}
        <span class="header__search_result__info">
          <span class="header__search_result__title">${titulo}</span>
          ${subtitulo ? `<span class="header__search_result__subtitle">${subtitulo}</span>` : ''}
        </span>
        <span class="header__search_result__type">${tipo === 'musica' ? 'Música' : tipo === 'album' ? 'Álbum' : 'Artista'}</span>
      </button>
    `;
  }

  function irParaItem(tipo, dataset) {
    const { id, titulo, artista } = dataset;
    if (tipo === 'musica') {
      window.location.href = `../Musica/musica.html?id=${encodeURIComponent(id)}&titulo=${encodeURIComponent(titulo)}&artista=${encodeURIComponent(artista)}`;
      return;
    }
    if (tipo === 'album') {
      // Rota assumida — ajustar se a página de álbum usar outro caminho/parâmetros.
      window.location.href = `../Album/album.html?id=${encodeURIComponent(id)}&titulo=${encodeURIComponent(titulo)}&artista=${encodeURIComponent(artista)}`;
      return;
    }
    // Artista: sem página própria confirmada — dispara a busca completa com o nome dele.
    dispararBuscaCompleta(titulo);
  }

  function dispararBuscaCompleta(termo) {
    fecharDropdown();
    input.value = termo;
    if (typeof onSearch === 'function') onSearch(termo);
  }

  async function buscarResultadosRapidos(termo) {
    const buscaId = ++ultimaBuscaId;

    try {
      const combinado = await buscarTudo(termo, { limit: LIMITE_POR_TIPO });
      if (buscaId !== ultimaBuscaId) return; // uma busca mais nova já foi disparada, ignora essa resposta

      const itens = [
        ...combinado.musicas.map((item) => ({ item, tipo: 'musica' })),
        ...combinado.albuns.map((item) => ({ item, tipo: 'album' })),
        ...combinado.artistas.map((item) => ({ item, tipo: 'artista' })),
      ].slice(0, LIMITE_TOTAL);

      if (itens.length === 0) {
        resultsBox.innerHTML = `<p class="header__search_empty">Nenhum resultado para "${escaparHtml(termo)}".</p>`;
        abrirDropdown();
        return;
      }

      resultsBox.innerHTML = `
        ${itens.map(({ item, tipo }) => renderItemHtml(item, tipo)).join('')}
        <button type="button" class="header__search_verTodos" data-termo="${escaparHtml(termo)}">
          Ver todos os resultados para "${escaparHtml(termo)}"
        </button>
      `;
      abrirDropdown();

      resultsBox.querySelectorAll('.header__search_result').forEach((btn) => {
        btn.addEventListener('click', () => irParaItem(btn.dataset.tipo, btn.dataset));
      });
      resultsBox.querySelector('.header__search_verTodos')?.addEventListener('click', (event) => {
        dispararBuscaCompleta(event.currentTarget.dataset.termo);
      });
    } catch {
      if (buscaId !== ultimaBuscaId) return;
      resultsBox.innerHTML = `<p class="header__search_empty">Não foi possível buscar agora.</p>`;
      abrirDropdown();
    }
  }

  const buscarResultadosRapidosDebounced = debounce(buscarResultadosRapidos, 300);

  input.addEventListener('input', (event) => {
    const termo = event.target.value.trim();
    if (termo.length < 2) {
      ultimaBuscaId++; // invalida qualquer busca em andamento
      fecharDropdown();
      return;
    }
    buscarResultadosRapidosDebounced(termo);
  });

  input.addEventListener('focus', () => {
    if (resultsBox.innerHTML.trim() && input.value.trim().length >= 2) abrirDropdown();
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      fecharDropdown();
      input.blur();
    }
  });

  // Clique fora do form/dropdown fecha o dropdown.
  document.addEventListener('click', (event) => {
    if (!searchWrap.contains(event.target)) fecharDropdown();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input.value.trim();
    if (query) dispararBuscaCompleta(query);
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