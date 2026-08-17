// components/Header/Header.js

export function renderFooter(){
  const footer = document.createElement('footer');
  footer.className = 'footer';

  footer.innerHTML = '<span>aaaaaaaaaa</span>';

  // Eventos ficam encapsulados aqui dentro — a página não precisa
  // saber COMO o header funciona, só o QUE ele faz (callback)
//   const form = header.querySelector('.header__search-form');
//   const input = header.querySelector('.header__search-input');

//   form.addEventListener('submit', (event) => {
//     event.preventDefault();
//     const query = input.value.trim();
//     if (query && typeof onSearch === 'function') {
//       onSearch(query);
//     }
//   });

  return footer;
}