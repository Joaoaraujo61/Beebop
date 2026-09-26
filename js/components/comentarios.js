// js/components/comentarios.js
//
// Seção de comentários reutilizável — usada abaixo da letra na página
// de Música e (a integrar da mesma forma) na página de Álbum. Toda a
// persistência é client-side, por usuário, via
// js/services/comentariosService.js (localStorage, sem backend).
//
// Uso:
//   import { renderComentarios } from '../../components/comentarios.js';
//   const el = renderComentarios({
//     tipo: 'musica',              // ou 'album' — qualquer string, só
//                                  // precisa ser consistente entre chamadas
//     id: faixa.id,                // id único do item (trackId, collectionId...)
//     placeholder: 'O que você achou dessa música?',
//   });
//   algumContainer.appendChild(el);
//
// Login: reaproveita appState.user (login simulado do projeto — ver
// contexto do Beebop). Sem usuário logado, a seção continua mostrando
// os comentários existentes (leitura pública), mas troca o formulário
// por um aviso pedindo login, e bloqueia curtir/responder — mesmo
// padrão que app.js já documenta para a seção de reviews do Álbum
// ("o bloqueio delas deve acontecer dentro do próprio componente").

import { getState, subscribe } from '../store/appState.js';
import {
  listarComentarios,
  adicionarComentario,
  alternarCurtida,
  adicionarResposta,
  extrairIdentidadeUsuario,
} from '../services/comentariosService.js';

/**
 * @param {{tipo: string, id: string|number, placeholder?: string}} opcoes
 * @returns {HTMLElement}
 */
export function renderComentarios({ tipo, id, placeholder }) {
  const section = document.createElement('section');
  section.className = 'comentarios';
  section.innerHTML = `
    <h2 class="comentarios_titulo">Comentários</h2>
    <div class="comentarios_composer"></div>
    <div class="comentarios_lista"></div>
  `;

  const composerEl = section.querySelector('.comentarios_composer');
  const listaEl = section.querySelector('.comentarios_lista');

  function usuarioAtual() {
    return extrairIdentidadeUsuario(getState().user);
  }

  function renderComposer() {
    const usuario = usuarioAtual();

    if (!usuario) {
      composerEl.innerHTML = `<p class="comentarios_login_aviso">Faça login para comentar e avaliar.</p>`;
      return;
    }

    composerEl.innerHTML = `
      <textarea class="comentarios_input" placeholder="${placeholder || 'O que você achou?'}"></textarea>
      <div class="comentarios_composer_footer">
        <label class="comentarios_nota_campo">
          Sua nota (opcional)
          <input type="number" min="0" max="10" step="0.5" class="comentarios_nota_input" placeholder="0–10" />
        </label>
        <button class="comentarios_publicar" type="button">Publicar</button>
      </div>
    `;

    const textarea = composerEl.querySelector('.comentarios_input');
    const notaInput = composerEl.querySelector('.comentarios_nota_input');
    const publicarBtn = composerEl.querySelector('.comentarios_publicar');

    publicarBtn.addEventListener('click', () => {
      const texto = textarea.value.trim();
      if (!texto) {
        textarea.focus();
        return;
      }

      const notaBruta = notaInput.value.trim();
      const nota = notaBruta === '' ? null : Math.min(10, Math.max(0, Number(notaBruta)));

      adicionarComentario(tipo, id, {
        usuarioId: usuario.id,
        usuarioNome: usuario.nome,
        texto,
        nota,
      });

      textarea.value = '';
      notaInput.value = '';
      renderLista();
    });
  }

  function renderLista() {
    const comentarios = listarComentarios(tipo, id);
    const usuario = usuarioAtual();

    if (!comentarios.length) {
      listaEl.innerHTML = `<p class="comentarios_vazio">Nenhum comentário ainda. Seja o primeiro a comentar!</p>`;
      return;
    }

    listaEl.innerHTML = comentarios.map((c) => renderItem(c, usuario)).join('');
  }

  function renderItem(c, usuario) {
    const curtidoPeloUsuario = Boolean(usuario) && c.curtidoPor.includes(usuario.id);
    const notaMarkup = typeof c.nota === 'number'
      ? `<span class="comentarios_nota"><i class="fa-solid fa-star" aria-hidden="true"></i> ${c.nota.toFixed(1)}</span>`
      : '';

    const respostasMarkup = c.respostas
      .map((r) => `
        <div class="comentarios_resposta">
          <div class="comentarios_avatar comentarios_avatar--sm">${iniciais(r.usuarioNome)}</div>
          <div>
            <span class="comentarios_autor">@${escaparHtml(r.usuarioNome)}</span>
            <span class="comentarios_tempo">${tempoRelativo(r.data)}</span>
            <p class="comentarios_texto">${escaparHtml(r.texto)}</p>
          </div>
        </div>
      `)
      .join('');

    const respostaFormMarkup = usuario
      ? `<div class="comentarios_resposta_form">
           <input type="text" class="comentarios_resposta_input" placeholder="Responder @${escaparHtml(c.usuarioNome)}..." data-id="${c.id}" />
           <button class="comentarios_resposta_enviar" type="button" data-acao="enviar-resposta" data-id="${c.id}">Enviar</button>
         </div>`
      : '';

    return `
      <article class="comentarios_item" data-id="${c.id}">
        <div class="comentarios_avatar">${iniciais(c.usuarioNome)}</div>
        <div class="comentarios_corpo">
          <div class="comentarios_cabecalho">
            <span class="comentarios_autor">@${escaparHtml(c.usuarioNome)}</span>
            ${notaMarkup}
            <span class="comentarios_tempo">${tempoRelativo(c.data)}</span>
          </div>
          <p class="comentarios_texto">${escaparHtml(c.texto)}</p>
          <div class="comentarios_acoes">
            <button class="comentarios_curtir${curtidoPeloUsuario ? ' is-active' : ''}" type="button" data-acao="curtir" data-id="${c.id}">
              <i class="fa-${curtidoPeloUsuario ? 'solid' : 'regular'} fa-heart" aria-hidden="true"></i> ${c.curtidas}
            </button>
            <button class="comentarios_respostas_btn" type="button" data-acao="respostas" data-id="${c.id}">
              <i class="fa-regular fa-comment" aria-hidden="true"></i> ${c.respostas.length} resposta${c.respostas.length === 1 ? '' : 's'}
            </button>
          </div>
          <div class="comentarios_respostas" data-respostas="${c.id}" hidden>
            ${respostasMarkup}
            ${respostaFormMarkup}
          </div>
        </div>
      </article>
    `;
  }

  listaEl.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-acao]');
    if (!btn) return;

    const acao = btn.dataset.acao;
    const comentarioId = btn.dataset.id;

    if (acao === 'curtir') {
      const usuario = usuarioAtual();
      if (!usuario) {
        alert('Faça login para curtir comentários.');
        return;
      }
      alternarCurtida(tipo, id, comentarioId, usuario.id);
      renderLista();
      return;
    }

    if (acao === 'respostas') {
      const bloco = section.querySelector(`[data-respostas="${comentarioId}"]`);
      if (bloco) bloco.hidden = !bloco.hidden;
      return;
    }

    if (acao === 'enviar-resposta') {
      const usuario = usuarioAtual();
      if (!usuario) {
        alert('Faça login para responder.');
        return;
      }
      const input = section.querySelector(`.comentarios_resposta_input[data-id="${comentarioId}"]`);
      const texto = input?.value.trim();
      if (!texto) return;

      adicionarResposta(tipo, id, comentarioId, {
        usuarioId: usuario.id,
        usuarioNome: usuario.nome,
        texto,
      });
      renderLista();
    }
  });

  renderComposer();
  renderLista();

  // Só re-renderiza o composer quando o status de login muda de fato
  // (login/logout) — não a cada mudança do appState (ex: playingId
  // mudando ao tocar uma prévia), pra não apagar o que o usuário está
  // digitando no meio de um comentário.
  let logadoAnteriormente = Boolean(usuarioAtual());
  subscribe((state) => {
    const logadoAgora = Boolean(extrairIdentidadeUsuario(state.user));
    if (logadoAgora !== logadoAnteriormente) {
      logadoAnteriormente = logadoAgora;
      renderComposer();
    }
  });

  return section;
}

function iniciais(nome) {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  const letras = partes.length > 1 ? partes[0][0] + partes[1][0] : partes[0].slice(0, 2);
  return letras.toUpperCase();
}

function tempoRelativo(dataIso) {
  const diffMs = Date.now() - new Date(dataIso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return 'ontem';
  if (dias < 7) return `há ${dias} dias`;
  return new Date(dataIso).toLocaleDateString('pt-BR');
}

// Escapa &, <, > e " antes de inserir texto de terceiros (comentários de
// usuários) no innerHTML — evita que o texto digitado vire markup.
function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}