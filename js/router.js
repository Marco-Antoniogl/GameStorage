/**
 * router.js — Roteador SPA simples baseado em hash (#/dashboard, #/login…)
 */
import { Auth } from '/auth.js';

const routes = {};
let currentRoute = null;

export const Router = {
  // Registra uma rota: Router.on('/dashboard', renderFn, { requiresAuth: true })
  on(path, handler, opts = {}) {
    routes[path] = { handler, ...opts };
    return this;
  },

  navigate(path, { replace = false } = {}) {
    const method = replace ? 'replaceState' : 'pushState';
    history[method](null, '', `#${path}`);
    this._resolve(path);
  },

  init() {
    window.addEventListener('popstate', () => {
      this._resolve(this._currentPath());
    });

    // Links com data-link navegam pelo router
    document.addEventListener('click', e => {
      const a = e.target.closest('[data-link]');
      if (!a) return;
      e.preventDefault();
      this.navigate(a.getAttribute('href'));
    });

    this._resolve(this._currentPath());
  },

  _currentPath() {
    const hash = location.hash.replace(/^#/, '') || '/';
    return hash || '/';
  },

  _resolve(path) {
    const route = routes[path] ?? routes['*'];
    if (!route) return;

    // Guard de autenticação
    if (route.requiresAuth && !Auth.isAuthenticated()) {
      this.navigate('/login', { replace: true });
      return;
    }
    if (route.publicOnly && Auth.isAuthenticated()) {
      this.navigate('/dashboard', { replace: true });
      return;
    }

    currentRoute = path;
    route.handler();
  },

  getCurrentRoute() { return currentRoute; },
};
