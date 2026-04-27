/**
 * register.js — Página de cadastro
 */
import { Auth }   from './auth.js';
import { Router } from './router.js';
import { Toast }  from './utils.js';

export function renderRegister() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="auth-layout">
      <div class="auth-brand">
        <div class="brand-icon">🎮</div>
        <h1 class="brand-name">GAME<span>VAULT</span></h1>
        <p class="brand-tagline">Sua biblioteca. Seu progresso.</p>
      </div>
      <div class="auth-card">
        <h2 class="auth-title">CRIAR CONTA</h2>
        <div id="register-alert"></div>

        <button class="btn btn-google" id="btn-google-register">
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.4 30.2 0 24 0 14.7 0 6.7 5.4 2.7 13.3l7.8 6C12.4 13 17.8 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.6 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8C43.8 37.3 46.6 31.4 46.6 24.5z"/>
            <path fill="#FBBC05" d="M10.5 28.7A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.7 10.7l7.8-6z"/>
            <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.2 0-11.5-4.2-13.4-9.8l-7.8 6C6.7 42.6 14.7 48 24 48z"/>
          </svg>
          Cadastrar com Google (mock)
        </button>

        <div class="auth-divider"><span>ou</span></div>

        <form id="register-form" novalidate>
          <div class="field">
            <label for="reg-username">Nome de usuário</label>
            <input type="text" id="reg-username" placeholder="seu_nick" autocomplete="username" required>
            <p class="field-hint">Letras, números e _ • mínimo 3 caracteres</p>
          </div>
          <div class="field">
            <label for="reg-email">E-mail</label>
            <input type="email" id="reg-email" placeholder="gamer@email.com" autocomplete="email" required>
          </div>
          <div class="field">
            <label for="reg-password">Senha</label>
            <input type="password" id="reg-password" placeholder="••••••••" autocomplete="new-password" required>
            <p class="field-hint">Mín. 6 caracteres, uma maiúscula e um número</p>
          </div>
          <div class="field">
            <label for="reg-confirm">Confirmar senha</label>
            <input type="password" id="reg-confirm" placeholder="••••••••" autocomplete="new-password" required>
          </div>
          <button type="submit" class="btn btn-primary btn-full">Criar Conta</button>
        </form>

        <p class="auth-footer">
          Já tem conta? <a href="/login" data-link>Entrar</a>
        </p>
      </div>
    </div>
    <div class="toast-container" id="toast-container"></div>
  `;

  Toast.init();

  // Google mock
  document.getElementById('btn-google-register').addEventListener('click', () => {
    Auth.login('google@mock.com', 'Mock123');
    Auth.currentUser.displayName = 'Google User';
    Router.navigate('/dashboard', { replace: true });
  });

  // Form submit
  document.getElementById('register-form').addEventListener('submit', e => {
    e.preventDefault();
    const alertEl = document.getElementById('register-alert');
    alertEl.innerHTML = '';

    const username = document.getElementById('reg-username').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm  = document.getElementById('reg-confirm').value;

    if (password !== confirm) {
      alertEl.innerHTML = `<div class="alert alert-error" role="alert">As senhas não coincidem.</div>`;
      return;
    }

    try {
      Auth.register(username, email, password);
      Router.navigate('/dashboard', { replace: true });
    } catch (err) {
      alertEl.innerHTML = `<div class="alert alert-error" role="alert">${err.message}</div>`;
    }
  });
}
