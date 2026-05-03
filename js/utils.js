/**
 * utils.js — Funções utilitárias e sistema de toasts
 */

// ── Formatadores ──────────────────────────────────────────────────────────────
export function formatHours(h) {
  const n = Number(h) || 0;
  if (n < 1) 
    return `${Math.round(n * 60)}min`;
  return `${n}h`;
  /*const rounded = Math.round(n * 100) / 100;*/
  /*return `${rounded.toFixed(2)}h`;*/
}

export function formatDate(s) {
  if (!s) return '—';
  const d = new Date(s + 'T00:00:00');
  return isNaN(d) ? '—' : d.toLocaleDateString('pt-BR');
}

export function getRatingClass(n) {
  if (n >= 8) return 'rating-high';
  if (n >= 5) return 'rating-mid';
  return 'rating-low';
}

export function getStatusLabel(s) {
  return { jogando:'Jogando', zerado:'Zerado', abandonado:'Abandonado', na_fila:'Na fila' }[s] ?? s;
}

export function getStatusEmoji(s) {
  return { jogando:'🎮', zerado:'✅', abandonado:'🚫', na_fila:'⏳' }[s] ?? '❓';
}

// ── Debounce ──────────────────────────────────────────────────────────────────
export function debounce(fn, delay = 350) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

// ── Validação básica ──────────────────────────────────────────────────────────
export function validateGame(data) {
  const errors = {};
  if (!data.nomeGame || data.nomeGame.trim().length < 2)
    errors.nomeGame = 'Nome deve ter ao menos 2 caracteres';
  if (!data.genero)    errors.genero    = 'Selecione um gênero';
  if (!data.plataforma) errors.plataforma = 'Selecione uma plataforma';
  if (!data.status)    errors.status    = 'Selecione um status';
  const horas = Number(data.horasDeJogo);
  if (isNaN(horas) || horas < 0) errors.horasDeJogo = 'Informe horas válidas (≥ 0)';
  const nota  = Number(data.notaGame);
  if (isNaN(nota) || nota < 0 || nota > 10) errors.notaGame = 'Nota entre 0 e 10';
  if (data.coverUrl && !/^https?:\/\/.+/.test(data.coverUrl.trim()))
    errors.coverUrl = 'URL inválida (deve começar com http/https)';
  return errors;
}

// ── Toast system ──────────────────────────────────────────────────────────────
const ICONS = { success: '✅', error: '❌', info: '💡' };

export const Toast = {
  container: null,

  init() {
    this.container = document.getElementById('toast-container');
  },

  show(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${ICONS[type] ?? ''}</span>
      <span class="toast-msg">${message}</span>
      <button class="toast-close" aria-label="Fechar">✕</button>
    `;
    toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
    this.container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  },

  success(msg) { this.show(msg, 'success'); },
  error(msg)   { this.show(msg, 'error');   },
  info(msg)    { this.show(msg, 'info');     },
};

// ── Campo com erro ────────────────────────────────────────────────────────────
export function setFieldError(fieldId, msg) {
  const wrap  = document.getElementById(fieldId)?.closest('.field');
  const input = document.getElementById(fieldId);
  if (!wrap || !input) return;
  wrap.classList.add('has-error');
  let err = wrap.querySelector('.field-error');
  if (!err) { err = document.createElement('p'); err.className = 'field-error'; wrap.appendChild(err); }
  err.textContent = msg;
}

export function clearFieldErrors(formEl) {
  formEl.querySelectorAll('.field').forEach(f => {
    f.classList.remove('has-error');
    f.querySelector('.field-error')?.remove();
  });
}

export function showFieldErrors(errors, prefix = '') {
  for (const [key, msg] of Object.entries(errors)) {
    setFieldError(prefix + key, msg);
  }
}
