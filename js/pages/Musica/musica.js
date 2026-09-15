// js/pages/Musica/musica.js
//
// Ainda não implementado em nenhuma das duas versões originais. Placeholder
// no mesmo padrão de artista.js/charts.js/playlist.js — a rota 'musica'
// não está registrada em app.js por padrão (ver README).

export function initMusicaPage({ header }) {
  const container = document.getElementById('results-container');

  container.innerHTML = `
    <div class="album-page">
      <div class="album-page__error">
        <p>A página de música ainda está em construção.</p>
        <a class="hero__btn hero__btn--primary" href="../Inicio/inicio.html">Voltar ao início</a>
      </div>
    </div>
  `;
}
