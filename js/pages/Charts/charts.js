
// js/pages/Charts/charts.js

import {
  getAlbunsRankeados,
  getMusicasRankeadas,
} from '../../data/curatedSelections.js';

import { renderMusicCard } from '../../components/musicCard.js';
import { renderChartRow } from '../../components/chartRow.js';
import {
  paginate,
  getPaginationInfo,
  getPageRange,
} from '../../utils/pagination.js';

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

      <p>
        Posições calculadas a partir de notas consolidadas em críticas e
        listas públicas. Como o Beebop ainda não tem um serviço de avaliações
        próprio, este ranking usa a curadoria editorial enriquecida pela
        iTunes API.
      </p>
    </div>

    <div class="charts_period">
      ${PERIODOS.map((periodo) => `
        <button
          class="charts_period_btn"
          data-periodo="${periodo.id}"
          type="button"
        >
          ${periodo.label}
        </button>
      `).join('')}
    </div>

    <div class="charts_podium">
      <div
        class="charts_podium_slot charts_podium_slot--2"
        data-slot="2"
      ></div>

      <div
        class="charts_podium_slot charts_podium_slot--1"
        data-slot="1"
      ></div>

      <div
        class="charts_podium_slot charts_podium_slot--3"
        data-slot="3"
      ></div>
    </div>

    <div class="charts_tabs">
      ${CATEGORIAS.map((categoria) => `
        <button
          class="charts_tab"
          data-categoria="${categoria.id}"
          type="button"
        >
          ${categoria.label}
        </button>
      `).join('')}
    </div>

    <div class="charts_genres"></div>

    <p class="charts_list_label"></p>

    <p
      class="charts_status"
      hidden
    ></p>

    <div class="charts_list"></div>

    <p class="charts_methodology">
      <b>Metodologia:</b>
      as notas de álbum partem de agregadores públicos de crítica
      (Metacritic, Album of the Year) e do consenso crítico em torno de cada
      disco. Capas e gêneros são buscados em tempo real na iTunes Search API
      (country=BR). "Avaliações" e a variação por período ainda são simuladas
      — dependem do futuro <code>reviewService</code>.
    </p>
  `;
}

/*
 * Pseudo-aleatório determinístico.
 *
 * É utilizado apenas para simular a quantidade de avaliações
 * e a variação por período enquanto não existe reviewService.
 */
function seed(str) {
  let h = 0;

  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }

  return h;
}

function avaliacoesSimuladas(item, escala) {
  const base = 4000 + (seed(String(item.id)) % 20000);

  return Math.round(base * escala);
}

function variacaoSimulada(item, periodoId) {
  const h = seed(String(item.id) + periodoId);

  return (h % 9) - 4;
}

/*
 * Cria o ranking de artistas a partir dos álbuns.
 *
 * Cada artista é representado pelo álbum com maior nota.
 * O gênero utilizado será o gênero desse álbum.
 */
function agruparPorArtista(albuns) {
  const porArtista = new Map();

  albuns.forEach((album) => {
    if (!album?.artista) return;

    const atual = porArtista.get(album.artista);

    if (!atual || Number(album.nota) > Number(atual.nota)) {
      porArtista.set(album.artista, album);
    }
  });

  return Array.from(porArtista.values())
    .sort((a, b) => Number(b.nota) - Number(a.nota))
    .map((item, indice) => ({
      ...item,
      posicao: indice + 1,
    }));
}

/*
 * Retorna a escala correspondente ao período atual.
 */
function getEscalaPeriodo(periodoId) {
  return (
    PERIODOS.find((periodo) => periodo.id === periodoId)?.escala ?? 1
  );
}

/*
 * Calcula a pontuação utilizada pelo ranking.
 *
 * Importante:
 * a escala não altera a ordem sozinha, pois seria apenas uma
 * multiplicação por um fator comum. Por isso, a quantidade de
 * avaliações simuladas também entra na pontuação do período.
 *
 * Enquanto o reviewService não existe, essa função representa
 * o recorte temporal de forma determinística.
 */
function calcularPontuacaoPeriodo(item, periodoId) {
  const escala = getEscalaPeriodo(periodoId);

  const nota = Number(item.nota) || 0;

  const avaliacoes = avaliacoesSimuladas(item, escala);

  /*
   * A nota continua sendo o fator principal.
   * As avaliações funcionam como critério secundário para
   * diferenciar itens com notas muito próximas.
   */
  return (
    nota * 1000000 +
    avaliacoes
  );
}

/*
 * Ordena e reposiciona o ranking depois dos filtros.
 */
function ordenarRanking(lista, periodoId) {
  return lista
    .slice()
    .sort((a, b) => {
      const pontuacaoA = calcularPontuacaoPeriodo(a, periodoId);
      const pontuacaoB = calcularPontuacaoPeriodo(b, periodoId);

      if (pontuacaoB !== pontuacaoA) {
        return pontuacaoB - pontuacaoA;
      }

      return String(a.artista ?? '').localeCompare(
        String(b.artista ?? ''),
        'pt-BR'
      );
    })
    .map((item, indice) => ({
      ...item,
      posicao: indice + 1,
    }));
}

export function initChartsPage() {
  const container = document.getElementById('results-container');

  if (!container) {
    console.warn(
      '#results-container não encontrado na página de Charts.'
    );

    return;
  }

  container.classList.add('charts');
  container.innerHTML = buildShellMarkup();

  const el = {
    periodoBtns: container.querySelectorAll(
      '.charts_period_btn'
    ),

    categoriaBtns: container.querySelectorAll(
      '.charts_tab'
    ),

    genresRow: container.querySelector(
      '.charts_genres'
    ),

    podiumSlots: {
      1: container.querySelector('[data-slot="1"]'),
      2: container.querySelector('[data-slot="2"]'),
      3: container.querySelector('[data-slot="3"]'),
    },

    listLabel: container.querySelector(
      '.charts_list_label'
    ),

    status: container.querySelector(
      '.charts_status'
    ),

    list: container.querySelector(
      '.charts_list'
    ),
  };

  let periodoAtivo = 'todos';
  let categoriaAtiva = 'albuns';
  let generoAtivo = TODOS_OS_GENEROS;
  let paginaAtual = 1;

  /*
   * Os dados são carregados uma vez e reutilizados
   * durante as mudanças de filtro.
   */
  const cache = {
    albuns: null,
    musicas: null,
    artistas: null,
  };

  function mostrarStatus(texto) {
    el.status.hidden = !texto;
    el.status.textContent = texto ?? '';
  }

  async function garantirCategoriaCarregada(categoria) {
    if (categoria === 'artistas') {
      if (!cache.albuns) {
        cache.albuns = await getAlbunsRankeados();
      }

      if (!cache.artistas) {
        cache.artistas = agruparPorArtista(
          cache.albuns
        );
      }

      return;
    }

    if (
      categoria === 'albuns' &&
      !cache.albuns
    ) {
      cache.albuns = await getAlbunsRankeados();
    }

    if (
      categoria === 'musicas' &&
      !cache.musicas
    ) {
      cache.musicas = await getMusicasRankeadas();
    }
  }

  /*
   * Renderiza os filtros de gênero disponíveis
   * para a categoria atual.
   */
  function renderGeneroChips(lista) {
    const generos = [
      TODOS_OS_GENEROS,
      ...new Set(
        lista
          .map((item) => item?.genero)
          .filter(Boolean)
      ),
    ];

    /*
     * Se o gênero anteriormente selecionado não existir
     * na nova categoria, volta para "Todos os gêneros".
     */
    if (
      generoAtivo !== TODOS_OS_GENEROS &&
      !generos.includes(generoAtivo)
    ) {
      generoAtivo = TODOS_OS_GENEROS;
      paginaAtual = 1;
    }

    el.genresRow.innerHTML = generos
      .map((genero) => `
        <button
          class="charts_chip${
            genero === generoAtivo
              ? ' charts_chip--active'
              : ''
          }"
          data-genero="${genero}"
          type="button"
        >
          ${genero}
        </button>
      `)
      .join('');

    el.genresRow
      .querySelectorAll('.charts_chip')
      .forEach((chip) => {
        chip.addEventListener('click', () => {
          const novoGenero = chip.dataset.genero;

          if (novoGenero === generoAtivo) {
            return;
          }

          generoAtivo = novoGenero;
          paginaAtual = 1;

          renderTudo();
        });
      });
  }

  /*
   * Aplica os filtros na seguinte ordem:
   *
   * 1. categoria
   * 2. gênero
   * 3. período
   * 4. ordenação
   * 5. posição
   */
  function datasetFiltrado() {
    const base = cache[categoriaAtiva] ?? [];

    const filtrado = generoAtivo === TODOS_OS_GENEROS
      ? base
      : base.filter(
          (item) =>
            item?.genero === generoAtivo
        );

    return ordenarRanking(
      filtrado,
      periodoAtivo
    );
  }

  function renderPodio(dataset) {
    [1, 2, 3].forEach((posicao) => {
      const slot = el.podiumSlots[posicao];

      slot.innerHTML = '';

      const item = dataset[posicao - 1];

      if (!item) {
        return;
      }

      const card = renderMusicCard({
        id: item.id,
        title: item.titulo,
        artist: item.artista,
        cover: item.capa,
        rating: item.nota,
        rank: posicao,
      });

      slot.appendChild(card);

      const legenda =
        document.createElement('p');

      legenda.className =
        'charts_podium_count';

      legenda.textContent =
        `${avaliacoesSimuladas(
          item,
          getEscalaPeriodo(periodoAtivo)
        ).toLocaleString('pt-BR')} notas`;

      slot.appendChild(legenda);
    });
  }

  function renderLista(dataset) {
    const categoria =
      CATEGORIAS.find(
        (item) =>
          item.id === categoriaAtiva
      );

    const periodo =
      PERIODOS.find(
        (item) =>
          item.id === periodoAtivo
      );

    el.listLabel.textContent =
      `TOP ${categoria?.label?.toUpperCase() ?? ''} · ` +
      `${periodo?.label?.toUpperCase() ?? ''}`;

    removerPager();

    if (!dataset.length) {
      el.list.innerHTML = '';

      mostrarStatus(
        `Nenhum item encontrado para "${generoAtivo}".`
      );

      return;
    }

    mostrarStatus(null);

    /*
     * Garante que a página atual nunca fique além
     * da quantidade de páginas disponível após um filtro.
     */
    const info = getPaginationInfo(
      dataset.length,
      paginaAtual,
      ITENS_POR_PAGINA
    );

    if (
      paginaAtual > info.totalPages &&
      info.totalPages > 0
    ) {
      paginaAtual = info.totalPages;

      return renderLista(dataset);
    }

    const pagina = paginate(
      dataset,
      paginaAtual,
      ITENS_POR_PAGINA
    );

    const escala =
      getEscalaPeriodo(periodoAtivo);

    el.list.innerHTML = pagina
      .map((item) =>
        renderChartRow({
          ...item,

          avaliacoes:
            avaliacoesSimuladas(
              item,
              escala
            ),

          variacao:
            variacaoSimulada(
              item,
              periodoAtivo
            ),
        })
      )
      .join('');

    renderPager(info.totalPages);
  }

  function removerPager() {
    const existente =
      container.querySelector(
        '.charts_pager'
      );

    existente?.remove();
  }

  function renderPager(totalPages) {
    if (totalPages <= 1) {
      return;
    }

    const range = getPageRange(
      paginaAtual,
      totalPages
    );

    const pager =
      document.createElement('div');

    pager.className =
      'charts_pager';

    pager.innerHTML = range
      .map((pagina) => `
        <button
          class="charts_pager_btn${
            pagina === paginaAtual
              ? ' charts_pager_btn--active'
              : ''
          }"
          data-pagina="${pagina}"
          type="button"
        >
          ${pagina}
        </button>
      `)
      .join('');

    el.list.insertAdjacentElement(
      'afterend',
      pager
    );

    pager
      .querySelectorAll('.charts_pager_btn')
      .forEach((btn) => {
        btn.addEventListener(
          'click',
          () => {
            const novaPagina =
              Number(btn.dataset.pagina);

            if (
              !Number.isInteger(novaPagina) ||
              novaPagina < 1 ||
              novaPagina > totalPages
            ) {
              return;
            }

            paginaAtual = novaPagina;

            renderLista(
              datasetFiltrado()
            );
          }
        );
      });
  }

  function renderTudo() {
    const base =
      cache[categoriaAtiva] ?? [];

    renderGeneroChips(base);

    const dataset =
      datasetFiltrado();

    renderPodio(dataset);
    renderLista(dataset);
  }

  function atualizarPeriodoAtivo() {
    el.periodoBtns.forEach((btn) => {
      btn.classList.toggle(
        'charts_period_btn--active',
        btn.dataset.periodo ===
          periodoAtivo
      );
    });
  }

  function atualizarCategoriaAtiva() {
    el.categoriaBtns.forEach((btn) => {
      btn.classList.toggle(
        'charts_tab--active',
        btn.dataset.categoria ===
          categoriaAtiva
      );
    });
  }

  function attachEvents() {
    /*
     * Filtro de período
     */
    el.periodoBtns.forEach((btn) => {
      btn.addEventListener(
        'click',
        () => {
          const novoPeriodo =
            btn.dataset.periodo;

          if (
            novoPeriodo === periodoAtivo
          ) {
            return;
          }

          periodoAtivo =
            novoPeriodo;

          paginaAtual = 1;

          atualizarPeriodoAtivo();

          renderTudo();
        }
      );
    });

    /*
     * Filtro de categoria
     */
    el.categoriaBtns.forEach((btn) => {
      btn.addEventListener(
        'click',
        async () => {
          const novaCategoria =
            btn.dataset.categoria;

          if (
            novaCategoria ===
            categoriaAtiva
          ) {
            return;
          }

          categoriaAtiva =
            novaCategoria;

          generoAtivo =
            TODOS_OS_GENEROS;

          paginaAtual = 1;

          atualizarCategoriaAtiva();

          mostrarStatus(
            'Carregando ranking...'
          );

          try {
            await garantirCategoriaCarregada(
              categoriaAtiva
            );

            mostrarStatus(null);

            renderTudo();
          } catch (erro) {
            console.error(
              'Erro ao carregar ranking:',
              erro
            );

            mostrarStatus(
              'Não foi possível carregar este ranking.'
            );
          }
        }
      );
    });
  }

  async function iniciar() {
    attachEvents();

    atualizarPeriodoAtivo();
    atualizarCategoriaAtiva();

    mostrarStatus(
      'Carregando ranking...'
    );

    try {
      await garantirCategoriaCarregada(
        categoriaAtiva
      );

      mostrarStatus(null);

      renderTudo();
    } catch (erro) {
      console.error(
        'Erro ao inicializar Charts:',
        erro
      );

      mostrarStatus(
        'Não foi possível carregar o ranking.'
      );
    }
  }

  iniciar();
}
