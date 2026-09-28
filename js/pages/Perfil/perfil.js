// js/pages/Perfil/perfil.js
//
// Página de Perfil (exige login — ver PROTECTED_PAGES em app.js).
// Reaproveita as classes já existentes em css/components.css
// (.profile-*, .dna-*, .music-card) e adiciona só o que é novo em
// perfil.css (abas, atividade, CTA do DNA e modal).
//
// Dados reais: usuário (appState.user) e favoritos (appState.savedItems).
// Dados MOCKADOS: DNA Musical e usuários sugeridos (js/data/perfilMock.js).

import { appState } from '../../store/appState.js';
import { renderMusicCard } from '../../components/musicCard.js';
import { DNA_MOCK, SIMILAR_USERS } from '../../data/perfilMock.js';

const FOLLOWING_KEY = 'beebop_following'; // { [userId]: [idsDeUsuariosSeguidos] }
const PLAYLISTS_KEY = 'beebop_playlists'; // chave já existente no projeto

const TABS = [
  { id: 'atividade', label: 'Atividade' },
  { id: 'listas', label: 'Listas' },
  { id: 'albuns', label: 'Álbuns' },
  { id: 'artistas', label: 'Artistas' },
];

/* ------------------------------ utilitários ------------------------------ */

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage indisponível: segue só em memória.
  }
}

function getFollowing(userId) {
  const all = readJson(FOLLOWING_KEY, {});
  return Array.isArray(all[userId]) ? all[userId] : [];
}

function setFollowing(userId, ids) {
  const all = readJson(FOLLOWING_KEY, {});
  all[userId] = ids;
  writeJson(FOLLOWING_KEY, all);
}

/** Aceita tanto o formato em inglês do card quanto o do itunesApi.js (PT). */
function normalizeSaved(item) {
  return {
    id: item.id,
    tipo: item.tipo ?? 'song',
    title: item.title ?? item.titulo ?? item.name ?? 'Sem título',
    artist: item.artist ?? item.artista ?? '',
    cover: item.cover ?? item.capa ?? '',
    previewUrl: item.previewUrl ?? item.preview ?? '',
    rating: typeof item.rating === 'number' ? item.rating : undefined,
  };
}

/* --------------------------------- página -------------------------------- */

export function initPerfilPage({ header }) {
  const container = document.getElementById('results-container');
  const { user } = appState.getState();
  if (!user) return; // app.js já redireciona visitantes; guarda extra.

  const displayName = user.nome || user.usuario || 'Usuário';
  const initial = displayName.trim().charAt(0).toUpperCase() || '?';
  let activeTab = 'atividade';

  container.innerHTML = `
    <div class="profile-page">
      <header class="profile-header">
        <div class="profile-header__avatar" aria-hidden="true">${escapeHtml(initial)}</div>
        <div class="profile-header__info">
          <h1 class="profile-header__name">${escapeHtml(displayName)}</h1>
          <p class="profile-header__handle">@${escapeHtml(user.usuario || '')}</p>
          <div class="profile-header__streaming">
            <button type="button" class="profile-header__stream-btn" disabled title="Em breve" aria-label="Conectar Spotify (em breve)"><i class="fa-brands fa-spotify" aria-hidden="true"></i></button>
            <button type="button" class="profile-header__stream-btn" disabled title="Em breve" aria-label="Conectar iTunes (em breve)"><i class="fa-brands fa-itunes-note" aria-hidden="true"></i></button>
          </div>
        </div>
        <div class="profile-header__stats" id="profile-stats"></div>
        <button type="button" class="hero__btn hero__btn--ghost" disabled title="Em breve">Editar perfil</button>
      </header>

      <nav class="profile-tabs" role="tablist" aria-label="Seções do perfil">
        ${TABS.map((t) => `
          <button type="button" role="tab" class="profile-tabs__tab${t.id === activeTab ? ' is-active' : ''}"
                  data-tab="${t.id}" aria-selected="${t.id === activeTab}">${t.label}</button>`).join('')}
      </nav>

      <div class="profile-content">
        <div class="profile-main" id="profile-panel" role="tabpanel"></div>
        <aside class="dna-card" id="dna-card"></aside>
      </div>
    </div>
  `;

  const statsEl = container.querySelector('#profile-stats');
  const panelEl = container.querySelector('#profile-panel');
  const dnaEl = container.querySelector('#dna-card');

  /* ------------------------------ estatísticas ----------------------------- */
  function getSaved() {
    return (appState.getState().savedItems || []).map(normalizeSaved);
  }
  function getPlaylists() {
    const list = readJson(PLAYLISTS_KEY, []);
    return Array.isArray(list) ? list : [];
  }

  function renderStats() {
    const saved = getSaved();
    const stats = [
      { label: 'Músicas', value: saved.filter((s) => s.tipo !== 'album').length },
      { label: 'Listas', value: getPlaylists().length },
      { label: 'Avaliações', value: 0 }, // reviews ainda são mock (sem persistência)
      { label: 'Seguindo', value: getFollowing(user.id).length },
      { label: 'Seguidores', value: 0 },
    ];
    statsEl.innerHTML = stats.map((s) => `
      <div class="profile-header__stat">
        <span class="profile-header__stat-value">${s.value}</span>
        <span class="profile-header__stat-label">${s.label}</span>
      </div>`).join('');
  }

  /* --------------------------------- abas ---------------------------------- */
  function emptyState(message, withLink = true) {
    return `<p class="album-page__empty">${message}${
      withLink ? ' <a class="profile-link" href="../Explorar/explorar.html">Explorar músicas</a>' : ''
    }</p>`;
  }

  function coverTile(item) {
    const cover = item.cover
      ? `<img src="${escapeHtml(item.cover)}" alt="Capa de ${escapeHtml(item.title)}" loading="lazy" />`
      : '<i class="fa-solid fa-compact-disc" aria-hidden="true"></i>';
    return `
      <div class="activity-item" title="${escapeHtml(item.title)}${item.artist ? ' — ' + escapeHtml(item.artist) : ''}">
        <div class="activity-item__cover">${cover}</div>
        <p class="activity-item__title">${escapeHtml(item.title)}</p>
      </div>`;
  }

  function renderPanel() {
    const saved = getSaved();
    panelEl.replaceChildren();

    if (activeTab === 'atividade') {
      const tracks = saved.filter((s) => s.tipo !== 'album');
      const favSection = document.createElement('section');
      favSection.className = 'profile-section';
      favSection.innerHTML = '<h2 class="album-section__title">Músicas favoritas</h2>';
      if (tracks.length === 0) {
        favSection.insertAdjacentHTML('beforeend', emptyState('Você ainda não favoritou nenhuma música.'));
      } else {
        const grid = document.createElement('div');
        grid.className = 'profile-favorites-grid';
        tracks.forEach((t) => grid.appendChild(renderMusicCard(t)));
        favSection.appendChild(grid);
      }

      const recentSection = document.createElement('section');
      recentSection.className = 'profile-section';
      recentSection.innerHTML = '<h2 class="album-section__title">Atividades recentes</h2>';
      const recent = [...saved].reverse().slice(0, 8);
      recentSection.insertAdjacentHTML(
        'beforeend',
        recent.length === 0
          ? emptyState('Sua atividade aparece aqui quando você salvar músicas e álbuns.', false)
          : `<div class="activity-grid">${recent.map(coverTile).join('')}</div>`
      );

      panelEl.append(favSection, recentSection);
    }

    if (activeTab === 'listas') {
      const playlists = getPlaylists();
      panelEl.innerHTML = `
        <section class="profile-section">
          <h2 class="album-section__title">Listas</h2>
          ${playlists.length === 0
            ? emptyState('Você ainda não criou nenhuma lista.', false)
            : `<ul class="profile-playlists">${playlists.map((p) => {
                const tracks = p.faixas ?? p.tracks ?? [];
                return `<li class="profile-playlists__item">
                  <i class="fa-solid fa-list-ul" aria-hidden="true"></i>
                  <span>${escapeHtml(p.nome ?? p.name ?? 'Lista sem nome')}</span>
                  <span class="profile-playlists__count">${Array.isArray(tracks) ? tracks.length : 0} faixas</span>
                </li>`;
              }).join('')}</ul>`}
        </section>`;
    }

    if (activeTab === 'albuns') {
      const albums = saved.filter((s) => s.tipo === 'album');
      panelEl.innerHTML = `
        <section class="profile-section">
          <h2 class="album-section__title">Álbuns salvos</h2>
          ${albums.length === 0
            ? emptyState('Você ainda não salvou nenhum álbum.')
            : `<div class="activity-grid">${albums.map(coverTile).join('')}</div>`}
        </section>`;
    }

    if (activeTab === 'artistas') {
      panelEl.innerHTML = `
        <section class="profile-section">
          <h2 class="album-section__title">Artistas</h2>
          ${emptyState('Você ainda não segue nenhum artista.')}
        </section>`;
    }
  }

  container.querySelector('.profile-tabs').addEventListener('click', (event) => {
    const tab = event.target.closest('[data-tab]');
    if (!tab || tab.dataset.tab === activeTab) return;
    activeTab = tab.dataset.tab;
    container.querySelectorAll('.profile-tabs__tab').forEach((btn) => {
      const on = btn.dataset.tab === activeTab;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', String(on));
    });
    renderPanel();
  });

  /* ------------------------------ DNA Musical ------------------------------ */
  renderDna(dnaEl, () => openSimilarUsersModal(user, renderStats));

  renderStats();
  renderPanel();
}

/* ------------------------------ card DNA Musical ------------------------------ */

function radarMarkup(genres) {
  const cx = 120, cy = 110, radius = 70;
  const point = (i, scale) => {
    const angle = (-90 + (360 / genres.length) * i) * (Math.PI / 180);
    return [cx + Math.cos(angle) * radius * scale, cy + Math.sin(angle) * radius * scale];
  };
  const polygon = (scales) => scales.map((s, i) => point(i, s).join(',')).join(' ');
  const rings = [1, 0.66, 0.33].map((r) =>
    `<polygon class="dna-radar__grid" points="${polygon(genres.map(() => r))}" />`).join('');
  const shape = `<polygon class="dna-radar__shape" points="${polygon(genres.map((g) => g.value))}" />`;
  const labels = genres.map((g, i) => {
    const [x, y] = point(i, 1.22);
    const anchor = x < cx - 4 ? 'end' : x > cx + 4 ? 'start' : 'middle';
    return `<text class="dna-radar__label" x="${x}" y="${y + 3}" text-anchor="${anchor}">${escapeHtml(g.label)}</text>`;
  }).join('');
  return `<svg class="dna-radar" viewBox="0 0 240 220" role="img" aria-label="Gráfico radar dos gêneros favoritos">${rings}${shape}${labels}</svg>`;
}

function donutGradient(moods) {
  let acc = 0;
  const stops = moods.map((m, i) => {
    const start = acc;
    acc += m.value;
    return `var(--dna-mood-${i + 1}) ${start}% ${acc}%`;
  });
  return `conic-gradient(${stops.join(', ')})`;
}

function renderDna(dnaEl, onOpenSimilar) {
  const d = DNA_MOCK;
  dnaEl.innerHTML = `
    <div class="dna-card__header">
      <i class="fa-solid fa-dna" aria-hidden="true"></i>
      <h2 class="dna-card__title">Meu DNA Musical</h2>
      <span class="dna-card__beta">BETA</span>
    </div>

    <div class="dna-block">
      <p class="dna-block__label">Gêneros favoritos</p>
      ${radarMarkup(d.genres)}
    </div>

    <div class="dna-block">
      <p class="dna-block__label">Décadas mais ouvidas</p>
      <div class="dna-bars">
        ${d.decades.map((x) => `
          <div class="dna-bar-row">
            <span class="dna-bar-row__label">${x.label}</span>
            <span class="dna-bar-row__track"><span class="dna-bar-row__fill" style="width:${x.value}%"></span></span>
            <span class="dna-bar-row__value">${x.value}%</span>
          </div>`).join('')}
      </div>
    </div>

    <div class="dna-block">
      <p class="dna-block__label">Artistas recorrentes</p>
      <div class="dna-pills">${d.artists.map((a) => `<span class="dna-pill">${escapeHtml(a)}</span>`).join('')}</div>
    </div>

    <div class="dna-block">
      <p class="dna-block__label">Humor predominante</p>
      <div class="dna-mood">
        <div class="dna-mood__donut" style="background:${donutGradient(d.moods)}">
          <div class="dna-mood__donut-hole"><span class="dna-mood__label">${d.score}</span></div>
        </div>
        <ul class="dna-mood-legend">
          ${d.moods.map((m, i) => `
            <li class="dna-mood-legend__item">
              <span class="dna-mood-legend__dot" style="background:var(--dna-mood-${i + 1})"></span>
              ${escapeHtml(m.label)}
              <span class="dna-mood-legend__value">${m.value}%</span>
            </li>`).join('')}
        </ul>
      </div>
      <p class="dna-mood__blurb">Seu perfil é <strong>${escapeHtml(d.profileName)}</strong> — ${escapeHtml(d.blurb)}</p>
    </div>

    <button type="button" class="dna-card__cta" id="dna-similar-btn">
      <i class="fa-solid fa-user-group" aria-hidden="true"></i>
      Conhecer pessoas com gostos parecidos
    </button>
  `;
  dnaEl.querySelector('#dna-similar-btn').addEventListener('click', onOpenSimilar);
}

/* --------------------------- modal de usuários parecidos --------------------------- */

function openSimilarUsersModal(user, onFollowingChange) {
  const previousFocus = document.activeElement;
  let following = getFollowing(user.id);

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="similar-title">
      <div class="modal__header">
        <div>
          <h2 class="modal__title" id="similar-title">Pessoas com gostos parecidos</h2>
          <p class="modal__subtitle">Sugestões fictícias, baseadas no seu DNA Musical.</p>
        </div>
        <button type="button" class="modal__close" aria-label="Fechar"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
      </div>
      <ul class="similar-list"></ul>
    </div>
  `;

  const listEl = overlay.querySelector('.similar-list');

  function renderList() {
    listEl.innerHTML = SIMILAR_USERS.map((u) => {
      const isFollowing = following.includes(u.id);
      return `
        <li class="similar-user">
          <div class="similar-user__avatar" aria-hidden="true">${escapeHtml(u.nome.charAt(0))}</div>
          <div class="similar-user__body">
            <p class="similar-user__name">${escapeHtml(u.nome)} <span class="similar-user__handle">@${escapeHtml(u.usuario)}</span></p>
            <p class="similar-user__bio">${escapeHtml(u.bio)}</p>
            <div class="dna-pills">
              ${u.generos.map((g) => `<span class="dna-pill">${escapeHtml(g)}</span>`).join('')}
              ${u.artistas.map((a) => `<span class="dna-pill">${escapeHtml(a)}</span>`).join('')}
            </div>
          </div>
          <div class="similar-user__side">
            <span class="similar-user__match">${u.afinidade}%</span>
            <span class="similar-user__match-label">afinidade</span>
            <button type="button" class="similar-user__follow${isFollowing ? ' is-following' : ''}" data-user="${u.id}">
              ${isFollowing ? 'Seguindo' : 'Seguir'}
            </button>
          </div>
        </li>`;
    }).join('');
  }

  function close() {
    document.removeEventListener('keydown', onKeydown);
    overlay.remove();
    document.body.classList.remove('modal-open');
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
  }

  function onKeydown(event) {
    if (event.key === 'Escape') {
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = overlay.querySelectorAll('button:not([disabled])');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
  overlay.querySelector('.modal__close').addEventListener('click', close);
  listEl.addEventListener('click', (event) => {
    const btn = event.target.closest('.similar-user__follow');
    if (!btn) return;
    const id = btn.dataset.user;
    following = following.includes(id) ? following.filter((x) => x !== id) : [...following, id];
    setFollowing(user.id, following);
    renderList();
    onFollowingChange();
  });

  renderList();
  document.body.appendChild(overlay);
  document.body.classList.add('modal-open');
  document.addEventListener('keydown', onKeydown);
  overlay.querySelector('.modal__close').focus();
}