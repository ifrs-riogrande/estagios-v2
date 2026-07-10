/* ============================================================
   SGE v2 — IFRS CAMPUS RIO GRANDE
   cursos-regras.js — regras derivadas do grupo/modalidade do curso
   ============================================================
   Centraliza o que na v1 estava duplicado entre páginas (ex.: a
   lista de opções de semestre era copiada em mais de um arquivo,
   e o "tipo" do curso era adivinhado por prefixo do nome). Aqui
   a chave é o campo `grupo` do curso (mesmo grupo cadastrado em
   admin/cursos.html), não o nome — mais confiável que prefixo de texto.
   ============================================================ */

'use strict';

const OPCOES_SEMESTRE_POR_GRUPO = {
  'Técnico Integrado':   ['1º Ano', '2º Ano', '3º Ano', '4º Ano'],
  'Técnico Subsequente': ['1º Semestre', '2º Semestre', '3º Semestre', '4º Semestre'],
  'Tecnologia':          ['1º Semestre', '2º Semestre', '3º Semestre', '4º Semestre', '5º Semestre', '6º Semestre'],
};

// Grupos sem entrada acima (Bacharelado, Licenciatura, Especialização) usam este padrão —
// mesmo fallback genérico que a v1 já aplicava a cursos não reconhecidos.
const OPCOES_SEMESTRE_PADRAO = [
  '1º Semestre', '2º Semestre', '3º Semestre', '4º Semestre', '5º Semestre',
  '6º Semestre', '7º Semestre', '8º Semestre', '9º Semestre', '10º Semestre',
];

const SEMESTRES_BLOQUEIO_OBRIGATORIO_POR_GRUPO = {
  'Técnico Integrado':   ['1º Ano', '2º Ano'],
  'Técnico Subsequente': ['1º Semestre', '2º Semestre'],
  'Tecnologia':          ['1º Semestre', '2º Semestre', '3º Semestre'],
};

const SEMESTRES_BLOQUEIO_OBRIGATORIO_PADRAO = ['1º Semestre', '2º Semestre', '3º Semestre', '4º Semestre', '5º Semestre'];

/**
 * Opções de período/semestre para o select, conforme o grupo do curso.
 */
function opcoesSemestrePorGrupo(grupo) {
  return OPCOES_SEMESTRE_POR_GRUPO[grupo] || OPCOES_SEMESTRE_PADRAO;
}

/**
 * true se, no semestre informado, o Estágio Obrigatório ainda não é permitido
 * (períodos iniciais do curso).
 */
function semestreBloqueiaObrigatorio(grupo, semestre) {
  const lista = SEMESTRES_BLOQUEIO_OBRIGATORIO_POR_GRUPO[grupo] || SEMESTRES_BLOQUEIO_OBRIGATORIO_PADRAO;
  return lista.includes(semestre);
}
