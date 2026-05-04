/**
 * components.js — Construtores de HTML reutilizáveis
 */
import { formatHours, formatDate, getRatingClass, getStatusEmoji, getStatusLabel } from './utils.js';

const GENRES    = ['RPG','FPS','Aventura','Estratégia','Plataforma','Puzzle','Simulação','Esportes','Luta','Terror','Outro'];
const PLATFORMS = ['PC','PlayStation 5','PlayStation 4','Xbox Series X/S','Xbox One','Nintendo Switch','Mobile','Outro'];
const STATUSES  = [
  { value:'jogando',    label:'🎮 Jogando'    },
  { value:'zerado',     label:'✅ Zerado'     },
  { value:'abandonado', label:'🚫 Abandonado' },
  { value:'na_fila',    label:'⏳ Na fila'    },
];

export function renderNavbar(user) {
  const initials = (user?.displayName ?? user?.email ?? '?')[0].toUpperCase();
  return `
    <nav class="navbar">
      <div class="navbar-brand">
        <span style="font-size:1.4rem">🎮</span>
        <span class="navbar-brand-name">GAME<span>STORAGE</span></span>
      </div>
      <div class="navbar-user">
        <div class="navbar-avatar">${initials}</div>
        <span class="navbar-username">${user?.displayName ?? user?.email?.split('@')[0] ?? 'Usuário'}</span>
        <button class="btn btn-ghost btn-sm" id="btn-logout">Sair</button>
      </div>
    </nav>`;
}

export function renderGameCard(game) {
  const cls  = getRatingClass(game.notaGame);
  const pct  = (game.notaGame / 10 * 100).toFixed(0);
  const cover = game.coverUrl
    ? `<img src="${game.coverUrl}" alt="Capa de ${game.nomeGame}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=game-card-cover-placeholder>🎮</div>'">`
    : `<div class="game-card-cover-placeholder">🎮</div>`;

  return `
    <article class="game-card" data-id="${game.id}" aria-label="Jogo: ${game.nomeGame}">
      <div class="game-card-cover">
        ${cover}
        <span class="game-card-status" title="${getStatusLabel(game.status)}">${getStatusEmoji(game.status)}</span>
      </div>
      <div class="game-card-body">
        <h3 class="game-card-title">${game.nomeGame}</h3>
        <div class="game-card-tags">
          <span class="tag tag-genre">${game.genero}</span>
          <span class="tag tag-platform">${game.plataforma}</span>
        </div>
        <div class="game-card-meta">
          <span>⏱ ${formatHours(game.horasDeJogo)}</span>
          ${game.dataFechamento ? `<span>📅 ${formatDate(game.dataFechamento)}</span>` : ''}
        </div>
        <div class="game-card-rating ${cls}">
          <span class="rating-value">${Number(game.notaGame).toFixed(1)}</span>
          <span class="rating-max">/10</span>
          <div class="rating-bar"><div class="rating-fill" style="width:${pct}%"></div></div>
        </div>
      </div>
      <div class="game-card-actions">
        <button class="btn btn-ghost btn-sm btn-edit-game" data-id="${game.id}" style="flex:1">✏️</button>
        <button class="btn btn-danger btn-sm btn-delete-game" data-id="${game.id}">🗑</button>
      </div>
    </article>`;
}

export function renderSkeletons(n = 8) {
  return Array.from({ length: n }, () => `<div class="game-card game-card-skeleton"></div>`).join('');
}

export function renderStatsBar(games) {
  const total  = games.length;
  /*const horas  = games.reduce((s, g) => s + (Number(g.horasDeJogo) || 0), 0); */
  const toMinutos = (val) => {
    const n = parseFloat(String(val || '0').replace(',', '.')) || 0;
    const h = Math.floor(n);
    const m = Math.round((n % 1) * 100);
    return h * 60 + m;
  };

  const fromMinutos = (total) => {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${h}.${String(m).padStart(2, '0')}`;
  };

  const totalMinutos = games.reduce((s, g) => s + toMinutos(g.horasDeJogo), 0);
  const horas = fromMinutos(totalMinutos);
  const zerados = games.filter(g => g.status === 'zerado').length;
  const jogando = games.filter(g => g.status === 'jogando').length;
  const avg    = total ? (games.reduce((s,g) => s + (Number(g.notaGame)||0), 0) / total).toFixed(1) : '—';

  return `
    <div class="stats-grid">
      <div class="stat-card"><span class="stat-icon">⏱</span><div><div class="stat-value">${formatHours(horas)}</div><div class="stat-label">Total jogado</div></div></div>
      <div class="stat-card"><span class="stat-icon">✅</span><div><div class="stat-value">${zerados}</div><div class="stat-label">Zerados</div></div></div>
      <div class="stat-card"><span class="stat-icon">🎮</span><div><div class="stat-value">${jogando}</div><div class="stat-label">Jogando agora</div></div></div>
      <div class="stat-card"><span class="stat-icon">⭐</span><div><div class="stat-value">${avg}</div><div class="stat-label">Nota média</div></div></div>
    </div>`;
}

export function renderFiltersBar() {
  const genreOpts    = GENRES.map(g => `<option value="${g}">${g}</option>`).join('');
  const platformOpts = PLATFORMS.map(p => `<option value="${p}">${p}</option>`).join('');
  const statusOpts   = STATUSES.map(s => `<option value="${s.value}">${s.label}</option>`).join('');
  return `
    <div class="filters-bar">
      <div class="filters-search">
        <span class="filters-search-icon">🔍</span>
        <input type="search" id="filter-search" placeholder="Buscar jogos..." aria-label="Buscar jogos">
      </div>
      <div class="filters-row">
        <select id="filter-genre" aria-label="Filtrar por gênero">
          <option value="">Todos os gêneros</option>${genreOpts}
        </select>
        <select id="filter-platform" aria-label="Filtrar por plataforma">
          <option value="">Todas as plataformas</option>${platformOpts}
        </select>
        <select id="filter-status" aria-label="Filtrar por status">
          <option value="">Todos os status</option>${statusOpts}
        </select>
        <select id="filter-sort" aria-label="Ordenar por">
          <option value="createdAt">Data de adição</option>
          <option value="nomeGame">Nome</option>
          <option value="notaGame">Nota</option>
          <option value="horasDeJogo">Horas jogadas</option>
        </select>
        <button class="btn-sort-order" id="btn-sort-order" title="Alternar ordem">↓</button>
        <button class="btn-clear hidden" id="btn-clear-filters">✕ Limpar</button>
      </div>
    </div>`;
}

export function renderGameModal(game = null) {
  const isEdit = !!game;
  const v = game ?? {};
  const genreOpts    = GENRES.map(g => `<option value="${g}" ${v.genero===g?'selected':''}>${g}</option>`).join('');
  const platformOpts = PLATFORMS.map(p => `<option value="${p}" ${v.plataforma===p?'selected':''}>${p}</option>`).join('');
  const statusOpts   = STATUSES.map(s => `<option value="${s.value}" ${v.status===s.value?'selected':''}>${s.label}</option>`).join('');
  const nota         = v.notaGame ?? 5;

  return `
    <div class="modal-overlay" id="game-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title" id="modal-title">${isEdit ? '✏️ EDITAR' : '➕ ADICIONAR'}</h2>
          <button class="modal-close" id="modal-close-btn" aria-label="Fechar">✕</button>
        </div>
        <div class="modal-body">
          <form id="game-form" novalidate>
            <input type="hidden" id="game-id" value="${v.id ?? ''}">
            <div class="form-grid">
              <div class="field form-full">
                <label for="g-nomeGame">Nome do jogo *</label>
                <input type="text" id="g-nomeGame" name="nomeGame" value="${v.nomeGame??''}" placeholder="Ex: Elden Ring" maxlength="100">
              </div>
              <div class="field">
                <label for="g-genero">Gênero *</label>
                <select id="g-genero" name="genero"><option value="">Selecione...</option>${genreOpts}</select>
              </div>
              <div class="field">
                <label for="g-plataforma">Plataforma *</label>
                <select id="g-plataforma" name="plataforma"><option value="">Selecione...</option>${platformOpts}</select>
              </div>
              <div class="field">
                <label for="g-status">Status *</label>
                <select id="g-status" name="status"><option value="">Selecione...</option>${statusOpts}</select>
              </div>
              <div class="field">
                <label for="g-horasDeJogo">Horas jogadas *</label>
                <input type="number" id="g-horasDeJogo" name="horasDeJogo" value="${v.horasDeJogo??0}" min="0" max="99999" step="0.5">
              </div>
              <div class="field form-full">
                <label for="g-notaGame">Nota * — <span class="nota-preview" id="nota-display">${nota}</span>/10</label>
                <input type="range" class="field-range" id="g-notaGame" name="notaGame" min="0" max="10" step="0.5" value="${nota}">
              </div>
              <div class="field">
                <label for="g-dataFechamento">Data de conclusão</label>
                <input type="date" id="g-dataFechamento" name="dataFechamento" value="${v.dataFechamento??''}">
              </div>
              <div class="field">
                <label for="g-coverUrl">URL da capa</label>
                <input type="url" id="g-coverUrl" name="coverUrl" value="${v.coverUrl??''}" placeholder="https://...">
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" id="modal-cancel-btn">Cancelar</button>
          <button class="btn btn-primary" id="modal-save-btn">${isEdit ? 'Salvar alterações' : 'Adicionar jogo'}</button>
        </div>
      </div>
    </div>`;
}

export function renderPagination(page, totalPages) {
  if (totalPages <= 1) return '';
  let html = `<div class="pagination">`;
  html += `<button ${page===1?'disabled':''} data-page="${page-1}" aria-label="Anterior">←</button>`;
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
      html += `<button class="${p===page?'active':''}" data-page="${p}" aria-label="Página ${p}" ${p===page?'aria-current="page"':''}>${p}</button>`;
    } else if (Math.abs(p - page) === 2) {
      html += `<span class="pagination-ellipsis">…</span>`;
    }
  }
  html += `<button ${page===totalPages?'disabled':''} data-page="${page+1}" aria-label="Próxima">→</button>`;
  return html + '</div>';
}

export { GENRES, PLATFORMS, STATUSES };
