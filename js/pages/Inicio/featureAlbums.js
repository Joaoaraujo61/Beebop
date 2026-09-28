// js/pages/Inicio/featureAlbums.js
//
// Capas de álbum da seção "Qual foi sua última música favorita?".
// Cada linha de feature tem um vinil "saindo" de uma capa real. Os álbuns
// vêm de getAlbunsParaDescoberta() (js/data/curatedSelections.js), que
// sorteia a seleção a cada carregamento da página e já traz a capa real
// da iTunes Search API (via services/itunesApi.js) — nada é inventado.
//
// Segue o mesmo padrão de heroCards.js:
//   1. Skeleton imediato no lugar de cada capa (sem pulo de layout).
//   2. Busca só quando a seção está perto de entrar na tela: ela fica
//      abaixo da dobra e a iTunes API tem limite de requisições por
//      minuto, então não vale gastar chamadas de quem nem rolou a página.
//   3. Erro / sem capa: placeholder discreto (o vinil continua aparecendo,
//      a seção não quebra). Não há "tentar novamente" porque a capa é
//      decorativa — diferente dos cards do hero.

import { getAlbunsParaDescoberta } from '../../data/curatedSelections.js';

/**
 * Preenche o slot de capa com a imagem real ou com o placeholder.
 * @param {HTMLElement} coverWrap - elemento `.feature__cover`.
 * @param {object|undefined} album
 */
function preencherCapa(coverWrap, album) {
  coverWrap.classList.remove('feature__cover--skeleton');
  coverWrap.innerHTML = '';

  if (!album || !album.capa) {
    coverWrap.classList.add('feature__cover--placeholder');
    coverWrap.innerHTML = '<i class="fa-solid fa-music" aria-hidden="true"></i>';
    return;
  }

  const img = document.createElement('img');
  img.className = 'feature__cover-img';
  img.src = album.capa;
  img.alt = `Capa do álbum ${album.titulo}, de ${album.artista}`;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
  // Se a imagem em si falhar (URL quebrada), cai no placeholder.
  img.addEventListener('error', () => preencherCapa(coverWrap, null), { once: true });
  coverWrap.appendChild(img);
}

/**
 * Busca álbuns aleatórios e distribui um por linha de feature.
 * @param {HTMLElement[]} coverWraps
 */
async function carregarCapas(coverWraps) {
  try {
    const albuns = await getAlbunsParaDescoberta(coverWraps.length);
    coverWraps.forEach((wrap, index) => preencherCapa(wrap, albuns[index]));
  } catch (erro) {
    console.error('Falha ao carregar capas da seção de features:', erro);
    coverWraps.forEach((wrap) => preencherCapa(wrap, null));
  }
}

/**
 * Inicia o carregamento das capas da seção de features. Não deve ser
 * "await"ada por quem chama.
 * @param {HTMLElement} featuresList - elemento `#features-list`.
 */
export function renderFeatureAlbums(featuresList) {
  const coverWraps = Array.from(featuresList.querySelectorAll('.feature__cover'));
  if (!coverWraps.length) return;

  // Sem IntersectionObserver (navegadores muito antigos): busca direto.
  if (!('IntersectionObserver' in window)) {
    carregarCapas(coverWraps);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      carregarCapas(coverWraps);
    },
    { rootMargin: '300px 0px' }
  );
  observer.observe(featuresList);
}