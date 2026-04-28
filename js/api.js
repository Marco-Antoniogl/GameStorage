/**
 * api.js — Camada de comunicação com a API ASP.NET C#
 *
 * Troca o storage.js (localStorage) por chamadas HTTP reais.
 * Configure a URL base abaixo com o endereço da sua API.
 */

// ─── Configure aqui a URL da sua API ─────────────────────────────────────────
const API_BASE = 'https://gameszeradosapi.onrender.com/api';
// Anteriormente: 'https://localhost:7001/api'

// ─── Autenticação simples (email + senha) ────────────────────────────────────

// ─── Fetch base com tratamento de erros ───────────────────────────────────────
async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, options);
  } catch {
    throw new Error('Sem conexão com o servidor. Verifique se a API está rodando.');
  }

  // Erros do servidor
  if (!response.ok) {
    let msg = `Erro ${response.status}`;
    try {
      const err = await response.json();
      msg = err.message ?? err.title ?? msg;
    } catch { /* resposta sem JSON */ }
    throw new Error(msg);
  }

  // 204 No Content
  if (response.status === 204) return null;

  return response.json();
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────
export const AuthAPI = {
  async login(email, password) {
    const data = await request('POST', '/auth/login', { email, password });
    return data.user;                 // { id, displayName, email }
  },

  async register(username, email, password) {
    const data = await request('POST', '/auth/register', { username, email, password });
    return data.user;
  },

  logout() {
    // Sem token para remover
  },
};

// ─── Games endpoints ──────────────────────────────────────────────────────────
export const GamesAPI = {
  // GET /api/games?genero=RPG&plataforma=PC&status=zerado&sortField=notaGame&sortOrder=desc
  list(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search)     params.set('search',     filters.search);
    if (filters.genero)     params.set('genero',     filters.genero);
    if (filters.plataforma) params.set('plataforma', filters.plataforma);
    if (filters.status)     params.set('status',     filters.status);
    if (filters.sortField)  params.set('sortField',  filters.sortField);
    if (filters.sortOrder)  params.set('sortOrder',  filters.sortOrder);
    if (filters.page)       params.set('page',       filters.page);
    if (filters.limit)      params.set('limit',      filters.limit ?? 12);
    const qs = params.toString();
    return request('GET', `/games${qs ? '?' + qs : ''}`);
    // Retorna: { data: Game[], total: number, page: number, totalPages: number }
  },

  getById(id) {
    return request('GET', `/games/${id}`);
  },

  create(gameData) {
    return request('POST', '/games', gameData);
  },

  update(id, gameData) {
    return request('PUT', `/games/${id}`, gameData);
  },

  delete(id) {
    return request('DELETE', `/games/${id}`);
  },
};
