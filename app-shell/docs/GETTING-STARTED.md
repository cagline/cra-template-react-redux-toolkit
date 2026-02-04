# Getting Started

How to set up and run the app shell and remote modules locally. **Start here if you're new** — prerequisites, install, run, then where to read next and how to link work to requirements.

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+ (or yarn/pnpm)

## Repository layout

This repo is a monorepo containing:

- **app-shell/** — Host application (this project). Runs on port 3000.
- **remote-module-a/** — Remote micro frontend (Team Management). Runs on port 3001.
- **remote-module-b/** — Remote micro frontend (Reporting & Analytics). Runs on port 3002.

## Install

From the **repository root** (parent of `app-shell`):

```bash
# Install shell
cd app-shell && npm install && cd ..

# Install remotes
cd remote-module-a && npm install && cd ..
cd remote-module-b && npm install && cd ..
```

Or install each package from its directory.

## Run (full integration)

You need the shell and both remotes running so the shell can load them via Module Federation.

### Option 1: Three terminals

**Terminal 1 — Shell (port 3000):**
```bash
cd app-shell
npm run dev
```

**Terminal 2 — Module A (port 3001):**
```bash
cd remote-module-a
npm run dev
```

**Terminal 3 — Module B (port 3002):**
```bash
cd remote-module-b
npm run dev
```

Then open **http://localhost:3000**. Use the sidebar to navigate to Module A or Module B.

### Option 2: Shell only (stub remotes)

If you only want to work on the shell and don't need real remotes:

1. In `app-shell/public/env-config.js`, set `USE_STUB_REMOTES: true`.
2. Run only the shell: `cd app-shell && npm run dev`.
3. Module A and Module B routes will render stub components instead of loading remote entry points.

See [ENVIRONMENT.md](./ENVIRONMENT.md) for all env options.

## Ports

| Application   | Port | URL                    |
|---------------|------|------------------------|
| App shell     | 3000 | http://localhost:3000  |
| Remote Module A | 3001 | http://localhost:3001  |
| Remote Module B | 3002 | http://localhost:3002  |

The shell's Vite config and `env-config.js` point to these URLs. Change them if you use different ports.

## Build

```bash
# Shell
cd app-shell && npm run build

# Remotes (build order doesn't matter)
cd remote-module-a && npm run build
cd remote-module-b && npm run build
```

Preview production build of the shell (remotes must be served from their built URLs):

```bash
cd app-shell && npm run preview
```

Update `public/env-config.js` (or your deployment config) to use the remote entry URLs where the built remotes are served.

## Scripts (app-shell)

| Script    | Description                |
|-----------|----------------------------|
| `npm run dev`     | Start Vite dev server (port 3000) |
| `npm run build`  | TypeScript check + Vite build     |
| `npm run preview` | Serve production build           |
| `npm run lint`    | Run ESLint                       |
| `npm run test`    | Run Vitest                       |
| `npm run api`     | Start json-server on 3001 (separate from Module A) |

## Troubleshooting

- **Remotes don't load / blank or error:** Ensure all three apps are running and CORS is enabled on remotes (already set in their `vite.config.ts`). Check browser console and Network tab for failed requests to `remoteEntry.js`.
- **Wrong remote URL:** Edit `app-shell/public/env-config.js` (and/or `vite.config.ts` remotes for build-time). The shell loads remotes from `window._env_.MODULE_A_REMOTE_URL` etc. at runtime when using dynamic config.
- **Language change doesn’t affect remotes:** Remotes share the shell’s i18n instance. Ensure all three use the same shared config (see [LOCALIZATION.md](./LOCALIZATION.md)).

## What to read next

| Goal | Document |
|------|----------|
| Understand project structure | [PROJECT-STRUCTURE](./PROJECT-STRUCTURE.md), [FEATURE-STRUCTURE](./FEATURE-STRUCTURE.md) |
| Add or change a feature | [IMPLEMENTATION-GUIDE](./IMPLEMENTATION-GUIDE.md) |
| Tech stack and scaffold (new project / AI) | [TECH-STACK-AND-SCAFFOLD](./TECH-STACK-AND-SCAFFOLD.md) |
| Work from a User Story | [requirements/](./requirements/README.md) — find the US, link PR/commit to its id |
| Environment and remotes | [ENVIRONMENT](./ENVIRONMENT.md) |

## Conventions and requirements

- **Stack and structure:** React 18+, Redux Toolkit (RTK Query), MUI, Vite, TypeScript. Feature layout: flat by default. See [TECH-STACK-AND-SCAFFOLD](./TECH-STACK-AND-SCAFFOLD.md), [FEATURE-STRUCTURE](./FEATURE-STRUCTURE.md), [IMPLEMENTATION-GUIDE](./IMPLEMENTATION-GUIDE.md).
- **Linting and tests:** `npm run lint`, `npm run test` — fix lint before opening a PR.
- **Commit messages:** Use `#TASK_ID - Brief description` (e.g. `#US-001 - Add login form` or `#JIRA-123 - Fix validation`). Keep the first line under ~72 characters; add a body line if you need more detail. When the work is for a User Story, use the US id as the task id (e.g. `#US-001 - Add login form`).
- **Linking work to requirements:** Reference the User Story id (e.g. `US-001`) in commit message or PR. Update the US file status to **In Progress** when starting, **Done** when the PR is merged. Full steps (US → code and code → US): [requirements/README](./requirements/README.md) → "Workflow: keep requirement docs updated".
- **PR checklist (suggested):** Code follows FEATURE-STRUCTURE and IMPLEMENTATION-GUIDE; lint and test pass; PR references the US id; US status updated when merging. When using GitHub, the PR template includes a requirement-docs checklist.
