/**
 * papeis.gs — papéis institucionais e roteamento pós-login do servidor
 * IFRS Campus Rio Grande — SGE v2
 *
 * A área que um servidor acessa (Central de Estágios, Admin, DEX, DEN,
 * Diretor Geral, Registro Acadêmico, NAPNE) não é fixa no código — depende
 * de quem ocupa o cargo, e isso muda ao longo do tempo. Por isso os papéis
 * ficam só na aba ConfigAcesso (CONFIG.ABAS.INSTITUCIONAL_CONFIG.CONFIG_ACESSO),
 * nunca hardcoded — igual ao problema que a v1 tinha com ADMIN_EMAILS fixo
 * no auth.js do front-end.
 *
 * Responsabilidade única deste arquivo: ler ConfigAcesso e decidir papel/rota.
 * Validação de token é sempre feita antes, em auth.gs.
 */

'use strict';

// Ordem de prioridade pra decidir o redirecionamento: o primeiro papel que
// o e-mail tiver, nessa ordem, define a página de destino. Central de
// Estágios vem antes de Admin de propósito — quem tem os dois vai pra
// Central de Estágios (e de lá enxerga também as opções de Admin).
var PAPEL_REDIRECIONAMENTO = [
  { papel: CONFIG.PAPEIS.CENTRAL_ESTAGIOS,   caminho: 'central-estagios/index.html' },
  { papel: CONFIG.PAPEIS.ADMIN,              caminho: 'admin/index.html' },
  { papel: CONFIG.PAPEIS.DEX,                caminho: 'dex/index.html' },
  { papel: CONFIG.PAPEIS.DEN,                caminho: 'den/index.html' },
  { papel: CONFIG.PAPEIS.DIRETOR_GERAL,      caminho: 'diretor/index.html' },
  { papel: CONFIG.PAPEIS.REGISTRO_ACADEMICO, caminho: 'registro/index.html' },
  { papel: CONFIG.PAPEIS.NAPNE,              caminho: 'napne/index.html' },
];

/**
 * Lê a aba ConfigAcesso e retorna todos os papéis (strings) associados
 * a um e-mail. Colunas esperadas: E-mail | Papel | Observação.
 *
 * @param {string} email
 * @returns {string[]}
 */
function obterPapeisPorEmail(email) {
  if (!email) return [];
  var emailLower = String(email).trim().toLowerCase();

  var aba = abrirAba('INSTITUCIONAL_CONFIG', CONFIG.ABAS.INSTITUCIONAL_CONFIG.CONFIG_ACESSO);
  var linhas = aba.getDataRange().getValues();

  var papeis = [];
  for (var i = 1; i < linhas.length; i++) { // linha 0 = cabeçalho
    var linhaEmail = String(linhas[i][0] || '').trim().toLowerCase();
    var linhaPapel = String(linhas[i][1] || '').trim();
    if (linhaEmail === emailLower && linhaPapel) papeis.push(linhaPapel);
  }
  return papeis;
}

/**
 * Decide pra qual página um servidor deve ir após o login, com base nos
 * papéis configurados em ConfigAcesso. Sem nenhum papel, retorna null
 * (front-end segue como servidor comum).
 *
 * @param {string} email
 * @returns {string|null} caminho relativo à raiz do site, ou null
 */
function obterCaminhoRedirecionamentoServidor(email) {
  var papeis = obterPapeisPorEmail(email);
  if (!papeis.length) return null;

  for (var i = 0; i < PAPEL_REDIRECIONAMENTO.length; i++) {
    var item = PAPEL_REDIRECIONAMENTO[i];
    if (papeis.indexOf(item.papel) !== -1) return item.caminho;
  }
  return null;
}
