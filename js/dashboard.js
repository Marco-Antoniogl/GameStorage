/**
 * dashboard.js — Lógica completa da página de dashboard
 */
import { Auth }    from './auth.js';
import { Storage } from './storage.js';
import { Router }  from './router.js';
import { Toast, validateGame, debounce, getStatusLabel } from './utils.js';
import {
  renderNavbar, renderGameCard, renderSkeletons,
  renderStatsBar, renderFiltersBar, renderGameModal, renderPagination,
} from './components.js';

const PER_PAGE = 12;

// ── Estado da página ──────────────────────────────────────────────────────────
let state = {
  allGames:   [],
  filtered:   [],
  page:       1,
  sortField:  'createdAt',
  sortOrder:  'desc',
  search:     '',
  genre:      '',
  platform:   '',
  status:     '',
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

// ── Carregar e filtrar jogos ──────────────────────────────────────────────────
function loadGames() {
  state.allGames = Storage.listGames(Auth.currentUser.id);
  applyFilters();
}

function applyFilters() {
  let games = [...state.allGames];

  // Busca
  if (state.search) {
    const term = state.search.toLowerCase();
    games = games.filter(g => g.nomeGame.toLowerCase().includes(term));
  }
  // Filtros
  if (state.genre)    games = games.filter(g => g.genero === state.genre);
  if (state.platform) games = games.filter(g => g.plataforma === state.platform);
  if (state.status)   games = games.filter(g => g.status === state.status);

  // Ordenação
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

  // Subtitle
  document.getElementById('game-count').textContent =
    `${total} jogo${total !== 1 ? 's' : ''} na biblioteca`;

  // Stats (usa todos os jogos sem filtro)
  document.getElementById('stats-area').innerHTML = renderStatsBar(state.allGames);

  // Grid
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

  // Pagination
  document.getElementById('pagination-area').innerHTML = renderPagination(page, totalPages);
  document.querySelectorAll('.pagination button[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.page = parseInt(btn.dataset.page);
      renderGrid();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

// ── Bind card actions ──────────────────────────────────────────────────────────
function bindCardActions() {
  document.querySelectorAll('.btn-edit-game').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.id));
  });
  document.querySelectorAll('.btn-delete-game').forEach(btn => {
    btn.addEventListener('click', () => deleteGame(btn.dataset.id));
  });
}

// ── Filtros ───────────────────────────────────────────────────────────────────
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

// ── Modal ─────────────────────────────────────────────────────────────────────
function openModal(gameId = null) {
  const game = gameId ? state.allGames.find(g => g.id === gameId) : null;

  // Injeta modal
  const wrapper = document.createElement('div');
  wrapper.id = 'modal-wrapper';
  wrapper.innerHTML = renderGameModal(game);
  document.body.appendChild(wrapper);

  // Range slider → preview ao vivo
  const rangeEl   = document.getElementById('g-notaGame');
  const displayEl = document.getElementById('nota-display');
  rangeEl.addEventListener('input', () => {
    displayEl.textContent = parseFloat(rangeEl.value).toFixed(1);
  });

  // Fechar
  const close = () => wrapper.remove();
  document.getElementById('modal-close-btn')?.addEventListener('click', close);
  document.getElementById('modal-cancel-btn')?.addEventListener('click', close);
  document.getElementById('game-modal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) close();
  });

  // Escape
  const escHandler = e => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); } };
  document.addEventListener('keydown', escHandler);

  // Salvar
  document.getElementById('modal-save-btn')?.addEventListener('click', () => saveGame(game, close));
}

function saveGame(existingGame, close) {
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

  // Limpa erros anteriores
  form.querySelectorAll('.field').forEach(f => {
    f.classList.remove('has-error');
    f.querySelector('.field-error')?.remove();
  });

  // Valida
  const errors = validateGame(data);
  if (Object.keys(errors).length > 0) {
    for (const [key, msg] of Object.entries(errors)) {
      const input = document.getElementById(`g-${key}`);
      const field = input?.closest('.field');
      if (!field) continue;
      field.classList.add('has-error');
      const err = document.createElement('p');
      err.className = 'field-error'; err.textContent = msg;
      field.appendChild(err);
    }
    return;
  }

  try {
    if (existingGame) {
      Storage.updateGame(existingGame.id, data);
      Toast.success('Jogo atualizado com sucesso!');
    } else {
      Storage.createGame(Auth.currentUser.uid, data);
      Toast.success('Jogo adicionado à biblioteca!');
    }
    close();
    loadGames();
  } catch (err) {
    Toast.error(err.message ?? 'Erro ao salvar jogo.');
  }
}

function deleteGame(id) {
  const game = state.allGames.find(g => g.id === id);
  if (!game) return;
  if (!confirm(`Remover "${game.nomeGame}" da biblioteca?`)) return;
  Storage.deleteGame(id);
  Toast.info('Jogo removido.');
  loadGames();
}
