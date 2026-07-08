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
