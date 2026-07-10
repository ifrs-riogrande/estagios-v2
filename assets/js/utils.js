/* ============================================================
   SGE v2 — IFRS CAMPUS RIO GRANDE
   utils.js — funções utilitárias compartilhadas
   ============================================================ */

'use strict';

/**
 * Escapa texto para uso seguro dentro de HTML (previne XSS).
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(String(text ?? '')));
  return div.innerHTML;
}

/**
 * Exibe uma notificação toast no canto inferior direito.
 * @param {string} html - Conteúdo (aceita HTML, ex.: links) — só usar com conteúdo confiável/estático.
 * @param {'info'|'success'|'error'} type
 * @param {number} [duration] - ms até desaparecer. Padrão: 10s (error/info) ou 5s (success).
 */
function showToast(html, type = 'info', duration) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const el = document.createElement('div');
  el.className = 'toast toast--' + type;
  el.innerHTML = html;
  container.appendChild(el);

  const ms = duration ?? (type === 'success' ? 5000 : 10000);
  setTimeout(() => el.remove(), ms);
}
