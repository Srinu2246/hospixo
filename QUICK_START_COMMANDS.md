# Quick Start Guide

Welcome to **Hospixo Admin Frontend**. Follow these commands and conventions to get up and running.

---

## 📦 1. Installation

Always use **pnpm** (avoid using `npm` or `yarn`):

```bash
pnpm install
```

---

## 🚀 2. Running Locally

### Development Server

Starts the Next.js development server and automatically opens [http://localhost:3002](http://localhost:3002):

```bash
pnpm dev
```

### Production Build

Build and run the production-optimized build:

```bash
pnpm build
pnpm start
```

---

## 🛠 3. Code Quality & Validation

Run these commands before pushing to ensure quality checks pass:

| Command             | Description                                                        |
| :------------------ | :----------------------------------------------------------------- |
| `pnpm validate`     | **Runs all checks:** format, spellcheck, lint, typecheck, and knip |
| `pnpm format`       | Formats all code with Prettier                                     |
| `pnpm format:check` | Verifies formatting without modifying files                        |
| `pnpm lint`         | Runs ESLint (Next.js core web vitals + TypeScript rules)           |
| `pnpm typecheck`    | Validates TypeScript types (`tsc --noEmit`)                        |
| `pnpm spellcheck`   | Checks spelling across code and documentation via CSpell           |
| `pnpm knip`         | Finds unused dependencies, dead exports, and unused files          |
| `pnpm clean`        | Cleans `.next`, build cache, and dependencies                      |

---

## 📁 4. Project Structure (`src/`)

All application source code resides in [`src/`](file:///Users/jsvutilities-019/Documents/GitHub/hospixo-frontend/hospixo-frontend/src) and uses the `@/*` path alias:

```
src/
├── app/                     # Next.js App Router (pages, layouts, route handlers)
├── components/              # UI components
│   ├── common/              # Shared domain-agnostic elements
│   ├── layout/              # Shared shell and layout components
│   └── ui/                  # Core atomic UI primitives
├── features/                # Domain-driven feature modules
├── hooks/                   # Custom React hooks
├── lib/                     # Design system & shared library configs
│   └── theme/mui/           # MUI tokens (breakpoints, colors, shape, spacing, theme, typography)
├── providers/               # AppProvider (MUI Theme + TanStack Query + CssBaseline)
├── services/                # Centralized network layer & business logic
│   └── api/                 # Primary HTTP client, API methods, and domain endpoints
├── stores/                  # Global Zustand client stores
├── types/                   # Shared TypeScript models and interfaces
└── utils/                   # Pure deterministic shared utility functions
```

---

## 📦 5. Managing Dependencies

Because this is a standalone project, you no longer need workspace flags like `-w` or `--filter`:

```bash
# Add a production dependency
pnpm add <package-name>

# Add a development dependency
pnpm add -D <package-name>
```

---

## 🗜 6. Export Clean Zip

To create a clean zip file of the source code (excluding `.git`, `node_modules`, `.next`, and build caches):

```bash
zip -r ../hospixo-frontend.zip . -x ".git/*" -x ".next/*" -x "node_modules/*" -x "*.tsbuildinfo" -x ".DS_Store" -x "*/.DS_Store"
```
