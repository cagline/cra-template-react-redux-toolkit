# Remote Module Contract

How the shell and remote modules interact: props, routing, and adding a new remote.

## ShellProps (contract)

The shell passes a single props object to each remote’s root component. Type definition lives in **`app-shell/src/remotes/types.ts`** and is mirrored (or imported) by remotes.

### ShellProps interface

```typescript
interface ShellProps {
  /** Current authenticated user */
  user: User | null;
  /** Auth token for API calls */
  token: string | null;
  /** MUI theme object */
  theme: Theme;
  /** Shell's router navigate function */
  navigate: NavigateFunction;
}

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}
```

- **user** — Current user; remotes use it for display and access control.
- **token** — Auth token; remotes can use it for API calls (or the shell can attach it via interceptors).
- **theme** — MUI theme so remotes can align with shell theme (e.g. dark/light).
- **navigate** — React Router’s `navigate`. Remotes should use this for shell-level navigation (e.g. back to shell home or to another module) so the shell’s router stays in sync.

Remotes **must not** create their own `BrowserRouter`; they receive `navigate` and render under the shell’s router. They can use `<Routes>` / `<Route>` for their own sub-routes under the path the shell gives them.

## How remotes are loaded

1. **Routes** — In `src/routes.tsx`, routes `module-a/*` and `module-b/*` render `RemoteModuleA` and `RemoteModuleB` respectively. The `*` lets the remote handle sub-paths (e.g. `/module-a/details/1`).
2. **Remote loaders** — `src/remotes/RemoteLoader.tsx`:
   - Reads `window._env_.USE_STUB_REMOTES` and `MODULE_*_ENABLED`.
   - If stubs are enabled or the module is disabled, renders a stub component (`ModuleAStub` / `ModuleBStub`).
   - Otherwise, dynamically imports the federated module (`import('moduleA/App')` or `import('moduleB/App')`) and passes `ShellProps`.
3. **ShellProps** — Built in `useShellProps()` (navigate, theme, mock user/token) and passed to the remote’s default export.

## Stub vs real remote

| Mode | When | Behavior |
|------|------|----------|
| **Real remote** | `USE_STUB_REMOTES: false`, module enabled, remote URL loads | Shell loads `remoteEntry.js` and mounts the remote’s App with ShellProps. |
| **Stub** | `USE_STUB_REMOTES: true` or remote fails to load | Shell renders an in-repo stub component that implements the same ShellProps contract, so you can develop the shell without running the remote. |

Stubs live in `src/remotes/stubs/` (e.g. `ModuleAStub.tsx`, `ModuleBStub.tsx`). They accept `ShellProps` and mimic the remote’s UI/behavior for development.

## Adding a new remote (e.g. Module C)

1. **Remote repo/app**
   - Build a Vite app that exposes a root component (e.g. `./App`) via Module Federation.
   - Use the same shared deps as the shell (React, react-router-dom, MUI, i18next, react-i18next) with **singleton: true** so one instance is shared.
   - Default export of the entry component must accept `ShellProps` and render its own `<Routes>` for sub-routes.

2. **Shell: env config**
   - In `public/env-config.js`, add:
     - `MODULE_C_ENABLED: true`
     - `MODULE_C_REMOTE_URL: 'http://localhost:3003/assets/remoteEntry.js'` (or your URL).
   - Keep or set `USE_STUB_REMOTES: false` when you want to load the real Module C.

3. **Shell: Vite federation**
   - In `app-shell/vite.config.ts`, add the remote and shared config for the new app (same shared list, including i18n if the remote uses translations).

4. **Shell: types**
   - In `src/remotes/types.ts`, extend `Window['_env_']` with `MODULE_C_ENABLED` and `MODULE_C_REMOTE_URL`.

5. **Shell: remote loader**
   - In `src/remotes/RemoteLoader.tsx`, add `RemoteModuleC`: same pattern as A/B (check enabled/stub, lazy `import('moduleC/App')`, pass `useShellProps()`).

6. **Shell: stub (optional)**
   - Add `src/remotes/stubs/ModuleCStub.tsx` that accepts `ShellProps` and optionally add it to stubs index.

7. **Shell: routes**
   - In `src/routes.tsx`, add a route `{ path: 'module-c/*', element: <RemoteModuleC /> }` (wrapped in Suspense if needed).

8. **Shell: navigation**
   - Add a sidebar/link to `/module-c` so users can open the new module.

9. **Remote: localization**
   - If the remote uses i18n, add its keys under a namespace (e.g. `moduleC`) in `app-shell/public/locales/<lng>/translation.json` and use `useTranslation()` / `t('moduleC.…')` in the remote so it uses the shell’s shared i18n instance.

## Shared dependencies (Module Federation)

Shell and remotes must share the same major versions and declare **singleton: true** for:

- react, react-dom
- react-router-dom
- @mui/material, @emotion/react, @emotion/styled
- i18next, react-i18next

So the shell and all remotes use one React tree, one router, one theme, and one i18n instance. Remotes **do not** initialize their own i18n or router; they use what the shell provides via shared modules and ShellProps.
