// auth.js
import { AuthAPI } from './api.js';

const USE_MOCK = false;

const MOCK_USER = {
  id: 'dev-001',
  displayName: 'Dev Tester',
  email: 'dev@gamevault.local',
};

export const Auth = {
  currentUser: null,

  init() {
    try {
      const saved = sessionStorage.getItem('gv_user');
      if (saved) this.currentUser = JSON.parse(saved);
    } catch {
      this.currentUser = null;
    }

    if (USE_MOCK && !this.currentUser) {
      this.currentUser = MOCK_USER;
      sessionStorage.setItem('gv_user', JSON.stringify(MOCK_USER));
    }

    window.addEventListener('auth:expired', () => {
      this.currentUser = null;
      sessionStorage.removeItem('gv_user');
    });
  },

  isAuthenticated() {
    // 🔥 Agora só depende do usuário em sessão
    return !!this.currentUser;
  },

  async login(email, password) {
    if (USE_MOCK) {
      if (!email || password.length < 6) {
        throw new Error('Credenciais inválidas');
      }

      this.currentUser = {
        id: 'dev-001',
        displayName: email.split('@')[0],
        email,
      };

      sessionStorage.setItem('gv_user', JSON.stringify(this.currentUser));
      return this.currentUser;
    }

    const user = await AuthAPI.login(email, password);

    this.currentUser = user;
    sessionStorage.setItem('gv_user', JSON.stringify(user));

    return user;
  },

  async register(username, email, password) {
    if (USE_MOCK) {
      this.currentUser = {
        id: crypto.randomUUID(),
        displayName: username,
        email,
      };

      sessionStorage.setItem('gv_user', JSON.stringify(this.currentUser));
      return this.currentUser;
    }

    const user = await AuthAPI.register(username, email, password);

    this.currentUser = user;
    sessionStorage.setItem('gv_user', JSON.stringify(user));

    return user;
  },

  logout() {
    this.currentUser = null;
    sessionStorage.removeItem('gv_user');
    AuthAPI.logout();
  },
};