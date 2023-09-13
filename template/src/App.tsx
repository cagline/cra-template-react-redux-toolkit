import React from 'react';
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import { selectThemeMode } from "./appSlice";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import AppRoutes from "./routes";
import { useAppSelector } from "./store/hooks";

import "./App.css";

function App() {
  const themeMode = useAppSelector(selectThemeMode);

  const theme = createTheme({
    palette: {
      mode: themeMode,
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <BrowserRouter>
          <div className="App">
            <CssBaseline />
            <AppRoutes />
          </div>
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
