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

function bindCardActions() {
  document.querySelectorAll('.btn-edit-game').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.id));
  });
  document.querySelectorAll('.btn-delete-game').forEach(btn => {
    btn.addEventListener('click', () => deleteGame(btn.dataset.id));
  });
}

function bindNavbar() {
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    Auth.logout();
    Router.navigate('/login', { replace: true });
  });
}

function bindAddButton() {
  document.getElementById('btn-add-game')?.addEventListener('click', () => openModal());
}

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

function openModal(gameId = null) {
  const game = gameId ? state.allGames.find(g => g.id === gameId) : null;

  const wrapper = document.createElement('div');
  wrapper.id = 'modal-wrapper';
  wrapper.innerHTML = renderGameModal(game);
  document.body.appendChild(wrapper);

  const rangeEl   = document.getElementById('g-notaGame');
  const displayEl = document.getElementById('nota-display');
  rangeEl.addEventListener('input', () => {
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