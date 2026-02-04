# Tech Stack & Scaffold (From Scratch / AI Use)

Use this document when **building a new application** that should match this app-shell's **technical stack** and **project structure** — for example when copying the `docs/` folder into an empty project and using an AI agent (e.g. "vibe code") to generate the base application.

---

## 1. Technical stack (required)

The base application **must** use this stack so that structure and patterns in the other docs apply:

| Layer | Technology | Notes |
|-------|------------|--------|
| **UI framework** | React 18+ | With TypeScript |
| **State & API** | Redux Toolkit | `@reduxjs/toolkit`; includes RTK Query for server state |
| **UI components & theme** | MUI (Material-UI) | `@mui/material`; use for layout (e.g. Topbar, SideNav), theme, and shared components |
| **Build & dev server** | Vite | With React + TypeScript template |
| **Routing** | React Router | `react-router-dom` (v6/v7) |
| **Language** | TypeScript | Strict mode recommended |

**Key packages to install (base app):**

- `react`, `react-dom`
- `@reduxjs/toolkit`, `react-redux`
- `@mui/material`, `@emotion/react`, `@emotion/styled`
- `react-router-dom`
- `vite`, `@vitejs/plugin-react`, `typescript`

Optional for full parity with this repo: `i18next`, `react-i18next` (see [LOCALIZATION.md](./LOCALIZATION.md)).

---

## 2. From-scratch scaffold order

If you start from an **empty folder** or a minimal Vite app, follow this order so the result matches the docs:

1. **Create a Vite + React + TypeScript app** (e.g. `npm create vite@latest . -- --template react-ts`).
2. **Install the stack above** (Redux Toolkit, react-redux, MUI, Emotion, React Router).
3. **Apply the structure** using [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md): create `src/api/`, `src/shared/`, `src/config/`, `src/features/`, `src/layouts/`, `src/store/`, `src/utils/`, and entry files (`App.tsx`, `index.tsx`, `routes.tsx`).
4. **Wire the store** and **shared API** as in [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md) (base query in `src/api/`, store in `src/store/`).
5. **Add features** using [FEATURE-STRUCTURE.md](./FEATURE-STRUCTURE.md) and [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md): flat feature folders, `[FeatureName]Page.tsx`, controller hooks, feature-owned API slices, lazy-loaded routes from feature index.

**Doc flow for structure and patterns:**  
[PROJECT-STRUCTURE](./PROJECT-STRUCTURE.md) → [FEATURE-STRUCTURE](./FEATURE-STRUCTURE.md) → [IMPLEMENTATION-GUIDE](./IMPLEMENTATION-GUIDE.md).

---

## 3. Instructions for AI agents

When using an AI agent to generate the base application from these docs:

1. **Tech stack:** Use **React**, **Redux Toolkit** (with RTK Query), **MUI (Material-UI)**, **Vite**, and **TypeScript**. Do not substitute other UI libraries (e.g. Chakra, Ant) or state libraries (e.g. Zustand only) if the goal is to match this app-shell.
2. **Layout and theme:** Use MUI for the shell layout (e.g. Topbar, SideNav, dashboard layout) and a single MUI theme (e.g. `createTheme`, `ThemeProvider`).
3. **Structure:** Follow the directory tree and folder roles in [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md).
4. **Features:** Follow [FEATURE-STRUCTURE.md](./FEATURE-STRUCTURE.md) (flat by default, naming by role) and [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md) (API slices in features, shared API in `src/api/`, store and routes wiring).
5. **Checklist:** Use the "Checklist to generate a similar app" in [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md#7-checklist-to-generate-a-similar-app) and ensure the scaffold includes the shared API layer, feature index exports, store registration of feature reducers and API middleware, and lazy-loaded routes from feature index.

Micro frontends (remotes, Module Federation) are optional; see [MICRO_UI_ARCHITECTURE.md](./MICRO_UI_ARCHITECTURE.md) and [REMOTE-MODULE-CONTRACT.md](./REMOTE-MODULE-CONTRACT.md) only if you need them.

---

## 4. What the other docs assume

- **GETTING-STARTED.md** — For **running this repo** (monorepo with app-shell + remotes). Use it after you have the repo; for from-scratch, use this doc and the structure/implementation guides.
- **ENVIRONMENT.md**, **REMOTE-MODULE-CONTRACT.md**, **LOCALIZATION.md** — Configuration and remotes; use when you need env config, remote contract, or i18n.
- **MICRO_UI_ARCHITECTURE.md**, **MICRO_UI_POC_README.md** — Micro frontend design and POC; only needed if you add remotes.

Following **this doc** plus **PROJECT-STRUCTURE** → **FEATURE-STRUCTURE** → **IMPLEMENTATION-GUIDE** gives clear, reproducible instructions to create the same kind of base application (React + Redux Toolkit + MUI + same project structure).
