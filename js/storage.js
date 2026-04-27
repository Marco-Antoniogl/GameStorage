/**
 * storage.js
 * Wrapper seguro para localStorage com sanitização básica contra XSS.
 */

const KEYS = {
  GAMES: 'gv_games',
  USER:  'gv_user',
};

/** Sanitiza string removendo tags HTML */
function sanitize(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function sanitizeGame(game) {
  return {
    ...game,
    nomeGame:  sanitize(String(game.nomeGame ?? '')),
    coverUrl:  sanitize(String(game.coverUrl ?? '')),
    genero:    sanitize(String(game.genero ?? '')),
    plataforma: sanitize(String(game.plataforma ?? '')),
    status:    sanitize(String(game.status ?? '')),
  };
}

function readGames() {
  try { return JSON.parse(localStorage.getItem(KEYS.GAMES) || '[]'); }
  catch { return []; }
}

function writeGames(games) {
  localStorage.setItem(KEYS.GAMES, JSON.stringify(games));
}

export const Storage = {
  // ── Games ──────────────────────────────────────────────────────
  listGames(userId) {
    return readGames().filter(g => g.userId === userId);
  },

  createGame(userId, data) {
    const games = readGames();
    const game = {
      id:        crypto.randomUUID(),
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...sanitizeGame(data),
    };
    games.unshift(game);
    writeGames(games);
    return game;
  },

  updateGame(id, data) {
    const games = readGames();
    const idx   = games.findIndex(g => g.id === id);
    if (idx === -1) throw new Error('Jogo não encontrado');
    games[idx] = { ...games[idx], ...sanitizeGame(data), updatedAt: new Date().toISOString() };
    writeGames(games);
    return games[idx];
  },

  deleteGame(id) {
    writeGames(readGames().filter(g => g.id !== id));
  },

  // ── Mock User ──────────────────────────────────────────────────
  getUser() {
    try { return JSON.parse(localStorage.getItem(KEYS.USER) || 'null'); }
    catch { return null; }
  },

  setUser(user) {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  clearUser() {
    localStorage.removeItem(KEYS.USER);
  },
};
