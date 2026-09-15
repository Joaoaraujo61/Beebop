// js/pages/Artista/artista.js
//
// A página de Artista está fora do escopo desta rodada (só Perfil e
// Álbum foram pedidos). Sem este arquivo, o link "Navegar para
// artista" — que ESTE prompt pede tanto no Perfil quanto no Álbum —
// cairia num erro de JS (app.js importa initArtistaPage, que não
// existiria). Este placeholder só evita a quebra; não é a
// implementação da página, que fica pra uma próxima etapa.

export function initArtistaPage({ header }) {
  const container = document.getElementById('results-container');

  container.innerHTML = `
    <div class="album-page">
      <div class="album-page__error">
        <p>A página de artista ainda está em construção.</p>
        <a class="hero__btn hero__btn--primary" href="../Inicio/inicio.html">Voltar ao início</a>
      </div>
    </div>
  `;
}
