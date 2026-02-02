import type { AppConfig } from "./AppConfig";

let w = window as any;

const prodConfig: AppConfig = {
  env: "PRODUCTION",
  logLevel: (w._env_ && w._env_.REACT_APP_LOG_LEVEL) || 'verbose',
  X_API_KEY: (w._env_ && w._env_.REACT_APP_X_API_KEY) || '',
  keycloakEnabled: (w._env_ && w._env_.REACT_APP_KEYCLOAK_ENABLE !== 'false') ? true : false,
  applicationConfig: {
    appTimeZone: (w._env_ && w._env_.REACT_APP_TIME_ZONE_NAME) ?? 'Asia/Manila',
    paginationConfig: {
      pageSizeOptions: [10, 15, 20],
      defaultSize: 20
    },
  },
  baseUrl: (w._env_ && w._env_.REACT_APP_BASE_URL) || 'http://10.101.15.207:8000',
  keycloak: {
      keycloakUrl: (w._env_ && w._env_.REACT_APP_KEYCLOAK_URL) || 'http://10.101.16.22:8080',
      realm: (w._env_ && w._env_.REACT_APP_KEYCLOAK_REALM) || 'lbc-dev',
      clientId: (w._env_ && w._env_.REACT_APP_KEYCLOAK_CLIENT_ID) || 'wms-frontend'
  },
  roles: {
    system_admin: 'System Admin',
    admin: 'Admin',
    manager: 'Manager',
    officer: 'Officer',
  },
};

export default prodConfig;
