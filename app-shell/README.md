# App Shell

Host application for the micro frontend setup. Provides the layout, routing, theme, and shared i18n; remote modules (Module A, Module B) load at runtime via Module Federation.

---

## Project features

- Layout, sidebar, topbar, and shared MUI theme
- React Router with lazy-loaded shell and remote routes
- Redux Toolkit store; shared i18n (i18next) with language switcher
- Module Federation: remotes load at runtime; optional stub mode when remotes aren’t running
- Environment-driven config via `public/env-config.js`

---

## Documentation

**📖 [Complete documentation](docs/README.md)** — Main hub for all shell and remote-module docs:

- Getting started (install, run shell + remotes, stub mode)
- Environment (`env-config.js`, variables, deployment)
- Remote module contract (ShellProps, adding remotes)
- Localization (i18n, shared language with remotes)
- Feature structure (folder organization, flat vs subfolders)
- Micro UI architecture and POC summary

---

## Project structure

```
app-shell/
├── docs/                 # Documentation (getting started, env, remotes, i18n, feature structure)
├── public/               # Static assets, env-config.js, locales (i18n)
├── src/
│   ├── api/              # API slices (e.g. interceptors)
│   ├── components/       # Shared UI (Topbar, SideNav, ErrorBoundary)
│   ├── config/           # App config (dev/prod)
│   ├── features/        # Feature modules (counter, dashboard, todo, etc.)
│   ├── layouts/         # DashboardLayout, UnauthorizedLayout
│   ├── remotes/         # Remote loaders, stubs, ShellProps types
│   ├── store/           # Redux store
│   ├── utils/            # i18n, logger, helpers
│   ├── App.tsx
│   ├── index.tsx
│   └── routes.tsx
├── index.html
├── vite.config.ts
└── package.json
```

## Feature structure

Features can be flat (default) or use subfolders when complexity justifies it. **📋 [Feature structure guide](docs/FEATURE-STRUCTURE.md)** — naming, when to use subfolders, and examples.

---

## Getting started

### 1. Prerequisites

Node.js 18+ (LTS recommended). Check: `node -v`, `npm -v`.

### 2. Install

```bash
cd app-shell
npm install
```

### 3. Environment (optional for local dev)

Runtime config is in `public/env-config.js`. For remotes, set `MODULE_A_REMOTE_URL`, `MODULE_B_REMOTE_URL` (and optionally `USE_STUB_REMOTES: true` to use stubs). See [Environment](docs/ENVIRONMENT.md) and [Getting started](docs/GETTING-STARTED.md).

### 4. Run

```bash
npm run dev
```

Open **http://localhost:3000**. For full integration with remotes, run Module A (port 3001) and Module B (port 3002) — see [Getting started](docs/GETTING-STARTED.md).

---

## Scripts

| Script           | Description                |
|------------------|----------------------------|
| `npm run dev`    | Start dev server (port 3000) |
| `npm run build`  | TypeScript check + Vite build |
| `npm run preview`| Serve production build     |
| `npm run lint`   | ESLint                     |
| `npm run test`   | Vitest                     |

---

## Tests

```bash
npm run test
```

For test options and coverage, see [Getting started](docs/GETTING-STARTED.md#scripts) or run `npx vitest run --help`.

---

## Build for production

```bash
npm run build
```

Serve the `dist/` output (e.g. `npm run preview`). Update `public/env-config.js` (or deployment config) with production remote URLs. See [Environment](docs/ENVIRONMENT.md).

---

## Tech stack

React 19, TypeScript, Vite, React Router 7, MUI, Redux Toolkit, i18next. Module Federation via `@originjs/vite-plugin-federation`.

---

## Contributing

Open a feature/bugfix branch, make changes, and open a pull request. For remote contract and feature structure, see [docs](docs/README.md).
