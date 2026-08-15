// components/Header/Header.js

export function renderHeader({ onSearch, initialQuery = '' } = {}) {
  const header = document.createElement('header');
  header.className = 'header';

  header.innerHTML = `
    <div class="header__logo">
      <a href="/index.html">Beebop</a>
    </div>
    <form class="header__search-form">
      <input 
        type="text" 
        class="header__search-input" 
        placeholder="Buscar músicas, álbuns, artistas..." 
        value="${initialQuery}"
      />
      <button type="submit" class="header__search-btn">Buscar</button>
    </form>
    <nav class="header__nav">
      <a href="/playlists.html">Playlists</a>
    </nav>
  `;

  // Eventos ficam encapsulados aqui dentro — a página não precisa
  // saber COMO o header funciona, só o QUE ele faz (callback)
  const form = header.querySelector('.header__search-form');
  const input = header.querySelector('.header__search-input');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input.value.trim();
    if (query && typeof onSearch === 'function') {
      onSearch(query);
    }
  });

  return header;
}
