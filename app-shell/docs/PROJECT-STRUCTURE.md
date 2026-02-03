# Project structure

High-level layout of the app-shell codebase.

## Directory tree

```
app-shell/
├── docs/                 # Documentation (getting started, env, remotes, i18n, feature structure)
├── public/               # Static assets, env-config.js, locales (i18n)
├── src/
│   ├── api/              # Shared API only (base query, interceptors) — no feature slices here
│   ├── shared/           # Shared shell UI (Topbar, SideNav, ErrorBoundary)
│   ├── config/           # App config (dev/prod)
│   ├── features/         # Feature modules (counter, dashboard, todo, etc.)
│   ├── layouts/          # DashboardLayout, UnauthorizedLayout
│   ├── remotes/          # Remote loaders, stubs, ShellProps types
│   ├── store/            # Redux store
│   ├── utils/            # i18n, logger, helpers
│   ├── App.tsx
│   ├── index.tsx
│   └── routes.tsx
├── index.html
├── vite.config.ts
└── package.json
```

## Folder roles

| Path | Purpose |
|------|---------|
| **docs/** | All development documentation (see [README](./README.md)) |
| **public/** | Static assets, runtime env (`env-config.js`), i18n locale files |
| **src/api/** | Shared API only: base query, interceptors (e.g. `interceptorsSlice.ts`). No feature API slices here. |
| **src/shared/** | Reusable shell UI: Topbar, SideNav, ErrorBoundary |
| **src/config/** | App configuration (dev/prod, base URLs) |
| **src/features/** | Feature modules (counter, dashboard, todo, home, help, error). See [FEATURE-STRUCTURE.md](./FEATURE-STRUCTURE.md) |
| **src/layouts/** | Layout components: DashboardLayout, UnauthorizedLayout |
| **src/remotes/** | Module Federation: remote loaders, stubs, ShellProps types |
| **src/store/** | Redux store and hooks |
| **src/utils/** | i18n, logger, input helpers |

Entry points: **src/index.tsx** (bootstrap), **src/App.tsx** (root component), **src/routes.tsx** (routing).

## API slice placement

- **src/api/** — Shared layer only: base query, interceptors (e.g. `interceptorsSlice.ts`). No feature-specific `createApi` here.
- **Feature API slices** — Live in the feature: `src/features/[FeatureName]/[featureName]ApiSlice.ts`. See [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md).
