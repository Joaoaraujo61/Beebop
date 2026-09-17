// js/components/newsCard.js
//
// Card de notícia reutilizável para a página Notícias. Segue o mesmo
// padrão de TrackCard.js/AlbumCard.js: função pura de render, devolve
// markup em string. Classes com underscore (.news_card) definidas em
// css/style.css, na seção NOTICIAS — mesma convenção dos outros cards
// de página (.track_card, .album_card).

import { PLACEHOLDER_COVER } from '../utils/constants.js';

const UM_DIA_MS = 24 * 60 * 60 * 1000;

/** Formata a distância entre `dataISO` e agora em texto relativo (pt-BR). */
function formatarTempoRelativo(dataISO) {
  if (!dataISO) return '';
  const diffDias = Math.floor((Date.now() - new Date(dataISO).getTime()) / UM_DIA_MS);
  if (diffDias <= 0) return 'hoje';
  if (diffDias === 1) return 'há 1 dia';
  if (diffDias < 30) return `há ${diffDias} dias`;
  const diffMeses = Math.floor(diffDias / 30);
  if (diffMeses <= 1) return 'há 1 mês';
  if (diffMeses < 12) return `há ${diffMeses} meses`;
  const diffAnos = Math.floor(diffMeses / 12);
  return diffAnos <= 1 ? 'há 1 ano' : `há ${diffAnos} anos`;
}

/**
 * Renderiza o HTML de um card de notícia.
 * @param {object} noticia - { id, tag, titulo, resumo, capa, publicadoEm }
 * @returns {string} Markup do card.
 */
export function renderNewsCard(noticia) {
  const capa = noticia.capa || PLACEHOLDER_COVER;
  const tempo = formatarTempoRelativo(noticia.publicadoEm);

  return `
    <article class="news_card" data-id="${noticia.id}">
      <img class="news_cover" src="${capa}" alt="Capa relacionada à notícia: ${noticia.titulo}">
      <span class="news_tag">${noticia.tag ?? 'Notícia'}</span>
      <h3 class="news_title">${noticia.titulo}</h3>
      <p class="news_excerpt">${noticia.resumo}</p>
      ${tempo ? `<span class="news_meta">${tempo}</span>` : ''}
    </article>`;
}
