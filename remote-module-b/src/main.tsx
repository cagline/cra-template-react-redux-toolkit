import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, AppBar, Toolbar, Typography } from '@mui/material';
import App from './App';

/**
 * Standalone entry point for development
 * This allows the remote module to run independently for testing
 * 
 * In production, the shell loads ./App directly via Module Federation
 */

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#9c27b0', // Purple theme for Module B
    },
    secondary: {
      main: '#ff9800',
    },
  },
});

// Mock shell props for standalone development (navigate will be injected in component)
const mockShellProps = {
  user: {
    id: '1',
    name: 'Dev User',
    email: 'dev@example.com',
    roles: ['admin', 'analyst'],
  },
  token: 'mock-dev-token',
  theme: theme,
};

/**
 * Mock Shell Layout for standalone development
 */
const StandaloneShell: React.FC = () => {
  const reactNavigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="secondary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Remote Module B - Standalone Mode
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Development Server (Port 3002)
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1 }}>
        <Routes>
          <Route 
            path="/*" 
            element={
              <App 
                {...mockShellProps} 
                navigate={reactNavigate}
              />
            } 
          />
        </Routes>
      </Box>
    </Box>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <StandaloneShell />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
