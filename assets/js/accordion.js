/* ============================================================
   SGE v2 — IFRS CAMPUS RIO GRANDE
   accordion.js — accordion de seções + barra de progresso
   ============================================================
   Para formulários longos e sequenciais (Solicitar Estágio,
   Certificação de Conhecimento etc.). Cada <div class="form-section">
   direto dentro do <form> vira um card colapsável (só um aberto por
   vez), com uma barra de progresso no topo calculada automaticamente
   a partir dos campos obrigatórios visíveis de cada seção.

   Uso: chamar initAccordion(formEl) uma vez, depois de o formulário
   estar montado no DOM (ex.: dentro do DOMContentLoaded da página).
   ============================================================ */

'use strict';

var _accCards = []; // [{ card, body, hdr }] — estado da página atual

function initAccordion(formEl) {
  var secoes = Array.from(formEl.querySelectorAll(':scope > .form-section'));
  if (!secoes.length) return;

  var progWrap = document.createElement('div');
  progWrap.className = 'acc-progress-wrap';
  progWrap.innerHTML =
    '<div class="acc-progress-top">' +
      '<span>Progresso da solicitação</span>' +
      '<strong id="acc-prog-label">0 de ' + secoes.length + ' concluídas</strong>' +
    '</div>' +
    '<div class="acc-progress-bar"><div class="acc-progress-fill" id="acc-prog-fill" style="width:0%"></div></div>';
  formEl.insertBefore(progWrap, formEl.firstChild);

  secoes.forEach(function (secao, i) {
    var h2 = secao.querySelector('.form-section-title');
    var tituloTexto = '';
    if (h2) {
      var clone = h2.cloneNode(true);
      var svg = clone.querySelector('svg');
      if (svg) svg.remove();
      tituloTexto = clone.textContent.trim();
    }

    var card = document.createElement('div');
    card.className = 'acc-card' + (i === 0 ? ' acc-open' : '');

    var hdr = document.createElement('button');
    hdr.type = 'button';
    hdr.className = 'acc-hdr';
    hdr.setAttribute('aria-expanded', i === 0 ? 'true' : 'false');
    hdr.innerHTML =
      '<span class="acc-badge">' + (i + 1) + '</span>' +
      '<span class="acc-title">' + escapeHtml(tituloTexto) + '</span>' +
      '<span class="acc-status">Aguardando</span>' +
      '<svg class="acc-chevron" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>';

    var body = document.createElement('div');
    body.className = 'acc-body';
    while (secao.firstChild) body.appendChild(secao.firstChild);

    var isLast = i === secoes.length - 1;
    if (!isLast) {
      var footer = document.createElement('div');
      footer.className = 'acc-footer';
      var btnAdv = document.createElement('button');
      btnAdv.type = 'button';
      btnAdv.className = 'btn btn-ghost btn-sm acc-btn-adv';
      btnAdv.innerHTML = 'Confirmar e avançar ' +
        '<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>';
      (function (idx) {
        btnAdv.addEventListener('click', function () { abrirAccCard(idx + 1); });
      })(i);
      footer.appendChild(btnAdv);
      body.appendChild(footer);
    }

    card.appendChild(hdr);
    card.appendChild(body);
    secao.replaceWith(card);

    hdr.addEventListener('click', function () { toggleAccCard(i); });

    _accCards.push({ card: card, body: body, hdr: hdr });
  });

  formEl.addEventListener('input', atualizarProgresso);
  formEl.addEventListener('change', atualizarProgresso);
  atualizarProgresso();
}

function toggleAccCard(idx) {
  var isOpen = _accCards[idx].card.classList.contains('acc-open');
  abrirAccCard(isOpen ? -1 : idx);
}

function abrirAccCard(idx) {
  _accCards.forEach(function (c, i) {
    var aberto = i === idx;
    c.card.classList.toggle('acc-open', aberto);
    c.hdr.setAttribute('aria-expanded', String(aberto));
  });
  if (idx >= 0 && idx < _accCards.length) {
    _accCards[idx].card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function secaoEstaCompleta(bodyEl) {
  var campos = Array.from(bodyEl.querySelectorAll('[required]'));
  for (var i = 0; i < campos.length; i++) {
    var el = campos[i];
    if (el.offsetParent === null) continue; // oculto/irrelevante no momento
    if (el.type === 'checkbox') { if (!el.checked) return false; continue; }
    if (el.type === 'file') { if (!el.files.length || (window._fileOk || {})[el.id] === false) return false; continue; }
    if (!el.value || !el.value.trim()) return false;
    // Selects de busca (Empresa, Supervisor etc.) têm uma opção de escape
    // "__NAO__" ("não encontrei...") — não conta como resposta válida.
    if (el.tagName === 'SELECT' && el.value === '__NAO__') return false;
  }
  var grupos = Array.from(bodyEl.querySelectorAll('.radio-group[aria-required="true"]'));
  for (var g = 0; g < grupos.length; g++) {
    if (grupos[g].offsetParent === null) continue;
    if (!grupos[g].querySelector('input:checked')) return false;
  }
  return true;
}

function atualizarProgresso() {
  if (!_accCards.length) return;
  var concluidas = 0;
  _accCards.forEach(function (c) {
    var done = secaoEstaCompleta(c.body);
    c.card.classList.toggle('acc-done', done);
    var statusEl = c.hdr.querySelector('.acc-status');
    statusEl.textContent = done ? 'Concluída' : 'Aguardando';
    if (done) concluidas++;
  });
  var pct = Math.round((concluidas / _accCards.length) * 100);
  document.getElementById('acc-prog-fill').style.width = pct + '%';
  document.getElementById('acc-prog-label').textContent = concluidas + ' de ' + _accCards.length + ' concluídas';
}
