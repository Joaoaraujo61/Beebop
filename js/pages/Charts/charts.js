// js/pages/Charts/charts.js
//
// Nas duas versões originais deste projeto, js/pages/Charts/charts.js
// estava vazio — mas o header (components/header.js) já linka para
// "../Charts/charts.html", e app.js já importa initChartsPage. Sem este
// arquivo, clicar em "Charts" no menu resultava em erro de JS (import de
// um módulo sem esse export). Este placeholder segue o mesmo padrão já
// usado em pages/Artista/artista.js para evitar a quebra, sem ser a
// implementação final da funcionalidade (que fica para uma próxima etapa
// — ver README/relatório de consolidação).

export function initChartsPage({ header }) {
  const container = document.getElementById('results-container');

  container.innerHTML = `
    <div class="album-page">
      <div class="album-page__error">
        <p>Os Charts (rankings) ainda estão em construção.</p>
        <a class="hero__btn hero__btn--primary" href="../Inicio/inicio.html">Voltar ao início</a>
      </div>
    </div>
  `;
}
