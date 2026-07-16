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

## 7. HTTP Response Status Codes

All backend endpoints **must** follow RFC 9110. Using the wrong status code causes the frontend interceptor to mishandle responses (e.g. triggering logout on a wrong password).

### Success
| Code | When to use |
|---|---|
| `200 OK` | GET, PATCH, PUT, DELETE — request succeeded |
| `201 Created` | POST that creates a new resource |

### Client Errors
| Code | NestJS exception | When to use |
|---|---|---|
| `400 Bad Request` | `BadRequestException` | Invalid/missing input, validation failure, wrong password, bad token format |
| `401 Unauthorized` | `UnauthorizedException` | **No identity** — missing, invalid, or expired JWT token. Login failures (wrong email/password at the login endpoint). **Nothing else.** |
| `403 Forbidden` | `ForbiddenException` | Identity is known (user is logged in) but they lack permission — e.g. "not your offer", KYC not complete, account restricted |
| `404 Not Found` | `NotFoundException` | Resource does not exist — user not found, listing not found, etc. |
| `405 Method Not Allowed` | `MethodNotAllowedException` | HTTP method not supported on the endpoint |
| `409 Conflict` | `ConflictException` | Duplicate — already exists, unique constraint violation |

### Hard Rules
- **401 is ONLY for authentication failures** (bad/missing token, login with wrong credentials). Never for "you can't do this action".
- **403 is for authorization failures** — user is authenticated but not allowed. KYC check, restricted account, ownership check.
- **400 is for bad input** — wrong current password, invalid field value, malformed request.
- **404 is for missing resources** — never use `ForbiddenException('User not found')` when the resource simply doesn't exist.
- **Never** throw `UnauthorizedException` inside a service method that is already behind `AuthTokenGuard` — the user is authenticated by the time the service runs; use `ForbiddenException` or `BadRequestException` instead.

### Examples
```typescript
// ✅ Correct
if (!user) throw new NotFoundException('User not found');             // 404
if (!this.verifyPassword(dto.current, hash)) throw new BadRequestException('Current password is incorrect'); // 400
if (deal.buyer_id !== userId) throw new ForbiddenException('Not your deal');  // 403
// In AuthTokenGuard:
throw new UnauthorizedException('Invalid or expired token');          // 401 ✅

// ❌ Wrong
if (!user) throw new ForbiddenException('User not found');            // should be 404
if (!this.verifyPassword(...)) throw new UnauthorizedException(...);  // should be 400 (user is already authed)
```

---

## 8. Backend (NestJS) Rules

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
