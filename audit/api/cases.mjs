#!/usr/bin/env node
/** Writes audit/TEST_CASES.md, the test case specification, from catalog.mjs. Run: npm run audit:api:cases */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCatalog } from './catalog.mjs';

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'TEST_CASES.md');
const cases = buildCatalog();
const cell = s => String(s ?? '').replace(/\|/g, '\\|');
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

const lines = [
  '# Naseeb Agri API: test case specification',
  '',
  `${cases.length} test cases. Generated from \`audit/api/suite.mjs\`; run \`npm run audit:api:cases\` after editing the suite.`,
  'Severity scale: Blocker > Critical > Normal > Minor > Trivial.',
  '',
];
for (const module of [...new Set(cases.map(c => c.module))]) {
  const rows = cases.filter(c => c.module === module);
  lines.push(`## ${module}`, '', '| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |', '| --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const c of rows) {
    lines.push(`| ${c.tc} | ${cell(c.title)}${c.screen ? `<br><sub>${cell(c.screen)}</sub>` : ''} | ${cell(c.type)} | ${cap(c.severity)} | \`${cell(`${c.method} ${c.path}`)}\` | ${c.auth} | ${cell(c.steps)} | ${cell(c.expected)}${c.runOnly ? ` <sub>(${c.runOnly})</sub>` : ''} |`);
  }
  lines.push('');
}
fs.writeFileSync(OUT, lines.join('\n'));
console.log(`${cases.length} test cases written to ${path.relative(process.cwd(), OUT)}`);
