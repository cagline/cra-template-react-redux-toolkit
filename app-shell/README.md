# App Shell

Host application for the micro frontend setup. Provides the layout, routing, theme, and shared i18n; remote modules (Module A, Module B) load at runtime via Module Federation.

## Quick start

```bash
# From app-shell directory
npm install
npm run dev
```

Open **http://localhost:3000**. For full integration with remotes, run Module A (port 3001) and Module B (port 3002) as well — see [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md).

## Scripts

| Script         | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start dev server (3000)  |
| `npm run build`| TypeScript + Vite build  |
| `npm run preview` | Serve production build |
| `npm run lint` | ESLint                   |
| `npm run test` | Vitest                   |

## Documentation

Full documentation is in the **[docs](docs/)** folder:

- [docs/README.md](docs/README.md) — Index of all docs  
- [Getting started](docs/GETTING-STARTED.md) — Install, run shell + remotes, stub mode  
- [Environment](docs/ENVIRONMENT.md) — `env-config.js` and variables  
- [Remote module contract](docs/REMOTE-MODULE-CONTRACT.md) — ShellProps, adding remotes  
- [Localization](docs/LOCALIZATION.md) — i18n and shared language with remotes  
- [Micro UI architecture](docs/MICRO_UI_ARCHITECTURE.md) — Architecture and design  

## Tech stack

React 19, TypeScript, Vite, React Router 7, MUI, Redux Toolkit, i18next. Module Federation via `@originjs/vite-plugin-federation`.
