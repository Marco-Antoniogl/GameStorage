/**
 * main.js — Ponto de entrada da aplicação
 * Inicializa auth, registra rotas e arranca o router.
 */
import { inject }          from '@vercel/analytics';
import { Auth }            from './auth.js';
import { Router }          from './router.js';
import { renderLogin }     from './login.js';
import { renderRegister }  from './register.js';
import { renderDashboard } from './dashboard.js';

// Inicializa Vercel Analytics
inject();

// 1. Inicializa sessão (restaura usuário do localStorage ou usa mock)
Auth.init();

// 2. Registra rotas
Router
  .on('/', () => Router.navigate(Auth.isAuthenticated() ? '/dashboard' : '/login', { replace: true }))
  .on('/login',     renderLogin)
  .on('/register',  renderRegister)
  .on('/dashboard', renderDashboard, { requiresAuth: true })
  .on('*', () => Router.navigate('/dashboard', { replace: true }));

// 3. Arranca
Router.init();
