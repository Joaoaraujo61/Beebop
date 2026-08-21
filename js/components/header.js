// components/Header/Header.js

export function renderHeader({ onSearch, initialQuery = '' } = {}) {
  const header = document.createElement('header');
  header.className = 'header';

  header.innerHTML = `
      <div class="header__logo_nav">
        <a href="/index.html"><img src="../../../assets/beebop.png"></a>
        <nav class="header__nav">
          <a href="/playlists.html">Inicio</a>
          <a href="/playlists.html">Explorar</a>
          <a href="/playlists.html">Charts</a>
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
      <div class="header_login">
        <a href="/playlists.html">Entrar</a>
        <a href="/playlists.html" class="header_account">Criar Conta</a>
      </div>
  `;

  // Eventos ficam encapsulados aqui dentro — a página não precisa
  // saber COMO o header funciona, só o QUE ele faz (callback)
  const form = header.querySelector('.header__search_form');
  const input = header.querySelector('.header__search_input');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input.value.trim();
    if (query && typeof onSearch === 'function') {
      onSearch(query);
    }
  });

  return header;
}