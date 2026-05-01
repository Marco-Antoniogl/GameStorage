import { AuthAPI, setToken, clearToken } from './api.js'; // 🔥 importa setToken e clearToken

const USE_MOCK = false;

export const Auth = {
  currentUser: null,

  init() {
    try {
      const saved = sessionStorage.getItem('gv_user');
      if (saved) this.currentUser = JSON.parse(saved);

      // 🔥 Restaura o token ao recarregar a página
      const token = sessionStorage.getItem('gv_token');
      if (token) setToken(token);

    } catch {
      this.currentUser = null;
    }

    window.addEventListener('auth:expired', () => {
      this.currentUser = null;
      sessionStorage.removeItem('gv_user');
      sessionStorage.removeItem('gv_token'); // 🔥
      clearToken();
    });
  },

  isAuthenticated() {
    return !!this.currentUser;
  },

  async login(email, password) {
    const data = await AuthAPI.login(email, password);

    // 🔥 data tem { user, token } — salva ambos
    this.currentUser = data.user ?? data;
    const token = data.token;

    sessionStorage.setItem('gv_user',  JSON.stringify(this.currentUser));
    sessionStorage.setItem('gv_token', token); // 🔥 persiste o token
    setToken(token);                           // 🔥 ativa nas requisições

    return this.currentUser;
  },

  async register(username, email, password) {
    const user = await AuthAPI.register(username, email, password);

    this.currentUser = user;
    sessionStorage.setItem('gv_user', JSON.stringify(user));

    return user;
  },

  logout() {
    this.currentUser = null;
    sessionStorage.removeItem('gv_user');
    sessionStorage.removeItem('gv_token'); // 🔥
    clearToken();                          // 🔥
    AuthAPI.logout();
  },
};