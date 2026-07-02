# Project Rules

These rules are enforced by tooling, not just code review. Violations fail CI.

---

## 1. Automated Enforcement: Structure is Checked by CI, Not Just Review

| Rule | Tool | How it's enforced |
|---|---|---|
| Import direction (no importing controllers from services, etc.) | eslint-plugin-import + custom rules | ESLint fails in CI |
| Component line limit (200 lines max) | eslint `max-lines` rule | ESLint fails in CI |
| File naming conventions | eslint-plugin-filenames | ESLint fails in CI |
| No `../../../` deep imports (max 2 levels) | eslint `no-restricted-imports` | ESLint fails in CI |
| TypeScript formatting | prettier --check | CI fails if formatting differs |
| Flutter lint rules | flutter analyze | CI fails on lint errors |

---

## 2. File Naming Conventions

| File type | Convention | Example |
|---|---|---|
| React components | `PascalCase.tsx` | `UserProfile.tsx` |
| Hooks | `camelCase.ts` prefixed with `use` | `useAuth.ts` |
| Utilities / helpers | `camelCase.ts` | `formatDate.ts` |
| Types files | `camelCase.types.ts` | `user.types.ts` |
| Test files | same name as the file under test + `.test.tsx` | `Button.test.tsx` |
| API routes | `route.ts` (App Router convention — do not deviate) | `route.ts` |
| Constants | `SCREAMING_SNAKE_CASE` for values, `camelCase.ts` for the file | `appConfig.ts` |

---

## 3. Component Architecture Rules

1. **One primary component per file**, exported as a named export.
2. **Default exports only** at `page.tsx` and `layout.tsx` level (Next.js requires it).
3. **200-line limit per component file.** If a component exceeds this, extract sub-components.
4. **Co-locate tests** with the component: `Button.tsx` and `Button.test.tsx` in the same folder.
5. **Co-locate component-specific types** inside the component file unless shared — then move to `types/`.
6. **No deep relative imports** (`../../..` more than 2 levels). Use path aliases (`@/components/...`) configured in `tsconfig.json`.

---

## 4. Import Rules

```ts
// BAD — more than 2 levels deep
import { formatDate } from '../../../utils/formatDate';

// GOOD — use path alias
import { formatDate } from '@/utils/formatDate';
```

Aliases are defined in `tsconfig.json` under `compilerOptions.paths`.

---

## 5. Export Rules

```ts
// BAD — anonymous default export in a shared component
export default () => <div />;

// GOOD — named export for shared components
export const Button = () => <div />;

// OK — default export only for pages and layouts
export default function HomePage() { ... }
```

---

## 6. Constants

```ts
// constants/appConfig.ts
export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // SCREAMING_SNAKE_CASE value
export const API_TIMEOUT_MS = 10_000;
```

---

## 7. Backend (NestJS) Rules

- **No raw SQL in controllers.** All queries belong in services.
- **No importing service classes across module boundaries** without registering in the module's providers/imports.
- **Entities define the source of truth** for column names. SQL queries must match entity column names exactly.
- **DTOs validate all external input** (`class-validator` decorators required on every DTO property).
- When a column is removed from an entity, update all raw queries in services that reference it in the same commit.

---

## 8. Git / PR Rules

- **One concern per PR.** Bug fixes and feature work go in separate PRs.
- **No force-push to `main`.**
- **Migration files are immutable** once merged to `main` — never edit a committed migration. Add a new one.
- **Every DB schema change needs a migration.** TypeORM `synchronize: true` is for development only; it must be `false` in production.
