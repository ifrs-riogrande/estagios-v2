/**
 * setup-planilha.gs — cria as abas de cada planilha do SGE v2
 * IFRS Campus Rio Grande
 *
 * As 4 planilhas (CONFIG.PLANILHAS) já existem em branco no Drive.
 * Rode criarEstruturaPlanilhas() uma única vez pelo editor do Apps Script
 * (selecione a função no dropdown e clique em Executar) para criar todas
 * as abas definidas em CONFIG.ABAS. Idempotente — não duplica abas existentes.
 */

'use strict';

function criarEstruturaPlanilhas() {
  _criarAbas('OPERACIONAL', CONFIG.ABAS.OPERACIONAL);
  _criarAbas('CADASTROS', CONFIG.ABAS.CADASTROS);
  _criarAbas('INSTITUCIONAL_CONFIG', CONFIG.ABAS.INSTITUCIONAL_CONFIG);
  _criarAbas('NOTIFICACOES_LOG', CONFIG.ABAS.NOTIFICACOES_LOG);
  _semearConfigAcesso();
}

/**
 * Cabeçalho da aba ConfigAcesso (papéis institucionais — ver papeis.gs).
 * Cada linha: um e-mail associado a um papel de CONFIG.PAPEIS. Um mesmo
 * e-mail pode ter mais de uma linha (Central de Estágios + Admin, por
 * exemplo). Idempotente — só escreve se a aba estiver vazia.
 */
function _semearConfigAcesso() {
  var aba = abrirAba('INSTITUCIONAL_CONFIG', CONFIG.ABAS.INSTITUCIONAL_CONFIG.CONFIG_ACESSO);
  if (aba.getLastRow() === 0) {
    aba.appendRow(['E-mail', 'Papel', 'Observação']);
    aba.setFrozenRows(1);
    Logger.log('Cabeçalho criado na aba ConfigAcesso.');
  }
}

function _criarAbas(planilhaNome, abasMap) {
  var ss = abrirPlanilha(planilhaNome);

  Object.keys(abasMap).forEach(function (chave) {
    var nomeAba = abasMap[chave];
    if (!ss.getSheetByName(nomeAba)) {
      ss.insertSheet(nomeAba);
      Logger.log('Criada aba "%s" em %s', nomeAba, planilhaNome);
    }
  });

  // Remove a aba padrão ("Sheet1"/"Página1") que vem em toda planilha nova,
  // já que as abas reais acima já foram criadas.
  var padrao = ss.getSheetByName('Sheet1') || ss.getSheetByName('Página1');
  if (padrao && ss.getSheets().length > 1) {
    ss.deleteSheet(padrao);
  }
}
