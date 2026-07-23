/* ============================================================
   SGE v2 — IFRS CAMPUS RIO GRANDE
   adendo-config.js — motor genérico de formulário dinâmico de Adendo
   ============================================================
   Cada tipo de adendo é só uma entrada de config (campos, ou subtipos,
   ou o widget especial de dias/horários) — o motor (render + coleta)
   é único e compartilhado. Baseado no ADENDO_CONFIG da v1, portado
   pra reaproveitar os componentes do v2 (.dias-widget, .radio-group).
   Usado por estudantes/acompanhamento-estagio.html.
   ============================================================ */

'use strict';

var ADENDO_TIPOS = [
  'Prorrogação de estágio',
  'Alteração de vigência (início e final)',
  'Alteração de modalidade (obrigatório → não obrigatório)',
  'Alteração de modalidade (não obrigatório → obrigatório)',
  'Alteração de orientador',
  'Alteração de supervisor',
  'Alteração de horário / carga horária',
  'Alteração do plano de atividades',
  'Alteração de apólice de seguro',
  'Alteração de local/setor',
  'Alteração de remuneração',
  'Rescisão de estágio',
];

var ADENDO_CONFIG = {
  'Prorrogação de estágio': {
    instrucao: 'Informe a nova data de término para extensão do período de estágio.',
    campos: [
      { id: 'novaDataTermino', label: 'Nova Data de Término', type: 'date', required: true },
    ],
  },
  'Alteração de vigência (início e final)': {
    instrucao: 'Informe a nova data de início e a nova data de término do estágio.',
    campos: [
      { id: 'novaDataInicio', label: 'Nova Data de Início', type: 'date', required: true },
      { id: 'novaDataTermino', label: 'Nova Data de Término', type: 'date', required: true },
    ],
  },
  'Alteração de modalidade (obrigatório → não obrigatório)': {
    instrucao: 'Solicita a alteração da modalidade de estágio obrigatório para não obrigatório.',
    campos: [
      { id: 'dataVigencia', label: 'Data de Vigência da Alteração', type: 'date', required: true },
    ],
  },
  'Alteração de modalidade (não obrigatório → obrigatório)': {
    instrucao: 'Solicita a alteração da modalidade de estágio não obrigatório para obrigatório.',
    campos: [
      { id: 'dataVigencia', label: 'Data de Vigência da Alteração', type: 'date', required: true },
      { id: 'incluiProrrogacao', label: 'Incluir prorrogação do período?', type: 'checkbox', toggleId: 'prorr-group' },
      { id: 'novaDataTermino', label: 'Nova Data de Término', type: 'date', required: false, groupId: 'prorr-group', groupHidden: true },
    ],
  },
  'Alteração de orientador': {
    instrucao: 'Selecione o novo orientador acadêmico do estágio.',
    campos: [
      { id: 'dataVigencia', label: 'Data de Vigência da Alteração', type: 'date', required: true },
      { id: 'nomeNovoOrientador', label: 'Novo Orientador', type: 'select-orientador', required: true },
    ],
  },
  'Alteração de supervisor': {
    instrucao: 'Informe os dados do novo supervisor na empresa concedente.',
    campos: [
      { id: 'dataVigencia', label: 'Data de Vigência da Alteração', type: 'date', required: true },
      { id: 'nomeNovoSupervisor', label: 'Nome do Novo Supervisor', type: 'text', required: true, placeholder: 'Nome completo' },
      { id: 'cargoSupervisor', label: 'Cargo do Novo Supervisor', type: 'text', required: false, placeholder: 'Ex: Analista de TI' },
    ],
  },
  'Alteração de horário / carga horária': {
    instrucao: 'Informe a nova grade de dias e horários do estágio. A carga horária semanal é calculada automaticamente.',
    tipo: 'horario-tabela',
    campos: [
      { id: 'dataVigencia', label: 'Data de Vigência da Alteração', type: 'date', required: true },
    ],
  },
  'Alteração do plano de atividades': {
    instrucao: 'Descreva o novo plano de atividades a ser executado no estágio.',
    campos: [
      { id: 'dataVigencia', label: 'Data de Vigência da Alteração', type: 'date', required: true },
      { id: 'novoPlano', label: 'Novo Plano de Atividades', type: 'textarea', required: true, placeholder: 'Descreva as novas atividades…', rows: 5 },
    ],
  },
  'Alteração de apólice de seguro': {
    instrucao: 'Informe os dados da nova apólice de seguro contra acidentes pessoais.',
    campos: [
      { id: 'numeroApolice', label: 'Número da Nova Apólice', type: 'text', required: true, placeholder: 'Número da apólice' },
      { id: 'nomeSeguradora', label: 'Nome da Seguradora', type: 'text', required: true, placeholder: 'Nome da seguradora' },
    ],
  },
  'Alteração de local/setor': {
    instrucao: 'Informe o novo local ou setor onde as atividades serão realizadas.',
    campos: [
      { id: 'dataVigencia', label: 'Data de Vigência da Alteração', type: 'date', required: true },
      { id: 'nomeNovoLocal', label: 'Nome do Novo Local/Setor', type: 'text', required: true, placeholder: 'Ex: Departamento de TI — Sede Centro' },
    ],
  },
  'Alteração de remuneração': {
    instrucao: 'Selecione o tipo de alteração de remuneração desejado.',
    subtipos: {
      opcoes: [
        { value: 'nao-rem-para-rem', label: 'Não remunerado → Remunerado' },
        { value: 'rem-para-nao-rem', label: 'Remunerado → Não remunerado' },
        { value: 'alterar-valor', label: 'Alterar valor da bolsa' },
      ],
      camposPorSubtipo: {
        'nao-rem-para-rem': [
          { id: 'dataVigencia', label: 'Data de Vigência', type: 'date', required: true },
          { id: 'novoValor', label: 'Novo Valor Mensal (R$)', type: 'text', required: true, placeholder: 'Ex: 800,00' },
        ],
        'rem-para-nao-rem': [
          { id: 'dataVigencia', label: 'Data de Vigência', type: 'date', required: true },
        ],
        'alterar-valor': [
          { id: 'periodoInicio', label: 'Início do Período', type: 'date', required: true },
          { id: 'periodoFim', label: 'Fim do Período', type: 'date', required: true },
          { id: 'valorAtual', label: 'Valor Atual (R$)', type: 'text', required: true, placeholder: 'Ex: 600,00' },
          { id: 'novoValor', label: 'Novo Valor (R$)', type: 'text', required: true, placeholder: 'Ex: 800,00' },
        ],
      },
    },
  },
  'Rescisão de estágio': {
    instrucao: 'Selecione quem está solicitando a rescisão do Termo de Compromisso de Estágio.',
    subtipos: {
      opcoes: [
        { value: 'pela-empresa', label: 'Pela concedente' },
        { value: 'pelo-ifrs', label: 'Pelo IFRS' },
      ],
      camposPorSubtipo: {
        'pela-empresa': [
          { id: 'justificativa', label: 'Justificativa da concedente', type: 'textarea', required: true, rows: 4 },
        ],
        'pelo-ifrs': [
          { id: 'justificativa', label: 'Justificativa', type: 'textarea', required: true, rows: 4 },
        ],
      },
    },
  },
};

/** Renderiza os campos dinâmicos do tipo escolhido dentro de containerEl. */
function renderCamposAdendo(tipo, containerEl) {
  var cfg = ADENDO_CONFIG[tipo];
  if (!cfg) { containerEl.innerHTML = ''; return; }

  var html = '<p class="form-hint" style="margin-bottom:var(--space-4);">' + escapeHtml(cfg.instrucao || '') + '</p>';

  if (cfg.tipo === 'horario-tabela') {
    html += cfg.campos.map(renderCampoAdendo).join('') + renderWidgetHorarioAdendo();
    containerEl.innerHTML = html;
    inicializarWidgetHorarioAdendo(containerEl);
    return;
  }

  if (cfg.subtipos) {
    html += '<div class="form-group"><div class="radio-group">' +
      cfg.subtipos.opcoes.map(function (o, i) {
        return '<label class="radio-option"><input type="radio" name="adendo-subtipo" value="' + o.value + '"' + (i === 0 ? ' checked' : '') + '> ' + escapeHtml(o.label) + '</label>';
      }).join('') + '</div></div>' +
      '<div id="adendo-subtipo-campos"></div>';
    containerEl.innerHTML = html;

    var renderSubtipo = function () {
      var valor = containerEl.querySelector('input[name="adendo-subtipo"]:checked').value;
      var campos = cfg.subtipos.camposPorSubtipo[valor] || [];
      containerEl.querySelector('#adendo-subtipo-campos').innerHTML = campos.map(renderCampoAdendo).join('');
    };
    containerEl.querySelectorAll('input[name="adendo-subtipo"]').forEach(function (r) {
      r.addEventListener('change', renderSubtipo);
    });
    renderSubtipo();
    return;
  }

  html += cfg.campos.map(renderCampoAdendo).join('');
  containerEl.innerHTML = html;

  (cfg.campos || []).forEach(function (c) {
    if (c.type === 'checkbox' && c.toggleId) {
      var chk = containerEl.querySelector('#adendo-campo-' + c.id);
      chk.addEventListener('change', function () {
        containerEl.querySelectorAll('[data-group-id="' + c.toggleId + '"]').forEach(function (el) {
          el.closest('.form-group').style.display = chk.checked ? '' : 'none';
        });
      });
    }
    if (c.type === 'select-orientador') carregarOrientadoresAdendo(containerEl, c.id);
  });
}

function renderCampoAdendo(c) {
  var id = 'adendo-campo-' + c.id;
  var req = c.required ? ' required' : '';
  var reqLabel = c.required ? ' required' : '';
  var wrapAttrs = (c.groupId ? ' data-group-id="' + c.groupId + '"' : '');
  var hiddenStyle = c.groupHidden ? ' style="display:none;"' : '';

  var campoHtml = '';
  if (c.type === 'text') {
    campoHtml = '<input type="text" id="' + id + '" class="form-control" placeholder="' + escapeHtml(c.placeholder || '') + '"' + req + '>';
  } else if (c.type === 'date') {
    campoHtml = '<input type="date" id="' + id + '" class="form-control"' + req + '>';
  } else if (c.type === 'textarea') {
    campoHtml = '<textarea id="' + id + '" class="form-control" rows="' + (c.rows || 3) + '" placeholder="' + escapeHtml(c.placeholder || '') + '"' + req + '></textarea>';
  } else if (c.type === 'checkbox') {
    return '<div class="form-check" style="margin-bottom:var(--space-3);"' + wrapAttrs + '><input type="checkbox" id="' + id + '"><label class="form-check-label" for="' + id + '">' + escapeHtml(c.label) + '</label></div>';
  } else if (c.type === 'select-orientador') {
    campoHtml = '<select id="' + id + '" class="form-control" disabled><option value="">Carregando…</option></select>';
  }

  return '<div class="form-group"' + wrapAttrs + hiddenStyle + '>' +
    '<label class="form-label' + reqLabel + '" for="' + id + '">' + escapeHtml(c.label) + '</label>' +
    campoHtml + '</div>';
}

async function carregarOrientadoresAdendo(containerEl, campoId) {
  var sel = containerEl.querySelector('#adendo-campo-' + campoId);
  try {
    var lista = await API.get('listarOrientadores');
    sel.innerHTML = '<option value="">Selecione...</option>' +
      (lista || []).map(function (o) { return '<option value="' + escapeHtml(o.nome) + '">' + escapeHtml(o.nome) + '</option>'; }).join('');
    sel.disabled = false;
  } catch (e) {
    sel.innerHTML = '<option value="">Erro ao carregar orientadores</option>';
  }
}

/** Coleta os valores preenchidos, genericamente, pro tipo escolhido. */
function coletarCamposAdendo(tipo, containerEl) {
  var cfg = ADENDO_CONFIG[tipo];
  if (!cfg) return {};

  if (cfg.tipo === 'horario-tabela') {
    var dados = {};
    cfg.campos.forEach(function (c) { dados[c.id] = lerValorCampoAdendo(containerEl, c); });
    dados.diasHorarios = coletarHorarioAdendo(containerEl);
    return dados;
  }

  if (cfg.subtipos) {
    var valor = containerEl.querySelector('input[name="adendo-subtipo"]:checked').value;
    var dadosSub = { subtipo: valor };
    (cfg.subtipos.camposPorSubtipo[valor] || []).forEach(function (c) { dadosSub[c.id] = lerValorCampoAdendo(containerEl, c); });
    return dadosSub;
  }

  var out = {};
  cfg.campos.forEach(function (c) { out[c.id] = lerValorCampoAdendo(containerEl, c); });
  return out;
}

function lerValorCampoAdendo(containerEl, c) {
  var el = containerEl.querySelector('#adendo-campo-' + c.id);
  if (!el) return null;
  if (c.type === 'checkbox') return el.checked;
  return el.value.trim();
}

function validarCamposAdendo(tipo, containerEl) {
  var cfg = ADENDO_CONFIG[tipo];
  if (!cfg) return 'Selecione um tipo de adendo.';

  var campos = cfg.tipo === 'horario-tabela' ? cfg.campos
    : cfg.subtipos ? (cfg.subtipos.camposPorSubtipo[containerEl.querySelector('input[name="adendo-subtipo"]:checked').value] || [])
    : cfg.campos;

  for (var i = 0; i < campos.length; i++) {
    var c = campos[i];
    if (!c.required) continue;
    if (c.groupId) {
      var toggle = containerEl.querySelector('#adendo-campo-' + c.toggleId);
      if (toggle && !toggle.checked) continue;
    }
    var v = lerValorCampoAdendo(containerEl, c);
    if (!v) return 'Preencha o campo "' + c.label + '".';
  }
  if (cfg.tipo === 'horario-tabela' && !coletarHorarioAdendo(containerEl).length) {
    return 'Adicione ao menos um dia de estágio com horários válidos.';
  }
  return null;
}

/* ── Widget simplificado de dias/horários (Alteração de horário/carga) ── */
var _adendoDiasLista = [];
var _ADENDO_DIAS_OPCOES = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

function renderWidgetHorarioAdendo() {
  return '<div class="form-group"><label class="form-label required">Dias e horários</label>' +
    '<div id="adendo-dias-horarios" class="dias-widget">' +
      '<div class="dias-widget-head" aria-hidden="true"><span>Dia da semana</span><span>Entrada</span><span>Saída</span><span style="text-align:center;">Diária</span><span></span></div>' +
      '<div id="adendo-dias-rows"></div>' +
      '<div id="adendo-dias-vazio" class="dias-empty">Nenhum dia adicionado ainda.</div>' +
      '<div class="dias-widget-footer">' +
        '<button type="button" id="adendo-dias-add-btn" class="btn btn-ghost btn-sm">+ Adicionar dia</button>' +
        '<span id="adendo-dias-total" class="dias-total">Total semanal: —</span>' +
      '</div>' +
    '</div></div>';
}

function inicializarWidgetHorarioAdendo(containerEl) {
  _adendoDiasLista = [];
  containerEl.querySelector('#adendo-dias-add-btn').addEventListener('click', function () {
    _adendoDiasLista.push({ dia: 'Segunda-feira', entrada: '08:00', saida: '12:00' });
    _renderAdendoDias(containerEl);
  });
  _renderAdendoDias(containerEl);
}

function _renderAdendoDias(containerEl) {
  var rows = containerEl.querySelector('#adendo-dias-rows');
  var vazio = containerEl.querySelector('#adendo-dias-vazio');
  var totalEl = containerEl.querySelector('#adendo-dias-total');

  if (_adendoDiasLista.length === 0) {
    rows.innerHTML = '';
    vazio.style.display = 'block';
    totalEl.textContent = 'Total semanal: —';
    return;
  }
  vazio.style.display = 'none';

  var totalMin = 0;
  rows.innerHTML = _adendoDiasLista.map(function (d, idx) {
    var mins = _adendoCalcMins(d.entrada, d.saida);
    totalMin += Math.max(mins, 0);
    return '<div class="dias-row">' +
      '<select class="form-control dias-sel-dia" data-idx="' + idx + '">' +
        _ADENDO_DIAS_OPCOES.map(function (o) { return '<option value="' + o + '"' + (o === d.dia ? ' selected' : '') + '>' + o + '</option>'; }).join('') +
      '</select>' +
      '<input type="time" class="form-control" data-idx="' + idx + '" data-campo="entrada" value="' + d.entrada + '">' +
      '<input type="time" class="form-control" data-idx="' + idx + '" data-campo="saida" value="' + d.saida + '">' +
      '<span class="dias-diaria">' + (mins > 0 ? (Math.floor(mins / 60) + 'h' + (mins % 60 ? mins % 60 + 'min' : '')) : '—') + '</span>' +
      '<button type="button" class="dias-remove-btn" data-idx="' + idx + '" aria-label="Remover">×</button>' +
      '</div>';
  }).join('');

  totalEl.textContent = 'Total semanal: ' + Math.floor(totalMin / 60) + 'h' + (totalMin % 60 ? totalMin % 60 + 'min' : '');

  rows.querySelectorAll('.dias-sel-dia').forEach(function (sel) {
    sel.addEventListener('change', function () { _adendoDiasLista[+this.dataset.idx].dia = this.value; _renderAdendoDias(containerEl); });
  });
  rows.querySelectorAll('input[type="time"]').forEach(function (inp) {
    inp.addEventListener('change', function () { _adendoDiasLista[+this.dataset.idx][this.dataset.campo] = this.value; _renderAdendoDias(containerEl); });
  });
  rows.querySelectorAll('.dias-remove-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { _adendoDiasLista.splice(+this.dataset.idx, 1); _renderAdendoDias(containerEl); });
  });
}

function _adendoCalcMins(entrada, saida) {
  if (!entrada || !saida) return 0;
  var pE = entrada.split(':').map(Number), pS = saida.split(':').map(Number);
  return (pS[0] * 60 + pS[1]) - (pE[0] * 60 + pE[1]);
}

function coletarHorarioAdendo() {
  return _adendoDiasLista.filter(function (d) { return _adendoCalcMins(d.entrada, d.saida) > 0; });
}
