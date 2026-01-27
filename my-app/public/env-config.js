window._env_ = {
  // REACT_APP_BASE_URL: "${BASE_URL}",
  REACT_APP_BASE_URL: "http://localhost:3001",
  REACT_APP_DEVICE_URL: "${DEVICE_URL}",
  REACT_APP_X_API_KEY: "${X_API_KEY}",
  REACT_APP_LOG_LEVEL: "verbose",
  REACT_APP_TIME_ZONE_NAME: "${TIME_ZONE_NAME}",

  // ============================================================
  // Micro Frontend Remote Module Configuration
  // ============================================================
  // Enable/disable remote modules (feature flags)
  MODULE_A_ENABLED: true,
  MODULE_B_ENABLED: true,

  // Remote module URLs
  // For local development, use localhost URLs
  // For production, use CDN URLs
  MODULE_A_REMOTE_URL: "http://localhost:3001/assets/remoteEntry.js",
  MODULE_B_REMOTE_URL: "http://localhost:3002/assets/remoteEntry.js",

  // Use stub (mock) remotes for development when actual remotes aren't running
  // Set to true to use built-in stub components
  USE_STUB_REMOTES: false,
}
