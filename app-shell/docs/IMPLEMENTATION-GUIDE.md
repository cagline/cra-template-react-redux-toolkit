# Implementation guide

How to build a React application that matches this app-shell: **main structure**, **feature folder structure**, **API slices** (shared vs feature-owned), **store wiring**, and **routes**.

**Building from scratch or with an AI?** Start with [TECH-STACK-AND-SCAFFOLD.md](./TECH-STACK-AND-SCAFFOLD.md) for the required stack (React, Redux Toolkit, MUI, Vite, TypeScript) and scaffold order, then use this guide with [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md) and [FEATURE-STRUCTURE.md](./FEATURE-STRUCTURE.md) so someone with only the `.md` files in `docs/` can generate a similar app.

---

## 1. Main structure

Follow the directory tree in [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md):

- **src/api/** — Shared API layer only (base query, interceptors). Do **not** put feature-specific RTK Query API slices here.
- **src/features/** — One folder per feature; each feature owns its UI, controller hook(s), and **its own API slice** if it talks to the server.
- **src/store/** — Redux store; imports reducers and API slices from features (see below).
- **src/layouts/**, **src/shared/**, **src/config/**, **src/utils/** — As in the project structure doc.

---

## 2. Feature folder structure

Follow [FEATURE-STRUCTURE.md](./FEATURE-STRUCTURE.md): flat by default, name by role.

**Minimal feature (e.g. counter — no server):**

```
src/features/counter/
├── index.ts                    # Public exports
├── CounterPage.tsx             # Main screen
├── useCounterController.ts     # Business logic (Redux selectors/dispatch) — optional for very small features
├── counterSlice.ts             # Redux slice (optional)
├── counterAPI.ts               # Plain async helper (optional)
└── CounterPage.module.css      # Styles (optional)
```

For very small, single-use features, the controller hook is optional; Redux selectors, dispatch, and local state can live directly in the Page. See [FEATURE-STRUCTURE.md](./FEATURE-STRUCTURE.md#controller-hook-optional-by-default-for-small-features): if the logic fits in roughly under ~20 lines and is used in one place, keep it in the Page; if it exceeds ~20–25 lines or has multiple concerns, use a controller hook.

**Feature with server API (e.g. todo):**

```
src/features/todo/
├── index.ts                    # Public exports (Page, controller, apiSlice)
├── TodoPage.tsx                # Main screen
├── useTodoController.ts        # Uses RTK Query hooks, exposes state + handlers
├── todoApiSlice.ts             # RTK Query createApi — lives in the feature
└── (optional) constants.ts, utils.ts
```

- **API slice lives in the feature** — `todoApiSlice.ts` is under `src/features/todo/`, not under `src/api/`.
- **Feature index** re-exports: the Page component, the controller hook, and the API slice (so the store can import from the feature).
- **Controller hook:** Use when the logic exceeds roughly ~20–25 lines or has multiple concerns (RTK Query, `useEffect`, several handlers); see [FEATURE-STRUCTURE.md](./FEATURE-STRUCTURE.md#controller-hook-optional-by-default-for-small-features).

---

## 3. API slices: shared vs feature

### 3.1 Shared API layer (`src/api/`)

- **Purpose:** One place for base HTTP setup and interceptors (auth, base URL, headers).
- **Typical file:** `src/api/interceptorsSlice.ts` (or similar).
- **Exports:** e.g. `baseQueryWithReauth` — a `BaseQueryFn` that wraps `fetchBaseQuery` and adds reauth/logging. No `createApi` here for feature data.

**Usage:** Feature API slices import this base query:

```ts
// src/features/todo/todoApiSlice.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../api/interceptorsSlice';

export const todoApiSlice = createApi({
  reducerPath: 'todo',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['todo'],
  endpoints: (builder) => ({
    getToDos: builder.query(...),
    createToDo: builder.mutation(...),
    // ...
  }),
});
export const { useLazyGetToDosQuery, useCreateToDoMutation, ... } = todoApiSlice;
```

### 3.2 Feature API slices (`src/features/[FeatureName]/`)

- **Where:** `src/features/[FeatureName]/[featureName]ApiSlice.ts` (e.g. `todoApiSlice.ts`).
- **What:** RTK Query `createApi` with `reducerPath`, `baseQuery` from shared api, `tagTypes`, and `endpoints`.
- **Export from feature index:** Export the slice (and optionally types) so the store can import from the feature:

```ts
// src/features/todo/index.ts
export { default as TodoPage } from './TodoPage';
export { useTodoController } from './useTodoController';
export { todoApiSlice } from './todoApiSlice';
export type { ToDo } from './todoApiSlice';
```

- **Naming:** Prefer `[featureName]ApiSlice.ts` and export as `[featureName]ApiSlice` (e.g. `todoApiSlice`).

---

## 4. Store wiring

- **Redux slices** (e.g. counter, app): Import from the feature path and add to `reducer`.
- **Feature API slices:** Import from the **feature index** (not from `src/api/`). Add the API reducer and middleware.

**Example:**

```ts
// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import appReducer from '../appSlice';
import { todoApiSlice } from '../features/todo';   // from feature, not api/

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    app: appReducer,
    [todoApiSlice.reducerPath]: todoApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(todoApiSlice.middleware),
});
```

- Each feature API slice adds: one reducer entry (`[apiSlice.reducerPath]: apiSlice.reducer`) and `apiSlice.middleware` in `middleware`.

---

## 5. Feature index and routes

### 5.1 Feature `index.ts`

- Export the **Page** component (default or named).
- Export **controller hook(s)** and **API slice** (if the feature has one) so the store can import the slice from the feature.
- Optionally export types (e.g. `ToDo`).

### 5.2 Routes: lazy load from feature index

- Do **not** import page components from deep paths (e.g. `features/todo/Todo.tsx`).
- Lazy load from the **feature index** and use the exported Page:

```ts
// src/routes.tsx
const TodoPage = lazy(() =>
  import('./features/todo').then((m) => ({ default: m.TodoPage }))
);
const CounterPage = lazy(() =>
  import('./features/counter').then((m) => ({ default: m.CounterPage }))
);
// ... use <TodoPage />, <CounterPage /> in route elements
```

- This keeps a single public API per feature (the index) and matches the structure in FEATURE-STRUCTURE.

---

## 6. Controller + Page pattern

- **Controller hook** (`use[FeatureName]Controller.ts`):
  - Uses Redux (e.g. `useAppSelector`, `useAppDispatch`) and/or RTK Query hooks (e.g. `useLazyGetToDosQuery`, `useCreateToDoMutation`).
  - Owns local UI state (e.g. input value) and effect triggers (e.g. fetch on mount).
  - Returns a single object: `{ ...state, ...handlers }` (e.g. `toDos`, `todoInput`, `setTodoInput`, `addTodo`, `toggleDone`, `deleteTodo`).

- **Page component** (`[FeatureName]Page.tsx`):
  - Calls the controller hook once; renders only from the returned state and handlers.
  - No direct use of `useAppDispatch` or RTK Query hooks in the Page; keep that in the controller.

This keeps the Page presentational and makes the feature easy to test and reuse.

**Controller hook optional by default:** For minimal, single-use features (e.g. a simple counter in one page), don't use a controller hook — keep selectors, dispatch, and local state in the Page. Add one when the feature grows or is reused. Use the generic rule by size: under ~20 lines in one place → optional; over ~20–25 lines or multiple concerns → use a controller hook. See [FEATURE-STRUCTURE.md](./FEATURE-STRUCTURE.md#controller-hook-optional-by-default-for-small-features).

---

## 7. Checklist to generate a similar app

1. **Scaffold** the main structure from [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md) (api, shared, config, features, layouts, remotes, store, utils, App, index, routes).
2. **Shared API:** Add `src/api/interceptorsSlice.ts` (or equivalent) exporting a base query; no feature `createApi` in `api/`.
3. **Per feature:**
   - Create `src/features/[FeatureName]/` with flat layout from [FEATURE-STRUCTURE.md](./FEATURE-STRUCTURE.md).
   - Add `[FeatureName]Page.tsx`, `use[FeatureName]Controller.ts`, and `index.ts`. If the feature has server data, add `[featureName]ApiSlice.ts` in the same folder and export it from `index.ts`.
4. **Store:** Import feature reducers and feature API slices from features (e.g. `from '../features/todo'`); register reducers and API middleware.
5. **Routes:** Lazy load from feature index and use the exported Page component in route elements.
6. **Naming:** Use `[FeatureName]Page`, `use[FeatureName]Controller`, `[featureName]ApiSlice` as in this guide and FEATURE-STRUCTURE.

Following this, someone with only the `docs/` `.md` files can reproduce the main structure, feature folder structure, API slice placement (shared vs feature), and store/routes wiring.
