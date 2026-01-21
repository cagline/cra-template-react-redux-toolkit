import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.css';
import './utils/i18n';
import logger from "./utils/logger";

const container = document.getElementById('root')!;
const root = createRoot(container);
logger.info('App', 'VITE_APP_VERSION', import.meta.env.VITE_APP_VERSION);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
