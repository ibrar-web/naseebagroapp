/**
 * Flattens suite.mjs into numbered test cases (TC-001 …). The report, TEST_CASES.md and the
 * runner all use this, so a test case keeps the same ID everywhere. IDs follow suite order:
 * append new tests at the end of a group to keep existing numbers stable.
 */
import { loadTargets, probes, securityChecks, suite, writeFlows } from './suite.mjs';

const AUTH = { none: 'None', optional: 'Optional', user: 'User' };
const fmtQuery = query => (query ? '?' + decodeURIComponent(new URLSearchParams(query).toString()) : '');
const sample = fn => {
  try { return fn({ id: ':id' }); } catch { return '…'; }
};

export const WRITE_FLOWS = {
  'saved-listing': { title: 'Save then unsave a listing', method: 'POST, DELETE', path: 'profile/saved-listings/:id', steps: 'POST then DELETE profile/saved-listings/:id', expected: 'Listing appears after save and is gone after unsave' },
  favorite: { title: 'Favourite then unfavourite a listing', method: 'POST, DELETE', path: 'buyer/supplies/favorites/:id', steps: 'POST then DELETE buyer/supplies/favorites/:id', expected: 'Listing appears after add and is gone after remove' },
  'toggle-supply': { title: 'Pause then resume my supply post', method: 'PATCH', path: 'seller/supplies/:id/toggle-active', steps: 'PATCH seller/supplies/:id/toggle-active twice', expected: 'Both calls 2xx; post ends in its original state' },
};

export function buildCatalog() {
  const cases = [];
  const add = c => cases.push({ tc: `TC-${String(cases.length + 1).padStart(3, '0')}`, ...c });

  for (const g of suite) {
    for (const ep of g.endpoints) {
      const isList = ep.list !== undefined;
      add({
        key: ep.id, title: ep.name, module: g.group, type: 'Functional', severity: ep.severity || g.severity || 'normal',
        method: 'GET', path: ep.path + fmtQuery(ep.query), auth: AUTH[ep.auth], screen: ep.screen,
        steps: `Call the endpoint${ep.auth === 'user' && isList ? '; try each test account until one returns records' : ''}`,
        expected: ['HTTP 200', isList ? 'returns a list' : 'returns an object', ep.fields?.length ? `fields ${ep.fields.join(', ')}` : null, 'responds < 1 s'].filter(Boolean).join('; ') + (ep.optional ? ' (skipped if not deployed)' : ''),
      });
      for (const d of ep.details || []) {
        const idField = d.idField || 'id';
        const matchesId = d.list === undefined && (d.idField || d.fields?.includes('id'));
        add({
          key: `${ep.id} > ${d.name}`, title: d.name, module: g.group, type: 'Integration (list → detail)', severity: d.severity || ep.severity || g.severity || 'normal',
          method: 'GET', path: sample(d.path) + (d.query ? fmtQuery(sample(d.query)) : ''), auth: AUTH[d.auth || ep.auth], parent: ep.name,
          steps: `Take the first record from "${ep.name}" and open it`,
          expected: ['HTTP 200', d.fields ? `fields ${d.fields.join(', ')}` : null, matchesId ? `${idField} equals the list record id` : null].filter(Boolean).join('; '),
        });
      }
    }
  }
  for (const p of probes) {
    add({ key: p.id, title: p.name, module: 'Negative tests', type: 'Negative', severity: p.severity || 'normal', method: p.method, path: p.path + fmtQuery(p.query), auth: p.token === 'user' ? 'User' : p.token === 'forged' ? 'Forged' : 'None', steps: 'Send the invalid request', expected: `HTTP ${p.expect.join(' or ')}`, defect: p.defect, impact: p.impact, fix: p.fix });
  }
  for (const s of securityChecks) {
    add({ key: s.id, title: s.name, module: 'Security', type: 'Security', severity: s.severity || 'normal', method: s.method || 'POST', path: s.path, auth: 'None', steps: 'Send the request', expected: s.expected, defect: s.defect, impact: s.impact, fix: s.fix, envNote: 'Skipped on production' });
  }
  add({ key: 'socket.connect', title: 'Socket connects with a valid token', module: 'Real-time', type: 'Integration', severity: 'critical', method: 'WS', path: '/', auth: 'User', steps: 'Open a socket.io connection with the user token', expected: 'Connected and still connected after 1.5 s', defect: 'Socket connection with a valid token fails', impact: 'Offers, deals and notifications stop updating live.', fix: 'Check the gateway JWT verification and the load balancer WebSocket upgrade.' });
  add({ key: 'socket.reject', title: 'Socket rejects a forged token', module: 'Real-time', type: 'Security', severity: 'critical', method: 'WS', path: '/', auth: 'Forged', steps: 'Open a socket.io connection with a forged token', expected: 'Connection refused or closed', defect: 'Socket accepts a forged token', impact: 'Anyone could receive private real-time events.', fix: 'Disconnect sockets whose JWT fails verification.' });
  for (const w of writeFlows) {
    const f = WRITE_FLOWS[w];
    add({ key: `write.${w}`, title: f.title, module: 'Write flows', type: 'End-to-end (reversible)', severity: 'critical', method: f.method, path: f.path, auth: 'User', steps: f.steps, expected: f.expected, runOnly: '--write' });
  }
  for (const t of loadTargets) {
    add({ key: `load.${t.path}`, title: `25 concurrent requests: ${t.path}`, module: 'Performance', type: 'Load', severity: 'normal', method: 'GET', path: t.path + fmtQuery(t.query), auth: 'None', steps: 'Send 25 requests at once', expected: 'All HTTP 200; p95 < 1 s (fails > 3 s)', runOnly: '--load', impact: 'Slow or failing screens at peak usage.', fix: 'Paginate in SQL, add indexes, cache reference data.' });
  }
  return cases;
}
