// js/pages/Noticias/noticias.js

import { getNoticias } from '../../data/curatedNews.js';
import { renderNewsCard } from '../../components/newsCard.js';

function buildShellMarkup() {
  return `
    <div class="noticias_intro">
      <h1>Notícias Músicas</h1>
      <p>Lançamentos, turnês, polêmicas e curiosidades</p>
    </div>

    <p class="noticias_status" hidden></p>
    <div class="news_grid"></div>
  `;
}

export function initNoticiasPage({ header } = {}) {
  const container = document.getElementById('results-container');

  if (!container) {
    console.warn('#results-container não encontrado na página de Notícias.');
    return;
  }

  container.classList.add('noticias');
  container.innerHTML = buildShellMarkup();

  const el = {
    status: container.querySelector('.noticias_status'),
    grid: container.querySelector('.news_grid'),
  };

  function mostrarStatus(texto) {
    el.status.hidden = !texto;
    el.status.textContent = texto ?? '';
  }

  async function carregar() {
    mostrarStatus('Carregando notícias...');
    try {
      const noticias = await getNoticias();
      el.grid.innerHTML = noticias.map(renderNewsCard).join('');
      mostrarStatus(noticias.length === 0 ? 'Nenhuma notícia por aqui ainda.' : null);
    } catch (erro) {
      mostrarStatus('Não foi possível carregar as notícias agora. Tente novamente.');
    }
  }

  carregar();
}