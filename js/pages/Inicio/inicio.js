// js/pages/Inicio/inicio.js

import { playSplashIntro, observeScrollReveal } from './splashScreen.js';
import { renderHeroCards } from './heroCards.js';
import { renderFeatureAlbums } from './featureAlbums.js';

// Textos da seção de features. As capas ao lado de cada texto NÃO ficam
// aqui: vêm de álbuns sorteados a cada carregamento da página
// (featureAlbums.js -> curatedSelections.js -> iTunes API), então a
// seção mostra discos diferentes a cada reload.
const FEATURES = [
  {
    text: 'Redescubra <strong>seus gostos</strong>, descubra <strong>novos sons</strong> e opine junto com <strong>seus amigos</strong>.',
  },
  {
    text: 'Explore músicas, dê sua <strong>opinião</strong> e descubra se seus amigos têm o <strong>mesmo gosto</strong> que você.',
  },
  {
    text: 'Seu gosto musical vai <strong>muito além</strong> do que você escuta.',
  },
];

export function initInicioPage({ header }) {
  // "header" já vem pronto, injetado pelo app.js

  const container = document.getElementById('results-container');

  container.innerHTML = `
    <section class="hero has-splash-intro">
      <div class="hero__content">
        <h1 class="hero__title">
          Avalie. <span class="hero__highlight">Descubra.</span><br />
          Compartilhe.
        </h1>
        <div class="hero__actions">
          <a class="hero__btn hero__btn--primary" href="../Explorar/explorar.html">Explorar Músicas</a>
          <a class="hero__btn hero__btn--ghost" href="../CriarConta/criar_conta.html">Criar Conta</a>
        </div>
      </div>
      <div class="hero__cards" id="hero-cards"></div>
    </section>

    <section class="features">
      <h2 class="features__title reveal-on-scroll">
        Qual foi sua última música <span class="hero__highlight">favorita?</span>
      </h2>
      <div class="features__list" id="features-list"></div>
    </section>

    <section class="closing reveal-on-scroll">
      <h2 class="closing__title">
        <span class="closing__word closing__word--1">Ouviu.</span>
        <span class="closing__word closing__word--2">Sentiu.</span>
        <span class="closing__word closing__word--3">Avaliou.</span>
      </h2>
      <a class="hero__btn hero__btn--primary closing__cta" href="../CriarConta/criar_conta.html">Começar</a>
    </section>
  `;

  const heroEl = container.querySelector('.hero');
  const cardsWrap = container.querySelector('#hero-cards');
  const featuresList = container.querySelector('#features-list');

  FEATURES.forEach((feature) => {
    const row = document.createElement('div');
    row.className = 'feature__row reveal-on-scroll';
    // Vinil (decorativo) atrás + capa do álbum na frente. A capa nasce
    // como skeleton e é preenchida por renderFeatureAlbums().
    row.innerHTML = `
      <p class="feature__text">${feature.text}</p>
      <div class="feature__media">
        <div class="feature__vinyl" aria-hidden="true"></div>
        <div class="feature__cover feature__cover--skeleton"></div>
      </div>
    `;
    featuresList.appendChild(row);
  });

  // As duas linhas abaixo rodam EM PARALELO, de propósito:
  //  - playSplashIntro() só mexe no DOM já existente (cortina + título +
  //    CTA) e não depende de nenhuma rede, então dispara imediatamente.
  //  - renderHeroCards() desenha skeletons na hora e só then busca os
  //    dados reais depois — por isso não é "await"ado aqui. Se ele fosse
  //    aguardado antes de playSplashIntro(), a abertura da página ficaria
  //    presa esperando a resposta da API (exatamente o bloqueio que essa
  //    refatoração existe para evitar).
  playSplashIntro(heroEl);
  renderHeroCards(cardsWrap);
  // Também sem "await": as capas só são buscadas quando a seção se
  // aproxima da tela e não bloqueiam nada.
  renderFeatureAlbums(featuresList);

  observeScrollReveal(container);

  // Quando handleSearch/appState de busca existirem de fato, conectar aqui:
  // header.setOnSearch(handleSearch);
}