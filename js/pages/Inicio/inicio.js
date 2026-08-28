// js/pages/Inicio/inicio.js

import { renderMusicCard } from '../../components/musicCard.js';
import { appState } from '../../store/appState.js';

// Dados de demonstração.
// js/services/itunesApi.js ainda está vazio (sem integração real de
// dados), então estes registros existem só para preencher os cards
// visualmente até a busca/API ser implementada. Nenhuma "cover" real
// é inventada — os cards sem capa mostram um placeholder de disco.
const DEMO_TRACKS = [
  { id: 'demo-1', title: 'Faixa em destaque', artist: 'Artista exemplo', subtitle: 'Destaque' },
  { id: 'demo-2', title: 'Outra faixa', artist: 'Artista exemplo 2' },
  { id: 'demo-3', title: 'Sugestão do dia', artist: 'Artista exemplo 3', subtitle: 'Sugestão' },
];

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

  DEMO_TRACKS.forEach((track, index) => {
    const card = renderMusicCard(track);
    // Delay de entrada de cada card (usado pelo CSS via var(--enter-delay)).
    // Feito por card, e não com nth-child fixo, para funcionar com
    // qualquer quantidade de faixas quando os dados reais existirem.
    card.style.setProperty('--enter-delay', `${1400 + index * 120}ms`);
    cardsWrap.appendChild(card);
  });

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

  playSplashIntro(heroEl, cardsWrap);
  observeScrollReveal(container);

  // Quando handleSearch/appState de busca existirem de fato, conectar aqui:
  // header.setOnSearch(handleSearch);
}

/**
 * Toca a pequena "introdução musical" da splash page.
 *
 * A colmeia/fundo não existe como elementos separados no projeto — é uma
 * única imagem (assets/fundoBeebop.png) aplicada no <body>. Por isso os
 * passos BACKGROUND + HEXAGONS são feitos como uma única revelação: uma
 * cortina escura (só nesta página) que desaparece suavemente e mostra o
 * fundo que já existe, sem alterar o CSS global do <body>.
 *
 * O restante da sequência (título, cards, CTA) usa só CSS (animation-delay),
 * e o "SOUND_WAVE" reaproveita o único estado de reprodução do projeto
 * (appState.togglePlay) — nenhum estado novo é criado.
 */
function playSplashIntro(heroEl, cardsWrap) {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const curtain = document.createElement('div');
  curtain.className = 'splash-curtain';
  document.body.appendChild(curtain);

  if (prefersReducedMotion) {
    // Sem movimento: mostra tudo de uma vez (o CSS de reduced-motion
    // já cuida de exibir os elementos sem animação).
    curtain.remove();
    return;
  }

  // Duas frames para garantir que o navegador aplique o estado inicial
  // (opacity: 0) antes de disparar as animações — evita "pular" direto
  // para o estado final.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      heroEl.classList.add('splash-ready');
      curtain.classList.add('is-hidden');
    });
  });

  curtain.addEventListener('transitionend', () => curtain.remove(), {
    once: true,
  });

  // SOUND_WAVE: ativa o estado de reprodução já existente em um card,
  // só para o equalizador (que já existe) começar a se mover.
  const firstCard = cardsWrap.querySelector('.music-card');
  const firstTrackId = firstCard?.dataset.trackId;
  if (firstTrackId) {
    window.setTimeout(() => appState.togglePlay(firstTrackId), 2200);
  }
}

/**
 * Revela as seções abaixo da dobra (features + fechamento) suavemente
 * conforme o usuário rola a página, usando IntersectionObserver nativo
 * (sem biblioteca nova e sem listener de scroll manual/loop).
 * Em prefers-reduced-motion, o CSS já mostra tudo com opacity:1 fixo,
 * então o observer só existe sem custo perceptível.
 */
function observeScrollReveal(container) {
  const targets = container.querySelectorAll('.reveal-on-scroll');
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  targets.forEach((el) => observer.observe(el));
}
