import fs from 'node:fs';
import path from 'node:path';

export const ENVIRONMENTS = {
  local: 'http://192.168.18.65:3004/api/v1',
  development: 'https://api.naseebagri.com/api/v1',
  production: 'https://api.naseebagro.com/api/v1',
};

/** Loads KEY=VALUE lines into process.env without overriding values already set (CI secrets win). */
export function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

/** "a@x.com:pass,b@x.com:pass" -> [{email, password}] */
export function parseAccounts(value) {
  return (value || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => {
      const i = s.indexOf(':');
      return { email: s.slice(0, i), password: s.slice(i + 1) };
    });
}

// 1x1 PNG, used wherever an endpoint needs an uploaded file (receipts, truck documents).
const TINY_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', 'base64');
export const testFile = (name = 'test.png') => ({ __file: true, name });

/** { field: value | testFile() } -> multipart FormData (fetch sets the boundary header). */
function toFormData(fields) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null) continue;
    if (v?.__file) fd.append(k, new Blob([TINY_PNG], { type: 'image/png' }), v.name);
    else fd.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
  }
  return fd;
}

export function createClient(baseUrl, timeoutMs) {
  return async function request(method, urlPath, { token, query, body, raw, contentType, headers: extra, authHeader, form } = {}) {
    const url = new URL(baseUrl.replace(/\/$/, '') + '/' + urlPath.replace(/^\//, ''));
    for (const [k, v] of Object.entries(query || {})) if (v !== undefined) url.searchParams.set(k, v);
    const headers = { Accept: 'application/json', ...(extra || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (authHeader !== undefined) headers.Authorization = authHeader;
    if (body || raw !== undefined) headers['Content-Type'] = contentType || 'application/json';

    const started = performance.now();
    try {
      const res = await fetch(url, {
        method,
        headers,
        body: form ? toFormData(form) : raw !== undefined ? raw : body ? JSON.stringify(body) : undefined,
        redirect: 'manual',
        signal: AbortSignal.timeout(timeoutMs),
      });
      const text = await res.text();
      const ms = Math.round(performance.now() - started);
      let json = null;
      try { json = JSON.parse(text); } catch {}
      return { url: url.toString(), method, status: res.status, ms, bytes: Buffer.byteLength(text), json, text: json ? null : text.slice(0, 500), headers: Object.fromEntries(res.headers) };
    } catch (e) {
      return { url: url.toString(), method, status: 0, ms: Math.round(performance.now() - started), bytes: 0, json: null, error: e.name === 'TimeoutError' ? `Timed out after ${timeoutMs} ms` : e.message };
    }
  };
}

const SENSITIVE = /token|password|secret|iban|account_number|cnic(?!_status)|otp|authorization/i;

/** Deep copy with sensitive values masked, so reports are safe to share. */
export function redact(value, depth = 0) {
  if (depth > 12 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(v => redact(v, depth + 1));
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (SENSITIVE.test(k) && v !== null && typeof v !== 'object' && typeof v !== 'boolean') {
      const s = String(v);
      out[k] = s.length > 6 ? `${s.slice(0, 2)}…${s.slice(-2)} (redacted)` : '(redacted)';
    } else {
      out[k] = redact(v, depth + 1);
    }
  }
  return out;
}

/** Finds the list in a response: an explicit dotted key under `data`, else the first array of objects. */
export function extractList(json, key) {
  const data = json?.data;
  if (key) {
    const v = key.split('.').reduce((o, k) => o?.[k], data);
    return Array.isArray(v) ? v : null;
  }
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    for (const v of Object.values(data)) if (Array.isArray(v) && (v.length === 0 || typeof v[0] === 'object')) return v;
    for (const v of Object.values(data)) {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        for (const w of Object.values(v)) if (Array.isArray(w) && (w.length === 0 || typeof w[0] === 'object')) return w;
      }
    }
  }
  return null;
}

/** Unwraps the backend's {status, message, data} envelope, including the nested data.data case. */
export function unwrap(json) {
  let d = json?.data;
  if (d && typeof d === 'object' && !Array.isArray(d) && 'data' in d && Object.keys(d).every(k => ['data', 'status', 'message'].includes(k))) d = d.data;
  return d;
}

export const getPath = (obj, dotted) => dotted.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

export function percentile(values, p) {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  return Math.round(s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))]);
}

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function timestamp(d = new Date()) {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`;
}

export const rel = (from, to) => path.relative(from, to) || '.';
