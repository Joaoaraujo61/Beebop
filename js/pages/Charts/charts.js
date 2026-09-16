// js/pages/Charts/charts.js

import { getAlbunsRankeados, getMusicasRankeadas } from '../../data/curatedSelections.js';
import { renderMusicCard } from '../../components/musicCard.js';
import { renderChartRow } from '../../components/chartRow.js';
import { paginate, getPaginationInfo, getPageRange } from '../../utils/pagination.js';

const ITENS_POR_PAGINA = 8;

const PERIODOS = [
  { id: 'semana', label: 'Semana', escala: 0.06 },
  { id: 'mes', label: 'Mês', escala: 0.24 },
  { id: 'ano', label: 'Ano', escala: 0.7 },
  { id: 'todos', label: 'Todos os tempos', escala: 1 },
];

const CATEGORIAS = [
  { id: 'albuns', label: 'Álbuns' },
  { id: 'musicas', label: 'Músicas' },
  { id: 'artistas', label: 'Artistas' },
];

const TODOS_OS_GENEROS = 'Todos os gêneros';

function buildShellMarkup() {
  return `
    <div class="charts_intro">
      <h1>O ranking de quem <span>realmente</span> ouve</h1>
      <p>Posições calculadas a partir de notas consolidadas em críticas e listas públicas. Como o Beebop ainda não tem um serviço de avaliações próprio, este ranking usa a curadoria editorial enriquecida pela iTunes API.</p>
    </div>

    <div class="charts_period">
      ${PERIODOS.map((p) => `<button class="charts_period_btn" data-periodo="${p.id}">${p.label}</button>`).join('')}
    </div>

    <div class="charts_podium">
      <div class="charts_podium_slot charts_podium_slot--2" data-slot="2"></div>
      <div class="charts_podium_slot charts_podium_slot--1" data-slot="1"></div>
      <div class="charts_podium_slot charts_podium_slot--3" data-slot="3"></div>
    </div>

    <div class="charts_tabs">
      ${CATEGORIAS.map((c) => `<button class="charts_tab" data-categoria="${c.id}">${c.label}</button>`).join('')}
    </div>

    <div class="charts_genres"></div>

    <p class="charts_list_label"></p>
    <p class="charts_status" hidden></p>
    <div class="charts_list"></div>

    <p class="charts_methodology">
      <b>Metodologia:</b> as notas de álbum partem de agregadores públicos de crítica (Metacritic, Album of the Year) e do consenso crítico em torno de cada disco. Capas e gêneros são buscados em tempo real na iTunes Search API (country=BR). "Avaliações" e a variação por período ainda são simuladas — dependem do futuro <code>reviewService</code>.
    </p>
  `;
}

// Pseudo-aleatório determinístico (mesma seed = mesmo resultado) — só para
// simular "avaliações" e variação por período, já que não existe reviewService
// real ainda. As notas em si (críticas) NÃO são simuladas.
function seed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function avaliacoesSimuladas(item, escala) {
  const base = 4000 + (seed(String(item.id)) % 20000);
  return Math.round(base * escala);
}

function variacaoSimulada(item, periodoId) {
  const h = seed(String(item.id) + periodoId);
  return (h % 9) - 4; // -4..4
}

function agruparPorArtista(albuns) {
  const porArtista = new Map();
  albuns.forEach((album) => {
    const atual = porArtista.get(album.artista);
    if (!atual || album.nota > atual.nota) porArtista.set(album.artista, album);
  });
  return Array.from(porArtista.values())
    .sort((a, b) => b.nota - a.nota)
    .map((item, indice) => ({ ...item, posicao: indice + 1 }));
}

export function initChartsPage({ header } = {}) {
  const container = document.getElementById('results-container');

  if (!container) {
    console.warn('#results-container não encontrado na página de Charts.');
    return;
  }

  container.classList.add('charts');
  container.innerHTML = buildShellMarkup();

  const el = {
    periodoBtns: container.querySelectorAll('.charts_period_btn'),
    categoriaBtns: container.querySelectorAll('.charts_tab'),
    genresRow: container.querySelector('.charts_genres'),
    podiumSlots: {
      1: container.querySelector('[data-slot="1"]'),
      2: container.querySelector('[data-slot="2"]'),
      3: container.querySelector('[data-slot="3"]'),
    },
    listLabel: container.querySelector('.charts_list_label'),
    status: container.querySelector('.charts_status'),
    list: container.querySelector('.charts_list'),
  };

  let periodoAtivo = 'todos';
  let categoriaAtiva = 'albuns';
  let generoAtivo = TODOS_OS_GENEROS;
  let paginaAtual = 1;

  // Rankings completos, buscados uma vez por categoria (dado curado, não
  // depende de termo de busca) e reaproveitados ao trocar período/gênero/página.
  const cache = { albuns: null, musicas: null, artistas: null };

  function mostrarStatus(texto) {
    el.status.hidden = !texto;
    el.status.textContent = texto ?? '';
  }

  async function garantirCategoriaCarregada(categoria) {
    if (categoria === 'artistas') {
      if (!cache.albuns) cache.albuns = await getAlbunsRankeados();
      if (!cache.artistas) cache.artistas = agruparPorArtista(cache.albuns);
      return;
    }
    if (categoria === 'albuns' && !cache.albuns) {
      cache.albuns = await getAlbunsRankeados();
    }
    if (categoria === 'musicas' && !cache.musicas) {
      cache.musicas = await getMusicasRankeadas();
    }
  }

  function renderGeneroChips(lista) {
    const generos = [TODOS_OS_GENEROS, ...new Set(lista.map((item) => item.genero).filter(Boolean))];
    el.genresRow.innerHTML = generos
      .map((genero) => `
        <button class="charts_chip${genero === generoAtivo ? ' charts_chip--active' : ''}" data-genero="${genero}">
          ${genero}
        </button>`)
      .join('');

    el.genresRow.querySelectorAll('.charts_chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        generoAtivo = chip.dataset.genero;
        paginaAtual = 1;
        renderTudo();
      });
    });
  }

  function datasetFiltrado() {
    const base = cache[categoriaAtiva] ?? [];
    const filtrado = generoAtivo === TODOS_OS_GENEROS
      ? base
      : base.filter((item) => item.genero === generoAtivo);

    // Reposiciona o ranking dentro do recorte atual (ex: "Rock" tem seu próprio #1),
    // em vez de manter os buracos da posição original no ranking geral.
    return filtrado
      .slice()
      .sort((a, b) => b.nota - a.nota)
      .map((item, indice) => ({ ...item, posicao: indice + 1 }));
  }

  function renderPodio(dataset) {
    const escala = PERIODOS.find((p) => p.id === periodoAtivo).escala;

    [1, 2, 3].forEach((posicao) => {
      const slot = el.podiumSlots[posicao];
      slot.innerHTML = '';
      const item = dataset[posicao - 1];
      if (!item) return;

      const card = renderMusicCard({
        id: item.id,
        title: item.titulo,
        artist: item.artista,
        cover: item.capa,
        rating: item.nota,
        rank: posicao,
      });
      slot.appendChild(card);

      const legenda = document.createElement('p');
      legenda.className = 'charts_podium_count';
      legenda.textContent = `${avaliacoesSimuladas(item, escala).toLocaleString('pt-BR')} notas`;
      slot.appendChild(legenda);
    });
  }

  function renderLista(dataset) {
    const categoriaLabel = CATEGORIAS.find((c) => c.id === categoriaAtiva).label.toUpperCase();
    const periodoLabel = PERIODOS.find((p) => p.id === periodoAtivo).label.toUpperCase();
    el.listLabel.textContent = `TOP ${categoriaLabel} · ${periodoLabel}`;

    removerPager();

    if (dataset.length === 0) {
      el.list.innerHTML = '';
      mostrarStatus(`Nenhum item encontrado para "${generoAtivo}".`);
      return;
    }
    mostrarStatus(null);

    const escala = PERIODOS.find((p) => p.id === periodoAtivo).escala;
    const info = getPaginationInfo(dataset.length, paginaAtual, ITENS_POR_PAGINA);
    const pagina = paginate(dataset, paginaAtual, ITENS_POR_PAGINA);

    el.list.innerHTML = pagina
      .map((item) => renderChartRow({
        ...item,
        avaliacoes: avaliacoesSimuladas(item, escala),
        variacao: variacaoSimulada(item, periodoAtivo),
      }))
      .join('');

    renderPager(info.totalPages);
  }

  function removerPager() {
    const existente = container.querySelector('.charts_pager');
    if (existente) existente.remove();
  }

  function renderPager(totalPages) {
    if (totalPages <= 1) return;

    const range = getPageRange(paginaAtual, totalPages);
    const pager = document.createElement('div');
    pager.className = 'charts_pager';
    pager.innerHTML = range
      .map((pagina) => `
        <button class="charts_pager_btn${pagina === paginaAtual ? ' charts_pager_btn--active' : ''}" data-pagina="${pagina}">
          ${pagina}
        </button>`)
      .join('');

    el.list.insertAdjacentElement('afterend', pager);

    pager.querySelectorAll('.charts_pager_btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        paginaAtual = Number(btn.dataset.pagina);
        renderLista(datasetFiltrado());
      });
    });
  }

  function renderTudo() {
    renderGeneroChips(cache[categoriaAtiva] ?? []);
    const dataset = datasetFiltrado();
    renderPodio(dataset);
    renderLista(dataset);
  }

  function attachEvents() {
    el.periodoBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        periodoAtivo = btn.dataset.periodo;
        el.periodoBtns.forEach((b) => b.classList.toggle('charts_period_btn--active', b === btn));
        renderTudo();
      });
    });

    el.categoriaBtns.forEach((btn) => {
      btn.addEventListener('click', async () => {
        categoriaAtiva = btn.dataset.categoria;
        el.categoriaBtns.forEach((b) => b.classList.toggle('charts_tab--active', b === btn));
        generoAtivo = TODOS_OS_GENEROS;
        paginaAtual = 1;

        mostrarStatus('Carregando ranking...');
        await garantirCategoriaCarregada(categoriaAtiva);
        mostrarStatus(null);
        renderTudo();
      });
    });
  }

  async function iniciar() {
    attachEvents();
    el.periodoBtns.forEach((b) => b.classList.toggle('charts_period_btn--active', b.dataset.periodo === periodoAtivo));
    el.categoriaBtns.forEach((b) => b.classList.toggle('charts_tab--active', b.dataset.categoria === categoriaAtiva));

    mostrarStatus('Carregando ranking...');
    await garantirCategoriaCarregada(categoriaAtiva);
    mostrarStatus(null);
    renderTudo();
  }

  iniciar();
}