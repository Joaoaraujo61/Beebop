// js/pages/Inicio/inicio.js

// import { searchSongs } from '../../services/itunesApi.js';
// import { appState } from '../../store/appState.js';

export function initInicioPage({ header }) {
  // "header" já vem pronto, injetado pelo app.js

  // async function handleSearch(query) {
  //   appState.setSearchQuery(query);
  //   const results = await searchSongs(query);
  //   appState.setResults(results);
  //   renderResults(results);
  // }

  // function renderResults(results) {
    const container = document.getElementById('results-container');
    container.innerHTML = '<p>llllll</p>';
  // }

  // conecta o header desta página específica ao handler
  //header.setOnSearch(handleSearch);
}
