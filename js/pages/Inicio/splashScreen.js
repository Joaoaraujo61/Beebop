// js/pages/Inicio/splashScreen.js
//
// PARTE 1 DA REFATORAÇÃO (Splash Screen dividida):
// Antes, a sequência de entrada (cortina -> título -> cards -> CTA) e o
// carregamento dos cards viviam misturados dentro de inicio.js, e a
// função de animação recebia "cardsWrap" só para ler o id da primeira
// faixa (acoplamento desnecessário entre animação e dados).
//
// Este módulo agora é 100% independente de dados: só sabe animar a
// "casca" da página (cortina + título + CTA). Os cards entram no jogo
// separadamente, em heroCards.js — o que permite a splash tocar
// imediatamente, sem esperar nenhuma resposta de rede.

/**
 * Toca a introdução visual da splash page (cortina escura que revela o
 * plano de fundo já existente, título e CTA aparecendo em sequência).
 *
 * Não depende de nenhum dado carregado por API — só do próprio DOM do
 * hero, que já existe de forma síncrona assim que a página monta. Isso
 * garante que a transição de abertura nunca fica "presa" esperando uma
 * requisição de rede terminar.
 *
 * @param {HTMLElement} heroEl - elemento `.hero` da página.
 * @returns {{ prefersReducedMotion: boolean }} Info útil para quem for
 *   decidir animações complementares (ex: heroCards.js).
 */
export function playSplashIntro(heroEl) {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const curtain = document.createElement('div');
  curtain.className = 'splash-curtain';
  document.body.appendChild(curtain);

  if (prefersReducedMotion) {
    // Sem movimento: mostra tudo de uma vez (o CSS de reduced-motion já
    // cuida de exibir os elementos sem animação) — nenhum bloqueio extra.
    curtain.remove();
    return { prefersReducedMotion };
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

  return { prefersReducedMotion };
}

/**
 * Revela as seções abaixo da dobra (features + fechamento) suavemente
 * conforme o usuário rola a página, usando IntersectionObserver nativo
 * (sem biblioteca nova e sem listener de scroll manual/loop).
 * Em prefers-reduced-motion, o CSS já mostra tudo com opacity:1 fixo,
 * então o observer só existe sem custo perceptível.
 * @param {HTMLElement} container
 */
export function observeScrollReveal(container) {
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
