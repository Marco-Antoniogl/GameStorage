/**
 * dashboard.js — Lógica completa da página de dashboard
 */
import { Auth }     from './auth.js';
import { Router }   from './router.js';
import { GamesAPI } from './api.js';
import { Toast, validateGame, debounce } from './utils.js';
import {
  renderNavbar, renderGameCard, renderSkeletons,
  renderStatsBar, renderFiltersBar, renderGameModal, renderPagination,
} from './components.js';

const PER_PAGE = 12;

let state = {
  allGames:  [],
  filtered:  [],
  page:      1,
  sortField: 'createdAt',
  sortOrder: 'desc',
  search:    '',
  genre:     '',
  platform:  '',
  status:    '',
};

// ── Render principal ──────────────────────────────────────────────────────────
export function renderDashboard() {
  const user = Auth.currentUser;
  const app  = document.getElementById('app');

  app.innerHTML = `
    ${renderNavbar(user)}
    <main class="main-content">
      <div class="page" id="dash-page">
        <div class="dash-header">
          <div>
            <h1 class="dash-title">OLÁ, <span>${(user?.displayName ?? 'Gamer').toUpperCase()}</span> 👾</h1>
            <p class="dash-subtitle" id="game-count">Carregando...</p>
          </div>
          <button class="btn btn-primary" id="btn-add-game">+ Adicionar Jogo</button>
        </div>
        <div id="stats-area"></div>
        ${renderFiltersBar()}
        <div id="alert-area"></div>
        <div class="game-grid" id="game-grid">${renderSkeletons()}</div>
        <div id="pagination-area"></div>
      </div>
    </main>
    <div class="toast-container" id="toast-container"></div>
  `;

  Toast.init();
  bindNavbar();
  loadGames();
  bindFilters();
  bindAddButton();
}

// ── Carregar jogos da API ─────────────────────────────────────────────────────
async function loadGames() {
  try {
    const result = await GamesAPI.list();
    state.allGames = result?.data ?? result ?? [];
    applyFilters();
  } catch (err) {
    Toast.error(err.message ?? 'Erro ao carregar jogos.');
  }
}

// ── Filtros ───────────────────────────────────────────────────────────────────
function applyFilters() {
  let games = [...state.allGames];

  if (state.search) {
    const term = state.search.toLowerCase();
    games = games.filter(g => g.nomeGame.toLowerCase().includes(term));
  }
  if (state.genre)    games = games.filter(g => g.genero === state.genre);
  if (state.platform) games = games.filter(g => g.plataforma === state.platform);
  if (state.status)   games = games.filter(g => g.status === state.status);

  games.sort((a, b) => {
    const va = a[state.sortField] ?? '';
    const vb = b[state.sortField] ?? '';
    const cmp = typeof va === 'number'
      ? va - vb
      : String(va).localeCompare(String(vb), 'pt-BR');
    return state.sortOrder === 'asc' ? cmp : -cmp;
  });

  state.filtered = games;
  state.page     = 1;
  renderGrid();
}

function renderGrid() {
  const { filtered, page } = state;
  const total      = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const slice      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  document.getElementById('game-count').textContent =
    `${total} jogo${total !== 1 ? 's' : ''} na biblioteca`;

  document.getElementById('stats-area').innerHTML = renderStatsBar(state.allGames);

  const grid = document.getElementById('game-grid');
  if (total === 0) {
    const hasFilter = state.search || state.genre || state.platform || state.status;
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">🎮</div>
        <h3 class="empty-title">Nenhum jogo encontrado</h3>
        <p class="empty-desc">${hasFilter ? 'Tente outros filtros' : 'Adicione seu primeiro jogo à biblioteca'}</p>
        ${!hasFilter ? '<button class="btn btn-primary" id="btn-add-empty">+ Adicionar Jogo</button>' : ''}
      </div>`;
    document.getElementById('btn-add-empty')?.addEventListener('click', openModal);
  } else {
    grid.innerHTML = slice.map(renderGameCard).join('');
    bindCardActions();
  }

  document.getElementById('pagination-area').innerHTML = renderPagination(page, totalPages);
  document.querySelectorAll('.pagination button[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.page = parseInt(btn.dataset.page);
      renderGrid();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

// ── Bind card actions ─────────────────────────────────────────────────────────
function bindCardActions() {
  document.querySelectorAll('.btn-edit-game').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.id));
  });
  document.querySelectorAll('.btn-delete-game').forEach(btn => {
    btn.addEventListener('click', () => deleteGame(btn.dataset.id));
  });
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function bindNavbar() {
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    Auth.logout();
    Router.navigate('/login', { replace: true });
  });
}

function bindAddButton() {
  document.getElementById('btn-add-game')?.addEventListener('click', () => openModal());
}

// ── Filtros bind ──────────────────────────────────────────────────────────────
function bindFilters() {
  const dSearch = debounce((val) => { state.search = val; applyFilters(); updateClearBtn(); }, 350);

  document.getElementById('filter-search')?.addEventListener('input', e => dSearch(e.target.value));
  document.getElementById('filter-genre')?.addEventListener('change', e => { state.genre = e.target.value; applyFilters(); updateClearBtn(); });
  document.getElementById('filter-platform')?.addEventListener('change', e => { state.platform = e.target.value; applyFilters(); updateClearBtn(); });
  document.getElementById('filter-status')?.addEventListener('change', e => { state.status = e.target.value; applyFilters(); updateClearBtn(); });
  document.getElementById('filter-sort')?.addEventListener('change', e => { state.sortField = e.target.value; applyFilters(); });

  document.getElementById('btn-sort-order')?.addEventListener('click', () => {
    state.sortOrder = state.sortOrder === 'desc' ? 'asc' : 'desc';
    document.getElementById('btn-sort-order').textContent = state.sortOrder === 'asc' ? '↑' : '↓';
    applyFilters();
  });

  document.getElementById('btn-clear-filters')?.addEventListener('click', clearFilters);
}

function updateClearBtn() {
  const hasFilter = state.search || state.genre || state.platform || state.status;
  document.getElementById('btn-clear-filters')?.classList.toggle('hidden', !hasFilter);
}

function clearFilters() {
  state.search = ''; state.genre = ''; state.platform = ''; state.status = '';
  document.getElementById('filter-search').value   = '';
  document.getElementById('filter-genre').value    = '';
  document.getElementById('filter-platform').value = '';
  document.getElementById('filter-status').value   = '';
  document.getElementById('btn-clear-filters')?.classList.add('hidden');
  applyFilters();
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function openModal(gameId = null) {
  const game = gameId ? state.allGames.find(g => g.id === gameId) : null;

  const wrapper = document.createElement('div');
  wrapper.id = 'modal-wrapper';
  wrapper.innerHTML = renderGameModal(game);
  document.body.appendChild(wrapper);

  const rangeEl   = document.getElementById('g-notaGame');
  const displayEl = document.getElementById('nota-display');
  rangeEl?.addEventListener('input', () => {
    displayEl.textContent = parseFloat(rangeEl.value).toFixed(1);
  });

  const close = () => wrapper.remove();
  document.getElementById('modal-close-btn')?.addEventListener('click', close);
  document.getElementById('modal-cancel-btn')?.addEventListener('click', close);
  document.getElementById('game-modal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) close();
  });

  const escHandler = e => {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); }
  };
  document.addEventListener('keydown', escHandler);

  document.getElementById('modal-save-btn')?.addEventListener('click', () => saveGame(game, close));
}

// ── Salvar jogo ───────────────────────────────────────────────────────────────
/*async function saveGame(existingGame, close) {
  const form = document.getElementById('game-form');
  const data = {
    nomeGame:       document.getElementById('g-nomeGame').value.trim(),
    genero:         document.getElementById('g-genero').value,
    plataforma:     document.getElementById('g-plataforma').value,
    status:         document.getElementById('g-status').value,
    horasDeJogo:    parseFloat(document.getElementById('g-horasDeJogo').value) || 0,
    notaGame:       parseFloat(document.getElementById('g-notaGame').value) || 0,
    dataFechamento: document.getElementById('g-dataFechamento').value || '',
    coverUrl:       document.getElementById('g-coverUrl').value.trim(),
  };

  form.querySelectorAll('.field').forEach(f => {
    f.classList.remove('has-error');
    f.querySelector('.field-error')?.remove();
  });

  const errors = validateGame(data);
  if (Object.keys(errors).length > 0) {
    for (const [key, msg] of Object.entries(errors)) {
      const input = document.getElementById(`g-${key}`);
      const field = input?.closest('.field');
      if (!field) continue;
      field.classList.add('has-error');
      const err = document.createElement('p');
      err.className = 'field-error';
      err.textContent = msg;
      field.appendChild(err);
    }
    return;
  }

  try {
    if (existingGame) {
      await GamesAPI.update(existingGame.id, data);
      Toast.success('Jogo atualizado com sucesso!');
    } else {
      await GamesAPI.create(data);
      Toast.success('Jogo adicionado à biblioteca!');
    }
    close();
    loadGames();
  } catch (err) {
    Toast.error(err.message ?? 'Erro ao salvar jogo.');
  }
}*/

function normalizeHoras(valor) {
  const horas = Math.floor(valor);
  const minutos = Math.round((valor % 1) * 100);
  return horas + minutos / 60;
}

async function saveGame(existingGame, close) {
  const form = document.getElementById('game-form');

  const horasInput = parseFloat(document.getElementById('g-horasDeJogo').value) || 0;

  const minutosDigitados = Math.round((horasInput % 1) * 100);
  if (minutosDigitados >= 60) {
    Toast.error('Minutos não podem ser maiores que 59');
    return;
  }

  const data = {
    nomeGame: document.getElementById('g-nomeGame').value.trim(),
    genero: document.getElementById('g-genero').value,
    plataforma: document.getElementById('g-plataforma').value,
    status: document.getElementById('g-status').value,
    horasDeJogo: normalizeHoras(horasInput),
    notaGame: parseFloat(document.getElementById('g-notaGame').value) || 0,
    dataFechamento: document.getElementById('g-dataFechamento').value || '',
    coverUrl: document.getElementById('g-coverUrl').value.trim(),
  };

  // ✅ TUDO AQUI DENTRO
  form.querySelectorAll('.field').forEach(f => {
    f.classList.remove('has-error');
    f.querySelector('.field-error')?.remove();
  });

  const errors = validateGame(data);
  if (Object.keys(errors).length > 0) {
    for (const [key, msg] of Object.entries(errors)) {
      const input = document.getElementById(`g-${key}`);
      const field = input?.closest('.field');
      if (!field) continue;

      field.classList.add('has-error');

      const err = document.createElement('p');
      err.className = 'field-error';
      err.textContent = msg;

      field.appendChild(err);
    }
    return; // ✅ agora está dentro da função
  }

  try {
    if (existingGame) {
      await GamesAPI.update(existingGame.id, data);
      Toast.success('Jogo atualizado com sucesso!');
    } else {
      await GamesAPI.create(data);
      Toast.success('Jogo adicionado à biblioteca!');
    }

    close();
    loadGames();
  } catch (err) {
    Toast.error(err.message ?? 'Erro ao salvar jogo.');
  }
}

// ── Deletar jogo ──────────────────────────────────────────────────────────────
async function deleteGame(id) {
  const game = state.allGames.find(g => g.id === id);
  if (!game) return;
  if (!confirm(`Remover "${game.nomeGame}" da biblioteca?`)) return;

  try {
    await GamesAPI.delete(id);
    Toast.info('Jogo removido.');
    loadGames();
  } catch (err) {
    Toast.error(err.message ?? 'Erro ao remover jogo.');
  }
}