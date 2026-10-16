# API audit

One command tests every API the app uses and writes an HTML report.

```bash
cp audit/.env.audit.example audit/.env.audit   # once: set test accounts
npm run audit:api        # read-only, opens the report
npm run audit:api:full   # + reversible write flows + 25-concurrent load test
```

Also available as VS Code tasks (**Terminal › Run Task › API audit**) and as a GitHub Action
(**Actions › API audit › Run workflow**, needs the `AUDIT_USERS` secret).

## What it checks

- **Every app endpoint** (`api/suite.mjs`): HTTP status, response envelope, required fields, response time, payload size.
- **List → detail**: takes the first record of each list and calls its detail endpoints (e.g. deal → detail, payments, trucks), checking the detail is the same record.
- **Accounts**: tries each account in `AUDIT_USERS` until one has records, so list several with different data.
- **Negative tests**: missing/forged tokens, wrong role, bad params, unknown ids.
- **Security** (not on production): OTP bypass, public API docs.
- **Real-time**: socket connects with a valid token and rejects a forged one.
- `--write`: save/unsave and favourite/unfavourite a listing, pause/resume a supply post. Each flow restores what it changed.
- `--load`: 25 concurrent requests to the browse endpoints, p50/p95.

## Reports

Every run writes a formal **API Test Summary Report** to `audit/reports/` (git-ignored):

- `NA-API-TSR-<date><time>_<env>.pdf`: the A4 document to share (opened automatically with `npm run audit:api`)
- the same report as `.html`, and `.json` with the full raw data
- `history.json`: a small log of past results, used for the trend chart and New / Recurring / Regression labels

Each run deletes the previous reports, so the folder only holds the current run. To keep more, set
`AUDIT_KEEP_REPORTS=5` in `audit/.env.audit`.

The structure follows IEEE 829 (Test Summary Report) and ISO/IEC/IEEE 29119-3 (Test Completion Report):
cover with verdict, document control, executive summary, exit criteria (quality gate), scope and variances,
environment, results by module, defect log (severity, New / Recurring / Regression, first seen, impact, fix),
performance, trend across runs, residual risks, approval sign-off, and appendices with every test case result
and the list-record / detail-response evidence. Severity uses the Allure scale: Blocker, Critical, Normal, Minor, Trivial.

Verdict: **PASSED** when all exit criteria are met, **FAILED** when a Blocker or Critical defect is open,
otherwise **PASSED WITH ISSUES**. The PDF needs Chrome, Edge or Chromium; without one you still get the HTML.

## Options

`--env=local|development|production` · `--base=https://host/api/v1` · `--write` · `--load` · `--open` · `--no-security`
Production refuses `--write`/`--load` unless `--force` is added.

## Adding an endpoint

Add an entry to `api/suite.mjs`; the comment at the top lists the fields. Nothing else changes.

The test case specification (IDs TC-001…, severity, steps, expected result) is in [TEST_CASES.md](TEST_CASES.md) (`npm run audit:api:cases` regenerates it).
