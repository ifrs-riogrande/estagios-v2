/* ============================================================
   SGE v2 — IFRS CAMPUS RIO GRANDE
   api.js — camada de comunicação com o Google Apps Script
   ============================================================
   Núcleo mínimo por enquanto: só o cliente genérico GET/POST.
   Os helpers específicos (apiListarX, apiSalvarY...) entram
   conforme cada módulo é implementado — nada de trazer os da v1
   sem uso ainda.
   ============================================================ */

'use strict';

const API_CONFIG = {
  // Web App do backend SGE v2 (backend/), deployment @1 — ver clasp deployments.
  BASE_URL: 'https://script.google.com/macros/s/AKfycbzwbWCO0ANTTo86ky7TERw3WT2HIWe5H-sD7Yd8eQmEgq_oOhKsPgKeFzqWiKeslcuX1g/exec',
  TIMEOUT_MS: 30000,
};

class ApiError extends Error {
  constructor(message, code = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

async function fetchWithTimeout(url, options = {}, timeoutMs) {
  const ms = timeoutMs || API_CONFIG.TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);

  try {
    const resp = await fetch(url, { ...options, signal: controller.signal });
    return resp;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiError('A requisição demorou mais de ' + Math.round(ms / 1000) + ' segundos. Tente novamente.', 'TIMEOUT');
    }
    throw new ApiError('Falha na conexão. Verifique sua internet e tente novamente.', 'NETWORK');
  } finally {
    clearTimeout(timeoutId);
  }
}

const API = {
  async get(action, params = {}) {
    const url = new URL(API_CONFIG.BASE_URL);
    url.searchParams.set('action', action);
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
    const resp = await fetchWithTimeout(url.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    return this._parseResponse(resp);
  },

  async post(action, data = {}) {
    const token = typeof getAccessToken === 'function' ? getAccessToken() : null;
    const { _timeoutMs, ...dataClean } = data;
    const body = { action, ...dataClean, ...(token ? { authToken: token } : {}) };

    const resp = await fetchWithTimeout(API_CONFIG.BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
    }, _timeoutMs);
    return this._parseResponse(resp);
  },

  async _parseResponse(resp) {
    if (!resp.ok) {
      throw new ApiError(`Erro do servidor: ${resp.status} ${resp.statusText}`, 'HTTP_' + resp.status);
    }
    let json;
    try {
      json = await resp.json();
    } catch (e) {
      throw new ApiError('A resposta do servidor não é um JSON válido.', 'PARSE_ERROR');
    }
    if (json.ok === false) {
      throw new ApiError(json.error || 'Erro desconhecido no servidor.', json.code || 'APP_ERROR');
    }
    return json.data ?? json;
  },
};
