#!/usr/bin/env node
/**
 * One-command API audit for the Naseeb Agri app.
 *
 *   npm run audit:api                 read-only audit of the development API
 *   npm run audit:api -- --write      + reversible write flows (save/unsave, favourite, toggle)
 *   npm run audit:api -- --load       + 25-concurrent load test on browse endpoints
 *   npm run audit:api:full            all of the above
 *   --flows                           end-to-end business flows that create data (local/Docker only)
 *   --env=local|development|production   or   --base=https://host/api/v1
 *   --open                            open the HTML report when done
 *
 * Accounts and thresholds come from audit/.env.audit (see .env.audit.example).
 * Writes audit/reports/NA-API-TSR-<time>_<env>.{pdf,html,json} and history.json. Older runs are
 * deleted (AUDIT_KEEP_REPORTS, default 1).
 * Exits 1 when any check fails, so it can gate CI.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFile, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  ENVIRONMENTS, createClient, ensureDir, extractList, getPath, loadEnvFile,
  parseAccounts, percentile, redact, timestamp, unwrap,
} from './lib.mjs';
import { loadTargets, probes, securityChecks, suite, writeFlows } from './suite.mjs';
import { renderReport } from './report.mjs';
import { buildCatalog } from './catalog.mjs';
import { flows } from './flows.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const AUDIT_DIR = path.resolve(HERE, '..');
loadEnvFile(path.join(AUDIT_DIR, '.env.audit'));

// ── Options ────────────────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2).map(a => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);
const envName = args.env || process.env.AUDIT_ENV || 'development';
const baseUrl = args.base || process.env.AUDIT_BASE_URL || ENVIRONMENTS[envName];
const isProd = envName === 'production' || /naseebagro\.com/.test(baseUrl);
const opts = {
  write: !!args.write || !!args.full,
  flows: !!args.flows,
  load: !!args.load || !!args.full,
  security: !args['no-security'] && !isProd,
  open: !!args.open,
  warnMs: Number(process.env.AUDIT_WARN_MS || 1000),
  failMs: Number(process.env.AUDIT_FAIL_MS || 3000),
  timeoutMs: Number(process.env.AUDIT_TIMEOUT_MS || 30000),
  concurrency: Number(process.env.AUDIT_LOAD_CONCURRENCY || 25),
};
if (!baseUrl) {
  console.error(`Unknown environment "${envName}". Use --env=local|development|production or --base=URL`);
  process.exit(2);
}
// HTTPS-only checks (redirects, TLS) do not apply to a backend served over plain http://.
const isPlainHttp = baseUrl.startsWith('http://');
const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.|10\.)/.test(baseUrl);
if (opts.flows && !isLocal && !args.force) {
  console.error('Refusing --flows: it creates posts, offers, deals and users. Use a local/Docker backend (or --force).');
  process.exit(2);
}
if (isProd && (opts.write || opts.load) && !args.force) {
  console.error('Refusing --write/--load against production. Add --force if you really mean it.');
  process.exit(2);
}
const accounts = parseAccounts(process.env.AUDIT_USERS);
if (!accounts.length) {
  console.error('No test accounts. Copy audit/.env.audit.example to audit/.env.audit and set AUDIT_USERS.');
  process.exit(2);
}

const request = createClient(baseUrl, opts.timeoutMs);
const startedAt = new Date();
const log = (icon, msg) => console.log(`${icon} ${msg}`);
const ICON = { pass: '✔', warn: '!', fail: '✖', skip: '-' };

// ── Helpers ────────────────────────────────────────────────────────────────

/** Shortens long arrays so a response stays readable in the report. */
function trimForReport(value, depth = 0) {
  if (depth > 10 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    const head = value.slice(0, 2).map(v => trimForReport(v, depth + 1));
    return value.length > 2 ? [...head, `… ${value.length - 2} more item(s)`] : head;
  }
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, trimForReport(v, depth + 1)]));
}

function outcomeOf(checks) {
  if (checks.some(c => !c.ok && c.level === 'fail')) return 'fail';
  if (checks.some(c => !c.ok && c.level === 'warn')) return 'warn';
  return 'pass';
}

function baseChecks(res, { fields, list, listKey, optional }) {
  const checks = [];
  const ok2xx = res.status >= 200 && res.status < 300;
  checks.push({ label: `HTTP ${res.status || 'no response'}${res.error ? ` (${res.error})` : ''}`, ok: ok2xx, level: 'fail' });
  if (!ok2xx) return { checks, records: null };

  const env = res.json && typeof res.json === 'object' && 'data' in res.json && 'message' in res.json;
  checks.push({ label: 'Standard {status, message, data} envelope', ok: !!env, level: 'warn' });

  const slow = res.ms > opts.failMs ? 'fail' : res.ms > opts.warnMs ? 'warn' : null;
  checks.push({ label: `Response time ${res.ms} ms (warn > ${opts.warnMs}, fail > ${opts.failMs})`, ok: !slow, level: slow || 'warn' });
  checks.push({ label: `Payload ${(res.bytes / 1024).toFixed(1)} KB`, ok: res.bytes < 300 * 1024, level: 'warn' });

  let records = null;
  if (list) {
    records = extractList(res.json, listKey);
    checks.push({ label: records ? `List found (${records.length} record${records.length === 1 ? '' : 's'})` : `No list at data.${listKey || '*'}`, ok: !!records, level: 'fail' });
  }
  const subject = list ? records?.[0] : unwrap(res.json);
  if (fields?.length && subject) {
    const missing = fields.filter(f => getPath(subject, f) === undefined);
    checks.push({ label: missing.length ? `Missing fields: ${missing.join(', ')}` : `Fields present: ${fields.join(', ')}`, ok: !missing.length, level: 'fail' });
  }
  if (optional) checks.forEach(c => (c.level = c.level === 'fail' ? 'warn' : c.level));
  return { checks, records };
}

function snapshot(res) {
  return {
    method: res.method, url: res.url, status: res.status, ms: res.ms, bytes: res.bytes,
    response: res.json ? trimForReport(redact(res.json)) : res.text ?? res.error ?? null,
  };
}

// ── Sessions ───────────────────────────────────────────────────────────────
const sessions = [];
async function login() {
  for (const acc of accounts) {
    const res = await request('POST', 'auth/login', { body: acc });
    const token = res.json?.data?.access_token;
    sessions.push({ email: acc.email, token, ok: !!token, status: res.status, ms: res.ms });
    log(token ? ICON.pass : ICON.fail, `login ${acc.email} → ${res.status} ${res.ms} ms`);
  }
}
const liveSessions = () => sessions.filter(s => s.ok);
let adminSession = null;
async function loginAdmin() {
  const acc = parseAccounts(process.env.AUDIT_ADMIN)[0];
  if (!acc) return;
  const res = await request('POST', 'auth/admin/login', { body: acc });
  const token = res.json?.data?.access_token;
  adminSession = { email: acc.email, token, ok: !!token, status: res.status, admin: true };
  log(token ? ICON.pass : ICON.fail, `admin login ${acc.email} → ${res.status} ${res.ms} ms`);
}

// ── Endpoint runner ────────────────────────────────────────────────────────
async function runEndpoint(group, ep) {
  const isList = ep.list !== undefined;
  const candidates = ep.auth === 'admin' ? (adminSession?.ok ? [adminSession] : []) : ep.auth === 'user' ? liveSessions() : [{ email: ep.auth === 'optional' && liveSessions()[0] ? liveSessions()[0].email : 'anonymous', token: ep.auth === 'optional' ? liveSessions()[0]?.token : undefined }];
  if ((ep.auth === 'user' || ep.auth === 'admin') && !candidates.length) {
    return { id: ep.id, group, name: ep.name, screen: ep.screen, path: ep.path, outcome: 'skip', checks: [{ label: ep.auth === 'admin' ? 'No admin account (set AUDIT_ADMIN)' : 'No logged-in account', ok: false, level: 'warn' }], details: [] };
  }

  // Try accounts until one has records, so details can be tested.
  let chosen = null;
  for (const s of candidates) {
    const res = await request('GET', ep.path, { token: s.token, query: ep.query });
    const { checks, records } = baseChecks(res, { fields: ep.fields, list: isList, listKey: ep.list, optional: ep.optional });
    const attempt = { session: s, res, checks, records };
    if (!chosen) chosen = attempt;
    if (!isList || (records && records.length)) { chosen = attempt; break; }
  }

  const { session, res, checks, records } = chosen;
  if (ep.optional && res.status === 404) {
    return { id: ep.id, group, name: ep.name, screen: ep.screen, path: ep.path, account: session.email, outcome: 'skip', checks: [{ label: 'Endpoint not deployed yet (404)', ok: false, level: 'warn' }], ...snapshot(res), details: [] };
  }

  const result = {
    id: ep.id, group, name: ep.name, screen: ep.screen, path: ep.path, account: session.email,
    ...snapshot(res), checks, recordCount: records?.length ?? null,
    sample: records?.[0] ? redact(records[0]) : null, details: [],
  };
  if (isList && records && !records.length) {
    result.checks.push({ label: `No records for any of ${candidates.length} account(s); details not tested`, ok: false, level: 'warn' });
  }

  // Follow the first record into its detail endpoints.
  const first = records?.[0];
  for (const d of ep.details || []) {
    const id = `${ep.id} > ${d.name}`;
    if (!first) {
      result.details.push({ id, name: d.name, outcome: 'skip', checks: [{ label: 'No record to open', ok: false, level: 'warn' }] });
      continue;
    }
    const token = (d.auth ?? ep.auth) === 'none' ? undefined : session.token || liveSessions()[0]?.token;
    const dres = await request('GET', d.path(first), { token, query: d.query?.(first) });
    const { checks: dchecks, records: drecords } = baseChecks(dres, { fields: d.fields, list: d.list !== undefined, listKey: d.list });
    const dobj = unwrap(dres.json);
    const idField = d.idField || 'id';
    if (dobj && typeof dobj === 'object' && idField in dobj && 'id' in first && d.list === undefined) {
      dchecks.push({ label: `Detail ${idField} matches list record (${String(first.id).slice(0, 8)}…)`, ok: dobj[idField] === first.id, level: 'warn' });
    }
    result.details.push({ id, name: d.name, account: session.email, ...snapshot(dres), checks: dchecks, recordCount: drecords?.length ?? null, outcome: outcomeOf(dchecks) });
  }

  result.outcome = outcomeOf(result.checks);
  return result;
}

// ── Probes, security, sockets, load, writes ────────────────────────────────
/** Builds the Authorization token a probe asks for. */
function probeToken(kind) {
  const userToken = liveSessions()[0]?.token;
  if (kind === 'user') return userToken;
  if (kind === 'forged') return 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhdWRpdCJ9.forged';
  if ((kind === 'alg-none' || kind === 'tampered') && userToken) {
    const [head, body, sig] = userToken.split('.');
    const claims = JSON.parse(Buffer.from(body, 'base64url').toString());
    const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
    // alg "none": unsigned token for the same user. tampered: real signature, role edited to admin.
    return kind === 'alg-none' ? `${b64({ alg: 'none', typ: 'JWT' })}.${body}.` : `${head}.${b64({ ...claims, role: 'admin' })}.${sig}`;
  }
  return undefined;
}

const requestOpts = c => ({
  token: probeToken(c.token), query: c.query, body: c.body, raw: c.raw, contentType: c.contentType, headers: c.headers, authHeader: c.authHeader,
});

async function runProbe(p) {
  const res = await request(p.method, p.path, requestOpts(p));
  const ok = p.expect.includes(res.status);
  const checks = [{ label: `Expected ${p.expect.join(' or ')}, got ${res.status}`, ok, level: 'fail' }];
  return { id: p.id, group: 'Negative tests', name: p.name, path: p.path, ...snapshot(res), checks, outcome: outcomeOf(checks), details: [] };
}

const SECRET_KEYS = /^(password|password_hash|passwordHash|hash|salt|reset_token|resetToken|refresh_token|refreshToken|otp|otp_code)$/;
const PII_KEYS = /^(email|phone|cnic|cnic_number|address|bank_iban_number|bank_account_number)$/i;
function findKeys(value, pattern, found = new Set(), depth = 0) {
  if (depth > 12 || value === null || typeof value !== 'object') return found;
  for (const [k, v] of Object.entries(value)) {
    if (pattern.test(k)) found.add(k);
    findKeys(v, pattern, found, depth + 1);
  }
  return found;
}

async function runSecurity(c, results) {
  const result = (checks, extra = {}) => ({ id: c.id, group: 'Security', name: c.name, path: c.path, checks, outcome: outcomeOf(checks), details: [], ...extra });
  const users = liveSessions();
  const listIds = async (s, listPath) => (extractList((await request('GET', listPath, { token: s.token })).json) || []).map(r => r.id).filter(Boolean);

  if (c.kind === 'bola') {
    // Find a record owned by account A that account B does not own, then ask for it as B.
    const owned = new Map();
    for (const s of users) owned.set(s.email, await listIds(s, c.list));
    for (const owner of users) {
      for (const attacker of users) {
        const id = owned.get(owner.email)[0];
        if (owner === attacker || !id || owned.get(attacker.email).includes(id)) continue;
        const res = await request('GET', c.detail(id), { token: attacker.token });
        const ok = res.status === 403 || res.status === 404;
        const checks = [{ label: ok ? `Refused with ${res.status} (${owner.email}'s record requested by ${attacker.email})` : `HTTP ${res.status}: ${attacker.email} received ${owner.email}'s record`, ok, level: 'fail' }];
        return result(checks, { ...snapshot(res), account: attacker.email });
      }
    }
    return { ...result([{ label: 'Needs two test accounts with different records', ok: false, level: 'warn' }]), outcome: 'skip' };
  }

  if (c.kind === 'admin') {
    const anon = await request('GET', c.path);
    const user = await request('GET', c.path, { token: users[0]?.token });
    const checks = [
      { label: `Without token: HTTP ${anon.status} (expected 401)`, ok: anon.status === 401, level: 'fail' },
      { label: `With a user token: HTTP ${user.status} (expected 403)`, ok: user.status === 403, level: 'fail' },
    ];
    return result(checks, { ...snapshot(user), response: { without_token: anon.status, user_token: user.status } });
  }

  if (c.kind === 'enumeration') {
    const known = users[0]?.email;
    const a = await request('POST', c.path, { body: { email: 'audit-nobody-zz@naseeb.test', password: 'Wrong@12345' } });
    const b = await request('POST', c.path, { body: { email: known, password: 'Wrong@12345' } });
    const same = a.status === b.status && a.json?.message === b.json?.message;
    const checks = [{ label: same ? `Both return ${a.status} "${a.json?.message}"` : `Unknown email: ${a.status} "${a.json?.message}"; wrong password: ${b.status} "${b.json?.message}"`, ok: same, level: 'fail' }];
    return result(checks, { method: 'POST', url: `${baseUrl}/${c.path}`, status: b.status, response: { unknown_email: { status: a.status, message: a.json?.message }, wrong_password: { status: b.status, message: b.json?.message } } });
  }

  if (c.kind === 'blocked-login') {
    const blocked = parseAccounts(process.env.AUDIT_BLOCKED_USERS);
    if (!blocked.length) return { ...result([{ label: 'Set AUDIT_BLOCKED_USERS to inactive / KYC-rejected test accounts', ok: false, level: 'warn' }]), outcome: 'skip' };
    const outcomes = [];
    for (const acc of blocked) {
      const r = await request('POST', c.path, { body: acc });
      outcomes.push({ email: acc.email, status: r.status, message: r.json?.message });
    }
    const checks = outcomes.map(o => ({ label: `${o.email}: HTTP ${o.status} ${o.message ?? ''}`, ok: o.status === 401 || o.status === 403, level: 'fail' }));
    return result(checks, { method: 'POST', url: `${baseUrl}/${c.path}`, status: outcomes.at(-1)?.status, response: outcomes });
  }

  if (c.kind === 'exposure') {
    const found = new Set();
    for (const r of results.flatMap(x => [x, ...(x.details || [])])) {
      findKeys(r.response, SECRET_KEYS, found);
      findKeys(r.sample, SECRET_KEYS, found);
    }
    const scanned = results.flatMap(x => [x, ...(x.details || [])]).filter(r => r.response).length;
    const checks = [{ label: found.size ? `Secret fields found: ${[...found].join(', ')}` : `No secret fields in ${scanned} responses`, ok: !found.size, level: 'fail' }];
    return result(checks, { response: { responses_scanned: scanned, secret_fields_found: [...found] } });
  }

  if (c.kind === 'pii') {
    const res = await request('GET', c.path, { query: { page: 1, limit: 20 } });
    const listings = extractList(res.json, 'data.listings') || [];
    const found = new Set();
    for (const l of listings) findKeys(l.seller, PII_KEYS, found);
    const checks = listings.length
      ? [{ label: found.size ? `Seller fields exposed: ${[...found].join(', ')}` : `${listings.length} listings checked; seller shows only ${Object.keys(listings[0].seller || {}).join(', ') || 'no fields'}`, ok: !found.size, level: 'fail' }]
      : [{ label: 'No public listings to check', ok: false, level: 'warn' }];
    return result(checks, { ...snapshot(res), response: { seller_fields: Object.keys(listings[0]?.seller || {}) } });
  }

  if (c.kind === 'https') {
    const httpUrl = `${baseUrl.replace(/^https:/, 'http:')}/${c.path}`;
    let status = 0, location = null;
    try {
      const r = await fetch(httpUrl, { redirect: 'manual', signal: AbortSignal.timeout(opts.timeoutMs) });
      status = r.status;
      location = r.headers.get('location');
    } catch (e) {
      status = 0;
    }
    const ok = status === 0 || ([301, 302, 307, 308].includes(status) && /^https:/.test(location || ''));
    const checks = [{ label: status === 0 ? 'Plain HTTP refused' : `HTTP ${status}${location ? ` → ${location}` : ''}`, ok, level: 'fail' }];
    return result(checks, { method: 'GET', url: httpUrl, status, response: { status, location } });
  }

  // Plain request: `expect` statuses, or a `pass` predicate.
  const res = await request(c.method, c.path, requestOpts(c));
  const ok = c.pass ? c.pass(res) : c.expect.includes(res.status);
  const label = c.pass ? (ok ? `OK (HTTP ${res.status})` : `${c.why} (HTTP ${res.status})`) : `Expected ${c.expect.join(' or ')}, got ${res.status}`;
  return result([{ label, ok, level: 'fail' }], { ...snapshot(res), response: c.evidence ? c.evidence(res) : res.json ? trimForReport(redact(res.json)) : `HTTP ${res.status}` });
}

async function runSockets() {
  let io;
  try {
    ({ io } = await import('socket.io-client'));
  } catch {
    return [{ id: 'socket.client', group: 'Real-time', name: 'socket.io-client available', outcome: 'skip', checks: [{ label: 'socket.io-client not installed', ok: false, level: 'warn' }], details: [] }];
  }
  const socketUrl = baseUrl.replace(/\/api\/v1\/?$/, '');
  const attempt = token => new Promise(resolve => {
    const started = performance.now();
    const s = io(socketUrl, { auth: { token }, transports: ['websocket'], reconnection: false, timeout: 10000 });
    let connectMs = null;
    const done = outcome => { s.close(); resolve({ ...outcome, ms: connectMs ?? Math.round(performance.now() - started) }); };
    // The server accepts the handshake first, then disconnects bad tokens; wait briefly to see which.
    s.on('connect', () => { connectMs = Math.round(performance.now() - started); setTimeout(() => done({ connected: s.connected }), 1500); });
    s.on('connect_error', e => done({ connected: false, error: e.message }));
    setTimeout(() => done({ connected: s.connected, error: 'timeout' }), 12000);
  });

  const good = await attempt(liveSessions()[0]?.token);
  const bad = await attempt('forged.token.value');
  const c1 = [{ label: good.connected ? `Connected in ${good.ms} ms` : `Could not connect: ${good.error}`, ok: good.connected, level: 'fail' }];
  const c2 = [{ label: bad.connected ? 'Forged token stayed connected' : 'Forged token rejected', ok: !bad.connected, level: 'fail' }];
  return [
    { id: 'socket.connect', group: 'Real-time', name: 'Socket connects with valid token', path: socketUrl, ms: good.ms, checks: c1, outcome: outcomeOf(c1), details: [] },
    { id: 'socket.reject', group: 'Real-time', name: 'Socket rejects forged token', path: socketUrl, ms: bad.ms, checks: c2, outcome: outcomeOf(c2), details: [] },
  ];
}

async function runLoad() {
  const out = [];
  for (const t of loadTargets) {
    const times = [];
    const statuses = {};
    await Promise.all(Array.from({ length: opts.concurrency }, async () => {
      const r = await request('GET', t.path, { query: t.query });
      times.push(r.ms);
      statuses[r.status] = (statuses[r.status] || 0) + 1;
    }));
    const p50 = percentile(times, 0.5);
    const p95 = percentile(times, 0.95);
    const errors = opts.concurrency - (statuses[200] || 0);
    const checks = [
      { label: `p50 ${p50} ms, p95 ${p95} ms with ${opts.concurrency} concurrent`, ok: p95 <= opts.warnMs, level: p95 > opts.failMs ? 'fail' : 'warn' },
      { label: `${errors} non-200 responses`, ok: errors === 0, level: 'fail' },
    ];
    out.push({ id: `load.${t.path}`, group: 'Load', name: `${opts.concurrency} concurrent: ${t.path}`, path: t.path, ms: p50, p95, checks, outcome: outcomeOf(checks), response: { statuses }, details: [] });
  }
  return out;
}

async function runWrites(results) {
  const out = [];
  const s = liveSessions()[0];
  const supplyId = results.find(r => r.id === 'public.supplies')?.sample?.id;
  const step = async (checks, label, method, p) => {
    const r = await request(method, p, { token: s.token });
    checks.push({ label: `${label}: ${method} ${p} → ${r.status} (${r.ms} ms)`, ok: r.status >= 200 && r.status < 300, level: 'fail' });
    return r;
  };
  const ids = async (p, key) => (extractList((await request('GET', p, { token: s.token, query: { limit: 100 } })).json, key) || []).map(x => x.post_id);

  for (const flow of writeFlows) {
    const checks = [];
    let name = flow;
    if (flow === 'saved-listing' || flow === 'favorite') {
      const [listPath, key, base] = flow === 'saved-listing'
        ? ['profile/saved-listings', 'data.items', 'profile/saved-listings']
        : ['buyer/supplies/favorites', '', 'buyer/supplies/favorites'];
      name = flow === 'saved-listing' ? 'Save then unsave a listing' : 'Favourite then unfavourite a listing';
      if (!supplyId) { checks.push({ label: 'No marketplace listing to use', ok: false, level: 'warn' }); }
      else if ((await ids(listPath, key)).includes(supplyId)) { checks.push({ label: 'Listing already saved by this account; skipped to avoid changing it', ok: false, level: 'warn' }); }
      else {
        await step(checks, 'Add', 'POST', `${base}/${supplyId}`);
        const added = (await ids(listPath, key)).includes(supplyId);
        checks.push({ label: 'Appears in list after add', ok: added, level: 'fail' });
        await step(checks, 'Remove', 'DELETE', `${base}/${supplyId}`);
        const removed = !(await ids(listPath, key)).includes(supplyId);
        checks.push({ label: 'Gone from list after remove', ok: removed, level: 'fail' });
      }
    }
    if (flow === 'toggle-supply') {
      name = 'Pause then resume my supply post';
      const mine = extractList((await request('GET', 'seller/supplies', { token: s.token })).json) || [];
      if (!mine[0]) checks.push({ label: 'Account has no supply posts', ok: false, level: 'warn' });
      else {
        const before = unwrap((await request('GET', `seller/supplies/${mine[0].id}`, { token: s.token })).json);
        await step(checks, 'Toggle', 'PATCH', `seller/supplies/${mine[0].id}/toggle-active`);
        await step(checks, 'Toggle back', 'PATCH', `seller/supplies/${mine[0].id}/toggle-active`);
        const after = unwrap((await request('GET', `seller/supplies/${mine[0].id}`, { token: s.token })).json);
        const same = JSON.stringify(before?.is_active ?? before?.status) === JSON.stringify(after?.is_active ?? after?.status);
        checks.push({ label: 'State restored after two toggles', ok: same, level: 'fail' });
      }
    }
    out.push({ id: `write.${flow}`, group: 'Write flows', name, account: s.email, checks, outcome: outcomeOf(checks), details: [] });
  }
  return out;
}

// ── End-to-end flows (--flows) ─────────────────────────────────────────────
async function runFlows() {
  const out = [];
  for (const flow of flows) {
    const tokens = { seller: liveSessions()[0]?.token, buyer: liveSessions()[1]?.token, admin: adminSession?.token };
    const state = {};
    let blockedBy = null;
    for (const step of flow.steps) {
      const id = `flow.${flow.id}.${step.id}`;
      if (blockedBy) {
        out.push({ id, group: flow.title, name: step.name, outcome: 'skip', checks: [{ label: `Blocked: "${blockedBy}" failed`, ok: false, level: 'warn' }], details: [] });
        continue;
      }
      const calls = [];
      const checks = [];
      const ctx = {
        state, tokens, pollMs: 8000,
        call: async (role, method, p, o = {}) => {
          const res = await request(method, p, { ...o, token: role ? tokens[role] : undefined });
          calls.push(res);
          return res;
        },
        list: (res, key) => extractList(res.json, key),
        check: (ok, label, level = 'fail') => (checks.push({ label, ok: !!ok, level }), !!ok),
        fail: msg => Object.assign(new Error(msg), { stepFail: true }),
        expect: (res, statuses, label, { stop = true } = {}) => {
          const ok = statuses.includes(res.status);
          const why = ok ? '' : ` (expected ${statuses.join('/')})${res.json?.message ? `: ${res.json.message}` : res.error ? `: ${res.error}` : ''}`;
          checks.push({ label: `${label}: HTTP ${res.status}${why}`, ok, level: 'fail' });
          if (!ok && stop) throw ctx.fail(label);
          return ok;
        },
        poll: async fn => {
          const end = Date.now() + ctx.pollMs;
          for (;;) {
            const r = await fn();
            if (r || Date.now() > end) return r;
            await new Promise(r2 => setTimeout(r2, 500));
          }
        },
        login: async (role, email, password, admin = false) => {
          const res = await ctx.call(null, 'POST', admin ? 'auth/admin/login' : 'auth/login', { body: { email, password } });
          tokens[role] = res.json?.data?.access_token;
          return res;
        },
      };
      const started = performance.now();
      try {
        await step.run(ctx);
      } catch (e) {
        if (!e.stepFail) checks.push({ label: `Error: ${e.message}`, ok: false, level: 'fail' });
      }
      const outcome = checks.length ? outcomeOf(checks) : 'pass';
      if (outcome === 'fail' && !step.optional) blockedBy = step.name;
      const last = calls.at(-1);
      out.push({
        id, group: flow.title, name: step.name, outcome, checks, details: [],
        method: last?.method, url: last?.url, status: last?.status, ms: Math.round(performance.now() - started), bytes: last?.bytes,
        response: {
          requests: calls.map(c => `${c.method} ${c.url.replace(baseUrl, '')} → ${c.status} (${c.ms} ms)`),
          last_response: last?.json ? trimForReport(redact(last.json)) : last?.text ?? null,
        },
      });
      log(ICON[outcome], `${flow.title} › ${step.name}`);
    }
  }
  return out;
}

// ── Report assembly ────────────────────────────────────────────────────────
function flatten(results) {
  return results.flatMap(r => [r, ...(r.details || [])]);
}

/** Joins results onto the numbered catalog; cases that did not run are kept with the reason. */
function toTestCases(results) {
  const byKey = new Map(flatten(results).map(r => [r.id, r]));
  return buildCatalog().map(c => {
    const r = byKey.get(c.key);
    if (!r) {
      const reason = c.runOnly ? `Not selected (run with ${c.runOnly})` : c.remoteOnly && isPlainHttp ? 'Not applicable: local backend runs over plain HTTP' : c.module === 'Security' ? 'Skipped on production' : 'Not executed';
      return { ...c, outcome: 'notrun', actual: reason };
    }
    const problems = (r.checks || []).filter(k => !k.ok);
    return {
      ...c,
      outcome: r.outcome, status: r.status, ms: r.ms, p95: r.p95, bytes: r.bytes, url: r.url, account: r.account,
      recordCount: r.recordCount, checks: r.checks, sample: r.sample, response: r.response,
      actual: problems.length ? problems.map(k => k.label).join('; ') : (r.checks || []).length > 1 && !r.status ? `All ${r.checks.length} steps passed` : r.status ? `HTTP ${r.status}${r.ms != null ? `, ${r.ms} ms` : ''}${r.recordCount != null ? `, ${r.recordCount} record(s)` : ''}` : (r.checks || [])[0]?.label,
    };
  });
}

const SEV_RANK = { blocker: 0, critical: 1, normal: 2, minor: 3, trivial: 4 };

/** Defect status from run history: New, Recurring (with first-seen date) or Regression. */
function defectsFrom(cases, history) {
  const sameEnv = history.filter(h => h.env === envName);
  const prev = sameEnv.at(-1);
  return cases
    .filter(c => c.outcome === 'fail')
    .map(c => {
      let status = 'New';
      let firstSeen = startedAt.toISOString();
      if (prev?.failed?.includes(c.tc)) {
        status = 'Recurring';
        for (let i = sameEnv.length - 1; i >= 0 && sameEnv[i].failed?.includes(c.tc); i--) firstSeen = sameEnv[i].startedAt;
      } else if (prev?.passed?.includes(c.tc)) {
        status = 'Regression';
      }
      const title = c.defect || `${c.title}: ${(c.checks || []).find(k => !k.ok && k.level === 'fail')?.label || 'failed'}`;
      return { id: `BUG-${c.tc.slice(3)}`, ...c, title, testTitle: c.title, defectStatus: status, firstSeen };
    })
    .sort((a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity] || a.tc.localeCompare(b.tc));
}

function qualityGate(cases, defects, totals) {
  const passRateMin = Number(process.env.AUDIT_GATE_PASS_RATE || 95);
  const severe = defects.filter(d => SEV_RANK[d.severity] <= 1);
  const regressions = defects.filter(d => d.defectStatus === 'Regression');
  const criteria = [
    { name: `Pass rate of executed test cases ≥ ${passRateMin}%`, actual: `${totals.passRate}%`, met: totals.passRate >= passRateMin },
    { name: 'No open Blocker or Critical defects', actual: `${severe.length} open`, met: severe.length === 0 },
    { name: 'No regressions since the previous run', actual: `${regressions.length}`, met: regressions.length === 0 },
    { name: `95th percentile response time ≤ ${opts.warnMs} ms`, actual: `${totals.p95} ms`, met: totals.p95 <= opts.warnMs },
  ];
  const verdict = criteria.every(c => c.met) ? 'PASSED' : severe.length ? 'FAILED' : 'PASSED WITH ISSUES';
  return { verdict, criteria };
}

function safeExec(cmd, args) {
  try { return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; }
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    'google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser',
  ].filter(Boolean);
  return candidates.find(c => (c.startsWith('/') ? fs.existsSync(c) : safeExec('which', [c])));
}

function writePdf(htmlFile, pdfFile) {
  const chrome = findChrome();
  if (!chrome) return 'Chrome/Chromium not found; set CHROME_PATH to enable PDF output';
  try {
    execFileSync(chrome, ['--headless=new', '--disable-gpu', '--no-sandbox', '--no-pdf-header-footer', `--print-to-pdf=${pdfFile}`, `file://${htmlFile}`], { stdio: 'ignore', timeout: 120000 });
    return fs.existsSync(pdfFile) ? null : 'Chrome did not produce a PDF';
  } catch (e) {
    return `PDF failed: ${e.message}`;
  }
}

/** Keeps only the newest `keep` runs (each run = .pdf/.html/.json); history.json is kept for trends. */
function removeOldReports(dir, keep) {
  const runOf = f => f.match(/^(NA-API-TSR-\d+)_/)?.[1];
  const runs = [...new Set(fs.readdirSync(dir).map(runOf).filter(Boolean))].sort().reverse();
  const stale = new Set(runs.slice(Math.max(1, keep)));
  for (const f of fs.readdirSync(dir)) {
    if (stale.has(runOf(f)) || /^latest\./.test(f) || /^api-audit_/.test(f)) fs.rmSync(path.join(dir, f), { force: true });
  }
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\nNaseeb Agri API audit → ${baseUrl} (${envName})`);
  console.log(`Options: write=${opts.write} load=${opts.load} security=${opts.security} flows=${opts.flows}\n`);
  await login();
  await loginAdmin();

  const results = [];
  for (const g of suite) {
    for (const ep of g.endpoints) {
      const r = await runEndpoint(g.group, ep);
      results.push(r);
      log(ICON[r.outcome], `${g.group} › ${r.name}  ${r.status ?? ''} ${r.ms ?? ''}ms${r.recordCount != null ? ` n=${r.recordCount}` : ''}`);
      for (const d of r.details) log(`  ${ICON[d.outcome]}`, `${d.name}  ${d.status ?? ''} ${d.ms ?? ''}ms`);
    }
  }
  for (const p of probes) { const r = await runProbe(p); results.push(r); log(ICON[r.outcome], `Negative › ${r.name}`); }
  if (opts.security) for (const c of securityChecks.filter(c => !(c.remoteOnly && isPlainHttp))) { const r = await runSecurity(c, results); results.push(r); log(ICON[r.outcome], `Security › ${r.name}`); }
  for (const r of await runSockets()) { results.push(r); log(ICON[r.outcome], `Real-time › ${r.name}`); }
  if (opts.write) for (const r of await runWrites(results)) { results.push(r); log(ICON[r.outcome], `Write › ${r.name}`); }
  if (opts.load) for (const r of await runLoad()) { results.push(r); log(ICON[r.outcome], `Load › ${r.name}`); }
  if (opts.flows) results.push(...(await runFlows()));

  const reportsDir = ensureDir(path.join(AUDIT_DIR, 'reports'));
  const historyFile = path.join(reportsDir, 'history.json');
  const history = fs.existsSync(historyFile) ? JSON.parse(fs.readFileSync(historyFile, 'utf8')) : [];

  const cases = toTestCases(results);
  const count = o => cases.filter(c => c.outcome === o).length;
  const executed = cases.filter(c => c.outcome !== 'notrun' && c.outcome !== 'skip');
  const timed = cases.filter(c => c.ms && c.type !== 'Load').map(c => c.ms);
  const totals = {
    total: cases.length, executed: executed.length, pass: count('pass'), warn: count('warn'), fail: count('fail'), skip: count('skip'), notrun: count('notrun'),
    passRate: executed.length ? Math.round(((count('pass') + count('warn')) / executed.length) * 1000) / 10 : 0,
    p50: percentile(timed, 0.5), p95: percentile(timed, 0.95),
  };
  const defects = defectsFrom(cases, history);
  const gate = qualityGate(cases, defects, totals);

  const stamp = timestamp(startedAt);
  const meta = {
    reportId: `NA-API-TSR-${stamp.replace(/[-_]/g, '')}`,
    title: 'API Test Summary Report',
    org: process.env.AUDIT_ORG || 'Naseeb Agri',
    product: process.env.AUDIT_PRODUCT || 'Naseeb Agri mobile app: backend API',
    preparedBy: process.env.AUDIT_PREPARED_BY || safeExec('git', ['config', 'user.name']) || os.userInfo().username,
    startedAt: startedAt.toISOString(), finishedAt: new Date().toISOString(), durationMs: Date.now() - startedAt.getTime(),
    env: envName, baseUrl, options: opts,
    suiteRevision: safeExec('git', ['-C', AUDIT_DIR, 'rev-parse', '--short', 'HEAD']),
    runner: `Node ${process.version} on ${os.type()} ${os.release()}`,
    accounts: sessions.map(s => ({ email: s.email, ok: s.ok, status: s.status })),
    totals,
  };

  const sameEnv = history.filter(h => h.env === envName);
  const trend = [...sameEnv.slice(-9), { reportId: meta.reportId, startedAt: meta.startedAt, totals }];
  const report = { meta, gate, defects, cases, trend };

  // Runs against a local/Docker backend are named "locallytested" so they are never mistaken for server runs.
  const stem = path.join(reportsDir, `${meta.reportId}_${isLocal ? 'locallytested' : envName}`);
  fs.writeFileSync(`${stem}.json`, JSON.stringify(report, null, 2));
  fs.writeFileSync(`${stem}.html`, renderReport(report));
  const pdfError = writePdf(`${stem}.html`, `${stem}.pdf`);
  removeOldReports(reportsDir, Number(process.env.AUDIT_KEEP_REPORTS || 1));

  history.push({
    reportId: meta.reportId, startedAt: meta.startedAt, env: envName, totals,
    failed: cases.filter(c => c.outcome === 'fail').map(c => c.tc),
    passed: cases.filter(c => c.outcome === 'pass' || c.outcome === 'warn').map(c => c.tc),
  });
  fs.writeFileSync(historyFile, JSON.stringify(history.slice(-100), null, 2));

  const t = totals;
  console.log(`\nVerdict: ${gate.verdict}`);
  console.log(`${t.pass} passed · ${t.warn} warnings · ${t.fail} failed · ${t.skip} blocked · ${t.notrun} not run  (pass rate ${t.passRate}%, p95 ${t.p95} ms)`);
  console.log(`Defects: ${defects.length} (${defects.filter(d => d.defectStatus === 'New').length} new, ${defects.filter(d => d.defectStatus === 'Regression').length} regressions)`);
  console.log(`Report:  ${stem}.${pdfError ? 'html' : 'pdf'}`);
  if (pdfError) console.log(`         (${pdfError})`);
  console.log('');

  if (opts.open && process.platform === 'darwin') execFile('open', [pdfError ? `${stem}.html` : `${stem}.pdf`]);
  process.exit(t.fail ? 1 : 0);
}

main().catch(e => {
  console.error(e);
  process.exit(2);
});
