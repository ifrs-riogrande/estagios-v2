/* ============================================================
   SGE v2 — IFRS CAMPUS RIO GRANDE
   notificacoes-config.js — registro genérico de todos os eventos de
   notificação do sistema (substitui as antigas listas fixas de 4
   "Lembretes Automáticos" e 4 "E-mails do Sistema" por um único motor
   config-driven, cobrindo todo evento real — inclusive os que hoje só
   notificam por dentro do sistema, sem opção de e-mail).
   ============================================================
   Consolidado a partir do mapeamento do backend da v1: descartados os
   6 templates mortos (nunca realmente disparados), unificados os 3
   sistemas de e-mail paralelos (Avaliações/Parecer/Convênios) nesta
   mesma estrutura, e excluído o fluxo legado de "documentos" (v1 tinha
   um 2º fluxo de aprovação por documentos, paralelo ao checklist — o
   v2 não tem esse fluxo, foi totalmente substituído pelo checklist).
   Usado por: admin/notificacoes.html.
   ============================================================ */

'use strict';

var FLUXOS_NOTIFICACAO_ORDEM = [
  'Cadastros', 'Checklist de Estágio', 'NAPNE', 'Assinaturas do TCE', 'Adendos ao TCE',
  'Avaliações de Estágio', 'Parecer Final de Estágio', 'Convênios', 'Oportunidades', 'Declarações',
];

var EVENTOS_NOTIFICACAO = [
  // ── Cadastros ──
  { id: 'cadastro-empresa-recebido', fluxo: 'Cadastros', label: 'Novo cadastro de empresa recebido', destinatario: 'Setor', variaveis: ['nomeEmpresa', 'cnpj'] },
  { id: 'cadastro-empresa-confirmacao', fluxo: 'Cadastros', label: 'Confirmação de cadastro de empresa (com código de acesso)', destinatario: 'Empresa', variaveis: ['nomeEmpresa', 'codigoAcesso', 'link'] },
  { id: 'cadastro-supervisor-recebido', fluxo: 'Cadastros', label: 'Novo cadastro de supervisor recebido', destinatario: 'Setor', variaveis: ['nomeSupervisor', 'nomeEmpresa'] },
  { id: 'cadastro-supervisor-validado', fluxo: 'Cadastros', label: 'Cadastro de supervisor validado', destinatario: 'Supervisor', variaveis: ['nomeSupervisor'] },
  { id: 'cadastro-supervisor-recusado', fluxo: 'Cadastros', label: 'Cadastro de supervisor recusado', destinatario: 'Supervisor', variaveis: ['nomeSupervisor', 'motivo'] },
  { id: 'cadastro-estudante-recebido', fluxo: 'Cadastros', label: 'Novo cadastro de estudante recebido', destinatario: 'Setor', variaveis: ['nomeEstudante', 'curso'] },
  { id: 'cadastro-estudante-validado', fluxo: 'Cadastros', label: 'Cadastro de estudante validado', destinatario: 'Estudante', variaveis: ['nomeEstudante'] },
  { id: 'cadastro-orientador-recebido', fluxo: 'Cadastros', label: 'Novo orientador cadastrado', destinatario: 'Setor', variaveis: ['nomeOrientador'] },
  { id: 'cadastro-coordenador-recebido', fluxo: 'Cadastros', label: 'Novo coordenador cadastrado', destinatario: 'Setor', variaveis: ['nomeCoordenador', 'curso'] },
  { id: 'cadastro-servidor-atualizado', fluxo: 'Cadastros', label: 'Atualização de cadastro de orientador/coordenador', destinatario: 'Setor', variaveis: ['nomeServidor'] },
  { id: 'cadastro-servidor-rejeitado', fluxo: 'Cadastros', label: 'Cadastro de orientador/coordenador rejeitado', destinatario: 'Orientador/Coordenador', variaveis: ['nomeServidor', 'motivo'] },
  { id: 'cadastro-agente-recebido', fluxo: 'Cadastros', label: 'Novo agente de integração cadastrado', destinatario: 'Setor', variaveis: ['nomeAgente'] },
  { id: 'convite-empresa', fluxo: 'Cadastros', label: 'Convite (magic link) para empresa completar cadastro', destinatario: 'Empresa', variaveis: ['nomeEmpresa', 'link'] },
  { id: 'convite-supervisor', fluxo: 'Cadastros', label: 'Convite (magic link) para supervisor completar cadastro', destinatario: 'Supervisor', variaveis: ['nomeSupervisor', 'link'] },

  // ── Checklist de Estágio ──
  { id: 'checklist-sua-vez', fluxo: 'Checklist de Estágio', label: 'É a vez do ator validar o checklist', destinatario: 'Orientador/Supervisor/Coordenador', variaveis: ['nomeEstudante', 'idEstagio', 'link'] },
  { id: 'checklist-ajuste-solicitado', fluxo: 'Checklist de Estágio', label: 'Ajuste solicitado no checklist', destinatario: 'Estudante', variaveis: ['nomeEstudante', 'idEstagio', 'motivo'] },
  { id: 'checklist-lembrete', fluxo: 'Checklist de Estágio', label: 'Lembrete de pendência no checklist', destinatario: 'Ator pendente (+ Setor, escalonado)', variaveis: ['nomeEstudante', 'idEstagio', 'diasRestantes'], lembrete: true },
  { id: 'checklist-orientador-escolhido', fluxo: 'Checklist de Estágio', label: 'Estudante escolheu você como orientador(a)', destinatario: 'Orientador', variaveis: ['nomeEstudante', 'idEstagio', 'link'] },
  { id: 'checklist-solicitacao-enviada', fluxo: 'Checklist de Estágio', label: 'Confirmação de envio da solicitação de estágio', destinatario: 'Estudante', variaveis: ['nomeEstudante', 'idEstagio'] },
  { id: 'checklist-orientador-resposta', fluxo: 'Checklist de Estágio', label: 'Orientador aceitou ou recusou a orientação', destinatario: 'Estudante', variaveis: ['nomeEstudante', 'idEstagio', 'resposta'] },

  // ── NAPNE ──
  { id: 'napne-aviso-nee', fluxo: 'NAPNE', label: 'Estudante se autodeclarou NEE no perfil (preencher ficha — não bloqueia nada)', destinatario: 'NAPNE', variaveis: ['nomeEstudante', 'link'] },

  // ── Assinaturas do TCE ──
  { id: 'assinatura-sua-vez-govbr', fluxo: 'Assinaturas do TCE', label: 'É a sua vez de assinar (gov.br)', destinatario: 'Estudante/Empresa/Direção-Geral', variaveis: ['nomeEstudante', 'idEstagio', 'etapa', 'link'] },
  { id: 'assinatura-sua-vez-interno', fluxo: 'Assinaturas do TCE', label: 'É a sua vez de aprovar (interno)', destinatario: 'Central de Estágios', variaveis: ['nomeEstudante', 'idEstagio', 'etapa'] },
  { id: 'assinatura-lembrete', fluxo: 'Assinaturas do TCE', label: 'Lembrete de pendência na assinatura', destinatario: 'Signatário pendente (+ Setor, escalonado)', variaveis: ['nomeEstudante', 'idEstagio', 'etapa', 'diasRestantes'], lembrete: true },
  { id: 'assinatura-concluida', fluxo: 'Assinaturas do TCE', label: 'TCE 100% assinado', destinatario: 'Todos os envolvidos', variaveis: ['nomeEstudante', 'idEstagio'] },

  // ── Adendos ao TCE ──
  { id: 'adendo-recebido', fluxo: 'Adendos ao TCE', label: 'Pedido de adendo recebido', destinatario: 'Setor', variaveis: ['nomeEstudante', 'idEstagio', 'tipoAdendo'] },
  { id: 'adendo-processado', fluxo: 'Adendos ao TCE', label: 'Adendo aprovado ou reprovado', destinatario: 'Estudante', variaveis: ['nomeEstudante', 'tipoAdendo', 'resultado'] },
  { id: 'adendo-sua-vez', fluxo: 'Adendos ao TCE', label: 'É a sua vez de assinar/aprovar o aditamento', destinatario: 'Ator da fila (gov.br/interno)', variaveis: ['nomeEstudante', 'idEstagio', 'etapa', 'link'] },
  { id: 'adendo-lembrete', fluxo: 'Adendos ao TCE', label: 'Lembrete de pendência no aditamento', destinatario: 'Signatário pendente (+ Setor, escalonado)', variaveis: ['nomeEstudante', 'idEstagio', 'etapa', 'diasRestantes'], lembrete: true },
  { id: 'adendo-concluido', fluxo: 'Adendos ao TCE', label: 'Aditamento 100% assinado', destinatario: 'Todos os envolvidos', variaveis: ['nomeEstudante', 'idEstagio', 'tipoAdendo'] },

  // ── Avaliações de Estágio ──
  { id: 'avaliacao-aguardando-preenchimento', fluxo: 'Avaliações de Estágio', label: 'Avaliação aguardando preenchimento', destinatario: 'Quem preenche (Aluno/Concedente)', variaveis: ['nomeEstudante', 'idEstagio', 'link'] },
  { id: 'avaliacao-aguardando-revisao', fluxo: 'Avaliações de Estágio', label: 'Avaliação aguardando revisão e assinatura', destinatario: 'Outra parte / Orientador', variaveis: ['nomeEstudante', 'idEstagio', 'link'] },
  { id: 'avaliacao-aguardando-aprovacao', fluxo: 'Avaliações de Estágio', label: 'Avaliação pronta para aprovação', destinatario: 'Setor', variaveis: ['nomeEstudante', 'idEstagio'] },
  { id: 'avaliacao-lembrete', fluxo: 'Avaliações de Estágio', label: 'Lembrete de pendência na avaliação', destinatario: 'Pendente (+ Setor, escalonado)', variaveis: ['nomeEstudante', 'idEstagio', 'diasRestantes'], lembrete: true },
  { id: 'avaliacao-concluida', fluxo: 'Avaliações de Estágio', label: 'Avaliação concluída', destinatario: 'Estudante/Revisores/Setor', variaveis: ['nomeEstudante', 'idEstagio'] },

  // ── Parecer Final de Estágio ──
  { id: 'parecer-aguardando-coordenador', fluxo: 'Parecer Final de Estágio', label: 'Parecer aguardando preenchimento do coordenador', destinatario: 'Coordenador', variaveis: ['nomeEstudante', 'idEstagio', 'link'] },
  { id: 'parecer-aguardando-diretoria', fluxo: 'Parecer Final de Estágio', label: 'Parecer aguardando a diretoria (DEN/DEX)', destinatario: 'DEN/DEX', variaveis: ['nomeEstudante', 'idEstagio', 'link'] },
  { id: 'parecer-pronto-aprovacao', fluxo: 'Parecer Final de Estágio', label: 'Parecer pronto para aprovação final', destinatario: 'Setor', variaveis: ['nomeEstudante', 'idEstagio'] },
  { id: 'parecer-devolvido', fluxo: 'Parecer Final de Estágio', label: 'Parecer devolvido (novo ciclo)', destinatario: 'Coordenador', variaveis: ['nomeEstudante', 'idEstagio', 'motivo'] },
  { id: 'parecer-concluido', fluxo: 'Parecer Final de Estágio', label: 'Parecer concluído', destinatario: 'Coordenador/Diretoria/Estudante/Setor', variaveis: ['nomeEstudante', 'idEstagio', 'resultado'] },

  // ── Convênios ──
  { id: 'convenio-acao-pendente', fluxo: 'Convênios', label: 'Ação pendente/correção no fluxo de convênio', destinatario: 'Ator do fluxo (gov.br/interno)', variaveis: ['nomeEmpresa', 'etapa', 'link'] },
  { id: 'convenio-aprovado', fluxo: 'Convênios', label: 'Convênio aprovado', destinatario: 'Setor/Empresa', variaveis: ['nomeEmpresa'] },

  // ── Oportunidades ──
  { id: 'oportunidade-convite-empresa', fluxo: 'Oportunidades', label: 'Convite (magic link) para empresa preencher vaga', destinatario: 'Empresa', variaveis: ['nomeEmpresa', 'link'] },

  // ── Declarações ──
  { id: 'declaracao-emitida', fluxo: 'Declarações', label: 'Declaração emitida (com PDF anexo)', destinatario: 'Servidor', variaveis: ['nomeServidor', 'tipoDeclaracao'] },
];

/** Retorna os eventos agrupados por fluxo, na ordem de FLUXOS_NOTIFICACAO_ORDEM. */
function agruparEventosPorFluxo() {
  return FLUXOS_NOTIFICACAO_ORDEM.map(function (fluxo) {
    return { fluxo: fluxo, eventos: EVENTOS_NOTIFICACAO.filter(function (e) { return e.fluxo === fluxo; }) };
  }).filter(function (g) { return g.eventos.length > 0; });
}

/** Renderiza a lista de eventos (tabela agrupada por fluxo) dentro de containerEl. */
function renderEventosNotificacao(containerEl, config) {
  config = config || {};
  var grupos = agruparEventosPorFluxo();

  var html = '<div class="table-wrapper"><table class="table"><thead><tr>' +
    '<th>Evento</th><th>Destinatário</th><th class="check-col">Ativo</th><th class="check-col">E-mail</th><th class="check-col">Sistema</th><th></th>' +
    '</tr></thead><tbody>';

  grupos.forEach(function (g) {
    html += '<tr class="table-group-row"><td colspan="6">' + escapeHtml(g.fluxo) + '</td></tr>';
    html += g.eventos.map(function (ev) {
      var c = config[ev.id] || {};
      var ativo = c.ativo !== false;
      var canalEmail = c.canalEmail === true;
      var canalSistema = c.canalSistema !== false;
      return '<tr>' +
        '<td>' + escapeHtml(ev.label) + (ev.lembrete ? ' <span class="badge badge-info" style="margin-left:4px;">lembrete</span>' : '') + '</td>' +
        '<td style="font-size:var(--font-size-xs);color:var(--color-text-muted);">' + escapeHtml(ev.destinatario) + '</td>' +
        '<td class="check-col"><div class="form-check"><input type="checkbox" class="evt-ativo" data-evento="' + ev.id + '"' + (ativo ? ' checked' : '') + '></div></td>' +
        '<td class="check-col"><div class="form-check"><input type="checkbox" class="evt-canal-email" data-evento="' + ev.id + '"' + (canalEmail ? ' checked' : '') + '></div></td>' +
        '<td class="check-col"><div class="form-check"><input type="checkbox" class="evt-canal-sistema" data-evento="' + ev.id + '"' + (canalSistema ? ' checked' : '') + '></div></td>' +
        '<td><button type="button" class="btn btn-secondary btn-sm" data-editar-evento="' + ev.id + '">Editar mensagem</button></td>' +
        '</tr>';
    }).join('');
  });

  html += '</tbody></table></div>';
  containerEl.innerHTML = html;
}

/** Corpo do modal de edição de um evento (assunto/corpo + variáveis + campos de lembrete, se aplicável). */
function renderEditorEvento(evento, dados) {
  dados = dados || {};
  var html = '<div class="alert alert-info" style="margin-bottom:var(--space-4);"><div class="alert-content">' +
    '<strong>Destinatário:</strong> ' + escapeHtml(evento.destinatario) + '</div></div>';

  if (evento.lembrete) {
    html += '<div class="form-row">' +
      '<div class="form-group"><label class="form-label" for="evt-dias-antes">Dias úteis antes do prazo</label><input type="number" id="evt-dias-antes" class="form-control" min="0" value="' + (dados.diasAntes != null ? dados.diasAntes : 1) + '"></div>' +
      '<div class="form-group"><label class="form-label" for="evt-freq-pos">Frequência após vencido (dias)</label><input type="number" id="evt-freq-pos" class="form-control" min="1" value="' + (dados.frequenciaPosVencido != null ? dados.frequenciaPosVencido : 3) + '"></div>' +
      '<div class="form-group"><label class="form-label" for="evt-max-reenvios">Máx. de reenvios</label><input type="number" id="evt-max-reenvios" class="form-control" min="0" value="' + (dados.maxReenvios != null ? dados.maxReenvios : 3) + '"></div>' +
      '<div class="form-group"><label class="form-label" for="evt-escalar">Escalar pro Setor após (reenvios)</label><input type="number" id="evt-escalar" class="form-control" min="0" value="' + (dados.escalarAdminApos != null ? dados.escalarAdminApos : 2) + '"></div>' +
      '</div>';
  }

  html += '<div class="form-group"><label class="form-label" for="evt-assunto">Assunto do e-mail</label>' +
    '<input type="text" id="evt-assunto" class="form-control" value="' + escapeHtml(dados.assunto || '') + '"></div>' +
    '<div class="form-group"><label class="form-label" for="evt-abertura">Parágrafo de abertura</label>' +
    '<textarea id="evt-abertura" class="form-control" rows="3">' + escapeHtml(dados.abertura || '') + '</textarea></div>' +
    '<div class="form-group"><label class="form-label" for="evt-fechamento">Parágrafo de fechamento</label>' +
    '<textarea id="evt-fechamento" class="form-control" rows="3">' + escapeHtml(dados.fechamento || '') + '</textarea></div>' +
    '<p class="form-hint">Variáveis disponíveis: ' + evento.variaveis.map(function (v) { return '<code>{{' + v + '}}</code>'; }).join(', ') + '</p>';

  return html;
}

/** Coleta os dados preenchidos no modal do editor de um evento. */
function coletarEditorEvento(evento, containerEl) {
  var dados = {
    assunto: containerEl.querySelector('#evt-assunto').value.trim(),
    abertura: containerEl.querySelector('#evt-abertura').value.trim(),
    fechamento: containerEl.querySelector('#evt-fechamento').value.trim(),
  };
  if (evento.lembrete) {
    dados.diasAntes = parseInt(containerEl.querySelector('#evt-dias-antes').value, 10) || 0;
    dados.frequenciaPosVencido = parseInt(containerEl.querySelector('#evt-freq-pos').value, 10) || 1;
    dados.maxReenvios = parseInt(containerEl.querySelector('#evt-max-reenvios').value, 10) || 0;
    dados.escalarAdminApos = parseInt(containerEl.querySelector('#evt-escalar').value, 10) || 0;
  }
  return dados;
}
