/**
 * TypeScript declarations for federated remote modules
 * These declarations allow TypeScript to understand the remote module imports
 */

declare module 'moduleA/App' {
  import type { FC } from 'react';
  import type { ShellProps } from './types';
  
  const ModuleAApp: FC<ShellProps>;
  export default ModuleAApp;
}

declare module 'moduleB/App' {
  import type { FC } from 'react';
  import type { ShellProps } from './types';
  
  const ModuleBApp: FC<ShellProps>;
  export default ModuleBApp;
}
