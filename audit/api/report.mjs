/**
 * Renders the audit as a formal Test Summary Report (one self-contained HTML file, printed to PDF).
 * Structure follows IEEE 829 (Test Summary Report) and ISO/IEC/IEEE 29119-3 (Test Completion Report):
 * document control, summary, exit criteria, scope and variances, environment, results, incidents,
 * residual risk, approvals, with test-case results and evidence as appendices.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LOGO = (() => {
  try { return `data:image/png;base64,${fs.readFileSync(path.join(HERE, 'assets', 'logo.png')).toString('base64')}`; } catch { return null; }
})();

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const cap = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
const fmtDate = iso => new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const fmtDay = iso => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const kb = b => (b == null ? '—' : `${(b / 1024).toFixed(1)} KB`);

const OUTCOME = {
  pass: { label: 'Passed', cls: 'pass' },
  warn: { label: 'Passed*', cls: 'warn' },
  fail: { label: 'Failed', cls: 'fail' },
  skip: { label: 'Blocked', cls: 'skip' },
  notrun: { label: 'Not run', cls: 'notrun' },
};
const SEVERITIES = ['blocker', 'critical', 'normal', 'minor', 'trivial'];

const badge = o => `<span class="st ${OUTCOME[o].cls}">${OUTCOME[o].label}</span>`;
const sev = s => `<span class="sev ${s}">${cap(s)}</span>`;

/** Pretty JSON cut to `max` lines so evidence stays readable on paper. */
function jsonBlock(value, max = 36) {
  if (value == null) return '<p class="muted small">No body captured.</p>';
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  const lines = text.split('\n');
  const shown = lines.slice(0, max).join('\n');
  return `<pre class="code">${esc(shown)}${lines.length > max ? `\n<span class="muted">… ${lines.length - max} more lines in the JSON report</span>` : ''}</pre>`;
}

// ── Charts (inline SVG, no libraries) ──────────────────────────────────────

function donut(t) {
  const parts = [
    ['pass', t.pass + t.warn, 'Passed'],
    ['fail', t.fail, 'Failed'],
    ['skip', t.skip, 'Blocked'],
    ['notrun', t.notrun, 'Not run'],
  ].filter(p => p[1] > 0);
  const total = parts.reduce((s, p) => s + p[1], 0) || 1;
  const r = 54, c = 2 * Math.PI * r;
  let offset = 0;
  const arcs = parts.map(([cls, n]) => {
    const len = (n / total) * c;
    const el = `<circle r="${r}" cx="70" cy="70" fill="none" class="arc ${cls}" stroke-width="20" stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-offset}" transform="rotate(-90 70 70)"/>`;
    offset += len;
    return el;
  }).join('');
  const legend = parts.map(([cls, n, label]) => `<div class="lg"><i class="dot ${cls}"></i>${label}<b>${n}</b></div>`).join('');
  return `<div class="donut"><svg viewBox="0 0 140 140" width="132" height="132" role="img" aria-label="Test case status">${arcs}
    <text x="70" y="66" text-anchor="middle" class="d-big">${t.passRate}%</text><text x="70" y="84" text-anchor="middle" class="d-small">pass rate</text></svg>
    <div class="legend">${legend}</div></div>`;
}

function severityBars(defects) {
  const max = Math.max(1, ...SEVERITIES.map(s => defects.filter(d => d.severity === s).length));
  return `<div class="sevbars">${SEVERITIES.map(s => {
    const n = defects.filter(d => d.severity === s).length;
    return `<div class="sb"><span class="sb-l">${cap(s)}</span><span class="sb-track"><span class="sb-fill ${s}" style="width:${(n / max) * 100}%"></span></span><b>${n}</b></div>`;
  }).join('')}</div>`;
}

function stack(m) {
  const total = m.total || 1;
  const seg = (cls, n) => (n ? `<span class="seg ${cls}" style="width:${(n / total) * 100}%"></span>` : '');
  return `<span class="stack">${seg('pass', m.pass + m.warn)}${seg('fail', m.fail)}${seg('skip', m.skip)}${seg('notrun', m.notrun)}</span>`;
}

function slowChart(cases, warnMs, failMs) {
  const rows = cases.filter(c => c.ms != null && c.type !== 'Load' && c.method !== 'WS').sort((a, b) => b.ms - a.ms).slice(0, 12);
  if (!rows.length) return '';
  const max = Math.max(failMs * 0.5, ...rows.map(r => r.ms)) * 1.08;
  const W = 640, L = 250, R = 56, rowH = 22, H = rows.length * rowH + 48;
  const x = v => L + (v / max) * (W - L - R);
  const ticks = [0, 250, 500, 750, 1000, 1500, 2000, 3000].filter(v => v <= max);
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Slowest responses">
    ${ticks.map(v => `<line x1="${x(v)}" x2="${x(v)}" y1="16" y2="${H - 24}" class="grid"/><text x="${x(v)}" y="${H - 8}" text-anchor="middle" class="ax">${v >= 1000 ? `${v / 1000} s` : `${v} ms`}</text>`).join('')}
    ${warnMs <= max ? `<line x1="${x(warnMs)}" x2="${x(warnMs)}" y1="0" y2="${H - 24}" class="ref"/><text x="${x(warnMs) + 4}" y="10" class="ax ref-t">target ${warnMs} ms</text>` : ''}
    ${rows.map((r, i) => {
      const y = 22 + i * rowH;
      return `<text x="${L - 8}" y="${y + 12}" text-anchor="end" class="lbl">${esc(r.tc)} ${esc(r.title.length > 30 ? r.title.slice(0, 29) + '…' : r.title)}</text>
      <rect x="${L}" y="${y + 2}" width="${Math.max(2, x(r.ms) - L)}" height="13" rx="2" class="${r.ms > warnMs ? 'bar-hot' : 'bar'}"/>
      <text x="${x(r.ms) + 5}" y="${y + 12}" class="val">${r.ms} ms</text>`;
    }).join('')}
  </svg>`;
}

function trendChart(trend) {
  if (trend.length < 2) return '<p class="muted">Trend charts appear from the second run onward. This is the first run recorded for this environment.</p>';
  const W = 640, H = 190, L = 40, R = 16, T = 14, B = 46;
  const n = trend.length;
  const pad = 34;
  const x = i => L + pad + (n === 1 ? 0 : (i / (n - 1)) * (W - L - R - pad * 2));
  const y = v => T + (1 - v / 100) * (H - T - B);
  const maxF = Math.max(1, ...trend.map(t => t.totals.fail));
  const bw = Math.min(26, (W - L - R) / n / 2);
  const fy = v => H - B - (v / maxF) * (H - T - B) * 0.45;
  const line = trend.map((t, i) => `${i ? 'L' : 'M'}${x(i)},${y(t.totals.passRate)}`).join(' ');
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Pass rate and failures over recent runs">
    ${[0, 50, 100].map(v => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="${L - 6}" y="${y(v) + 3}" text-anchor="end" class="ax">${v}%</text>`).join('')}
    ${trend.map((t, i) => `<rect x="${x(i) - bw / 2}" y="${fy(t.totals.fail)}" width="${bw}" height="${H - B - fy(t.totals.fail)}" class="bar-fail"><title>${t.totals.fail} failed</title></rect>
      <text x="${x(i)}" y="${fy(t.totals.fail) - 3}" text-anchor="middle" class="val">${t.totals.fail || ''}</text>
      <text x="${x(i)}" y="${H - B + 14}" text-anchor="middle" class="ax">${esc(fmtDay(t.startedAt).slice(0, 6))}</text>
      <text x="${x(i)}" y="${H - B + 26}" text-anchor="middle" class="ax">${esc(new Date(t.startedAt).toTimeString().slice(0, 5))}</text>`).join('')}
    <path d="${line}" class="trend"/>
    ${trend.map((t, i) => `<circle cx="${x(i)}" cy="${y(t.totals.passRate)}" r="${i === n - 1 ? 4 : 3}" class="trend-dot"><title>${t.totals.passRate}%</title></circle>`).join('')}
    <g transform="translate(${L},${H - 8})"><line x1="0" x2="16" y1="-3" y2="-3" class="trend"/><text x="22" y="0" class="ax">Pass rate</text>
    <rect x="96" y="-9" width="10" height="10" class="bar-fail"/><text x="112" y="0" class="ax">Failed test cases</text></g>
  </svg>`;
}

// ── Sections ───────────────────────────────────────────────────────────────

function byModule(cases) {
  const modules = [...new Set(cases.map(c => c.module))];
  return modules.map(module => {
    const rows = cases.filter(c => c.module === module);
    const n = o => rows.filter(r => r.outcome === o).length;
    const executed = rows.filter(r => !['skip', 'notrun'].includes(r.outcome)).length;
    return { module, total: rows.length, pass: n('pass'), warn: n('warn'), fail: n('fail'), skip: n('skip'), notrun: n('notrun'), executed, rate: executed ? Math.round(((n('pass') + n('warn')) / executed) * 100) : null };
  });
}

function summaryText(meta, gate, defects) {
  const t = meta.totals;
  const counts = SEVERITIES.map(s => [s, defects.filter(d => d.severity === s).length]).filter(([, n]) => n);
  const sevText = counts.map(([s, n]) => `${n} ${s}`).join(', ');
  const newCount = defects.filter(d => d.defectStatus === 'New').length;
  const regCount = defects.filter(d => d.defectStatus === 'Regression').length;
  const recommendation = gate.verdict === 'PASSED'
    ? 'All exit criteria are met. The API is fit for release from a testing standpoint.'
    : gate.verdict === 'FAILED'
      ? 'Exit criteria are not met. Release is <b>not recommended</b> until the Blocker and Critical defects below are fixed and re-tested.'
      : 'Release is possible with accepted risk: no Blocker or Critical defects are open, but some exit criteria are not met.';
  return `<p>${t.executed} of ${t.total} test cases were executed against <b>${esc(meta.env)}</b> on ${esc(fmtDate(meta.startedAt))}.
    <b>${t.pass + t.warn}</b> passed and <b>${t.fail}</b> failed, a pass rate of <b>${t.passRate}%</b>. Median response time was ${t.p50} ms (95th percentile ${t.p95} ms).</p>
    <p>${defects.length ? `${defects.length} defect${defects.length === 1 ? ' is' : 's are'} open (${sevText}); ${newCount} new and ${regCount} regression${regCount === 1 ? '' : 's'} since the previous run.` : 'No defects are open.'}
    ${t.notrun ? `${t.notrun} test case${t.notrun === 1 ? ' was' : 's were'} not run (see Variances).` : ''}</p>
    <p class="rec ${gate.verdict === 'PASSED' ? '' : gate.verdict === 'FAILED' ? 'bad' : 'meh'}">${recommendation}</p>`;
}

function defectCard(d) {
  return `<div class="card defect">
    <div class="card-h"><span class="def-id">${esc(d.id)}</span>${sev(d.severity)}<span class="def-title">${esc(d.title)}</span><span class="def-st ${d.defectStatus.toLowerCase()}">${esc(d.defectStatus)}</span></div>
    <table class="kv">
      <tr><th>Test case</th><td>${esc(d.tc)} ${esc(d.testTitle)} · ${esc(d.module === d.type ? d.module : `${d.module}, ${d.type}`)}</td></tr>
      <tr><th>Request</th><td><code>${esc(d.method)} ${esc(d.url || d.path)}</code></td></tr>
      <tr><th>Expected</th><td>${esc(d.expected)}</td></tr>
      <tr><th>Actual</th><td class="fail-t">${esc(d.actual)}</td></tr>
      ${d.impact ? `<tr><th>Impact</th><td>${esc(d.impact)}</td></tr>` : ''}
      ${d.fix ? `<tr><th>Recommended fix</th><td>${esc(d.fix)}</td></tr>` : ''}
      <tr><th>First seen</th><td>${esc(fmtDate(d.firstSeen))}</td></tr>
    </table>
    ${d.response ? `<div class="ev-title">Evidence</div>${jsonBlock(d.response, 10)}` : ''}
  </div>`;
}

function evidence(cases) {
  const lists = cases.filter(c => c.type === 'Functional' && (c.sample || c.response) && c.outcome !== 'notrun');
  const details = cases.filter(c => c.type.startsWith('Integration (list'));
  const modules = [...new Set(lists.map(c => c.module))];
  return modules.map(module => `<h3>${esc(module)}</h3>${lists.filter(c => c.module === module).map(c => {
    const kids = details.filter(d => d.parent === c.title && d.module === module);
    return `<div class="card ev">
      <div class="card-h">${badge(c.outcome)}<span class="def-id">${esc(c.tc)}</span><span class="def-title">${esc(c.title)}</span><span class="muted small">${c.status ?? ''} · ${c.ms ?? '—'} ms · ${kb(c.bytes)}${c.recordCount != null ? ` · ${c.recordCount} record(s)` : ''}</span></div>
      <div class="small muted req"><code>GET ${esc(c.url || c.path)}</code>${c.account && c.account !== 'anonymous' ? ` · account ${esc(c.account)}` : ''}</div>
      ${c.sample ? `<div class="ev-title">First record from the list</div>${jsonBlock(c.sample, 30)}` : `<div class="ev-title">Response</div>${jsonBlock(c.response, 24)}`}
      ${kids.map(k => `<div class="detail">
        <div class="card-h sub">${badge(k.outcome)}<span class="def-id">${esc(k.tc)}</span><span class="def-title">${esc(k.title)}</span><span class="muted small">${k.status ?? ''} · ${k.ms ?? '—'} ms · ${kb(k.bytes)}</span></div>
        ${k.outcome === 'skip' ? `<p class="muted small">${esc(k.actual)}</p>` : `<div class="small muted req"><code>GET ${esc(k.url || k.path)}</code></div>${jsonBlock(k.response, 30)}`}
      </div>`).join('')}
    </div>`;
  }).join('')}`).join('');
}

// ── Document ───────────────────────────────────────────────────────────────

export function renderReport({ meta, gate, defects, cases, trend }) {
  const t = meta.totals;
  const modules = byModule(cases);
  const notRun = cases.filter(c => c.outcome === 'notrun' || c.outcome === 'skip');
  const warnings = cases.filter(c => c.outcome === 'warn');
  const load = cases.filter(c => c.type === 'Load' && c.outcome !== 'notrun');
  const verdictCls = gate.verdict === 'PASSED' ? 'pass' : gate.verdict === 'FAILED' ? 'fail' : 'warn';
  const types = [...new Set(cases.map(c => c.type))];
  const footerId = `${meta.reportId} · ${meta.org} · Internal`;

  const toc = [
    ['1', 'Executive summary'], ['2', 'Exit criteria evaluation'], ['3', 'Scope, approach and variances'], ['4', 'Test environment'],
    ['5', 'Results by module'], ['6', 'Defect log'], ['7', 'Performance'], ['8', 'Trend across runs'],
    ['9', 'Residual risks and recommendations'], ['10', 'Approvals'], ['A', 'Appendix A: Test case results'], ['B', 'Appendix B: Response evidence'],
  ];

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(meta.title)} ${esc(meta.reportId)}</title>
<style>
  @page { size: A4; margin: 18mm 15mm 18mm 15mm;
    @top-left { content: "${esc(meta.org)}"; font: 600 7.5pt -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1A6B34; }
    @top-right { content: "${esc(meta.title)}"; font: 7.5pt -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #667085; }
    @bottom-left { content: "${esc(footerId)}"; font: 7.5pt -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #667085; }
    @bottom-right { content: "Page " counter(page) " of " counter(pages); font: 7.5pt -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #667085; } }
  @page :first { margin: 0; @top-left { content: none; } @top-right { content: none; } @bottom-left { content: none; } @bottom-right { content: none; } }

  :root { --ink:#101828; --ink2:#344054; --muted:#667085; --line:#EAECF0; --soft:#F9FAFB; --brand:#1A6B34; --brand2:#E8F3EC; --navy:#0B2537;
          --pass:#067647; --pass-bg:#ECFDF3; --fail:#B42318; --fail-bg:#FEF3F2; --warn:#B54708; --warn-bg:#FFFAEB; --skip:#475467; --skip-bg:#F2F4F7; --notrun:#98A2B3; }
  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; color: var(--ink); background: #E4E7EC; font: 9.5pt/1.5 -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  .doc { max-width: 210mm; margin: 0 auto; background: #fff; }
  .page { padding: 0 0 4mm; }
  @media screen { .doc { margin: 24px auto; box-shadow: 0 4px 24px rgba(16,24,40,.12); } .page { padding: 16mm 15mm 8mm; } .cover { min-height: 297mm; } }
  .break { break-before: page; }
  h1, h2, h3 { color: var(--navy); margin: 0; }
  h2 { font-size: 15pt; padding-bottom: 6px; border-bottom: 2px solid var(--brand); margin: 0 0 12px; display: flex; gap: 10px; align-items: baseline; }
  h2 .no { color: var(--brand); font-weight: 700; min-width: 22px; }
  h3 { font-size: 11pt; margin: 18px 0 8px; break-after: avoid; }
  h2 { break-after: avoid; }
  section { margin-bottom: 22px; }
  p { margin: 0 0 8px; color: var(--ink2); }
  .muted { color: var(--muted); } .small { font-size: 8pt; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 8pt; word-break: break-all; }

  /* Cover */
  .cover { position: relative; height: 297mm; padding: 0; overflow: hidden; display: flex; flex-direction: column; break-after: page; }
  .cover-band { background: var(--navy); color: #fff; padding: 26mm 20mm 18mm; }
  .cover-band .brand { display: flex; align-items: center; gap: 14px; margin-bottom: 30mm; }
  .cover-band .brand img { width: 46px; height: 46px; border-radius: 10px; background: #fff; padding: 4px; }
  .cover-band .brand span { font-size: 13pt; font-weight: 600; letter-spacing: .02em; }
  .cover-band .kicker { text-transform: uppercase; letter-spacing: .14em; font-size: 8.5pt; color: #9FD3B0; margin-bottom: 8px; }
  .cover-band h1 { color: #fff; font-size: 30pt; line-height: 1.15; font-weight: 700; margin-bottom: 8px; }
  .cover-band .sub { font-size: 12pt; color: #C7D2DA; }
  .cover-accent { height: 6px; background: linear-gradient(90deg, var(--brand), #4CAF72); }
  .cover-body { padding: 14mm 20mm; flex: 1; display: flex; flex-direction: column; }
  .verdict { display: inline-flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 8px; font-weight: 700; font-size: 13pt; letter-spacing: .03em; margin-bottom: 12mm; align-self: flex-start; }
  .verdict small { font-weight: 500; font-size: 9pt; letter-spacing: 0; opacity: .85; }
  .verdict.pass { background: var(--pass-bg); color: var(--pass); border: 1px solid #ABEFC6; }
  .verdict.fail { background: var(--fail-bg); color: var(--fail); border: 1px solid #FECDCA; }
  .verdict.warn { background: var(--warn-bg); color: var(--warn); border: 1px solid #FEDF89; }
  .facts { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
  .facts th { text-align: left; color: var(--muted); font-weight: 500; width: 38%; padding: 7px 0; border-bottom: 1px solid var(--line); }
  .facts td { padding: 7px 0; border-bottom: 1px solid var(--line); font-weight: 500; }
  .cover-foot { margin-top: auto; font-size: 8pt; color: var(--muted); border-top: 1px solid var(--line); padding-top: 8px; }

  /* Tables */
  table.t { width: 100%; border-collapse: collapse; font-size: 8.5pt; margin: 4px 0 10px; }
  table.t th { background: var(--soft); color: var(--ink2); text-align: left; font-weight: 600; padding: 6px 8px; border-bottom: 1px solid #D0D5DD; }
  table.t td { padding: 6px 8px; border-bottom: 1px solid var(--line); vertical-align: top; }
  table.t tr { break-inside: avoid; }
  table.t thead { display: table-header-group; }
  table.t.compact td, table.t.compact th { padding: 4px 6px; font-size: 7.5pt; }
  .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  table.kv { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
  table.kv th { text-align: left; color: var(--muted); font-weight: 500; width: 120px; padding: 3px 8px 3px 0; vertical-align: top; }
  table.kv td { padding: 3px 0; }

  /* Status & severity */
  .st { display: inline-block; min-width: 54px; text-align: center; font-size: 7.5pt; font-weight: 600; border-radius: 10px; padding: 1px 7px; }
  .st.pass { background: var(--pass-bg); color: var(--pass); } .st.warn { background: var(--warn-bg); color: var(--warn); }
  .st.fail { background: var(--fail-bg); color: var(--fail); } .st.skip { background: var(--skip-bg); color: var(--skip); } .st.notrun { background: #fff; color: var(--notrun); border: 1px dashed #D0D5DD; }
  .sev { display: inline-block; font-size: 7.5pt; font-weight: 600; border-radius: 4px; padding: 1px 6px; }
  .sev.blocker { background: #7A271A; color: #fff; } .sev.critical { background: var(--fail); color: #fff; } .sev.normal { background: #FEF0C7; color: #93370D; }
  .sev.minor { background: #EFF8FF; color: #175CD3; } .sev.trivial { background: var(--skip-bg); color: var(--skip); }
  .fail-t { color: var(--fail); font-weight: 500; } .pass-t { color: var(--pass); font-weight: 600; }

  /* KPIs & charts */
  .kpis { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin: 12px 0 14px; }
  .kpi { border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; }
  .kpi b { display: block; font-size: 16pt; line-height: 1.2; color: var(--navy); }
  .kpi span { font-size: 7.5pt; color: var(--muted); }
  .kpi.fail b { color: var(--fail); } .kpi.pass b { color: var(--pass); }
  .two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .panel { border: 1px solid var(--line); border-radius: 8px; padding: 10px 12px; break-inside: avoid; }
  .panel h4 { margin: 0 0 8px; font-size: 8.5pt; color: var(--muted); text-transform: uppercase; letter-spacing: .05em; }
  .donut { display: flex; align-items: center; gap: 16px; }
  .arc.pass { stroke: #17B26A; } .arc.fail { stroke: #F04438; } .arc.skip { stroke: #98A2B3; } .arc.notrun { stroke: #E4E7EC; }
  .d-big { font: 700 18px -apple-system, "Segoe UI", Roboto, sans-serif; fill: var(--navy); } .d-small { font: 9px -apple-system, sans-serif; fill: var(--muted); }
  .legend .lg { display: flex; align-items: center; gap: 6px; font-size: 8.5pt; margin: 3px 0; } .legend b { margin-left: auto; padding-left: 14px; }
  .dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
  .dot.pass { background: #17B26A; } .dot.fail { background: #F04438; } .dot.skip { background: #98A2B3; } .dot.notrun { background: #E4E7EC; }
  .sevbars .sb { display: grid; grid-template-columns: 64px 1fr 22px; gap: 8px; align-items: center; font-size: 8.5pt; margin: 5px 0; }
  .sb-track { height: 10px; background: var(--soft); border-radius: 3px; overflow: hidden; } .sb-fill { display: block; height: 100%; }
  .sb-fill.blocker { background: #7A271A; } .sb-fill.critical { background: #F04438; } .sb-fill.normal { background: #F79009; } .sb-fill.minor { background: #2E90FA; } .sb-fill.trivial { background: #98A2B3; }
  .sevbars b { text-align: right; }
  .stack { display: flex; height: 9px; width: 120px; border-radius: 3px; overflow: hidden; background: var(--soft); }
  .seg.pass { background: #17B26A; } .seg.fail { background: #F04438; } .seg.skip { background: #98A2B3; } .seg.notrun { background: #E4E7EC; }
  .chart { width: 100%; height: auto; font-family: -apple-system, "Segoe UI", Roboto, sans-serif; }
  .chart .grid { stroke: #EAECF0; } .chart .ax { font-size: 9px; fill: #667085; } .chart .lbl { font-size: 9.5px; fill: #344054; } .chart .val { font-size: 9px; fill: #344054; }
  .chart .bar { fill: #84ADFF; } .chart .bar-hot { fill: #F04438; } .chart .bar-fail { fill: #FDA29B; } .chart .ref { stroke: #F79009; stroke-dasharray: 4 3; } .chart .ref-t { fill: #B54708; }
  .chart .trend { fill: none; stroke: var(--brand); stroke-width: 2; } .chart .trend-dot { fill: var(--brand); }
  .rec { background: var(--brand2); border-left: 3px solid var(--brand); padding: 8px 12px; border-radius: 0 6px 6px 0; color: var(--ink); }
  .rec.bad { background: var(--fail-bg); border-left-color: var(--fail); } .rec.meh { background: var(--warn-bg); border-left-color: #F79009; }
  .keep { break-inside: avoid; }
  td.id, th.id { white-space: nowrap; }
  table.t.compact code { word-break: normal; overflow-wrap: anywhere; }

  /* Cards */
  .card { border: 1px solid var(--line); border-radius: 8px; padding: 10px 12px; margin: 0 0 10px; break-inside: avoid; }
  .card.ev { break-inside: auto; }
  .card-h { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
  .card-h.sub { margin-top: 4px; }
  .def-id { font-weight: 700; color: var(--navy); font-size: 8.5pt; }
  .def-title { font-weight: 600; flex: 1; }
  .def-st { font-size: 7.5pt; font-weight: 600; border-radius: 10px; padding: 1px 8px; background: var(--skip-bg); color: var(--skip); }
  .def-st.new { background: #EFF8FF; color: #175CD3; } .def-st.regression { background: var(--fail-bg); color: var(--fail); } .def-st.recurring { background: var(--warn-bg); color: var(--warn); }
  .ev-title { font-size: 7.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); margin: 8px 0 3px; }
  pre.code { background: #F8FAFC; border: 1px solid var(--line); border-radius: 6px; padding: 8px 10px; margin: 0; font: 7.3pt/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; white-space: pre-wrap; word-break: break-word; color: #1D2939; }
  .detail { border-top: 1px dashed var(--line); margin-top: 10px; padding-top: 6px; }
  .req { margin: 2px 0 4px; }
  .toc { list-style: none; padding: 0; margin: 0; columns: 2; column-gap: 24px; }
  .toc li { display: flex; gap: 10px; padding: 5px 0; border-bottom: 1px dotted #D0D5DD; break-inside: avoid; }
  .toc li span { color: var(--brand); font-weight: 700; min-width: 20px; }
  .sign td { height: 34px; }
  ul.tight { margin: 4px 0 8px; padding-left: 18px; color: var(--ink2); } ul.tight li { margin: 2px 0; }
</style>
</head>
<body>
<div class="doc">

<!-- Cover -->
<div class="cover">
  <div class="cover-band">
    <div class="brand">${LOGO ? `<img src="${LOGO}" alt="">` : ''}<span>${esc(meta.org)}</span></div>
    <div class="kicker">Quality Assurance</div>
    <h1>${esc(meta.title)}</h1>
    <div class="sub">${esc(meta.product)}</div>
  </div>
  <div class="cover-accent"></div>
  <div class="cover-body">
    <div class="verdict ${verdictCls}">${esc(gate.verdict)} <small>${t.pass + t.warn}/${t.executed} passed · ${defects.length} open defect${defects.length === 1 ? '' : 's'}</small></div>
    <table class="facts">
      <tr><th>Report ID</th><td>${esc(meta.reportId)}</td></tr>
      <tr><th>Version</th><td>1.0 (automatically generated)</td></tr>
      <tr><th>Test environment</th><td>${esc(cap(meta.env))}</td></tr>
      <tr><th>API base URL</th><td>${esc(meta.baseUrl)}</td></tr>
      <tr><th>Test execution</th><td>${esc(fmtDate(meta.startedAt))} (${Math.round(meta.durationMs / 1000)} s)</td></tr>
      <tr><th>Test cases</th><td>${t.total} total · ${t.executed} executed</td></tr>
      <tr><th>Prepared by</th><td>${esc(meta.preparedBy)}</td></tr>
      <tr><th>Classification</th><td>Internal: contains system details</td></tr>
    </table>
    <div class="cover-foot">Structure based on IEEE 829 Test Summary Report and ISO/IEC/IEEE 29119-3 Test Completion Report. Sensitive values (tokens, passwords, IBANs, CNICs, account numbers) are masked.</div>
  </div>
</div>

<!-- Document control + contents -->
<div class="page">
  <section>
    <h2>Document control</h2>
    <table class="t">
      <tr><th style="width:30%">Report ID</th><td>${esc(meta.reportId)}</td></tr>
      <tr><th>Document type</th><td>Test Summary Report (API)</td></tr>
      <tr><th>Status</th><td>Issued for review</td></tr>
      <tr><th>Test suite revision</th><td>${esc(meta.suiteRevision || '—')}</td></tr>
      <tr><th>Prepared by</th><td>${esc(meta.preparedBy)}</td></tr>
      <tr><th>Reviewed by</th><td>&nbsp;</td></tr>
      <tr><th>Approved by</th><td>&nbsp;</td></tr>
    </table>
    <h3>Revision history</h3>
    <table class="t">
      <thead><tr><th>Version</th><th>Date</th><th>Author</th><th>Description</th></tr></thead>
      <tr><td>1.0</td><td>${esc(fmtDay(meta.startedAt))}</td><td>${esc(meta.preparedBy)}</td><td>Generated by automated test run ${esc(meta.reportId)}</td></tr>
    </table>
  </section>
  <section>
    <h2>Contents</h2>
    <ul class="toc">${toc.map(([n, s]) => `<li><span>${n}</span>${esc(s)}</li>`).join('')}</ul>
  </section>
</div>

<!-- 1 Executive summary -->
<div class="page break">
  <section>
    <h2><span class="no">1</span>Executive summary</h2>
    ${summaryText(meta, gate, defects)}
    <div class="kpis">
      <div class="kpi"><b>${t.total}</b><span>Test cases</span></div>
      <div class="kpi"><b>${t.executed}</b><span>Executed</span></div>
      <div class="kpi pass"><b>${t.pass + t.warn}</b><span>Passed</span></div>
      <div class="kpi fail"><b>${t.fail}</b><span>Failed</span></div>
      <div class="kpi"><b>${t.passRate}%</b><span>Pass rate</span></div>
      <div class="kpi"><b>${t.p95} ms</b><span>p95 response</span></div>
    </div>
    <div class="two">
      <div class="panel"><h4>Test case status</h4>${donut(t)}</div>
      <div class="panel"><h4>Open defects by severity</h4>${severityBars(defects)}</div>
    </div>
    ${defects.length ? `<h3>Key defects</h3>
    <table class="t"><thead><tr><th>ID</th><th>Severity</th><th>Defect</th><th>Status</th></tr></thead>
    ${defects.slice(0, 6).map(d => `<tr><td class="id"><b>${esc(d.id)}</b></td><td>${sev(d.severity)}</td><td>${esc(d.title)}<div class="small muted">${esc(d.testTitle)}: ${esc(d.actual)}</div></td><td>${esc(d.defectStatus)}</td></tr>`).join('')}</table>` : ''}
  </section>

  <!-- 2 Exit criteria -->
  <section class="keep">
    <h2><span class="no">2</span>Exit criteria evaluation</h2>
    <p>The run is assessed against the following quality gate. Overall verdict: <b class="${verdictCls === 'pass' ? 'pass-t' : 'fail-t'}">${esc(gate.verdict)}</b>.</p>
    <table class="t"><thead><tr><th>Criterion</th><th class="num">Actual</th><th class="num">Result</th></tr></thead>
    ${gate.criteria.map(c => `<tr><td>${esc(c.name)}</td><td class="num">${esc(c.actual)}</td><td class="num">${c.met ? '<span class="pass-t">✓ Met</span>' : '<span class="fail-t">✕ Not met</span>'}</td></tr>`).join('')}</table>
  </section>
</div>

<!-- 3 Scope -->
<div class="page break">
  <section>
    <h2><span class="no">3</span>Scope, approach and variances</h2>
    <p>The test object is the REST and WebSocket API used by the Naseeb Agri mobile app. Each list endpoint's first record is opened through its detail endpoints to verify the list and detail views agree.</p>
    <h3>In scope</h3>
    <table class="t"><thead><tr><th>Module</th><th class="num">Test cases</th><th>Test types</th></tr></thead>
    ${modules.map(m => `<tr><td>${esc(m.module)}</td><td class="num">${m.total}</td><td>${esc([...new Set(cases.filter(c => c.module === m.module).map(c => c.type))].join(', '))}</td></tr>`).join('')}</table>
    <h3>Test types</h3>
    <ul class="tight">${types.map(ty => `<li><b>${esc(ty)}</b>: ${{
      Functional: 'status code, response envelope, required fields, response time and payload size of each endpoint the app calls.',
      'Integration (list → detail)': 'first record of a list opened through its detail endpoints; detail must return the same record.',
      Negative: 'invalid tokens, wrong roles, malformed parameters and unknown resources must be rejected correctly.',
      Security: 'checks for known weaknesses: public API documentation, socket authentication.',
      Integration: 'real-time socket connection with a valid token.',
      'End-to-end (reversible)': 'user journeys that change data and then restore it.',
      Load: 'concurrent requests on the busiest public endpoints.',
    }[ty] || (ty.startsWith('API') ? 'OWASP API Security Top 10 (2023) category; see owasp.org/API-Security.' : '')}</li>`).join('')}</ul>
    <h3>Out of scope</h3>
    <ul class="tight"><li>Mobile app user interface and device testing.</li><li>Admin panel APIs, except as authorisation probes.</li><li>Data-changing tests other than the reversible flows listed; payment, upload and deal-stage transitions.</li><li>Sustained load, soak and penetration testing.</li></ul>
    <h3>Variances</h3>
    ${notRun.length ? `<table class="t"><thead><tr><th>ID</th><th>Test case</th><th>Reason</th></tr></thead>${notRun.map(c => `<tr><td>${esc(c.tc)}</td><td>${esc(c.title)}</td><td>${esc(c.actual)}</td></tr>`).join('')}</table>` : '<p>All planned test cases were executed.</p>'}
  </section>

  <!-- 4 Environment -->
  <section>
    <h2><span class="no">4</span>Test environment</h2>
    <table class="t">
      <tr><th style="width:30%">Environment</th><td>${esc(cap(meta.env))}</td></tr>
      <tr><th>API base URL</th><td>${esc(meta.baseUrl)}</td></tr>
      <tr><th>Execution window</th><td>${esc(fmtDate(meta.startedAt))} to ${esc(fmtDate(meta.finishedAt))}</td></tr>
      <tr><th>Test accounts</th><td>${meta.accounts.length} (${meta.accounts.filter(a => a.ok).length} logged in successfully)</td></tr>
      <tr><th>Options</th><td>Write flows ${meta.options.write ? 'on' : 'off'} · Load test ${meta.options.load ? `on (${meta.options.concurrency} concurrent)` : 'off'} · Security checks ${meta.options.security ? 'on' : 'off'}</td></tr>
      <tr><th>Thresholds</th><td>Warning above ${meta.options.warnMs} ms, failure above ${meta.options.failMs} ms, timeout ${meta.options.timeoutMs / 1000} s</td></tr>
      <tr><th>Test runner</th><td>Naseeb API audit · ${esc(meta.runner)}</td></tr>
    </table>
  </section>
</div>

<!-- 5 Results by module -->
<div class="page break">
  <section>
    <h2><span class="no">5</span>Results by module</h2>
    <table class="t"><thead><tr><th>Module</th><th class="num">Total</th><th class="num">Passed</th><th class="num">Failed</th><th class="num">Blocked</th><th class="num">Not run</th><th class="num">Pass rate</th><th>Distribution</th></tr></thead>
    ${modules.map(m => `<tr><td>${esc(m.module)}</td><td class="num">${m.total}</td><td class="num">${m.pass + m.warn}</td><td class="num ${m.fail ? 'fail-t' : ''}">${m.fail}</td><td class="num">${m.skip}</td><td class="num">${m.notrun}</td><td class="num">${m.rate == null ? '—' : `${m.rate}%`}</td><td>${stack(m)}</td></tr>`).join('')}
    <tr><td><b>Total</b></td><td class="num"><b>${t.total}</b></td><td class="num"><b>${t.pass + t.warn}</b></td><td class="num"><b>${t.fail}</b></td><td class="num"><b>${t.skip}</b></td><td class="num"><b>${t.notrun}</b></td><td class="num"><b>${t.passRate}%</b></td><td></td></tr></table>
    <p class="small muted">Blocked: the test could not run because the API returned no data or the endpoint is not deployed. Passed* in Appendix A marks a pass with a non-blocking warning.</p>
  </section>

  <!-- 6 Defects -->
  <section>
    <h2><span class="no">6</span>Defect log</h2>
    ${defects.length ? `<table class="t"><thead><tr><th>ID</th><th>Severity</th><th>Title</th><th>Test case</th><th>Module</th><th>Status</th><th>First seen</th></tr></thead>
      ${defects.map(d => `<tr><td class="id"><b>${esc(d.id)}</b></td><td>${sev(d.severity)}</td><td>${esc(d.title)}</td><td class="id">${esc(d.tc)}</td><td>${esc(d.module)}</td><td>${esc(d.defectStatus)}</td><td class="num">${esc(fmtDay(d.firstSeen))}</td></tr>`).join('')}</table>
      <h3>Defect details</h3>${defects.map(defectCard).join('')}` : '<p>No defects were found in this run.</p>'}
  </section>
</div>

<!-- 7 Performance + 8 Trend -->
<div class="page break">
  <section>
    <h2><span class="no">7</span>Performance</h2>
    <p>Median response time ${t.p50} ms; 95th percentile ${t.p95} ms (target ≤ ${meta.options.warnMs} ms). Times include the network round trip from the test runner.</p>
    <div class="panel"><h4>Slowest responses (single request)</h4>${slowChart(cases, meta.options.warnMs, meta.options.failMs)}</div>
    <h3>Load test</h3>
    ${load.length ? `<table class="t"><thead><tr><th>ID</th><th>Endpoint</th><th class="num">p50</th><th class="num">p95</th><th>Result</th></tr></thead>
      ${load.map(c => `<tr><td>${esc(c.tc)}</td><td><code>${esc(c.path)}</code></td><td class="num">${c.ms} ms</td><td class="num">${c.p95 ?? '—'} ms</td><td>${badge(c.outcome)}</td></tr>`).join('')}</table>` : '<p class="muted">Load test not run in this cycle (run with --load).</p>'}
  </section>
  <section>
    <h2><span class="no">8</span>Trend across runs</h2>
    <div class="panel">${trendChart(trend)}</div>
  </section>
</div>

<!-- 9 Risks + 10 Approvals -->
<div class="page break">
  <section>
    <h2><span class="no">9</span>Residual risks and recommendations</h2>
    ${defects.length ? `<table class="t"><thead><tr><th>Risk</th><th>Severity</th><th>Impact</th><th>Recommendation</th></tr></thead>
      ${defects.map(d => `<tr><td><b>${esc(d.id)}</b> ${esc(d.title)}</td><td>${sev(d.severity)}</td><td>${esc(d.impact || 'Feature does not behave as specified.')}</td><td>${esc(d.fix || 'Investigate the failing request in Appendix B and fix the endpoint.')}</td></tr>`).join('')}</table>` : '<p>No open defects. Residual risk is limited to the out-of-scope areas listed in section 3.</p>'}
    ${notRun.length ? `<p><b>Untested areas:</b> ${notRun.length} test case${notRun.length === 1 ? '' : 's'} did not run (section 3); their behaviour in this build is unverified.</p>` : ''}
    ${warnings.length ? `<p><b>Warnings:</b> ${warnings.map(w => `${esc(w.tc)} ${esc(w.title)}`).join('; ')}.</p>` : ''}
  </section>
  <section>
    <h2><span class="no">10</span>Approvals</h2>
    <p>By signing, reviewers confirm this report accurately reflects the tested build and accept the residual risks listed above.</p>
    <table class="t sign"><thead><tr><th style="width:24%">Role</th><th style="width:28%">Name</th><th style="width:28%">Signature</th><th>Date</th></tr></thead>
      <tr><td>QA lead</td><td></td><td></td><td></td></tr>
      <tr><td>Engineering lead</td><td></td><td></td><td></td></tr>
      <tr><td>Product owner</td><td></td><td></td><td></td></tr>
    </table>
  </section>
</div>

<!-- Appendix A -->
<div class="page break">
  <section>
    <h2><span class="no">A</span>Appendix A: Test case results</h2>
    ${[...new Set(cases.map(c => c.module))].map(module => `<h3>${esc(module)}</h3>
    <table class="t compact"><thead><tr><th class="id">ID</th><th style="width:34%">Test case</th><th>Severity</th><th>Result</th><th class="num">HTTP</th><th class="num">Time</th><th>Actual result</th></tr></thead>
    ${cases.filter(c => c.module === module).map(c => `<tr><td class="id"><b>${esc(c.tc)}</b></td><td>${esc(c.title)}<div class="muted"><code>${esc(c.method)} ${esc(c.path)}</code></div></td><td>${sev(c.severity)}</td><td>${badge(c.outcome)}</td><td class="num">${c.status ?? '—'}</td><td class="num">${c.ms != null ? `${c.ms} ms` : '—'}</td><td class="${c.outcome === 'fail' ? 'fail-t' : ''}">${esc(c.actual || '')}</td></tr>`).join('')}</table>`).join('')}
  </section>
</div>

<!-- Appendix B -->
<div class="page break">
  <section>
    <h2><span class="no">B</span>Appendix B: Response evidence</h2>
    <p>For each list endpoint: the first record returned, then the response of each detail endpoint opened for that record. Long responses are shortened; the complete data is in the JSON report (${esc(meta.reportId)}.json).</p>
    ${evidence(cases)}
  </section>
</div>

</div>
</body>
</html>`;
}
