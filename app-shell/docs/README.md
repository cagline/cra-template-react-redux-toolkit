# App Shell Documentation

Documentation for the shell application (host) and how it integrates with remote micro frontend modules.

## Contents

| Document | Description |
|----------|-------------|
| [GETTING-STARTED.md](./GETTING-STARTED.md) | Prerequisites, install, and how to run the shell and remotes |
| [ENVIRONMENT.md](./ENVIRONMENT.md) | Environment configuration (`env-config.js`), variables, and deployment |
| [REMOTE-MODULE-CONTRACT.md](./REMOTE-MODULE-CONTRACT.md) | Shell–remote contract (ShellProps), adding a new remote, stubs vs real remotes |
| [LOCALIZATION.md](./LOCALIZATION.md) | i18n setup, adding translations, and how remotes share the shell's language |
| [FEATURE-STRUCTURE.md](./FEATURE-STRUCTURE.md) | Feature folder organization: flat by default, conditional subfolders, naming |
| [MICRO_UI_ARCHITECTURE.md](./MICRO_UI_ARCHITECTURE.md) | Micro UI architecture decisions and design |
| [MICRO_UI_POC_README.md](./MICRO_UI_POC_README.md) | POC implementation summary and what's built |

## Quick reference

- **Shell port:** 3000  
- **Module A port:** 3001  
- **Module B port:** 3002  
- **Env config:** `public/env-config.js` (loaded at runtime via `index.html`)  
- **Remote routes:** `/module-a/*`, `/module-b/*` (remotes handle their own sub-routes)
