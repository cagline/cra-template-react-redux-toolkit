# App Shell Documentation

**Your main hub for all development documentation** — getting started, environment, remote modules, localization, feature structure, and requirements.

---

## Sections

| Section | Description |
|---------|-------------|
| [GETTING-STARTED.md](./GETTING-STARTED.md) | **Start here if you're new** — Prerequisites, install, run, what to read next, conventions and linking work to requirements. |
| [requirements/](./requirements/README.md) | **User Stories & Change Requests** — Conventions, INDEX, example epic and templates. Keep requirements in sync with code; CRs as amendments. |

---

## Building from scratch or with an AI agent

If you **copy this `docs/` folder** into a new or empty project and want to generate a base app that matches this app-shell (React + Redux Toolkit + MUI + same structure), start here:

1. **[TECH-STACK-AND-SCAFFOLD.md](./TECH-STACK-AND-SCAFFOLD.md)** — Required tech stack (React, Redux Toolkit, MUI, Vite, TypeScript), from-scratch scaffold order, and instructions for AI agents.
2. Then follow: [PROJECT-STRUCTURE](./PROJECT-STRUCTURE.md) → [FEATURE-STRUCTURE](./FEATURE-STRUCTURE.md) → [IMPLEMENTATION-GUIDE](./IMPLEMENTATION-GUIDE.md).

---

## Contents (technical)

| Document | Description |
|----------|-------------|
| [TECH-STACK-AND-SCAFFOLD.md](./TECH-STACK-AND-SCAFFOLD.md) | **Tech stack and scaffold** — Required stack (React, Redux Toolkit, MUI, Vite), from-scratch order, AI-agent instructions |
| [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md) | App-shell directory tree and folder roles (api, shared, config, features, layouts, remotes, store, utils) |
| [FEATURE-STRUCTURE.md](./FEATURE-STRUCTURE.md) | Feature folder organization: flat by default, conditional subfolders, naming |
| [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md) | How to build a similar app: main structure, feature layout, API slices (shared vs feature), store, routes |
| [GETTING-STARTED.md](./GETTING-STARTED.md) | Prerequisites, install, run shell + remotes, stub mode, scripts, troubleshooting, what to read next, conventions |
| [ENVIRONMENT.md](./ENVIRONMENT.md) | Environment configuration (`env-config.js`), variables, deployment |
| [REMOTE-MODULE-CONTRACT.md](./REMOTE-MODULE-CONTRACT.md) | Shell–remote contract (ShellProps), adding a new remote, stubs vs real remotes |
| [LOCALIZATION.md](./LOCALIZATION.md) | i18n setup, adding translations, remotes sharing the shell's language |
| [MICRO_UI_ARCHITECTURE.md](./MICRO_UI_ARCHITECTURE.md) | Micro UI architecture decisions and design |
| [MICRO_UI_POC_README.md](./MICRO_UI_POC_README.md) | POC implementation summary and what's built |

**Doc flow (building a similar app):** [TECH-STACK-AND-SCAFFOLD](./TECH-STACK-AND-SCAFFOLD.md) → [PROJECT-STRUCTURE](./PROJECT-STRUCTURE.md) → [FEATURE-STRUCTURE](./FEATURE-STRUCTURE.md) → [IMPLEMENTATION-GUIDE](./IMPLEMENTATION-GUIDE.md).

---

## Quick reference

| Item | Value |
|------|--------|
| **Shell port** | 3000 |
| **Module A port** | 3001 |
| **Module B port** | 3002 |
| **Env config** | `public/env-config.js` (loaded at runtime via `index.html`) |
| **Remote routes** | `/module-a/*`, `/module-b/*` (remotes handle their own sub-routes) |
