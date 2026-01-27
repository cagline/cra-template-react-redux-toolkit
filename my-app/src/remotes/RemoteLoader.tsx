import React, { Suspense, lazy, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme, Box, CircularProgress, Typography } from '@mui/material';
import RemoteErrorBoundary from './RemoteErrorBoundary';
import type { ShellProps } from './types';

// Stub components for development
import ModuleAStub from './stubs/ModuleAStub';
import ModuleBStub from './stubs/ModuleBStub';

/**
 * Loading fallback component
 */
const LoadingFallback = ({ moduleName }: { moduleName: string }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      gap: 2,
    }}
  >
    <CircularProgress size={48} />
    <Typography variant="body1" color="text.secondary">
      Loading {moduleName}...
    </Typography>
  </Box>
);

/**
 * Get shell props to pass to remote modules
 */
const useShellProps = (): ShellProps => {
  const navigate = useNavigate();
  const theme = useTheme();

  // In a real app, these would come from auth context/store
  const user = {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    roles: ['user'],
  };
  const token = 'demo-token';

  return { user, token, theme, navigate };
};

/**
 * Remote Module A Loader
 * Loads Module A either from remote URL or uses stub for development
 */
export const RemoteModuleA: React.FC = () => {
  const [retryKey, setRetryKey] = useState(0);
  const shellProps = useShellProps();
  const useStubs = window._env_?.USE_STUB_REMOTES ?? true;

  const handleRetry = useCallback(() => {
    setRetryKey((k) => k + 1);
  }, []);

  if (useStubs || !window._env_?.MODULE_A_ENABLED) {
    return <ModuleAStub {...shellProps} />;
  }

  // Dynamic import of federated module
  const RemoteModule = lazy(() => import('moduleA/App'));

  return (
    <RemoteErrorBoundary moduleName="Module A" onRetry={handleRetry} key={retryKey}>
      <Suspense fallback={<LoadingFallback moduleName="Module A" />}>
        <RemoteModule {...shellProps} />
      </Suspense>
    </RemoteErrorBoundary>
  );
};

/**
 * Remote Module B Loader
 * Loads Module B either from remote URL or uses stub for development
 */
export const RemoteModuleB: React.FC = () => {
  const [retryKey, setRetryKey] = useState(0);
  const shellProps = useShellProps();
  const useStubs = window._env_?.USE_STUB_REMOTES ?? true;

  const handleRetry = useCallback(() => {
    setRetryKey((k) => k + 1);
  }, []);

  if (useStubs || !window._env_?.MODULE_B_ENABLED) {
    return <ModuleBStub {...shellProps} />;
  }

  // Dynamic import of federated module
  const RemoteModule = lazy(() => import('moduleB/App'));

  return (
    <RemoteErrorBoundary moduleName="Module B" onRetry={handleRetry} key={retryKey}>
      <Suspense fallback={<LoadingFallback moduleName="Module B" />}>
        <RemoteModule {...shellProps} />
      </Suspense>
    </RemoteErrorBoundary>
  );
};
