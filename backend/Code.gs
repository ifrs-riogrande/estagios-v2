/**
 * Code.gs — Roteador principal do backend do SGE v2
 * IFRS Campus Rio Grande
 *
 * Um único deployment (Web App) atende todas as chamadas do front-end.
 * O parâmetro ?action= (GET) ou body.action (POST) determina o handler.
 *
 * Para adicionar uma ação nova: mapeie no GET_ROUTES/POST_ROUTES abaixo e
 * implemente o handler no módulo do domínio correspondente (api-xxx.gs).
 * Todo handler que usa dado sensível PRECISA validar o authToken via
 * validarAuthToken()/validarAreaAcesso() (auth.gs) antes de processar.
 */

'use strict';

var GET_ROUTES = {
  'ping': doGetPing,
  'verificarSessao': doGetVerificarSessao,
  'verificarAreaServidor': doGetVerificarAreaServidor,
};

var POST_ROUTES = {
};

function doGet(e) {
  var action = e.parameter.action;
  var handler = GET_ROUTES[action];
  if (!handler) return respostaErro('Ação GET não reconhecida: ' + action, 404);
  try {
    return handler(e);
  } catch (err) {
    return respostaErro('Erro interno: ' + err.message, 500);
  }
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents || '{}');
  } catch (err) {
    return respostaErro('Corpo da requisição inválido.', 400);
  }
  var handler = POST_ROUTES[body.action];
  if (!handler) return respostaErro('Ação POST não reconhecida: ' + body.action, 404);
  try {
    return handler(body);
  } catch (err) {
    return respostaErro('Erro interno: ' + err.message, 500);
  }
}

/** Health-check público — sem autenticação, só confirma que o Web App está no ar. */
function doGetPing() {
  return respostaOk({ mensagem: 'Backend SGE v2 no ar.', hora: new Date().toISOString() });
}

/**
 * Endpoint de referência: valida o authToken no servidor e devolve o e-mail
 * confirmado. Serve de modelo para todo handler que precisar de sessão.
 */
function doGetVerificarSessao(e) {
  var v = validarAuthToken(e.parameter.authToken);
  if (!v.valido) return respostaErro(v.erro, 401);
  return respostaOk({ email: v.email });
}

/**
 * Verifica se o servidor logado tem um papel institucional configurado
 * (Central de Estágios, Admin, DEX, DEN, Diretor Geral, Registro Acadêmico,
 * NAPNE) e devolve pra onde o front-end deve redirecionar. `caminho: null`
 * significa servidor comum (orientador/coordenador) — segue o fluxo normal.
 */
function doGetVerificarAreaServidor(e) {
  var v = validarAreaAcesso(e.parameter.authToken, 'servidor');
  if (!v.valido) return respostaErro(v.erro, 401);
  var caminho = obterCaminhoRedirecionamentoServidor(v.email);
  return respostaOk({ email: v.email, caminho: caminho });
}

// ─────────────────────────────────────────
//  RESPOSTAS PADRÃO
//  Formato fixo: { ok: boolean, data?: any, error?: string }
// ─────────────────────────────────────────

function respostaOk(data) {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function respostaErro(mensagem, codigo) {
  return ContentService.createTextOutput(JSON.stringify({ ok: false, error: mensagem, code: codigo || 400 }))
    .setMimeType(ContentService.MimeType.JSON);
}
