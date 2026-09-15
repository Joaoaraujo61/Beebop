// js/pages/Inicio/inicio.js

import { playSplashIntro, observeScrollReveal } from './splashScreen.js';
import { renderHeroCards } from './heroCards.js';

// Textos da seção de features. Não há capas reais associadas (o projeto
// não tem dados de álbum/artista carregados aqui), então cada item usa
// apenas um ícone de vinil decorativo — nenhuma imagem de capa/artista
// real é usada ou inventada.
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
      <h2 class="closing__title">Ouviu. Sentiu. Avaliou.</h2>
      <a class="hero__btn hero__btn--primary closing__cta" href="../CriarConta/criar_conta.html">Começar</a>
    </section>
  `;

  const heroEl = container.querySelector('.hero');
  const cardsWrap = container.querySelector('#hero-cards');
  const featuresList = container.querySelector('#features-list');

  FEATURES.forEach((feature) => {
    const row = document.createElement('div');
    row.className = 'feature__row reveal-on-scroll';
    row.innerHTML = `
      <p class="feature__text">${feature.text}</p>
      <div class="feature__vinyl" aria-hidden="true">
        <i class="fa-solid fa-record-vinyl"></i>
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

  observeScrollReveal(container);

  // Quando handleSearch/appState de busca existirem de fato, conectar aqui:
  // header.setOnSearch(handleSearch);
}
