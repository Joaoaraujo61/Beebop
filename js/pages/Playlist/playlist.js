// js/pages/Playlist/playlist.js
//
// Ainda não implementado em nenhuma das duas versões originais. Este
// placeholder evita que a rota quebre (mesmo padrão de artista.js/
// charts.js) caso algum link para "../Playlist/playlist.html" seja
// adicionado no futuro (a rota 'playlist' não está registrada em
// app.js por padrão — ver README).

export function initPlaylistPage({ header }) {
  const container = document.getElementById('results-container');

  container.innerHTML = `
    <div class="album-page">
      <div class="album-page__error">
        <p>As Playlists ainda estão em construção.</p>
        <a class="hero__btn hero__btn--primary" href="../Inicio/inicio.html">Voltar ao início</a>
      </div>
    </div>
  `;
}
