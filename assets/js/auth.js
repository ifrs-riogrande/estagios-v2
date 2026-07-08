/* ============================================================
   SGE v2 — IFRS CAMPUS RIO GRANDE
   auth.js — autenticação Google OAuth (Google Identity Services)
   ============================================================
   Mesma abordagem da v1: fluxo OAuth 2.0 implícito via GIS,
   token usado só para identificar o e-mail e é validado
   novamente no backend (GAS) antes de qualquer dado sensível.

   Diferença para a v1: aqui existe UMA ÚNICA página de login
   para todo o sistema (esta), não um gate por área. Depois do
   login, o backend/perfil decide para onde o usuário vai —
   essa parte ainda será definida.

   Token nunca vai para localStorage — só sessionStorage.
   ============================================================ */

'use strict';

const AUTH_CONFIG = {
  // Mesmo Client ID da v1 — mesma origin (https://ifrs-riogrande.github.io),
  // então o OAuth client já autorizado na v1 cobre a v2 também.
  CLIENT_ID: '913495304278-opds2dsajahcl5khbs1qsqae1dmg4ggg.apps.googleusercontent.com',
  SCOPES: 'openid email profile',

  // Domínios que definem a área de destino após o login único.
  STUDENT_DOMAIN: '@aluno.riogrande.ifrs.edu.br',
  STAFF_DOMAIN: '@riogrande.ifrs.edu.br',
};

const SESSION_KEY = 'sge_session';

// ─────────────────────────────────────────
//  ROTEAMENTO POR DOMÍNIO DE E-MAIL
//  Login único (index.html na raiz) decide a área pelo domínio.
//  '@riogrande.ifrs.edu.br' não colide com o domínio de estudante
//  porque exige o '@' logo antes de "riogrande" (endsWith).
// ─────────────────────────────────────────

/**
 * Retorna 'estudante', 'servidor' ou null (domínio não reconhecido).
 */
function getUserArea(email) {
  if (!email) return null;
  const lower = email.toLowerCase();
  if (lower.endsWith(AUTH_CONFIG.STUDENT_DOMAIN)) return 'estudante';
  if (lower.endsWith(AUTH_CONFIG.STAFF_DOMAIN)) return 'servidor';
  return null;
}

/**
 * Caminho (relativo à raiz do site) da página inicial de cada área.
 */
function getAreaPath(area) {
  if (area === 'estudante') return 'estudantes/index.html';
  if (area === 'servidor') return 'servidores/index.html';
  return null;
}

/**
 * Guarda de acesso para páginas dentro de estudantes/ ou servidores/.
 * Sem sessão válida ou domínio incompatível → volta para o login central.
 * Uso (no topo da página, dentro de uma subpasta): requireAreaAuth('estudante', '../index.html')
 *
 * @param {'estudante'|'servidor'} expectedArea
 * @param {string} loginPath - caminho relativo até a index.html raiz (ex: '../index.html')
 * @returns {Object|null} sessão válida, ou null (já redirecionou)
 */
function requireAreaAuth(expectedArea, loginPath) {
  const session = getSession();
  const area = session ? getUserArea(session.email) : null;
  if (!session || area !== expectedArea) {
    window.location.href = loginPath;
    return null;
  }
  updateHeaderUser(session, loginPath);
  return session;
}

// ─────────────────────────────────────────
//  ESTADO DA SESSÃO
// ─────────────────────────────────────────

function saveSession(data) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Não foi possível salvar sessão:', e.message);
  }
}

function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session.expires_at && Date.now() > session.expires_at) {
      clearSession();
      return null;
    }
    return session;
  } catch (e) {
    return null;
  }
}

function clearSession() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
}

function isLoggedIn() {
  return getSession() !== null;
}

/**
 * Retorna o token de acesso atual ou null — usado por api.js em toda chamada.
 */
function getAccessToken() {
  const session = getSession();
  return session ? session.token : null;
}

// ─────────────────────────────────────────
//  FLUXO DE LOGIN
// ─────────────────────────────────────────

/**
 * Inicializa o Google Identity Services e solicita login.
 * @param {Function} onSuccess - cb(session: {email, name, picture, token})
 * @param {Function} onError   - cb(message: string)
 */
function requestLogin(onSuccess, onError) {
  if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
    onError('A biblioteca de autenticação do Google não foi carregada. Verifique sua conexão.');
    return;
  }

  const client = google.accounts.oauth2.initTokenClient({
    client_id: AUTH_CONFIG.CLIENT_ID,
    scope: AUTH_CONFIG.SCOPES,
    callback: (tokenResponse) => {
      if (tokenResponse.error) {
        onError('Falha na autenticação: ' + (tokenResponse.error_description || tokenResponse.error));
        return;
      }
      fetchUserInfo(tokenResponse.access_token)
        .then(userInfo => {
          const session = {
            token: tokenResponse.access_token,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            expires_at: Date.now() + (tokenResponse.expires_in || 3600) * 1000,
          };
          saveSession(session);
          onSuccess(session);
        })
        .catch(err => {
          onError('Não foi possível obter informações do usuário. Tente novamente.');
          console.error('fetchUserInfo error:', err);
        });
    },
  });

  client.requestAccessToken();
}

async function fetchUserInfo(accessToken) {
  const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!resp.ok) throw new Error('userinfo request failed: ' + resp.status);
  return resp.json();
}

function logout(redirectTo = '/') {
  const session = getSession();
  if (session && session.token && typeof google !== 'undefined') {
    try {
      google.accounts.oauth2.revoke(session.token, () => {});
    } catch (e) {}
  }
  clearSession();
  window.location.href = redirectTo;
}

// ─────────────────────────────────────────
//  ATUALIZAÇÃO DO HEADER
// ─────────────────────────────────────────

/**
 * Atualiza o badge de usuário no header com o nome/e-mail logado
 * e adiciona botão de logout no elemento #header-user-area.
 * @param {Object} session
 * @param {string} [logoutRedirect] - para onde ir após "Sair" (padrão: 'index.html')
 */
function updateHeaderUser(session, logoutRedirect) {
  const area = document.getElementById('header-user-area');
  if (!area || !session) return;

  const firstName = session.name ? session.name.split(' ')[0] : session.email;

  const pillAvatar = session.picture
    ? `<img src="${escapeHtml(session.picture)}" alt="" class="header-user-avatar" referrerpolicy="no-referrer">`
    : `<svg viewBox="0 0 20 20" fill="currentColor" class="header-user-avatar-icon" aria-hidden="true">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"/>
      </svg>`;

  const dropdownAvatar = session.picture
    ? `<img src="${escapeHtml(session.picture)}" alt="" class="header-user-dropdown-avatar" referrerpolicy="no-referrer">`
    : `<div class="header-user-dropdown-avatar-fallback" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"/>
        </svg>
      </div>`;

  area.innerHTML = `
    <div class="header-user-wrap">
      <button class="header-user" id="header-user-btn"
              aria-expanded="false" aria-haspopup="true"
              title="${escapeHtml(session.email)}">
        ${pillAvatar}
        <span>${escapeHtml(firstName)}</span>
        <svg class="header-user-chevron" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </button>

      <div class="header-user-dropdown" id="header-user-dropdown" hidden>
        <div class="header-user-dropdown-profile">
          ${dropdownAvatar}
          <div class="header-user-dropdown-info">
            <span class="header-user-dropdown-name">${escapeHtml(session.name || firstName)}</span>
            <span class="header-user-dropdown-email">${escapeHtml(session.email)}</span>
          </div>
        </div>
        <div class="header-user-dropdown-divider"></div>
        <button class="header-user-dropdown-item" id="header-user-logout">
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"/>
          </svg>
          Sair
        </button>
      </div>
    </div>
  `;

  const btn      = document.getElementById('header-user-btn');
  const dropdown = document.getElementById('header-user-dropdown');

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    const isOpen = !dropdown.hidden;
    dropdown.hidden = isOpen;
    btn.setAttribute('aria-expanded', String(!isOpen));
  });

  document.getElementById('header-user-logout').addEventListener('click', function () {
    logout(logoutRedirect || 'index.html');
  });

  document.addEventListener('click', function (e) {
    if (!area.contains(e.target)) {
      dropdown.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  if (window.SGE_BELL && typeof window.SGE_BELL.init === 'function') {
    window.SGE_BELL.init();
  }
}
