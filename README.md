# React + Redux Toolkit Boilerplate

A production-style **React app template** (the **shell app**) with React 19, TypeScript, Vite, Redux Toolkit, MUI, and a documented structure. Optionally extend with **micro frontends** (Module Federation) when you need them.

---

## Purpose of this boilerplate

**The whole idea** behind this boilerplate is **consistency across the multiple projects we maintain** — so every developer (and any AI agent) gets the **same kind of implementation**: same structure, same patterns, same conventions. One source of truth in `app-shell/docs/` (project structure, feature structure, implementation guide) means no drift: everyone follows the same rules and delivers the same style of output.

The **main value** is the **shell app** (`app-shell/`): a single React application that gives you a modern stack, clear feature structure, Redux Toolkit patterns, and those docs. Use it as a standalone app or as the base for something bigger.

**Micro frontends are optional** — a “sugar on top” if you later want to split the shell into a host plus remote modules. The repo includes example remotes so you can try that path without committing to it.

---

## What's in this repo

| Package | Description |
|---------|--------------|
| **app-shell** | **Main app** — layout, routing, theme, Redux store, i18n. Examples of **Redux Toolkit state** (counter) and **RTK Query / API slice** (todo). **`docs/`** — getting started, environment, feature structure, requirements — keeps the codebase and team consistent. Optionally loads remote modules at runtime (Module Federation). |
| **remote-module-a** | *(Optional)* Example remote micro frontend. |
| **remote-module-b** | *(Optional)* Second example remote micro frontend. |

**Note:** In real use, remotes would typically be **separate projects** — separate repos, hosted separately. They’re in this repo for **convenience** so you can learn or try the full setup with one clone. You can ignore them and use only the shell.

---

## Why the shell app matters for developers

- **Modern stack** — React 19, Redux Toolkit, Vite, TypeScript, MUI in one place.
- **Redux patterns out of the box** — Counter (slice state) and todo (RTK Query / API slice) show how to structure state and server data.
- **Production-style structure** — Features, layouts, env config, i18n, and docs you can reuse or hand to an AI agent to scaffold from.
- **Fully documented** — Getting started, environment, feature structure, requirements, and localization live under `app-shell/docs/`.

**Optional: micro frontends** — If you need to split later, the shell supports Module Federation; remotes are included as examples. Use the shell alone, or add remotes when it’s useful.

Use this repo as a reference or as a base for your own app (with or without remotes).

---

## How the documentation keeps consistency

The **`app-shell/docs/`** folder is the **single source of truth** so that across multiple projects, every developer gets the **same kind of output** — same structure, same patterns, same implementation style.

- **Same structure everywhere** *(most important)* — [PROJECT-STRUCTURE](app-shell/docs/PROJECT-STRUCTURE.md), [FEATURE-STRUCTURE](app-shell/docs/FEATURE-STRUCTURE.md), and [IMPLEMENTATION-GUIDE](app-shell/docs/IMPLEMENTATION-GUIDE.md) define how features are organized (flat vs subfolders, naming by role), where API slices and shared code live, and how to add new features. **Everyone—and any AI agent—follows the same rules**, so implementations stay consistent across projects and teams.
- **Requirements in sync with code** — User Stories and Change Requests live in `docs/requirements/` with clear conventions, status workflow, and traceability (e.g. commit format `#US-001 - description`, feature folder links). Whether you develop from a story or document existing code, the same workflow keeps requirements and implementation consistent.
- **One contract for remotes** *(optional)* — [REMOTE-MODULE-CONTRACT](app-shell/docs/REMOTE-MODULE-CONTRACT.md) defines ShellProps and how remotes integrate when you use micro frontends.
- **Shared conventions** — Environment ([ENVIRONMENT](app-shell/docs/ENVIRONMENT.md)), localization ([LOCALIZATION](app-shell/docs/LOCALIZATION.md)), and getting-started conventions (branch names, commit messages, stub mode) are documented in one place, so onboarding and day-to-day work stay consistent.

Using `app-shell/docs/` as the hub reduces drift: scale to more projects or hand the repo to a new team or an AI agent and get **the same kind of implementation** every time.

---

## Quick start

1. Clone this repository.
2. **Read the docs first** — [app-shell/README.md](app-shell/README.md) and [Getting started](app-shell/docs/GETTING-STARTED.md) for prerequisites, install, run, and remotes. Then follow the steps there.

---

## Documentation

- **[app-shell/README.md](app-shell/README.md)** — Shell overview, features, structure, scripts.
- **[app-shell/docs/](app-shell/docs/)** — Full documentation hub: getting started, environment, feature structure, requirements, i18n, scaffold guide; remote contract when using micro frontends. Use it to keep structure and requirements consistent across the codebase and team.
