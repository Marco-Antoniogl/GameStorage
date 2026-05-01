import { Auth }    from './auth.js';
import { Router }  from './router.js';
import { GamesAPI } from './api.js'; // 🔥 Troca Storage por GamesAPI
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
    const result = await GamesAPI.list(); // 🔥 Busca da API
    state.allGames = result?.data ?? result ?? [];
    applyFilters();
  } catch (err) {
    Toast.error(err.message ?? 'Erro ao carregar jogos.');
  }
}

// ── Salvar jogo (criar ou editar) ─────────────────────────────────────────────
async function saveGame(existingGame, close) {
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

  // Limpa erros
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
      err.className = 'field-error';
      err.textContent = msg;
      field.appendChild(err);
    }
    return;
  }

  try {
    if (existingGame) {
      await GamesAPI.update(existingGame.id, data); // 🔥
      Toast.success('Jogo atualizado com sucesso!');
    } else {
      await GamesAPI.create(data); // 🔥
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
    await GamesAPI.delete(id); // 🔥
    Toast.info('Jogo removido.');
    loadGames();
  } catch (err) {
    Toast.error(err.message ?? 'Erro ao remover jogo.');
  }
}