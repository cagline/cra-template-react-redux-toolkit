# Micro UI Architecture - POC Implementation

This POC implements the micro frontend architecture described in `MICRO_UI_ARCHITECTURE.md`.

## What's Implemented

### Shell App (my-app)

1. **Module Federation Configuration** (`vite.config.ts`)
   - Configured as a Module Federation host
   - Shared dependencies: React, React Router, MUI, Emotion

2. **Runtime Configuration** (`public/env-config.js`)
   - Remote module URLs (configurable per environment)
   - Feature flags to enable/disable modules
   - `USE_STUB_REMOTES` flag for development mode

3. **Remote Loader Components** (`src/remotes/`)
   - `RemoteLoader.tsx` - Lazy loads remote modules with Suspense
   - `RemoteErrorBoundary.tsx` - Error handling with retry functionality
   - `types.ts` - Shell props contract (user, token, theme, navigate)

4. **Stub Components** (`src/remotes/stubs/`)
   - `ModuleAStub.tsx` - Team Management module (stub)
   - `ModuleBStub.tsx` - Reporting & Analytics module (stub)

5. **Navigation** (`src/shared/SideNav/SideNav.tsx`)
   - Added "Module A" and "Module B" menu items

6. **Routing** (`src/routes.tsx`)
   - Added routes: `/module-a/*` and `/module-b/*`

### Sample Remote Apps

**Remote Module A (remote-module-a)** - Team Management
- Runs on port 3001
- Features: Team list, team details, settings

**Remote Module B (remote-module-b)** - Reporting & Analytics
- Runs on port 3002
- Features: Metrics dashboard, reports table, report details, analytics dashboard

Both can run:
- **Standalone** for independent development
- **Integrated** via Module Federation with the shell

## Quick Start

### 1. Run with Stub Remotes (Easiest)

```bash
cd my-app
npm run dev
```

Open http://localhost:3000 and click on "Module A" or "Module B" in the sidebar.

The stub components simulate the remote modules without needing to run separate servers.

### 2. Run with Real Remotes (Advanced)

**Terminal 1 - Start Remote Module A:**
```bash
cd remote-module-a
npm install
npm run dev   # Runs on port 3001
```

**Terminal 2 - Start Remote Module B:**
```bash
cd remote-module-b
npm install
npm run dev   # Runs on port 3002
```

**Terminal 3 - Start Shell:**
```bash
cd my-app
# Edit public/env-config.js and set USE_STUB_REMOTES: false
npm run dev   # Runs on port 3000
```

## Configuration

### env-config.js Options

```javascript
window._env_ = {
  // Feature flags
  MODULE_A_ENABLED: true,
  MODULE_B_ENABLED: true,

  // Remote URLs (for when USE_STUB_REMOTES is false)
  MODULE_A_REMOTE_URL: "http://localhost:3001/assets/remoteEntry.js",
  MODULE_B_REMOTE_URL: "http://localhost:3002/assets/remoteEntry.js",

  // Development mode: use built-in stubs instead of real remotes
  USE_STUB_REMOTES: true,
}
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Shell (my-app)                          │
│  Port 3000                                                      │
├─────────────────────────────────────────────────────────────────┤
│  - SideNav (with Module A, Module B links)                      │
│  - TopBar                                                       │
│  - Routes: /, /counter, /todo, /module-a/*, /module-b/*         │
│  - RemoteLoader (loads federated modules or stubs)              │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┴────────────────────┐
         │                                         │
         ▼                                         ▼
┌─────────────────────┐                 ┌─────────────────────┐
│  Remote Module A    │                 │  Remote Module B    │
│  (remote-module-a)  │                 │  (create separately)│
│  Port 3001          │                 │  Port 3002          │
├─────────────────────┤                 ├─────────────────────┤
│  Team Management    │                 │  Reporting/Analytics│
│  - /module-a/       │                 │  - /module-b/       │
│  - /module-a/details│                 │  - /module-b/report │
│  - /module-a/settings                 │                     │
└─────────────────────┘                 └─────────────────────┘
```

## Shell Props Contract

The shell passes these props to each remote module:

```typescript
interface ShellProps {
  user: User | null;      // Current authenticated user
  token: string | null;   // Auth token for API calls
  theme: Theme;           // MUI theme object
  navigate: NavigateFunction;  // Router navigate function
}
```

## Key Files

| File | Purpose |
|------|---------|
| `my-app/vite.config.ts` | Module Federation host config |
| `my-app/public/env-config.js` | Runtime config for remote URLs |
| `my-app/src/remotes/RemoteLoader.tsx` | Loads remote modules |
| `my-app/src/remotes/types.ts` | Shell props type definitions |
| `my-app/src/routes.tsx` | Route configuration |
| `my-app/src/shared/SideNav/SideNav.tsx` | Navigation with module links |
| `remote-module-a/vite.config.ts` | Module Federation remote config |
| `remote-module-a/src/App.tsx` | Remote module entry point |

## Next Steps

1. **Add Authentication**: Replace mock user/token with real auth
3. **Deploy to CDN**: Set up CI/CD for each remote
4. **Add Error Monitoring**: Integrate Sentry or similar
5. **Implement Feature Flags**: Use a feature flag service for gradual rollouts

## Testing the POC

1. Navigate to http://localhost:3000
2. Click "Module A" in the sidebar → See Team Management UI
3. Click on a team card → Navigate to detail page
4. Click "Module B" in the sidebar → See Reporting & Analytics UI
5. Interact with the reports table

The stub modules demonstrate:
- Internal routing within modules
- Receiving shell props (user info displayed)
- Using MUI components with shell theme
- Navigation via shell's navigate function
