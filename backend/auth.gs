/**
 * auth.gs — validação server-side do token OAuth do Google
 * IFRS Campus Rio Grande — SGE v2
 *
 * Regra inegociável: o front-end pode DIZER qual é o e-mail/área do usuário,
 * mas nenhum endpoint deve confiar nisso sem revalidar aqui. O authToken
 * enviado pelo front-end (assets/js/auth.js) é conferido contra o endpoint
 * tokeninfo do Google a cada chamada restrita — nunca aceito de graça.
 */

'use strict';

// Mesmo Client ID usado no front-end (assets/js/auth.js) — o token só é
// válido se tiver sido emitido para este Client ID.
var OAUTH_CLIENT_ID = '913495304278-opds2dsajahcl5khbs1qsqae1dmg4ggg.apps.googleusercontent.com';

/**
 * Valida um authToken contra o endpoint tokeninfo do Google.
 * Confirma: token pertence a este Client ID, não expirou, e-mail verificado.
 *
 * @param {string} token
 * @returns {{valido: boolean, email?: string, erro?: string}}
 */
function validarAuthToken(token) {
  if (!token) return { valido: false, erro: 'Token ausente.' };

  var resp;
  try {
    resp = UrlFetchApp.fetch(
      'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + encodeURIComponent(token),
      { muteHttpExceptions: true }
    );
  } catch (e) {
    return { valido: false, erro: 'Falha ao contatar o Google: ' + e.message };
  }

  if (resp.getResponseCode() !== 200) {
    return { valido: false, erro: 'Token inválido ou expirado.' };
  }

  var info;
  try {
    info = JSON.parse(resp.getContentText());
  } catch (e) {
    return { valido: false, erro: 'Resposta inválida do Google.' };
  }

  if (info.aud !== OAUTH_CLIENT_ID) {
    return { valido: false, erro: 'Token não pertence a este aplicativo.' };
  }
  if (!(info.email_verified === 'true' || info.email_verified === true)) {
    return { valido: false, erro: 'E-mail do Google não verificado.' };
  }
  if (!info.email) {
    return { valido: false, erro: 'Token sem e-mail associado.' };
  }

  return { valido: true, email: String(info.email).toLowerCase() };
}

/**
 * Valida o token E confirma que o e-mail pertence ao domínio da área
 * esperada. Uso obrigatório em todo endpoint restrito a estudante/servidor.
 *
 * @param {string} token
 * @param {'estudante'|'servidor'} areaEsperada
 * @returns {{valido: boolean, email?: string, erro?: string}}
 */
function validarAreaAcesso(token, areaEsperada) {
  var v = validarAuthToken(token);
  if (!v.valido) return v;

  var dominio = areaEsperada === 'estudante' ? CONFIG.DOMINIOS.ESTUDANTE : CONFIG.DOMINIOS.SERVIDOR;
  if (!v.email.endsWith(dominio)) {
    return { valido: false, erro: 'E-mail não pertence ao domínio esperado (' + dominio + ').' };
  }
  return v;
}
