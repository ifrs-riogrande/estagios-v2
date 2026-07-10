/**
 * Config.gs — Configuração central do backend do SGE v2
 * IFRS Campus Rio Grande
 *
 * Única fonte de verdade para IDs de planilha, pasta do Drive, nomes de aba
 * e domínios de e-mail. Nenhum outro arquivo .gs deve redeclarar essas
 * constantes — era o principal problema de arquitetura da v1 (CFG_ADMIN e
 * CFG_SOL duplicados em 13 arquivos diferentes).
 */

'use strict';

var CONFIG = {
  DRIVE: {
    PASTA_RAIZ_ID: '12W5skiz_38kLMRpknCI5sQZCXJjJ6hVn',
  },

  PLANILHAS: {
    OPERACIONAL: '1z23ZcdaShbpMXEfhpI2g9TgJsinUEnmu8fjPD6EDGFY',
    CADASTROS: '1GPR1B88XcHL8YwJGc5fnHWs008GWn2F0gOlhdV9P8rc',
    INSTITUCIONAL_CONFIG: '1dGesVHsi4EnfheuO2wd8Ysiv608DHfUJ7FzSDQ0MOYc',
    NOTIFICACOES_LOG: '1dfdRaUq-0j7jiPgzgY38ZR4neqgXhcSgW7iWVn8iGYU',
  },

  ABAS: {
    OPERACIONAL: {
      SOLICITACOES: 'Solicitações',
      ADENDOS: 'Adendos',
      CHECKLIST: 'Checklist',
      AVALIACOES: 'Avaliações',
      DECLARACOES: 'Declarações',
      PARECER: 'Parecer',
      APROVEITAMENTO: 'Aproveitamento',
      ASSINATURAS: 'Assinaturas',
    },
    CADASTROS: {
      ESTUDANTES: 'Estudantes',
      EMPRESAS: 'Empresas',
      SUPERVISORES: 'Supervisores',
      ORIENTADORES: 'Orientadores',
      COORDENADORES: 'Coordenadores',
      AGENTES: 'Agentes',
    },
    INSTITUCIONAL_CONFIG: {
      CONVENIOS: 'Convênios',
      OPORTUNIDADES: 'Oportunidades',
      NAPNE: 'NAPNE',
      CURSOS_HABILITADOS: 'CursosHabilitados',
      CONFIG_ACESSO: 'ConfigAcesso',
    },
    NOTIFICACOES_LOG: {
      NOTIFICACOES: 'Notificações',
      LOG: 'Log',
    },
  },

  DOMINIOS: {
    ESTUDANTE: '@aluno.riogrande.ifrs.edu.br',
    SERVIDOR: '@riogrande.ifrs.edu.br',
  },

  // Papéis institucionais configurados na aba ConfigAcesso (Institucional/Config).
  // Todo servidor com um desses papéis é redirecionado pra área correspondente
  // após o login — ver papeis.gs. Quem não tem nenhum papel segue como
  // servidor comum (orientador/coordenador).
  PAPEIS: {
    CENTRAL_ESTAGIOS: 'Central de Estágios',
    ADMIN: 'Admin',
    DEX: 'DEX',
    DEN: 'DEN',
    DIRETOR_GERAL: 'Diretor Geral',
    REGISTRO_ACADEMICO: 'Registro Acadêmico',
    NAPNE: 'NAPNE',
  },
};

/**
 * Abre uma planilha pelo apelido em CONFIG.PLANILHAS (ex: 'OPERACIONAL').
 * Centraliza a abertura para não espalhar SpreadsheetApp.openById pelo código.
 */
function abrirPlanilha(nome) {
  var id = CONFIG.PLANILHAS[nome];
  if (!id) throw new Error('Planilha desconhecida em CONFIG.PLANILHAS: ' + nome);
  return SpreadsheetApp.openById(id);
}

/**
 * Retorna uma aba específica, lançando erro claro se ela não existir.
 */
function abrirAba(planilhaNome, abaNome) {
  var ss = abrirPlanilha(planilhaNome);
  var aba = ss.getSheetByName(abaNome);
  if (!aba) throw new Error('Aba "' + abaNome + '" não encontrada em ' + planilhaNome + '. Rode criarEstruturaPlanilhas() em setup-planilha.gs.');
  return aba;
}
