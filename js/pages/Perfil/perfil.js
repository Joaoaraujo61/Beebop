// js/pages/Perfil/perfil.js
//
// BUG CORRIGIDO NESTA CONSOLIDAÇÃO: nas duas versões originais, este
// arquivo era uma cópia colada por engano de components/header.js (exportava
// `renderHeader`, não `initPerfilPage`). Como app.js importa
// `{ initPerfilPage }` deste módulo, a rota "/perfil" quebrava com um erro
// de JS nas duas versões.
//
// css/components.css já tem os estilos prontos para o cabeçalho de perfil
// (.profile-header__*) e para o card "DNA Musical" (.dna-*, ver também
// utils/helpers.js -> buildRadarPoints/buildRadarLabelPositions), mas
// nenhuma das duas versões chegou a implementar esta página de fato — não
// há dados de perfil/gêneros favoritos definidos em nenhum lugar do
// projeto. Este placeholder corrige a quebra sem inventar dados de
// usuário; a implementação completa (consumindo os estilos e helpers já
// existentes) fica como próximo passo — ver relatório de consolidação.

export function initPerfilPage({ header }) {
  const container = document.getElementById('results-container');

  container.innerHTML = `
    <div class="album-page">
      <div class="album-page__error">
        <p>O Perfil ainda está em construção.</p>
        <a class="hero__btn hero__btn--primary" href="../Inicio/inicio.html">Voltar ao início</a>
      </div>
    </div>
  `;
}
