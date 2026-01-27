import type { NavigateFunction } from 'react-router-dom';
import type { Theme } from '@mui/material';

/**
 * Props passed from shell to remote modules
 * This is the contract between shell and remotes
 */
export interface ShellProps {
  /** Current authenticated user */
  user: User | null;
  /** Auth token for API calls */
  token: string | null;
  /** MUI theme object */
  theme: Theme;
  /** Shell's router navigate function */
  navigate: NavigateFunction;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

/**
 * Remote module manifest for versioning and compatibility
 */
export interface RemoteManifest {
  name: string;
  version: string;
  shellCompatibility: string[];
  exposedComponent: string;
}

/**
 * Environment configuration for remotes
 */
declare global {
  interface Window {
    _env_: {
      REACT_APP_BASE_URL: string;
      REACT_APP_DEVICE_URL: string;
      REACT_APP_X_API_KEY: string;
      REACT_APP_LOG_LEVEL: string;
      REACT_APP_TIME_ZONE_NAME: string;
      MODULE_A_ENABLED: boolean;
      MODULE_B_ENABLED: boolean;
      MODULE_A_REMOTE_URL: string;
      MODULE_B_REMOTE_URL: string;
      USE_STUB_REMOTES: boolean;
    };
  }
}

export {};
