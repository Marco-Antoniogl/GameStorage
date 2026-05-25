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

const PER_PAGE = 15;

let state = {
  allGames:   [],
  filtered:   [],
  page:       1,
  totalPages: 1,
  total:      0,
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
  BugReport.init();
}

// ── Carregar jogos da API ─────────────────────────────────────────────────────

async function loadGames(){
  try{
    const result = await GamesAPI.list({
      search:    state.search,
      genero:    state.genre,
      plataforma: state.platform,
      status:    state.status,
      sortField: state.sortField,
      sortOrder: state.sortOrder,
      page:      state.page,
      limit:     15,
    });

    if (state.page === 1){
      state.allGames = result.data;
    }
    else{
      state.allGames = [...state.allGames, ...result.data];
    }
    state.total = result.total;
    state.totalPages = result.totalPages;

    renderGrid();
  } catch (err){
    Toast.error(err.message ?? 'Erro ao carregar jogos.');
  }
}

// ── Filtros ───────────────────────────────────────────────────────────────────
function applyFilters() {
  state.page = 1;
  state.allGames = []; // limpa antes de recarregar
  loadGames();
}

function renderGrid() {
  const total   = state.total;
  const hasMore = state.page < state.totalPages;

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
    grid.innerHTML = state.allGames.map(renderGameCard).join('');
    bindCardActions();
  }

  document.getElementById('pagination-area').innerHTML = hasMore
    ? `<div class="pagination">
         <button id="btn-load-more">Mostrar mais ↓</button>
       </div>`
    : '';

  document.getElementById('btn-load-more')?.addEventListener('click', () => {
    state.page += 1;
    loadGames();
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

  // ── Máscara horas  ─────────────────────────────────────────────────────────
  const horasEl = document.getElementById('g-horasDeJogo');
  if (horasEl) {
    if (game?.horasDeJogo != null) {
      const raw   = String(game.horasDeJogo).replace('.', '').padStart(6, '0');
      const horas = raw.slice(0, -2).replace(/^0+/, '') || '0';
      const min   = raw.slice(-2);
      horasEl.value = `${horas}.${min}`;
    } else {
      horasEl.value = '0.00';
    }

    horasEl.addEventListener('keydown', e => {
      const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'];
      if (allowed.includes(e.key)) return;
      if (!/^\d$/.test(e.key)) { e.preventDefault(); return; }

      e.preventDefault();

      let digits = horasEl.value.replace('.', '');

      if (e.key === 'Backspace' || e.key === 'Delete') {
        digits = '0' + digits.slice(0, -1);
      } else {
        digits = digits + e.key;
        if (digits.length > 6) return;
      }

      const horas = digits.slice(0, -2).replace(/^0+/, '') || '0';
      horasEl.value = `${horas}.${digits.slice(-2).padStart(2, '0')}`;
    });
  }

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
async function saveGame(existingGame, close) {
  // ...
  close();
  state.page = 1;      // 👈 adicione isso
  state.allGames = []; // 👈 e isso
  loadGames();
}

// ── Deletar jogo ──────────────────────────────────────────────────────────────
async function deleteGame(id) {
  // ...
  await GamesAPI.delete(id);
  Toast.info('Jogo removido.');
  state.page = 1;      // 👈 adicione isso
  state.allGames = []; // 👈 e isso
  loadGames();
}

// -- Botão de report de bug ──────────────────────────────────────────────────────────────

const BugReport = (() => {

  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwgP6EquoZQnvek_2eRmEbLItXbnTeEGLi0kxhZaVV_alelwik-8rm7mHmi0HR8NAWW/exec';

  /* ── Helpers ── */
  const getDate = () => new Date().toLocaleDateString('pt-BR');

  const getBrowser = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome') && !ua.includes('Edg'))   return 'Google Chrome';
    if (ua.includes('Firefox'))                          return 'Mozilla Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edg'))                              return 'Microsoft Edge';
    if (ua.includes('OPR') || ua.includes('Opera'))     return 'Opera';
    return 'Desconhecido';
  };

  const getResolution = () => `${screen.width}x${screen.height}`;

  /* ── Modal ── */
  const fillFields = () => {
    document.getElementById('brm-data').value      = getDate();
    document.getElementById('brm-navegador').value = getBrowser();
  };

  const open = () => {
    fillFields();
    document.getElementById('brm-descricao').value = '';
    document.getElementById('brm-erro').classList.add('hidden');
    document.getElementById('brm-btn-send').disabled    = false;
    document.getElementById('brm-btn-send').textContent = 'Enviar Report';
    document.getElementById('bug-report-modal').classList.remove('hidden');
  };

  const close = () => {
    document.getElementById('bug-report-modal').classList.add('hidden');
  };

  /* ── Envio ── */
  const send = async () => {
    const descricao = document.getElementById('brm-descricao').value.trim();
    const erro      = document.getElementById('brm-erro');
    const btnSend   = document.getElementById('brm-btn-send');

    if (!descricao) {
      erro.classList.remove('hidden');
      document.getElementById('brm-descricao').focus();
      return;
    }

    erro.classList.add('hidden');
    btnSend.disabled    = true;
    btnSend.textContent = 'Enviando...';

    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode:   'no-cors',
      body:   JSON.stringify({
        data:      getDate(),
        descricao,
        navegador: getBrowser(),
        resolucao,
      })
    });

    btnSend.textContent = 'Enviado!';
    setTimeout(close, 800);
  };

  /* ── Eventos ── */
  const bindEvents = () => {
    document.querySelector('.bug-report__button').addEventListener('click', open);

    document.querySelector('.brm-close').addEventListener('click', close);
    document.querySelector('.brm-btn-cancel').addEventListener('click', close);

    document.getElementById('bug-report-modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) close();
    });

    document.getElementById('brm-btn-send').addEventListener('click', send);
  };


  /* ── Init ── */
    const init = () => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindEvents);
      } else {
        bindEvents();
      }
    };

  return { init };

})();
