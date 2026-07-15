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
 * Valida data mínima (n dias a partir de hoje).
 * @param {string} dateValue - Valor do input date (YYYY-MM-DD)
 * @param {number} minDays - Mínimo de dias a partir de hoje
 */
function validateMinDate(dateValue, minDays = 0) {
  const date = new Date(dateValue + 'T00:00:00');
  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);
  minDate.setDate(minDate.getDate() + minDays);
  return date >= minDate;
}

/**
 * Retorna a data mínima formatada para o atributo min do input date.
 * @param {number} addDays
 */
function getMinDateString(addDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + addDays);
  return d.toISOString().split('T')[0];
}

/**
 * Exibe mensagem de erro abaixo de um campo.
 * O elemento de erro deve ter id = fieldId + '-error'.
 */
function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(fieldId + '-error');
  if (field) {
    field.classList.add('is-invalid');
    field.setAttribute('aria-invalid', 'true');
  }
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }
}

/**
 * Remove mensagem de erro de um campo.
 */
function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(fieldId + '-error');
  if (field) {
    field.classList.remove('is-invalid');
    field.setAttribute('aria-invalid', 'false');
  }
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }
}

/**
 * Exibe o bloco de feedback do formulário (elemento com classe .form-feedback).
 * @param {string} containerId
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {string} title
 * @param {string} message
 */
function showFormFeedback(containerId, type, title, message) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const icons = {
    success: `<svg class="alert-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`,
    error:   `<svg class="alert-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>`,
    warning: `<svg class="alert-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,
    info:    `<svg class="alert-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`,
  };

  container.innerHTML = `
    <div class="alert alert-${type}">
      ${icons[type] || ''}
      <div class="alert-content">
        ${title ? `<div class="alert-title">${escapeHtml(title)}</div>` : ''}
        <div>${escapeHtml(message)}</div>
      </div>
    </div>
  `;
  container.classList.add('is-visible');
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Esconde o bloco de feedback do formulário.
 */
function hideFormFeedback(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.classList.remove('is-visible');
    container.innerHTML = '';
  }
}

/**
 * Formata uma data ISO (YYYY-MM-DD) para exibição em DD/MM/AAAA.
 * Retorna a string original se não conseguir interpretar.
 */
function formatDateBR(value) {
  if (!value) return '';
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(value);
}

/**
 * Valida que uma URL é http(s) ou mailto antes de usá-la como href —
 * evita injeção de esquemas perigosos (ex.: javascript:) em conteúdo
 * vindo do backend/planilha.
 */
function safeUrl(url) {
  if (!url) return '';
  const s = String(url).trim().replace(/\s/g, '');
  if (/^https?:\/\//i.test(s)) return s;
  if (/^mailto:/i.test(s)) return s;
  return '';
}

/**
 * Preenche um <select> a partir de uma lista de { value, label }.
 */
function populateSelect(selectId, options, placeholder = 'Selecione...') {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = `<option value="">${escapeHtml(placeholder)}</option>`;
  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    select.appendChild(option);
  });
}

// ─────────────────────────────────────────
//  VÍNCULO ACADÊMICO PADRÃO (estudantes com múltiplos cursos)
// ─────────────────────────────────────────
const VINCULO_PADRAO_KEY = 'sge_vinculo_padrao';

/**
 * Lê o curso escolhido como vínculo padrão nas últimas solicitações
 * (mesma chave usada por todas as páginas de solicitação, pra que a
 * preferência convirja independente de qual formulário o estudante usou
 * por último).
 */
function getVinculoPadrao() {
  try { return localStorage.getItem(VINCULO_PADRAO_KEY) || ''; } catch (e) { return ''; }
}

/**
 * Salva o curso escolhido como vínculo padrão. Chamar no 'change' do
 * select de vínculo de cada formulário de solicitação.
 */
function setVinculoPadrao(curso) {
  try { if (curso) localStorage.setItem(VINCULO_PADRAO_KEY, curso); } catch (e) { /* localStorage indisponível — não bloqueia o formulário */ }
}

// ─────────────────────────────────────────
//  VALIDAÇÃO DE UPLOAD DE PDF (magic bytes)
// ─────────────────────────────────────────
const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46]; // %PDF
const PDF_MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// Estado global: inputId -> true/false, consultado pelo accordion (secaoStatus)
// e pela validação de envio de cada formulário.
var _fileOk = {};

/**
 * Liga a validação de PDF (tamanho + magic bytes) a um <input type="file">
 * dentro do padrão .file-input-wrapper/.file-input-label já usado no v2.
 * @param {string} inputId
 * @param {string} nameId - id do <span class="file-selected"> que mostra o nome do arquivo
 * @param {string} errorId - id do <span class="form-error"> associado (fieldId + '-error')
 */
function validarPdf(inputId, nameId, errorId) {
  const input = document.getElementById(inputId);
  const nameEl = document.getElementById(nameId);
  const textEl = input.closest('.file-input-label') ? input.closest('.file-input-label').querySelector('.file-text') : null;

  function setErro(msg) {
    _fileOk[inputId] = false;
    input.value = '';
    if (nameEl) { nameEl.textContent = ''; nameEl.style.display = 'none'; }
    if (textEl) textEl.style.display = '';
    showFieldError(inputId, msg);
  }
  function setOk(nome) {
    _fileOk[inputId] = true;
    if (nameEl) { nameEl.textContent = nome; nameEl.style.display = 'block'; }
    if (textEl) textEl.style.display = 'none';
    clearFieldError(inputId);
  }

  input.addEventListener('change', function () {
    const file = this.files && this.files[0];
    if (!file) { _fileOk[inputId] = false; return; }
    if (file.size > PDF_MAX_SIZE) { setErro('Arquivo muito grande. Limite: 5 MB.'); return; }

    const slice = file.slice(0, 4);
    const reader = new FileReader();
    reader.onload = function (ev) {
      const bytes = new Uint8Array(ev.target.result);
      const isPdf = PDF_MAGIC.every(function (b, i) { return bytes[i] === b; });
      if (!isPdf) setErro('O arquivo não é um PDF válido. Selecione um arquivo PDF.');
      else setOk(file.name);
    };
    reader.onerror = function () { setErro('Não foi possível ler o arquivo. Tente novamente.'); };
    reader.readAsArrayBuffer(slice);
  });
}

// ─────────────────────────────────────────
//  VALIDAÇÃO DE UPLOAD DE IMAGEM (magic bytes) — JPG/PNG
// ─────────────────────────────────────────
const IMG_MAGIC = {
  jpeg: [0xFF, 0xD8, 0xFF],
  png:  [0x89, 0x50, 0x4E, 0x47],
};
const IMG_MAX_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Liga a validação de imagem (tamanho + magic bytes JPG/PNG) a um
 * <input type="file"> no mesmo padrão .file-input-wrapper de validarPdf,
 * com pré-visualização opcional num <img>.
 * @param {string} inputId
 * @param {string} nameId - id do <span class="file-selected">
 * @param {string} errorId - id do <span class="form-error"> associado (fieldId + '-error')
 * @param {string} [previewId] - id de um <img> pra mostrar a pré-visualização
 */
function validarImagem(inputId, nameId, errorId, previewId) {
  const input = document.getElementById(inputId);
  const nameEl = document.getElementById(nameId);
  const previewEl = previewId ? document.getElementById(previewId) : null;
  const textEl = input.closest('.file-input-label') ? input.closest('.file-input-label').querySelector('.file-text') : null;

  function setErro(msg) {
    _fileOk[inputId] = false;
    input.value = '';
    if (nameEl) { nameEl.textContent = ''; nameEl.style.display = 'none'; }
    if (textEl) textEl.style.display = '';
    if (previewEl) { previewEl.src = ''; previewEl.classList.add('hidden'); }
    showFieldError(inputId, msg);
  }
  function setOk(file) {
    _fileOk[inputId] = true;
    if (nameEl) { nameEl.textContent = file.name; nameEl.style.display = 'block'; }
    if (textEl) textEl.style.display = 'none';
    clearFieldError(inputId);
    if (previewEl) {
      const reader = new FileReader();
      reader.onload = function (ev) { previewEl.src = ev.target.result; previewEl.classList.remove('hidden'); };
      reader.readAsDataURL(file);
    }
  }

  input.addEventListener('change', function () {
    const file = this.files && this.files[0];
    if (!file) { _fileOk[inputId] = false; return; }
    if (file.size > IMG_MAX_SIZE) { setErro('Arquivo muito grande. Limite: 5 MB.'); return; }

    const slice = file.slice(0, 4);
    const reader = new FileReader();
    reader.onload = function (ev) {
      const bytes = new Uint8Array(ev.target.result);
      const isJpeg = IMG_MAGIC.jpeg.every(function (b, i) { return bytes[i] === b; });
      const isPng = IMG_MAGIC.png.every(function (b, i) { return bytes[i] === b; });
      if (!isJpeg && !isPng) setErro('O arquivo não é uma imagem JPG ou PNG válida.');
      else setOk(file);
    };
    reader.onerror = function () { setErro('Não foi possível ler o arquivo. Tente novamente.'); };
    reader.readAsArrayBuffer(slice);
  });
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

/**
 * Transforma um <select> oculto num campo de busca por nome (combobox).
 * Único componente de busca do sistema — reaproveitado em qualquer <select>
 * com muitas opções (empresas, supervisores, orientadores etc.), em vez de
 * reimplementar a mesma lógica em cada página.
 *
 * Cada <option> pode ter um atributo `data-nome` (rótulo usado na busca,
 * caso diferente do texto visível). A option com value="__NAO__" (se houver)
 * é sempre exibida ao final da lista, fora do filtro de busca, como escape
 * hatch ("+ Não encontrei..."). Selecionar uma opção dispara `change` no
 * <select> original — o código que escuta esse elemento não precisa saber
 * que existe uma busca por cima.
 *
 * @param {string} selectId
 * @param {string} [placeholder]
 */
function makeSearchable(selectId, placeholder) {
  const sel = document.getElementById(selectId);
  if (!sel) return;

  const anterior = sel.parentNode.querySelector('.ss-wrapper');
  if (anterior) anterior.remove();

  const normais = [];
  const naoEncontrei = [];
  for (let i = 0; i < sel.options.length; i++) {
    const o = sel.options[i];
    if (!o.value) continue;
    const entry = { value: o.value, label: (o.dataset.nome || o.textContent).trim(), display: o.textContent.trim() };
    (o.value === '__NAO__' ? naoEncontrei : normais).push(entry);
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'ss-wrapper';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'form-control ss-input';
  input.placeholder = placeholder || 'Digite para buscar…';
  input.autocomplete = 'off';

  const list = document.createElement('div');
  list.className = 'ss-list ss-hidden';

  wrapper.appendChild(input);
  wrapper.appendChild(list);
  sel.parentNode.insertBefore(wrapper, sel.nextSibling);
  sel.style.display = 'none';

  function renderList(q) {
    list.innerHTML = '';
    const qn = (q || '').toLowerCase().trim();
    const filtrados = qn ? normais.filter(o => o.label.toLowerCase().includes(qn)) : normais.slice();

    if (filtrados.length === 0 && naoEncontrei.length === 0) {
      const vazio = document.createElement('div');
      vazio.className = 'ss-empty';
      vazio.textContent = 'Nenhum resultado encontrado.';
      list.appendChild(vazio);
    }

    filtrados.forEach(function (o) {
      const item = document.createElement('div');
      item.className = 'ss-option';
      item.textContent = o.display;
      item.addEventListener('mousedown', function (e) { e.preventDefault(); escolher(o); });
      list.appendChild(item);
    });

    naoEncontrei.forEach(function (o) {
      const item = document.createElement('div');
      item.className = 'ss-option ss-option--nao';
      item.textContent = o.display;
      item.addEventListener('mousedown', function (e) { e.preventDefault(); escolher(o); });
      list.appendChild(item);
    });

    list.classList.remove('ss-hidden');
  }

  function escolher(o) {
    input.value = o.value === '__NAO__' ? '' : o.label;
    sel.value = o.value;
    list.classList.add('ss-hidden');
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  }

  input.addEventListener('focus', function () { renderList(this.value); });
  input.addEventListener('input', function () { sel.value = ''; renderList(this.value); });
  input.addEventListener('blur', function () { setTimeout(function () { list.classList.add('ss-hidden'); }, 160); });
  input.addEventListener('keydown', function (e) { if (e.key === 'Escape') list.classList.add('ss-hidden'); });
}

/**
 * Calcula os períodos de avaliação (semestral(is) + final) de um estágio,
 * a partir da data de início e término — usado nas telas de acompanhamento
 * de orientadores/supervisores/coordenadores pra mostrar quando cada
 * relatório é esperado. Estágios de até 6 meses têm só avaliação final;
 * acima disso, uma avaliação a cada 6 meses, mais a final.
 */
function calcularPeriodosAvaliacao(dataInicio, dataTermino) {
  function parseData(v) {
    if (!v) return null;
    if (v instanceof Date) return v;
    const m = String(v).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) return new Date(m[3], m[2] - 1, m[1]);
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  const dInicio = parseData(dataInicio);
  const dFim = parseData(dataTermino);
  if (!dInicio || !dFim || dFim <= dInicio) return [];

  const diasTotal = (dFim - dInicio) / 86400000;
  const mesesTotal = diasTotal / 30.44;
  const periodos = [];

  if (mesesTotal <= 6) {
    periodos.push({ tipo: 'final', label: 'Final', dataDisparo: new Date(dFim) });
    return periodos;
  }

  let sem = 1;
  while (true) {
    const dSem = new Date(dInicio);
    dSem.setMonth(dSem.getMonth() + sem * 6);
    if (dSem >= dFim) break;
    periodos.push({ tipo: 'semestral_' + sem, label: 'Semestral ' + sem, dataDisparo: new Date(dSem) });
    sem++;
  }
  periodos.push({ tipo: 'final', label: 'Final', dataDisparo: new Date(dFim) });
  return periodos;
}
