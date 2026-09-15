// js/pages/Inicio/heroCards.js
//
// PARTE 2 DA REFATORAÇÃO (Cards da Home com API):
// Antes, os cards do hero eram 3 registros fixos em memória
// (DEMO_TRACKS), sem nenhuma chamada real. Este módulo substitui isso
// por dados reais: getMusicasParaDescoberta() (js/data/curatedSelections.js)
// já consulta a iTunes Search API de verdade (via services/itunesApi.js)
// e devolve uma seleção editorial com capas reais.
//
// Fluxo:
//   1. Renderiza IMEDIATAMENTE skeleton cards (mesmo tamanho/formato do
//      card real) — a splash não fica esperando a rede para desenhar algo.
//   2. Busca os dados em paralelo com a animação da splash (esta função
//      nunca é "await"ada por quem a chama).
//   3. Sucesso: troca os skeletons pelos cards reais, com a mesma entrada
//      suave que os cards já tinham.
//   4. Erro: mostra um fallback discreto em vez de deixar a seção quebrada
//      ou vazia, com opção de tentar novamente.

import { renderMusicCard } from '../../components/musicCard.js';
import { appState } from '../../store/appState.js';
import { getMusicasParaDescoberta } from '../../data/curatedSelections.js';

const QTD_CARDS = 3;

/**
 * Converte o formato retornado por curatedSelections.js (chaves em
 * português: titulo/artista/capa/nota) para o formato que
 * components/musicCard.js espera (title/artist/cover/subtitle).
 * @param {object} musica
 * @param {number} index
 * @returns {object}
 */
function paraTrackDoCard(musica, index) {
  return {
    id: musica.id,
    title: musica.titulo,
    artist: musica.artista,
    cover: musica.capa || undefined,
    subtitle: index === 0 ? 'Destaque' : undefined,
  };
}

/**
 * Monta um card "esqueleto" (mesmo tamanho/estrutura do music-card real,
 * sem dados) para exibir enquanto a API responde. Usa a mesma classe
 * `.music-card` como base — herda tamanho/raio/borda — mais um modificador
 * `.music-card--skeleton` só para o efeito de shimmer.
 * @returns {HTMLElement}
 */
function renderSkeletonCard() {
  const card = document.createElement('article');
  card.className = 'music-card music-card--skeleton';
  card.setAttribute('aria-hidden', 'true');
  card.innerHTML = `
    <div class="music-card__cover-wrap music-card__cover--skeleton"></div>
    <div class="music-card__info">
      <p class="music-card__title-skeleton"></p>
      <p class="music-card__artist-skeleton"></p>
    </div>
  `;
  return card;
}

/**
 * Monta um bloco de fallback para quando a busca de sugestões falha —
 * mantém o espaço do hero coerente (não desmonta o layout) e oferece
 * uma forma simples de tentar de novo.
 * @param {() => void} onRetry
 * @returns {HTMLElement}
 */
function renderErrorFallback(onRetry) {
  const wrap = document.createElement('div');
  wrap.className = 'hero-cards-error';
  wrap.innerHTML = `
    <p class="hero-cards-error__text">Não foi possível carregar sugestões agora.</p>
    <button type="button" class="hero-cards-error__retry">Tentar novamente</button>
  `;
  wrap.querySelector('.hero-cards-error__retry').addEventListener('click', onRetry);
  return wrap;
}

/**
 * Renderiza a área de cards do hero: mostra skeletons de imediato e troca
 * pelos dados reais assim que a busca terminar (sucesso ou fallback de
 * erro). Não deve ser "await"ado por quem chama — a ideia é justamente
 * não bloquear o resto da página/animação nessa busca.
 * @param {HTMLElement} cardsWrap - elemento `#hero-cards`.
 */
export async function renderHeroCards(cardsWrap) {
  // 1) Estado de carregamento: skeletons imediatos, sem esperar nada.
  cardsWrap.innerHTML = '';
  const skeletons = Array.from({ length: QTD_CARDS }, renderSkeletonCard);
  skeletons.forEach((skeleton, index) => {
    // Mesmo stagger de entrada que os cards reais usam, para a troca
    // posterior (skeleton -> card real) não "saltar" visualmente.
    skeleton.style.setProperty('--enter-delay', `${1400 + index * 120}ms`);
    cardsWrap.appendChild(skeleton);
  });

  // 2) Busca real (iTunes API, via curatedSelections.js), com fallback de erro.
  try {
    const musicas = await getMusicasParaDescoberta(QTD_CARDS);
    if (!musicas || musicas.length === 0) {
      throw new Error('Nenhuma sugestão retornada.');
    }

    // 3) Sucesso: troca skeletons pelos cards reais.
    cardsWrap.innerHTML = '';
    let primeiroId = null;

    musicas.forEach((musica, index) => {
      const track = paraTrackDoCard(musica, index);
      if (index === 0) primeiroId = track.id;

      const card = renderMusicCard(track);
      // Se a intro da splash já tiver terminado quando os dados chegarem,
      // este delay é aplicado a partir do momento em que o card entra no
      // DOM (não do carregamento da página) — a troca continua suave em
      // vez de reiniciar a contagem de 1400ms.
      card.style.setProperty('--enter-delay', `${index * 120}ms`);
      cardsWrap.appendChild(card);
    });

    // Pequeno "aceno" do equalizador no primeiro card carregado, mesmo
    // efeito que a versão anterior tinha com os dados de demonstração —
    // só que agora com o id real vindo da API.
    if (primeiroId) {
      window.setTimeout(() => appState.togglePlay(primeiroId), 600);
    }
  } catch (erro) {
    // 4) Erro: fallback visual, sem quebrar a página nem deixar a área vazia.
    console.error('Falha ao carregar sugestões da Home:', erro);
    cardsWrap.innerHTML = '';
    cardsWrap.appendChild(renderErrorFallback(() => renderHeroCards(cardsWrap)));
  }
}
