import React, { Component, type ReactNode } from 'react';
import { Box, Button, Typography, Paper, Alert } from '@mui/material';
import { RefreshOutlined, ErrorOutline } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  moduleName: string;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary specifically for remote module loading
 * Provides retry functionality and user-friendly error messages
 */
class RemoteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service (e.g., Sentry)
    console.error(`[RemoteErrorBoundary] ${this.props.moduleName} failed to load:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            p: 3,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 500,
              textAlign: 'center',
            }}
          >
            <ErrorOutline color="error" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Failed to load {this.props.moduleName}
            </Typography>
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              {this.state.error?.message || 'An unexpected error occurred while loading the module.'}
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This could be due to a network issue or the module being temporarily unavailable.
              Please try again or contact support if the problem persists.
            </Typography>
            <Button
              variant="contained"
              startIcon={<RefreshOutlined />}
              onClick={this.handleRetry}
              size="large"
            >
              Retry
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default RemoteErrorBoundary;
