// components/Nav/Nav.js
//
// Barra de navegação principal (Início / Explorar / Charts / Notícias).
// Extraída de components/Header/Header.js pra poder ser reaproveitada e,
// principalmente, pra centralizar a lógica de "qual link está ativo" —
// antes os links tinham ids soltos (inicio_nav, explorar_nav...) mas
// nada no código de fato os marcava como ativos.
//
// Uso:
//   - Header.js chama renderNav() pra criar o <nav> (ver ali).
//   - Qualquer página que receba o header pronto (ex.: initExplorarPage
//     recebe `{ header }`) chama applyActiveNavLink(header, 'explorar')
//     pra marcar seu próprio link como ativo, sem precisar recriar nada.
//
// Os ids de cada <a> (inicio_nav, explorar_nav, charts_nav, news_nav)
// são os MESMOS do header.js original — preservados de propósito, caso
// algo mais no projeto (CSS, outro JS) já dependa deles.

const PAGINAS = [
  { navId: 'inicio_nav', pageId: 'inicio', label: 'Inicio', href: '../Inicio/inicio.html' },
  { navId: 'explorar_nav', pageId: 'explorar', label: 'Explorar', href: '../Explorar/explorar.html' },
  { navId: 'charts_nav', pageId: 'charts', label: 'Charts', href: '../Charts/charts.html' },
  { navId: 'news_nav', pageId: 'noticias', label: 'Notícias', href: '../Noticias/noticias.html' },
];

/**
 * Cria o elemento <nav> da barra de navegação principal.
 * @param {{ activePage?: string }} [opts] - pageId da página ativa (ver PAGINAS), se já souber na hora de criar
 * @returns {HTMLElement}
 */
export function renderNav({ activePage } = {}) {
  const nav = document.createElement('nav');
  nav.className = 'header__nav';
  nav.id = 'header-nav';

  nav.innerHTML = PAGINAS.map((pagina) => {
    const ativo = pagina.pageId === activePage;
    return `
      <a
        id="${pagina.navId}"
        href="${pagina.href}"
        data-page-id="${pagina.pageId}"
        class="${ativo ? 'header__nav_link--active' : ''}"
        ${ativo ? 'aria-current="page"' : ''}
      >${pagina.label}</a>`;
  }).join('');

  return nav;
}

/**
 * Marca visualmente qual link está ativo dentro de um header já
 * renderizado. Páginas que recebem o header pronto usam isso pra se
 * anunciar como a página atual, sem precisar recriar a nav inteira.
 * @param {HTMLElement} headerEl - o elemento .header (ou algo que contenha .header__nav dentro)
 * @param {string} activePage - pageId da página ativa (ver PAGINAS acima: 'inicio' | 'explorar' | 'charts' | 'noticias')
 */
export function applyActiveNavLink(headerEl, activePage) {
  if (!headerEl) return;
  const nav = headerEl.querySelector('.header__nav');
  if (!nav) return;

  nav.querySelectorAll('a[data-page-id]').forEach((link) => {
    const ativo = link.dataset.pageId === activePage;
    link.classList.toggle('header__nav_link--active', ativo);
    if (ativo) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}