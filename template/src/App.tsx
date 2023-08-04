import React, { useState } from 'react';
import './App.css';
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { createTheme, CssBaseline, FormControlLabel, Switch, ThemeProvider } from "@mui/material";
import { useAppSelector } from "./store/hooks";
import { selectThemeMode } from "./appSlice";

function App() {
  const themeMode = useAppSelector(selectThemeMode);

  const theme = createTheme({
    palette: {
      mode: themeMode
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <div className="App">
          <CssBaseline/>
          <AppRoutes/>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
