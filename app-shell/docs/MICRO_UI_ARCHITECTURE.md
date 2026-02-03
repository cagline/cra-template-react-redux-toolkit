# Micro UI (Micro Frontend) Architecture

## Goal

Add **two new main modules** in the left side navigation. Each module is owned by a **different team** and must support **independent**:
- Development
- Version control
- Release versioning
- Deployment

---

## Technology Selection: Module Federation vs single-spa

Before choosing the micro frontend approach, we evaluated the two leading solutions: **Module Federation** and **single-spa**.

### What is Module Federation?

Module Federation is a **Webpack/Vite feature** that allows multiple independent builds to share code at runtime. It enables:
- Loading remote JavaScript modules from different origins
- Sharing dependencies between host and remotes
- Dynamic remote loading without rebuild

### What is single-spa?

single-spa is a **JavaScript framework** for orchestrating multiple micro frontends. It provides:
- Lifecycle management (bootstrap, mount, unmount)
- URL-based application activation
- Framework-agnostic architecture (React, Vue, Angular on same page)

### Comparison

| Aspect | Module Federation | single-spa |
|--------|-------------------|------------|
| **Primary purpose** | Code sharing between builds | Micro frontend orchestration |
| **Framework agnostic** | Partial (works best with same framework) | Yes (first-class support) |
| **Lifecycle management** | Manual (you handle mount/unmount) | Built-in (bootstrap/mount/unmount hooks) |
| **Routing** | Use existing router (React Router) | Built-in URL-based activation |
| **Shared dependencies** | Built-in sharing in bundler config | External (import maps / SystemJS) |
| **Bundler support** | Webpack (native), Vite (plugin) | Any bundler |
| **Learning curve** | Moderate (extends bundler config) | Steeper (new concepts, lifecycle) |
| **Community** | Webpack/Vite ecosystem | Dedicated MFE community |
| **Tooling** | Bundler plugins | `create-single-spa` CLI |
| **Runtime overhead** | Lower (just module loading) | Higher (orchestration layer) |

### Feature Deep-Dive

#### Lifecycle Management

**single-spa** requires each micro frontend to export lifecycle functions:

```javascript
// single-spa remote must export these
export function bootstrap(props) { return Promise.resolve(); }
export function mount(props) { 
  ReactDOM.render(<App />, props.domElement);
  return Promise.resolve();
}
export function unmount(props) {
  ReactDOM.unmountComponentAtNode(props.domElement);
  return Promise.resolve();
}
```

**Module Federation** lets you handle mounting however you want (or use React's natural component lifecycle).

#### Routing

**single-spa** has built-in URL-based activation:

```javascript
registerApplication({
  name: '@org/module-a',
  app: () => System.import('@org/module-a'),
  activeWhen: ['/module-a'],  // Built-in route matching
});
```

**Module Federation** uses your existing router (React Router in our case):

```typescript
// routes.tsx
{ path: "module-a/*", element: <RemoteModuleA /> }
```

#### Shared Dependencies

**Module Federation** handles sharing in the bundler config:

```javascript
// vite.config.ts
shared: {
  react: { singleton: true },
  'react-dom': { singleton: true },
}
```

**single-spa** typically uses import maps or SystemJS for sharing.

### Decision Matrix for Our Project

| Factor | Our Situation | Better Choice |
|--------|---------------|---------------|
| All apps same framework? | Yes (React) | Module Federation |
| Bundler | Vite | Module Federation (good plugin) |
| Need framework mixing? | No | Module Federation |
| Existing router | React Router v7 | Module Federation (reuse it) |
| Team familiarity | Bundler config | Module Federation |
| Lifecycle complexity | Simple (just React) | Module Federation |
| Shared deps | React, MUI, react-router | Module Federation (built-in) |

### Why We Chose Module Federation

1. **All React**: We don't need single-spa's framework-agnostic features since both remotes will be React.

2. **Simpler mental model**: Module Federation is just "remote components" — no new lifecycle concepts to learn.

3. **Reuse React Router**: We already use React Router v7. Module Federation lets us keep using it. single-spa would add another routing layer.

4. **Built-in dependency sharing**: Module Federation's `shared` config handles React/MUI singletons. single-spa requires external import maps.

5. **Vite compatibility**: The `@originjs/vite-plugin-federation` plugin works well with our Vite setup.

6. **Lower runtime overhead**: No orchestration layer — just load remote modules and render React components.

7. **Easier onboarding**: Developers familiar with Webpack/Vite will understand Module Federation faster than single-spa's lifecycle model.

### When We Would Choose single-spa Instead

single-spa would be the better choice if:
- We needed to mix frameworks (React + Vue + Angular)
- We wanted explicit lifecycle control (cleanup, memory management)
- We had a complex orchestration requirement (multiple apps on same page simultaneously)
- We were migrating a legacy monolith incrementally

### Conclusion

For our use case (two React micro frontends, Vite bundler, shared MUI theme, independent deployment), **Module Federation is the simpler and more appropriate choice**.

---

## Repository Structure (Polyrepo - Recommended)

Use **separate repositories** for maximum team independence:

```
github.com/your-org/
├── shell-app/                 # Platform/Core team (this repo)
├── module-a/                  # Team A (separate repo)
├── module-b/                  # Team B (separate repo)
└── shared-lib/                # Shared types, utilities (optional)
```

### Why Polyrepo?

| Requirement | How polyrepo satisfies it |
|-------------|---------------------------|
| Independent development | Each team works in their own repo |
| Independent version control | Separate git history, branches, tags |
| Independent releases | Each repo has own release cycle |
| Independent deployment | Each repo has own CI/CD pipeline |
| Team autonomy | Team A can't accidentally break Team B |

### Repository Responsibilities

#### Shell App (this repo)
- Owns: layout, `SideNav`, `TopBar`, shared theme (MUI), auth/session, global error boundary
- Owns: top-level routing via React Router
- Loads remotes at runtime via Module Federation

#### Module A Repo (Team A)
- Owns: all code under `/module-a/*` route
- Exposes: single React component consumed by shell
- Deploys: independently to CDN

#### Module B Repo (Team B)
- Owns: all code under `/module-b/*` route
- Exposes: single React component consumed by shell
- Deploys: independently to CDN

#### Shared Lib (Optional)
- Shared TypeScript types/interfaces
- Shared utility functions
- Published as `@your-org/shared` npm package

---

## Target Design: Vite + Module Federation

Use **Micro Frontends** with a **Shell** loading 2 independent **Remote** apps at runtime.

### Components
- **Shell (Host)**: this application
- **Remote A**: separate repo, owned by Team A
- **Remote B**: separate repo, owned by Team B

Each remote builds and deploys its own JS bundle (e.g., a `remoteEntry.js`) to a stable URL.

### Relevant Files in Shell

| File | Purpose |
|------|---------|
| `src/shared/SideNav/SideNav.tsx` | Add new menu items |
| `src/routes.tsx` | Add mount routes for micro UIs |
| `public/env-config.js` | Runtime config for remote URLs |
| `vite.config.ts` | Module Federation host config |

---

## Navigation + Routing Shape

### Side Navigation
Add two menu items in `SideNav`:
- `Module A` → `/module-a`
- `Module B` → `/module-b`

### Routes
Add two route mounts in `routes.tsx`:
- `module-a/*` renders Remote A root component
- `module-b/*` renders Remote B root component

---

## Runtime Configuration

Keep remote URLs **outside the shell build**, so the shell does not need redeploy when a remote updates.

### Example: `public/env-config.js`

```javascript
window._env_ = {
  // Existing config
  REACT_APP_BASE_URL: "http://localhost:3001",
  
  // Remote module URLs
  MODULE_A_REMOTE_URL: "https://cdn.company.com/mfe/module-a/remoteEntry.js",
  MODULE_B_REMOTE_URL: "https://cdn.company.com/mfe/module-b/remoteEntry.js",
}
```

### Environment-Specific URLs

| Environment | Module A URL | Module B URL |
|-------------|--------------|--------------|
| Local Dev | `http://localhost:3001/remoteEntry.js` | `http://localhost:3002/remoteEntry.js` |
| Staging | `https://staging-cdn.company.com/mfe/module-a/remoteEntry.js` | `https://staging-cdn.company.com/mfe/module-b/remoteEntry.js` |
| Production | `https://cdn.company.com/mfe/module-a/remoteEntry.js` | `https://cdn.company.com/mfe/module-b/remoteEntry.js` |

---

## Remote App Contract

Each remote should expose **one stable entry** consumed by the shell.

### Option A (Recommended): Expose a React Component

```typescript
// module-a/src/App.tsx
export default function ModuleAApp({ user, token, navigate }: ShellProps) {
  return (
    <Routes>
      <Route path="/" element={<ModuleAHome />} />
      <Route path="/details/:id" element={<ModuleADetails />} />
    </Routes>
  );
}
```

Remote internally handles its nested pages under the base path (`/module-a/...`).

### Option B: Expose Route Objects

```typescript
// module-a/src/routes.ts
export const routes = [
  { path: "/", element: <ModuleAHome /> },
  { path: "/details/:id", element: <ModuleADetails /> },
];
```

Shell mounts them under `module-a/*` and `module-b/*`.

---

## Shared State / Context

Shell passes the following **props** to each remote:

| Prop | Type | Description |
|------|------|-------------|
| `user` | `User \| null` | Current authenticated user |
| `token` | `string \| null` | Auth token for API calls |
| `theme` | `Theme` | MUI theme object |
| `navigate` | `NavigateFunction` | Shell's router navigate function |

### Rules
- Remotes should **NOT** access shell's Redux store directly
- Remotes can have their own internal state management
- For cross-remote communication, use shell-provided event bus (if needed)

### Example: Shell Mounting Remote

```typescript
// Shell: src/remotes/RemoteLoader.tsx
<Suspense fallback={<Loading />}>
  <ErrorBoundary fallback={<RemoteError />}>
    <RemoteModuleA 
      user={user}
      token={token}
      theme={theme}
      navigate={navigate}
    />
  </ErrorBoundary>
</Suspense>
```

---

## Router Ownership Rule

- The **Shell** owns `BrowserRouter`
- Remotes must **NOT** create a second `BrowserRouter`
- Remotes render content compatible with the shell route base (`/module-a/*`, `/module-b/*`)
- Remotes use `useNavigate()` from props or relative navigation

---

## Shared Dependencies

In federation config, share/singleton these to avoid duplicates:

```javascript
// vite.config.ts (both shell and remotes)
shared: {
  react: { singleton: true, requiredVersion: '^19.0.0' },
  'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
  'react-router-dom': { singleton: true, requiredVersion: '^7.0.0' },
  '@mui/material': { singleton: true },
  '@emotion/react': { singleton: true },
  '@emotion/styled': { singleton: true },
}
```

---

## Versioning Strategy

### Shell API Version
- Shell declares a **contract version** (e.g., `shell-api-v1`)
- Document in shell repo: what props are passed, what hooks are available

### Remote Compatibility
- Each remote declares compatible shell versions in `package.json` or manifest
- Backward compatibility: remotes should support shell-api-vN and vN-1

### Breaking Changes
- Announce breaking changes 2 weeks ahead
- Coordinate release if shell contract changes
- Use feature flags to gradually roll out

### Example: Remote Manifest

```json
{
  "name": "module-a",
  "version": "1.2.0",
  "shellCompatibility": ["shell-api-v1", "shell-api-v2"],
  "exposedComponent": "./src/App.tsx"
}
```

---

## Local Development

### Team A Developing Remote A

**Option 1: Standalone with Mock Shell**
- Run Remote A on `localhost:3001`
- Use a minimal mock shell (layout, router, theme) for standalone testing
- Faster iteration, no shell dependency

**Option 2: Full Integration**
- Run shell locally
- Set `MODULE_A_REMOTE_URL=http://localhost:3001/remoteEntry.js` in `env-config.js`
- Run Remote A on `localhost:3001`
- Test full integration

### Shell Team Developing Shell

- Use **stub remotes** (placeholder components) for routes
- OR: Point to deployed staging remotes
- Test with mock remote loaders

### Local Dev Config

```javascript
// public/env-config.js (local development)
window._env_ = {
  REACT_APP_BASE_URL: "http://localhost:3001",
  MODULE_A_REMOTE_URL: "http://localhost:3001/remoteEntry.js",
  MODULE_B_REMOTE_URL: "http://localhost:3002/remoteEntry.js",
}
```

---

## CI/CD + Release Model

### Team A Pipeline (Remote A Repo)

```yaml
# .github/workflows/deploy.yml
on:
  push:
    tags: ['v*']

jobs:
  build-deploy:
    steps:
      - npm ci
      - npm run build
      - deploy to CDN (e.g., S3 + CloudFront)
      - output: https://cdn.company.com/mfe/module-a/remoteEntry.js
```

### Team B Pipeline (Remote B Repo)
- Same as above

### Shell Pipeline (This Repo)

Deploy shell independently. Changes only when:
- routing/navigation changes
- contract changes (remote export name changes)
- shared dependency version changes

---

## Rollback / Failsafe

### CDN Versioning
- Keep last 3 versions of each remote on CDN
- Use content hash in filenames for cache busting

```
https://cdn.company.com/mfe/module-a/
├── remoteEntry.js              # Latest (alias)
├── remoteEntry.abc123.js       # v1.2.0
├── remoteEntry.def456.js       # v1.1.0
└── remoteEntry.ghi789.js       # v1.0.0
```

### Failure Handling

If Remote A fails to load:
1. Shell shows error UI with retry button
2. Log error to monitoring (e.g., Sentry)
3. Option: fall back to previous Remote A version via manifest

### Feature Flags

- Disable a broken remote without shell redeploy
- Gradual rollout of new remote versions

```javascript
window._env_ = {
  MODULE_A_ENABLED: true,
  MODULE_B_ENABLED: true,
  MODULE_A_REMOTE_URL: "...",
}
```

---

## Performance

### Loading Strategy
- **Lazy load** remotes on route hit (don't preload all on shell load)
- **Prefetch** on hover over nav item (optional optimization)

### Caching
- Use long cache headers with content hash in filename
- CDN caching for remote bundles

### Monitoring
- Track remote load times (Performance API or RUM)
- Alert on slow loads or failures

### Bundle Size
- Each remote should be code-split internally
- Shared deps are loaded once by shell

---

## Testing Strategy

### Unit Tests (Each Team)
- Test remote components in isolation
- Mock shell props (user, token, navigate)

### Integration Tests (Shell Repo)
- Shell runs with mock/stub remotes
- Validate remote loading, error handling

### E2E Tests (Staging Environment)
- Shell + real deployed remotes
- Full user flows across modules

### Contract Tests
- Validate remote exports expected component
- Validate shell passes required props
- Run on PR merge to catch breaking changes

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CDN / Hosting                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Shell App                 Module A           Module B         │
│   ──────────                ─────────          ─────────        │
│   /index.html               /remoteEntry.js    /remoteEntry.js  │
│   /assets/*                 /assets/*          /assets/*        │
│                                                                 │
│   Deployed by:              Deployed by:       Deployed by:     │
│   Platform Team             Team A             Team B           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         Runtime Flow                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. User loads shell → https://app.company.com                 │
│   2. Shell reads env-config.js for remote URLs                  │
│   3. User clicks "Module A" in nav                              │
│   4. Shell lazy-loads Remote A from MODULE_A_REMOTE_URL         │
│   5. Remote A mounts under /module-a/* route                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Alternatives Considered

We evaluated several approaches before selecting Module Federation. See the detailed comparison in [Technology Selection](#technology-selection-module-federation-vs-single-spa) above.

### 1. npm Package Modules
- **Pros**: Simplest build tooling, familiar workflow
- **Cons**: Shell must rebuild/redeploy to get new versions → **not "independent deployment"**
- **Verdict**: Rejected — doesn't meet our core requirement

### 2. iframe Embedding
- **Pros**: Strongest isolation, no shared runtime conflicts
- **Cons**: Harder UX integration (routing, theme, auth, sizing, cross-app communication)
- **Verdict**: Rejected — too much friction for unified UX

### 3. single-spa
- **Pros**: Framework-agnostic, explicit lifecycle management, built-in routing
- **Cons**: More complex, extra lifecycle boilerplate, overkill for all-React setup
- **Verdict**: Rejected — unnecessary complexity since all apps are React
- **Reconsider if**: Future requirement to mix React + Vue + Angular

### 4. Monorepo (with Module Federation)
- **Pros**: Easy code sharing, atomic commits, single CI config
- **Cons**: Less team independence, shared git history, complex selective builds
- **Verdict**: Rejected — doesn't meet "independent version control" requirement
- **Reconsider if**: Teams are small and want tight collaboration

### Selected Approach
**Polyrepo + Vite + Module Federation** — best fit for independent teams with all-React micro frontends.

---

## Summary

- **Architecture**: Vite + Module Federation (runtime remotes)
- **Repo Structure**: Polyrepo (3 separate repos: shell, module-a, module-b)
- **Navigation**: Two new nav items in SideNav
- **Routing**: `module-a/*` and `module-b/*` mount remote components
- **Config**: Remote URLs in `env-config.js` (runtime, not build-time)
- **Deploy**: Each team deploys independently to CDN
- **Shared**: React, MUI, react-router as singletons
- **Props**: Shell passes user, token, theme, navigate to remotes
- **Failsafe**: Error boundaries, retry, rollback via versioned CDN

This architecture enables Team A and Team B to build, release, and deploy independently while maintaining a unified user experience in the shell.
