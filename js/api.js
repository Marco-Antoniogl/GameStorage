const API_BASE = 'https://gameszeradosapi.onrender.com/api';

// ─── Token em memória ─────────────────────────────────────────────────────────
//let _token = null;

//export function setToken(token) { _token = token; }
//export function getToken()      { return _token; }
//export function clearToken()    { _token = null; }

let _token = null;

export function setToken(token) {
  _token = token;
  localStorage.setItem('token', token);
}

export function getToken() {
  if (!_token) _token = localStorage.getItem('token');
  return _token;
}

export function clearToken() {
  _token = null;
  localStorage.removeItem('token');
}

// ─── Fetch base com tratamento de erros ──────────────────────────────────────
async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };

  // 🔥 Adiciona o JWT se existir
  if (_token) {
    headers['Authorization'] = `Bearer ${_token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, options);
  } catch {
    throw new Error('Sem conexão com o servidor. Verifique se a API está rodando.');
  }

  if (!response.ok) {
    let msg = `Erro ${response.status}`;
    try {
      const err = await response.json();
      msg = err.message ?? err.title ?? msg;
    } catch { /* resposta sem JSON */ }
    throw new Error(msg);
  }

  if (response.status === 204) return null;

  return response.json();
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────
export const AuthAPI = {
  async login(email, password) {
    const data = await request('POST', '/auth/login', { email, password });
    setToken(data.token); // 🔥 Salva o token após login
    return data;
  },

  async register(username, email, password) {
    const data = await request('POST', '/auth/register', { username, email, password });
    return data.user;
  },

  logout() {
    clearToken(); // 🔥 Limpa o token ao sair
  },
};

// ─── Games endpoints ──────────────────────────────────────────────────────────
export const GamesAPI = {
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
  },

  getById(id)           { return request('GET',    `/games/${id}`); },
  create(gameData)      { return request('POST',   '/games', gameData); },
  update(id, gameData)  { return request('PUT',    `/games/${id}`, gameData); },
  delete(id)            { return request('DELETE', `/games/${id}`); },
};