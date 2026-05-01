/**
 * login.js — Página de login
 */
import { Auth }   from './auth.js';
import { Router } from './router.js';
import { Toast }  from './utils.js';

export function renderLogin() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="auth-layout">
      <div class="auth-brand">
        <div class="brand-icon">🎮</div>
        <h1 class="brand-name">GAME<span>VAULT</span></h1>
        <p class="brand-tagline">Sua biblioteca. Seu progresso.</p>
      </div>
      <div class="auth-card">
        <h2 class="auth-title">ENTRAR</h2>
        <div id="login-alert"></div>

        <button class="btn btn-google" id="btn-google-login">
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.4 30.2 0 24 0 14.7 0 6.7 5.4 2.7 13.3l7.8 6C12.4 13 17.8 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.6 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8C43.8 37.3 46.6 31.4 46.6 24.5z"/>
            <path fill="#FBBC05" d="M10.5 28.7A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.7 10.7l7.8-6z"/>
            <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.2 0-11.5-4.2-13.4-9.8l-7.8 6C6.7 42.6 14.7 48 24 48z"/>
          </svg>
          Entrar com Google (mock)
        </button>

        <div class="auth-divider"><span>ou</span></div>

        <form id="login-form" novalidate>
          <div class="field">
            <label for="login-email">E-mail</label>
            <input type="email" id="login-email" placeholder="gamer@email.com" autocomplete="email" required>
          </div>
          <div class="field">
            <label for="login-password">Senha</label>
            <input type="password" id="login-password" placeholder="••••••••" autocomplete="current-password" required>
          </div>
          <button type="submit" class="btn btn-primary btn-full" id="btn-login">Entrar</button>
        </form>

        <p class="auth-footer">
          Não tem conta? <a href="/register" data-link>Criar conta</a>
        </p>
      </div>
    </div>
    <div class="toast-container" id="toast-container"></div>
  `;

  Toast.init();

  // Google mock
  document.getElementById('btn-google-login').addEventListener('click', () => {
    Auth.login('google@mock.com', 'Mock123');
    Auth.currentUser.displayName = 'Google User';
    Router.navigate('/dashboard', { replace: true });
  });

  // Form submit
    document.getElementById('login-form').addEventListener('submit', async e => {  // 👈 async aqui
      e.preventDefault();
      const alertEl  = document.getElementById('login-alert');
      const email    = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      alertEl.innerHTML = '';

      try {
        await Auth.login(email, password);  // 👈 await aqui
        Router.navigate('/dashboard', { replace: true });
      } catch (err) {
        alertEl.innerHTML = `<div class="alert alert-error" role="alert">${err.message}</div>`;
      }
    });
}
