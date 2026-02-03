# App Shell Documentation

**Your main hub for all development documentation** — getting started, environment, remote modules, localization, feature structure, and micro UI architecture.

---

## Contents

| Document | Description |
|----------|-------------|
| [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md) | App-shell directory tree and folder roles (api, shared, config, features, layouts, remotes, store, utils) |
| [GETTING-STARTED.md](./GETTING-STARTED.md) | Prerequisites, install, run shell + remotes, stub mode, scripts, troubleshooting |
| [ENVIRONMENT.md](./ENVIRONMENT.md) | Environment configuration (`env-config.js`), variables, deployment |
| [REMOTE-MODULE-CONTRACT.md](./REMOTE-MODULE-CONTRACT.md) | Shell–remote contract (ShellProps), adding a new remote, stubs vs real remotes |
| [LOCALIZATION.md](./LOCALIZATION.md) | i18n setup, adding translations, remotes sharing the shell's language |
| [FEATURE-STRUCTURE.md](./FEATURE-STRUCTURE.md) | Feature folder organization: flat by default, conditional subfolders, naming |
| [MICRO_UI_ARCHITECTURE.md](./MICRO_UI_ARCHITECTURE.md) | Micro UI architecture decisions and design |
| [MICRO_UI_POC_README.md](./MICRO_UI_POC_README.md) | POC implementation summary and what's built |

---

## Quick reference

| Item | Value |
|------|--------|
| **Shell port** | 3000 |
| **Module A port** | 3001 |
| **Module B port** | 3002 |
| **Env config** | `public/env-config.js` (loaded at runtime via `index.html`) |
| **Remote routes** | `/module-a/*`, `/module-b/*` (remotes handle their own sub-routes) |
