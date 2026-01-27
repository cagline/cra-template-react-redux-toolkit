import type { NavigateFunction } from 'react-router-dom';
import type { Theme } from '@mui/material';

/**
 * Props passed from shell to this remote module
 */
export interface ShellProps {
  user: User | null;
  token: string | null;
  theme: Theme;
  navigate: NavigateFunction;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}
