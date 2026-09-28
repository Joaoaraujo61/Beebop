// js/pages/Artista/artista.js
//
// Página de detalhe de um artista, seguindo o mesmo padrão de Música e
// Álbum. Recebe a identificação do artista pela URL:
//   ?id=<artistId ou id curado>&nome=<nome>
//
// - `id` numérico (artistId real da iTunes API): lookup direto
//   (buscarArtistaPorId) — traz o artista + todos os álbuns dele.
// - Qualquer outro id (ex.: "curado-artista-...", de um card da seleção
//   curada cuja busca por nome não encontrou correspondência — ver
//   getArtistasParaDescoberta em curatedSelections.js) ou se o lookup
//   falhar: busca por "nome" e usa o melhor resultado.
//
// Músicas: a iTunes API não tem um endpoint de "top tracks por artista" —
// usamos busca por nome (entity=song, buscarMusicas) como aproximação. Os
// resultados vêm ordenados por relevância da própria API, não por
// popularidade real; é a mesma limitação que qualquer app baseado só na
// iTunes Search API teria aqui.
//
// Álbuns e músicas reaproveitam os cards já existentes (albumCard.js,
// trackCard.js) — favoritar e navegar pra Álbum/Música funcionam do
// mesmo jeito que em Explorar, sem duplicar lógica.
//
// Notas: reais quando o item bate com a seleção curada; senão, mockadas
// (determinísticas) — ver getNotaAlbumCurada/getNotaCurada em
// curatedSelections.js.

import { buscarArtistaPorId, buscarArtistas, buscarMusicas } from '../../services/itunesApi.js';
import { getState, toggleSavedItem } from '../../store/appState.js';
import { renderAlbumCard, attachAlbumCardEvents } from '../../components/albumCard.js';
import { renderTrackCard, attachTrackCardEvents } from '../../components/trackCard.js';
import { getNotaAlbumCurada, getNotaCurada } from '../../data/curatedSelections.js';
import { renderComentarios } from '../../components/comentarios.js';

const ALBUNS_VISIVEIS_INICIAL = 6;
const MUSICAS_VISIVEIS_INICIAL = 6;

export function initArtistaPage({ header } = {}) {
  const container = document.getElementById('results-container');
  if (!container) {
    console.warn('#results-container não encontrado na página de Artista.');
    return;
  }

  container.classList.add('artista-page');
  container.innerHTML = '<p class="artista-page__status">Carregando artista...</p>';

  const params = new URLSearchParams(window.location.search);
  const idParam = params.get('id') ?? params.get('artistId');
  const nomeParam = params.get('nome') ?? params.get('artista');

  if (!idParam && !nomeParam) {
    container.innerHTML = renderErro('Nenhum artista informado.');
    return;
  }

  carregarArtista({ idParam, nomeParam })
    .then(async (dados) => {
      if (!dados?.artista) {
        container.innerHTML = renderErro('Não foi possível encontrar esse artista.');
        return;
      }
      const musicas = await buscarMusicasDoArtista(dados.artista.nome);
      renderPagina(container, dados.artista, dados.albuns ?? [], musicas);
    })
    .catch(() => {
      container.innerHTML = renderErro('Não foi possível carregar esse artista agora. Tente novamente.');
    });
}

async function carregarArtista({ idParam, nomeParam }) {
  if (idParam && /^\d+$/.test(idParam)) {
    const dados = await buscarArtistaPorId(idParam);
    if (dados.artista) return dados;
  }

  if (nomeParam) {
    const [encontrado] = await buscarArtistas(nomeParam, { limit: 1 });
    if (encontrado) return buscarArtistaPorId(encontrado.id);
  }

  return null;
}

async function buscarMusicasDoArtista(nomeArtista) {
  try {
    return await buscarMusicas(nomeArtista, { limit: 14 });
  } catch {
    return [];
  }
}

function renderPagina(container, artista, albuns, musicas) {
  const savedIds = new Set(getState().savedItems.map((item) => String(item.id)));

  const albunsComNota = albuns.map((a) => ({
    ...a,
    nota: typeof a.nota === 'number' ? a.nota : getNotaAlbumCurada(a.artista, a.titulo)?.nota,
  }));
  const musicasComNota = musicas.map((m) => ({
    ...m,
    nota: typeof m.nota === 'number' ? m.nota : getNotaCurada(m.artista, m.titulo)?.nota,
  }));

  container.innerHTML = `
    <div class="artista-hero">
      <div class="artista-hero__avatar">${iniciais(artista.nome)}</div>
      <div class="artista-hero__info">
        <span class="artista-hero__eyebrow">Artista</span>
        <h1 class="artista-hero__nome">${escaparHtml(artista.nome)}</h1>
        ${artista.genero ? `<p class="artista-hero__genero">${escaparHtml(artista.genero)}</p>` : ''}
      </div>
    </div>

    <section class="artista-secao" data-secao="albuns">
      <h2 class="artista-secao__titulo">Principais Álbuns</h2>
      <div class="album_grid" data-grid="albuns"></div>
      ${albunsComNota.length > ALBUNS_VISIVEIS_INICIAL ? '<button class="artista-vermais" type="button" data-vermais="albuns">Ver mais álbuns</button>' : ''}
    </section>

    <section class="artista-secao" data-secao="musicas">
      <h2 class="artista-secao__titulo">Principais Músicas</h2>
      <div class="track_grid" data-grid="musicas"></div>
      ${musicasComNota.length > MUSICAS_VISIVEIS_INICIAL ? '<button class="artista-vermais" type="button" data-vermais="musicas">Ver mais músicas</button>' : ''}
    </section>

    <section class="artista-secao" data-secao="comentarios">
      <h2 class="artista-secao__titulo">Comentários</h2>
      <div data-comentarios></div>
    </section>
  `;

  

  renderGridExpandivel(container, {
    chave: 'albuns',
    itens: albunsComNota,
    quantidadeInicial: ALBUNS_VISIVEIS_INICIAL,
    renderFn: renderAlbumCard,
    attachFn: attachAlbumCardEvents,
    savedIds,
    mensagemVazio: 'Nenhum álbum encontrado para este artista.',
  });

  renderGridExpandivel(container, {
    chave: 'musicas',
    itens: musicasComNota,
    quantidadeInicial: MUSICAS_VISIVEIS_INICIAL,
    renderFn: renderTrackCard,
    attachFn: attachTrackCardEvents,
    savedIds,
    mensagemVazio: 'Nenhuma música encontrada para este artista.',
  });

  const comentariosEl = renderComentarios({
    tipo: 'artista',
    id: artista.id,
    placeholder: 'O que você acha desse artista?',
  });
  container.querySelector('[data-comentarios]').appendChild(comentariosEl);
}

function renderGridExpandivel(container, { chave, itens, quantidadeInicial, renderFn, attachFn, savedIds, mensagemVazio }) {
  const grid = container.querySelector(`[data-grid="${chave}"]`);
  const botao = container.querySelector(`[data-vermais="${chave}"]`);
  const labelVerMais = botao?.textContent ?? '';
  let expandido = false;

  function desenhar() {
    const visiveis = expandido ? itens : itens.slice(0, quantidadeInicial);
    grid.innerHTML = visiveis.length
      ? visiveis.map((item) => renderFn(item, { saved: savedIds.has(String(item.id)) })).join('')
      : `<p class="artista-secao__vazio">${mensagemVazio}</p>`;
    attachFn(grid, visiveis, toggleSavedItem);
    if (botao) botao.textContent = expandido ? 'Ver menos' : labelVerMais;
  }

  desenhar();

  botao?.addEventListener('click', () => {
    expandido = !expandido;
    desenhar();
  });
}

function iniciais(nome) {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  const letras = partes.length > 1 ? partes[0][0] + partes[1][0] : partes[0].slice(0, 2);
  return letras.toUpperCase();
}

function escaparHtml(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderErro(mensagem) {
  return `
    <div class="artista-page__error">
      <p>${mensagem}</p>
      <a href="../Explorar/explorar.html">Voltar para Explorar</a>
    </div>
  `;
}