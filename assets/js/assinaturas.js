/* ============================================================
   SGE v2 — IFRS CAMPUS RIO GRANDE
   assinaturas.js — UI compartilhada do fluxo de assinaturas do TCE
   ============================================================
   Mesmo fluxo da v1 (waterfall de 5 etapas: Estudante → Empresa →
   Central (revisão) → Direção-Geral → Central (finalização)), mas sem
   página universal por token — cada ator interno resolve dentro do
   próprio painel já existente; só a Empresa (externa) usa magic link.
   Usado por: estudantes/acompanhamento-estagio.html, diretor/index.html,
   central-estagios/estagios.html (modal), assinaturas/index.html (empresa).
   ============================================================ */

'use strict';

var ASS_DOT_CLASS = { concluido: 'is-concluido', aguardando: 'is-aguardando', pendente: 'is-pendente', rejeitado: 'is-rejeitado' };
var ASS_DOT_ICON  = { concluido: '✓', aguardando: '…', pendente: '○', rejeitado: '✕' };

/**
 * Renderiza a timeline (etapa-linha/etapa-dot, já usado no fluxo de
 * Convênio) do fluxo de assinaturas. Somente leitura.
 */
function renderTimelineAssinaturas(fluxo) {
  var etapas = fluxo.etapas || [];
  var html = etapas.map(function (et) {
    return '<div class="etapa-linha">' +
      '<div class="etapa-dot ' + (ASS_DOT_CLASS[et.status] || 'is-pendente') + '">' + (ASS_DOT_ICON[et.status] || et.numero) + '</div>' +
      '<div style="flex:1;">' +
        '<div style="font-size:var(--font-size-sm);font-weight:600;">' + escapeHtml(et.label) + ' <span style="font-size:11px;font-weight:400;color:var(--color-text-muted);">(' + (et.tipo === 'govbr' ? 'gov.br' : 'Interno') + ')</span></div>' +
        (et.data ? '<div style="font-size:11px;color:var(--color-text-muted);margin-top:2px;">' + escapeHtml(formatDateBR(et.data)) + '</div>' : '') +
        (et.prazoVencimento && et.status === 'aguardando' ? '<div style="font-size:11px;color:var(--color-warning);margin-top:2px;">⏰ Prazo: ' + escapeHtml(formatDateBR(et.prazoVencimento)) + '</div>' : '') +
        (et.obs ? '<div style="font-size:11px;color:var(--color-error);margin-top:2px;">Rejeitado: ' + escapeHtml(et.obs) + '</div>' : '') +
        (et.driveUrl ? '<button type="button" class="btn btn-ghost btn-sm" data-baixar-etapa="' + et.numero + '" style="margin-top:4px;font-size:11px;">⬇ PDF desta etapa</button>' : '') +
      '</div></div>';
  }).join('');
  return '<div style="border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-3) var(--space-4);">' + html + '</div>';
}

/** Histórico de rejeições, se houver. */
function renderHistoricoRejeicoes(fluxo) {
  var lista = fluxo.historicoRejeicoes || [];
  if (!lista.length) return '';
  return '<p style="font-size:var(--font-size-xs);font-weight:600;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.05em;margin:var(--space-4) 0 var(--space-2);">Histórico de rejeições</p>' +
    lista.map(function (r) {
      return '<div class="alert alert-error" style="margin-bottom:var(--space-2);"><div class="alert-content" style="font-size:var(--font-size-sm);">' +
        '<strong>' + escapeHtml(r.label) + '</strong> — ' + escapeHtml(r.motivo) + ' (' + escapeHtml(formatDateBR(r.data)) + ')</div></div>';
    }).join('');
}

/**
 * Monta o painel gov.br (baixar → assinar externamente → enviar assinado)
 * dentro de containerEl, pra uma etapa 'aguardando' do tipo 'govbr'.
 * opts.onBaixar() e opts.onEnviar(pdfBase64, nomeArquivo) são async.
 */
function montarPainelGovBr(containerEl, etapa, opts) {
  containerEl.innerHTML =
    '<div class="alert alert-info" style="margin-bottom:var(--space-4);"><div class="alert-content">' +
      '<strong>É a sua vez de assinar.</strong> Siga os 3 passos abaixo.' +
    '</div></div>' +
    '<ol style="margin:0 0 var(--space-4);padding-left:var(--space-5);font-size:var(--font-size-sm);display:flex;flex-direction:column;gap:var(--space-2);">' +
      '<li><button type="button" class="btn btn-secondary btn-sm" id="ass-btn-baixar">⬇ Baixar PDF do TCE</button></li>' +
      '<li>Assine o PDF em <a href="https://assinador.iti.br" target="_blank" rel="noopener">assinador.iti.br</a> (gov.br), usando sua conta gov.br.</li>' +
      '<li>Envie aqui o PDF assinado:</li>' +
    '</ol>' +
    '<div class="file-input-wrapper">' +
      '<label class="file-input-label" for="ass-doc-assinado">' +
        '<svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>' +
        '<span class="file-text">Selecionar PDF assinado</span>' +
        '<span class="file-selected" id="ass-doc-nome"></span>' +
      '</label>' +
      '<input type="file" class="form-control-file" id="ass-doc-assinado" accept=".pdf">' +
    '</div>' +
    '<span id="ass-doc-assinado-error" class="form-error hidden" role="alert"></span>' +
    '<div style="margin-top:var(--space-4);">' +
      '<button type="button" class="btn btn-primary btn-sm" id="ass-btn-enviar">Enviar PDF Assinado</button>' +
    '</div>';

  validarPdf('ass-doc-assinado', 'ass-doc-nome', 'ass-doc-assinado-error');

  containerEl.querySelector('#ass-btn-baixar').addEventListener('click', function () { opts.onBaixar(); });
  containerEl.querySelector('#ass-btn-enviar').addEventListener('click', async function () {
    var btn = this;
    var file = containerEl.querySelector('#ass-doc-assinado').files[0];
    if (!file) { showToast('Selecione o PDF assinado antes de enviar.', 'error'); return; }
    var orig = btn.textContent;
    btn.disabled = true; btn.textContent = 'Enviando…';
    try {
      var pdfBase64 = await new Promise(function (resolve) {
        var r = new FileReader();
        r.onload = function () { resolve(r.result.split(',')[1]); };
        r.onerror = function () { resolve(null); };
        r.readAsDataURL(file);
      });
      await opts.onEnviar(pdfBase64, file.name);
    } catch (err) {
      showToast('Erro: ' + err.message, 'error');
      btn.disabled = false; btn.textContent = orig;
    }
  });
}

/**
 * Monta o painel interno (Aprovar / Rejeitar) dentro de containerEl,
 * pra uma etapa 'aguardando' do tipo 'interno' (só Central de Estágios).
 * opts.onAprovar() e opts.onRejeitar(motivo, retornoParaEtapa) são async.
 */
function montarPainelInterno(containerEl, fluxo, etapa, opts) {
  var etapasAnteriores = (fluxo.etapas || []).filter(function (e) { return e.numero < etapa.numero; });
  var opcoesRetorno = etapasAnteriores.map(function (e) {
    return '<option value="' + e.numero + '">' + e.numero + '. ' + escapeHtml(e.label) + '</option>';
  }).join('');

  containerEl.innerHTML =
    '<div class="alert alert-info" style="margin-bottom:var(--space-4);"><div class="alert-content">Revise o documento e aprove, ou rejeite e escolha para qual etapa o fluxo deve retornar.</div></div>' +
    '<div style="display:flex;gap:var(--space-2);margin-bottom:var(--space-4);">' +
      '<button type="button" class="btn btn-danger btn-sm" id="ass-btn-rejeitar-toggle">Rejeitar</button>' +
      '<button type="button" class="btn btn-primary btn-sm" id="ass-btn-aprovar">Aprovar' + (etapa.numero === 5 ? ' e Concluir' : '') + '</button>' +
    '</div>' +
    '<div class="hidden" id="ass-rejeitar-panel" style="border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);">' +
      '<div class="form-group"><label class="form-label required" for="ass-rejeitar-motivo">Motivo da rejeição</label>' +
      '<textarea id="ass-rejeitar-motivo" class="form-control" rows="3" maxlength="500"></textarea></div>' +
      '<div class="form-group"><label class="form-label required" for="ass-rejeitar-retorno">Retornar para etapa</label>' +
      '<select id="ass-rejeitar-retorno" class="form-control">' + opcoesRetorno + '</select></div>' +
      '<button type="button" class="btn btn-danger btn-sm" id="ass-btn-confirmar-rejeicao">Confirmar Rejeição</button>' +
    '</div>';

  containerEl.querySelector('#ass-btn-aprovar').addEventListener('click', async function () {
    var btn = this;
    var orig = btn.textContent;
    btn.disabled = true; btn.textContent = 'Aprovando…';
    try { await opts.onAprovar(); }
    catch (err) { showToast('Erro: ' + err.message, 'error'); btn.disabled = false; btn.textContent = orig; }
  });

  containerEl.querySelector('#ass-btn-rejeitar-toggle').addEventListener('click', function () {
    containerEl.querySelector('#ass-rejeitar-panel').classList.toggle('hidden');
  });

  containerEl.querySelector('#ass-btn-confirmar-rejeicao').addEventListener('click', async function () {
    var btn = this;
    var motivo = containerEl.querySelector('#ass-rejeitar-motivo').value.trim();
    if (!motivo) { showToast('Informe o motivo da rejeição.', 'error'); return; }
    var retorno = parseInt(containerEl.querySelector('#ass-rejeitar-retorno').value, 10);
    var orig = btn.textContent;
    btn.disabled = true; btn.textContent = 'Enviando…';
    try { await opts.onRejeitar(motivo, retorno); }
    catch (err) { showToast('Erro: ' + err.message, 'error'); btn.disabled = false; btn.textContent = orig; }
  });
}

/** Aciona o download do PDF (proxy pelo backend, base64 → Blob). */
async function baixarPdfAssinaturaEtapa(params) {
  try {
    var resp = await API.get('baixarPdfAssinatura', params);
    var byteChars = atob(resp.pdfBase64);
    var byteNumbers = new Array(byteChars.length);
    for (var i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
    var blob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = resp.nome || 'TCE.pdf';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    showToast('Erro ao baixar PDF: ' + err.message, 'error');
  }
}
