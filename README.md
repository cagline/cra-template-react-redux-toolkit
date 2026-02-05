# React + Redux Toolkit Micro Frontend Template

A monorepo template for building micro frontends with a **host app (shell)** and **remote modules**, using React 19, TypeScript, Vite, Redux Toolkit, MUI, and Module Federation.

---

## What's in this repo

| Package | Description |
|---------|--------------|
| **app-shell** | Host application: layout, routing, theme, Redux store, i18n; loads remote modules at runtime. Includes examples of **Redux Toolkit state** (counter) and **RTK Query / API slice** (todo). **`docs/`** — getting started, environment, remote contract, feature structure, requirements — keeps the codebase and team consistent. |
| **remote-module-a** | Example remote micro frontend (Module Federation). |
| **remote-module-b** | Second example remote micro frontend. |

**Note:** In production or real use, these would typically be **three separate projects** — separate repos, separate builds, **hosted separately**. Each remote has its own URL; the shell loads them at runtime. This repo keeps all three in one place for **convenience** so you can **learn** the full setup and **clone once** to run the shell and remotes locally. When you adopt this pattern, you’d split them into separate repos and host them independently.

The shell provides the layout (sidebar, topbar), shared MUI theme, React Router, and Redux Toolkit store. Remotes are loaded via `@originjs/vite-plugin-federation` and can run standalone or be stubbed when not running.

---

## Why it matters for developers

- **Modern stack** — React 19, Redux Toolkit, Vite, TypeScript, MUI in one place.
- **Micro frontends** — Independent teams can own remotes; runtime integration with optional stub mode.
- **Production-style structure** — Features, layouts, remotes, env config, i18n, and docs you can reuse or hand to an AI agent to scaffold from.
- **Fully documented** — Getting started, environment, remote contract, localization, feature structure, and requirements live under `app-shell/docs/`.

Use this repo as a reference or as a base for your own shell + remotes setup.

---

## How the documentation keeps consistency

The **`app-shell/docs/`** folder is more than a reference: it’s the single source of truth that helps keep the codebase and team aligned.

- **Requirements in sync with code** — User Stories and Change Requests live in `docs/requirements/` with clear conventions, status workflow, and traceability (e.g. commit format `#US-001 - description`, feature folder links). Whether you develop from a story or document existing code, the same workflow keeps requirements and implementation consistent.
- **Same structure everywhere** — [PROJECT-STRUCTURE](app-shell/docs/PROJECT-STRUCTURE.md), [FEATURE-STRUCTURE](app-shell/docs/FEATURE-STRUCTURE.md), and [IMPLEMENTATION-GUIDE](app-shell/docs/IMPLEMENTATION-GUIDE.md) define how features are organized (flat vs subfolders, naming by role), where API slices and shared code live, and how to add new features. Everyone—and any AI agent—follows the same rules.
- **One contract for remotes** — [REMOTE-MODULE-CONTRACT](app-shell/docs/REMOTE-MODULE-CONTRACT.md) defines ShellProps and how remotes integrate, so the shell and every remote stay compatible.
- **Shared conventions** — Environment ([ENVIRONMENT](app-shell/docs/ENVIRONMENT.md)), localization ([LOCALIZATION](app-shell/docs/LOCALIZATION.md)), and getting-started conventions (branch names, commit messages, stub mode) are documented in one place, so onboarding and day-to-day work stay consistent.

Using `app-shell/docs/` as the hub for structure, requirements, and contracts reduces drift and makes it easier to scale the app or hand the repo to a new team or an AI agent and get predictable results.

---

## Quick start

1. Clone this repository.
2. **Read the docs first** — [app-shell/README.md](app-shell/README.md) and [Getting started](app-shell/docs/GETTING-STARTED.md) for prerequisites, install, run, and remotes. Then follow the steps there.

---

## Documentation

- **[app-shell/README.md](app-shell/README.md)** — Shell overview, features, structure, scripts.
- **[app-shell/docs/](app-shell/docs/)** — Full documentation hub: getting started, environment, remote contract, i18n, feature structure, requirements, and scaffold guide. Use it to keep structure and requirements consistent across the codebase and team.
