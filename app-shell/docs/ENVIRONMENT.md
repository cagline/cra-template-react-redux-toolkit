# Environment Configuration

The shell loads environment variables at **runtime** from `public/env-config.js`, which is included in `index.html` before the app bundle. This allows changing config without rebuilding (e.g. per deployment or environment).

## Config file

**Location:** `app-shell/public/env-config.js`

It defines a global object `window._env_`:

```javascript
window._env_ = {
  REACT_APP_BASE_URL: "http://localhost:3001",
  REACT_APP_DEVICE_URL: "${DEVICE_URL}",
  REACT_APP_X_API_KEY: "${X_API_KEY}",
  REACT_APP_LOG_LEVEL: "verbose",
  REACT_APP_TIME_ZONE_NAME: "${TIME_ZONE_NAME}",

  // Micro Frontend Remote Module Configuration
  MODULE_A_ENABLED: true,
  MODULE_B_ENABLED: true,
  MODULE_A_REMOTE_URL: "http://localhost:3001/assets/remoteEntry.js",
  MODULE_B_REMOTE_URL: "http://localhost:3002/assets/remoteEntry.js",
  USE_STUB_REMOTES: false,
};
```

## Variables

### General

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_BASE_URL` | Base API URL | `http://localhost:3001` |
| `REACT_APP_DEVICE_URL` | Device/service URL | Set per environment |
| `REACT_APP_X_API_KEY` | API key for requests | Set per environment |
| `REACT_APP_LOG_LEVEL` | Log level | `verbose`, `info`, `warn`, `error` |
| `REACT_APP_TIME_ZONE_NAME` | Time zone | e.g. `Europe/Berlin` |

### Micro frontend remotes

| Variable | Description | Example |
|----------|-------------|---------|
| `MODULE_A_ENABLED` | Whether Module A is enabled | `true` / `false` |
| `MODULE_B_ENABLED` | Whether Module B is enabled | `true` / `false` |
| `MODULE_A_REMOTE_URL` | Full URL to Module A’s `remoteEntry.js` | `http://localhost:3001/assets/remoteEntry.js` |
| `MODULE_B_REMOTE_URL` | Full URL to Module B’s `remoteEntry.js` | `http://localhost:3002/assets/remoteEntry.js` |
| `USE_STUB_REMOTES` | If `true`, use in-shell stub components instead of loading remotes | `false` (use real remotes) |

## Usage in code

TypeScript types for `window._env_` are in `src/remotes/types.ts`. Use the config like this:

```typescript
if (window._env_?.MODULE_A_ENABLED) {
  // load Module A
}

const remoteUrl = window._env_?.MODULE_A_REMOTE_URL ?? 'http://localhost:3001/assets/remoteEntry.js';
```

The remote loaders in `src/remotes/RemoteLoader.tsx` read `MODULE_*_ENABLED`, `*_REMOTE_URL`, and `USE_STUB_REMOTES` to decide whether to load a real remote or render a stub.

## Local development

- Use the values above for local dev (shell 3000, Module A 3001, Module B 3002).
- Set `USE_STUB_REMOTES: true` to work on the shell without running remotes.

## Production / deployment

1. **Build** the shell and each remote; serve the shell’s `dist/` and each remote’s `dist/` (e.g. from CDN or static host).
2. **Replace** `public/env-config.js` per environment (or generate it in your pipeline) with production values:
   - `MODULE_A_REMOTE_URL`: e.g. `https://cdn.example.com/module-a/assets/remoteEntry.js`
   - `MODULE_B_REMOTE_URL`: e.g. `https://cdn.example.com/module-b/assets/remoteEntry.js`
   - `USE_STUB_REMOTES: false`
   - Set other `REACT_APP_*` and `*_REMOTE_URL` as needed.
3. Ensure `env-config.js` is deployed with the shell and loaded from the same origin (or a known URL) so `window._env_` is available before the app runs.

## Placeholders

Some projects use placeholders like `${DEVICE_URL}` and replace them at deploy time. The current repo may ship literal strings; replace or generate `env-config.js` in CI/CD so production gets the correct values.
