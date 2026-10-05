<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Coding Rules

## 1. Project Overview

This project is a production-ready Next.js application built with strict typing, atomic theme tokens, centralized networking, and modern dev tooling:

- **Next.js 16.3.8** (App Router)
- **React 19.2.8** + **React Compiler** (`reactCompiler: true` in `next.config.ts`, `babel-plugin-react-compiler`)
- **TypeScript 5.9+** (strict mode enabled)
- **MUI v9** (`@mui/material`, `@mui/icons-material`) + **Emotion** (`@emotion/react`, `@emotion/styled`)
- **TanStack React Query v5** (`@tanstack/react-query`)
- **React Hook Form v7** (`react-hook-form`) + **Zod v4** (`zod`, `@hookform/resolvers`)
- **Zustand v5** (`zustand`)
- **pnpm 11+** (`pnpm@11.22.0`)
- **ESLint 9** (Flat Config), **Prettier 3**, **CSpell 10**, **Knip 6**, **Husky + lint-staged**
- **LocatorJS / TreeLocatorJS** (`@locator/webpack-loader`, `@locator/babel-jsx`, `@treelocator/runtime`)
- **Dev Server:** Port 3003 with Webpack (`pnpm dev` -> `next dev --webpack -p 3003`)

The codebase must prioritize:

1. Maintainability
2. Type safety
3. Reusability
4. Clear separation of concerns
5. Consistent UI tokens
6. Minimal duplication
7. Production readiness
8. Fast onboarding

---

# 2. General Coding Principles

## 2.1 TypeScript First

- Use TypeScript for all application code.
- Do not introduce `.js` files unless technically mandatory.
- Avoid `any`. Use `unknown` when incoming data shape is unverified.
- Explicitly type public functions, API contracts, hooks, and reusable components.
- Never bypass type checking with `@ts-ignore`. Prefer `@ts-expect-error` with a reason when unavoidable.
- Avoid unnecessary type assertions.

Bad:

```ts
const user = response as any;
```

Good:

```ts
const user: UserResponse = response;
```

---

# 3. Folder Architecture

All application source code resides under `src/`. Follow this clear separation of concerns:

```text
src/
├── app/                  # Next.js App Router (layout.tsx, page.tsx, globals.css)
├── components/           # Reusable generic UI components
│   ├── common/           # Domain-agnostic shared elements
│   ├── layout/           # Shared layout components (headers, footers, containers)
│   └── ui/               # Core atomic primitives
├── features/             # Business modules sliced by domain
│   └── <feature-name>/   # Self-contained feature
│       ├── components/   # Feature-specific UI
│       ├── hooks/        # Feature-specific hooks
│       ├── schemas/      # Zod validation schemas
│       ├── types/        # Feature-specific TypeScript models
│       └── utils/        # Feature-specific helpers
├── services/             # Centralized external communication
│   └── api/
│       ├── api.ts        # Primary centralized API client (request, tokens, methods)
│       ├── http.ts       # Low-level fetch wrapper
│       ├── endpoints/    # Domain-specific API endpoint modules
│       └── types.ts      # HTTP and API contracts (ApiError, QueryParams, ApiResponse)
├── providers/            # Application-wide context providers
│   ├── AppProvider.tsx   # MUI ThemeProvider, CssBaseline, QueryProvider, dev log filters
│   └── QueryProvider.tsx # TanStack React Query QueryClientProvider
├── lib/                  # Shared configurations and design system tokens
│   └── theme/
│       └── mui/          # Centralized MUI theme tokens
│           ├── colors.ts       # Semantic color definitions
│           ├── spacing.ts      # Base 8px grid unit
│           ├── shape.ts        # Border radii tokens
│           ├── breakpoints.ts  # Responsive screen breakpoints
│           ├── typography.ts   # Font scale and variant definitions
│           └── theme.ts        # Material-UI theme creation
├── hooks/                # Cross-cutting, reusable global React hooks
├── stores/               # Global Zustand stores (client-side only)
├── types/                # Global shared TypeScript types and models
└── utils/                # Pure, deterministic shared utility functions
```

---

# 4. Page Rules

Pages must remain thin. Do not place business logic directly inside `src/app/**/page.tsx`.

A page should primarily:

- Compose feature components.
- Provide page-level metadata.
- Connect route parameters.
- Handle route-level suspense or error boundaries.

Bad:

```tsx
export default function Page() {
  const [users, setUsers] = useState([]);
  // 100+ lines of fetching, transformations, state, and complex UI
}
```

Good:

```tsx
export default function UsersPage() {
  return <UsersScreen />;
}
```

---

# 5. Components

## 5.1 Component Responsibility

Each component must have a single clear responsibility. Split monolithic components when state, API calls, and markup become mixed.

## 5.2 Reusability

Check existing primitives before writing new ones:

- `components/common/`
- `components/ui/`
- `features/<feature>/components/`

## 5.3 Props

Pass only what the component needs. Avoid passing giant nested objects when a few primitive fields suffice.

---

# 6. React Rules

- **React Compiler Active:** The project uses `reactCompiler: true` (`babel-plugin-react-compiler`). Do not clutter code with manual `useMemo` or `useCallback` unless handling external dependencies or non-standard reference stability requirements.
- **No Unnecessary Effects:** Derive values directly during render instead of synchronizing state inside `useEffect`.
- **External Store Subscription:** When reading from browser storage (`localStorage`), use React's `useSyncExternalStore` (see pattern in `src/app/page.tsx`) rather than triggering state updates inside `useEffect`.
- **Component Purity:** Keep components deterministic and avoid side effects in render.

---

# 7. Next.js Rules

- Default to React Server Components (RSC).
- Add `'use client'` only when browser APIs, event listeners, or client hooks (`useState`, `useSyncExternalStore`) are required.
- Keep client component leaves small; do not mark entire page subtrees as client components.
- Always use `next/link` for internal navigation and `next/image` for images.
- Root layout `<html>` in `src/app/layout.tsx` must keep `suppressHydrationWarning` to prevent hydration mismatches caused by browser extensions and dev inspection tools (TreeLocator).

---

# 8. API Architecture

All HTTP requests must flow through the centralized API client in `src/services/api/api.ts`. Never call raw `fetch()` directly in UI components.

## 8.1 API Client (`api`)

- **Methods:** `api.get<T>()`, `api.post<T>()`, `api.put<T>()`, `api.patch<T>()`, `api.delete<T>()`
- **Token Management:**
  - `api.setToken(token)`: Persists authorization token to `localStorage`.
  - `api.getToken()`: Reads token (`token`, `accessToken`, `auth_token`).
  - `api.removeToken()`: Clears stored auth tokens.
- **Automatic Bearer Injection:** Outgoing requests automatically include `Authorization: Bearer <token>` when a token is present.
- **Automatic 401 Purge:** Clears stored tokens on HTTP 401 Unauthorized responses.
- **Query & Body Handling:** Automatically serializes query parameters (`QueryParams`) and handles both JSON payloads and `FormData` (omits `Content-Type` for multipart boundary generation).
- **Base URL:** Driven by `process.env.NEXT_PUBLIC_API_BASE_URL` with client fallback.
- **Feature Endpoints:** Group calls into domain modules (`src/services/api/endpoints/` or `features/<feature>/api/`):

```ts
import { api } from '@/services/api/api';
import type { QueryParams } from '@/services/api/types';
import type { User, CreateUserPayload } from '@/types/user';

export const usersApi = {
  getUsers: (params?: QueryParams) => api.get<User[]>('/users', params),
  getUserById: (id: string) => api.get<User>(`/users/${id}`),
  createUser: (payload: CreateUserPayload) => api.post<User>('/users', payload),
  deleteUser: (id: string) => api.delete<void>(`/users/${id}`),
};
```

---

# 9. API Types

Centralize shared HTTP contracts in `src/services/api/types.ts`:

- `HttpMethod`, `QueryParams`, `ApiResponse<T>`, `ApiErrorResponse`, `HttpRequestConfig`
- Normalized `ApiError` class containing `status`, `message`, and parsed error `details`.

Place domain data models in `src/types/` or feature-level `types/`.

---

# 10. TanStack React Query

Use TanStack React Query v5 for all server state (fetching, caching, mutations, refetching).

- Standard query client configuration lives in `src/providers/QueryProvider.tsx`:
  - `staleTime: 60 * 1000` (60s)
  - `gcTime: 5 * 60 * 1000` (5min)
  - `refetchOnWindowFocus: false`
  - `retry: 1`
- **Rule:** Do NOT copy server data into Zustand stores.

---

# 11. Zustand

Use Zustand v5 strictly for shared client-only state:

- Navigation state, sidebar toggles, UI modal queues.
- Multi-step form drafts before submission.
- User display preferences.

Define stores in `src/stores/`. Keep stores focused; do not create monolithic stores.

---

# 12. Forms

Use **React Hook Form v7** with **Zod v4** via `@hookform/resolvers/zod`.

- Place validation schemas in `features/<feature>/schemas/` or `src/lib/schemas/`.
- Derive TypeScript form types directly from schemas:

```ts
import { z } from 'zod';

export const userFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
```

---

# 13. MUI Rules

MUI v9 is the primary component library.

- Use built-in MUI primitives (`Box`, `Stack`, `Typography`, `Button`, `Paper`, `Card`, `Container`, `Divider`, `Alert`, `Chip`).
- Use the `sx` prop for style overrides instead of raw CSS classes.
- Root provider hierarchy in `src/providers/AppProvider.tsx` wraps children with:
  `ThemeProvider` -> `CssBaseline` -> `QueryProvider`.

---

# 14. Theme Rules

All styling tokens must be imported from `src/lib/theme/mui/`:

- `colors.ts`: Semantic color palette tokens.
- `spacing.ts`: Base grid unit `spacing = 8` (8px). Use MUI `sx` multipliers (`p: 2` = 16px, `gap: 3` = 24px).
- `shape.ts`: Border radii (`shape.borderRadius = 8`).
- `breakpoints.ts`: Breakpoint values (`xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536`).
- `typography.ts`: Standard font scales (`Arial, Helvetica, sans-serif`, `button: { textTransform: 'none' }`).
- `theme.ts`: Custom theme assembly using `createTheme()`.

---

# 15. Color Structure

Use semantic color keys defined in `src/lib/theme/mui/colors.ts`:

```ts
colors.primary.default; // '#1976D2' (light: '#42A5F5', dark: '#1565C0')
colors.secondary.default; // '#9C27B0'
colors.success.default; // '#2E7D32'
colors.info.default; // '#0288D1'
colors.warning.default; // '#ED6C02'
colors.danger.default; // '#D32F2F' (maps to theme error)
colors.surface.default; // '#FFFFFF' (light: '#F5F5F5', dark: '#1E1E1E')
colors.background.light; // '#FAFAFA'
colors.text.primary; // '#212121'
colors.text.secondary; // '#757575'
colors.border.default; // '#E0E0E0'
colors.divider.default; // '#E0E0E0'
```

Never hard-code random hex codes directly in components.

---

# 16. Styling

- Rely on MUI theme tokens and the `sx` prop.
- Avoid repeating arbitrary inline style objects.
- Promote frequently repeated layouts to `components/layout/` or `components/ui/`.

---

# 17. Constants

Store shared immutable configuration in `src/lib/constants/` using `UPPER_SNAKE_CASE`:

- Route definitions
- Storage keys (`TOKEN_STORAGE_KEY`)
- Pagination defaults (`DEFAULT_PAGE_SIZE = 10`)

---

# 18. Utility Functions

Pure, deterministic functions belong in `src/utils/` or `src/lib/utils/`.

- Utilities must have single responsibility and zero hidden side effects.
- Always write descriptive function names (`formatCurrency`, `slugifyText`).

---

# 19. Hooks

Reusable React state logic belongs in:

- `src/hooks/` (cross-cutting application hooks)
- `src/features/<feature>/hooks/` (feature-scoped hooks)

Keep hooks focused and composable (`useUserPermissions`, `useDebouncedSearch`).

---

# 20. Error Handling

- Never swallow errors silently in empty `catch` blocks.
- Normalize network errors through `ApiError` in `src/services/api/types.ts`.
- Surface meaningful user feedback with MUI `Alert` or dedicated feedback components.

---

# 21. Async Code

- Prefer `async`/`await` over promise chains.
- Handle pending and rejected states explicitly.
- For server queries and mutations, rely on React Query's `isPending`, `isError`, and `error` states.

---

# 22. Naming Conventions

## Files

- Components: `PascalCase.tsx` (`UserProfile.tsx`, `DashboardCard.tsx`)
- Utilities, hooks, services: `camelCase.ts` (`formatDate.ts`, `useAuth.ts`, `api.ts`)
- Type declarations: `camelCase.ts` or `PascalCase.ts` (`types.ts`, `user.ts`)

## Components

- PascalCase: `UserProfile`, `AppProvider`, `QueryProvider`

## Functions & Hooks

- camelCase: `getUserProfile()`, `useSyncExternalStore()`, `formatCurrency()`

## Constants

- UPPER_SNAKE_CASE: `TOKEN_STORAGE_KEY`, `DEFAULT_PAGE_SIZE`

---

# 23. Import Rules

Keep imports organized in order:

1. External dependencies (`react`, `next/*`, `@mui/*`, `@tanstack/*`)
2. Internal path aliases (`@/components`, `@/features`, `@/services`, `@/lib`, `@/types`)
3. Relative imports (`./UserCard`, `../types`)

Never use deep relative traversal (`../../../../`). Always prefer path aliases (`@/*`).

---

# 24. Avoid Circular Dependencies

Maintain unidirectional data and module flow. Avoid cycles (`A -> B -> C -> A`). If cycles emerge, extract common contracts into `types/` or `utils/`.

---

# 25. Security

- Never commit API keys, private credentials, or secrets.
- Never expose private keys with `NEXT_PUBLIC_` prefixes.
- Validate all external and form inputs using Zod.

---

# 26. Environment Variables

- Access environment variables centrally through `process.env`.
- Public frontend variables must be prefixed with `NEXT_PUBLIC_` (e.g. `NEXT_PUBLIC_API_BASE_URL`).

---

# 27. Accessibility

- Use semantic HTML elements or corresponding MUI components (`Button` instead of clickable `div`).
- Include descriptive `aria-label` tags for icon-only buttons.
- Maintain sufficient visual color contrast against background surfaces.

---

# 28. Performance

- Leverage React Server Components for non-interactive layout trees.
- Let React Compiler optimize re-render lifecycles automatically.
- Optimize images using `next/image`.
- Keep bundle sizes small by importing specific icons from `@mui/icons-material/<IconName>`.

---

# 29. LocatorJS / TreeLocatorJS

LocatorJS provides source code navigation during development.

- **Dev Tooling:** Uses `@locator/webpack-loader`, `@locator/babel-jsx`, and `@treelocator/runtime`.
- **Webpack Required:** Runs with Webpack on port 3003 (`next dev --webpack -p 3003`).
- **Console Filter:** Non-fatal `[LocatorJS]` dev console errors are suppressed in `src/providers/AppProvider.tsx` to prevent the Next.js dev error overlay from triggering.
- **Babel Config:** Uses `.babelrc` strictly to configure `module:@locator/babel-jsx` in development. Do not add extraneous Babel plugins.

---

# 30. Logging

- Remove temporary `console.log` statements before committing code.
- Use structured logging or `console.error` only for legitimate exceptional conditions.

---

# 31. Comments

Write comments that explain the **why**, not the obvious **what**. Avoid leaving commented-out legacy code blocks.

---

# 32. Business Logic

Business logic must not be scattered inside UI components. Maintain the layered architecture:

```text
UI Component -> Custom Hook -> Service/Store -> Centralized API (api.ts)
```

---

# 33. No Duplicate Logic

Before writing a new utility, helper, or component:

1. Search the existing codebase.
2. Reuse or extend existing utilities.
3. Keep shared functions pure and well-typed.

---

# 34. Dependency Rules

Before adding a new dependency:

- Verify whether existing libraries (`MUI`, `React Query`, `Zod`, `Zustand`) already provide the solution.
- Verify compatibility with React 19, Next.js 16, and React Compiler.
- Prefer lightweight, well-maintained packages.

---

# 35. Production Readiness

Always consider all UI and data states:

- Loading state
- Error state
- Empty state
- Success state
- Mobile and desktop responsive layouts

---

# 36. Code Quality Commands

Always run quality checks before finishing tasks or committing changes:

```bash
# Development server (port 3003 with Webpack)
pnpm dev

# Build verification
pnpm build

# Static checks
pnpm lint           # ESLint 9 checks
pnpm typecheck      # TypeScript compilation check
pnpm format:check   # Prettier format check
pnpm format         # Prettier auto-format
pnpm cspell         # Spell checker
pnpm knip           # Unused files, dependencies & export analysis

# All-in-one check
pnpm codequality
```

---

# 37. Formatting

Use **Prettier**. Format files using `pnpm format` and check with `pnpm format:check`. Do not introduce conflicting formatting styles.

---

# 38. Git Rules

- Commit with conventional, descriptive commit messages:
  - `feat: add user profile view`
  - `fix: handle expired auth token in api client`
  - `refactor: extract mui color tokens`
- Husky runs `lint-staged` on pre-commit (`eslint --fix`, `prettier --write`).
- Never commit `.env`, `.env.local`, `.next/`, or `node_modules/`.

---

# 39. Change Discipline

When modifying existing code:

1. Understand the existing pattern first.
2. Make the smallest safe, focused change.
3. Preserve existing functionality and architecture.
4. Run static checks (`pnpm typecheck`, `pnpm lint`).

---

# 40. AI Coding Rules

When developing with AI assistance:

- Inspect existing files and directory structure before generating new code.
- Follow established project conventions and file locations.
- Use `@/` path aliases; never generate deep relative imports.
- Reuse centralized MUI tokens and `src/services/api/api.ts`.
- Avoid adding unneeded third-party libraries.

---

# 41. Final Rule

Prefer:

```text
Simple
Typed
Reusable
Predictable
Testable
Maintainable
```

Over:

```text
Complex
Duplicated
Over-engineered
Implicit
Hard-coded
Tightly coupled
```
