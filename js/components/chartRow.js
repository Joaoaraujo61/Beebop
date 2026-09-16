// js/components/chartRow.js
//
// Linha de ranking reutilizável para a página Charts. Segue o mesmo padrão
// de TrackCard.js/AlbumCard.js (função pura de render, devolve markup em
// string). Visualmente reaproveita a linguagem do .track-row (usado na
// lista de faixas do Álbum), mas vive em bloco próprio (.chart-row) porque
// track-row é especificamente a numeração de faixas DENTRO de um álbum —
// aqui a posição é de um ranking global, e a linha também tem capa e
// variação, que track-row não tem.

import { PLACEHOLDER_COVER } from '../utils/constants.js';

/**
 * Renderiza o HTML de uma linha de ranking.
 * @param {object} item - { id, titulo, artista, genero, nota, posicao, capa }
 * @param {number} [item.avaliacoes] - contagem exibida na coluna "Avaliações".
 * @param {number} [item.variacao] - variação de posição (positivo = subiu,
 *   negativo = desceu, 0/ausente = estável). Hoje é sempre simulada — não
 *   existe reviewService real para calcular isso de verdade ainda.
 * @returns {string} Markup da linha.
 */
export function renderChartRow(item) {
  const capa = item.capa || PLACEHOLDER_COVER;
  const temNota = typeof item.nota === 'number';
  const variacao = item.variacao ?? 0;
  const variacaoClasse = variacao > 0
    ? 'chart-row__variation--up'
    : variacao < 0
      ? 'chart-row__variation--down'
      : 'chart-row__variation--flat';
  const variacaoIcone = variacao > 0 ? 'fa-caret-up' : variacao < 0 ? 'fa-caret-down' : 'fa-minus';
  const variacaoTexto = variacao === 0 ? '' : Math.abs(variacao);
  const avaliacoes = typeof item.avaliacoes === 'number' ? item.avaliacoes.toLocaleString('pt-BR') : '—';

  return `
    <article class="chart-row" data-id="${item.id}">
      <span class="chart-row__rank">${item.posicao}</span>
      <img class="chart-row__cover" src="${capa}" alt="Capa de ${item.titulo}">
      <div class="chart-row__title-wrap">
        <span class="chart-row__title">${item.titulo}</span>
        <span class="chart-row__credit">${item.artista}${item.genero ? ` · ${item.genero}` : ''}</span>
      </div>
      <span class="chart-row__variation ${variacaoClasse}">
        <i class="fa-solid ${variacaoIcone}" aria-hidden="true"></i>${variacaoTexto}
      </span>
      <span class="chart-row__count">${avaliacoes}</span>
      <span class="chart-row__rating${temNota ? '' : ' chart-row__rating--empty'}">
        ${temNota ? `<i class="fa-solid fa-star" aria-hidden="true"></i> ${item.nota.toFixed(1)}` : '—'}
      </span>
    </article>`;
}