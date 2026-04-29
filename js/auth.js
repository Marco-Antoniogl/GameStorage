// api.js
// Responsável por comunicação com a API ASP.NET

const BASE_URL = 'https://gameszeradosapi.onrender.com'; // sua API

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function removeToken() {
  localStorage.removeItem('token');
}

async function request(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Se token expirou
  if (response.status === 401) {
    removeToken();
    window.dispatchEvent(new Event('auth:expired'));
    throw new Error('Sessão expirada');
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Erro na requisição');
  }

  return response.json();
}

export const AuthAPI = {
  async login(email, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Espera que a API retorne { token, user }
    if (!data.token) {
      throw new Error('Token não retornado pela API');
    }

    setToken(data.token);

    return data.user;
  },

  async register(username, email, password) {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    if (data.token) {
      setToken(data.token);
    }

    return data.user;
  },

  logout() {
    removeToken();
  },

  isAuthenticated() {
    return !!getToken();
  },
};