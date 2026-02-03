import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'moduleB',
      filename: 'remoteEntry.js',
      // Expose the main App component for the shell to consume
      exposes: {
        './App': './src/App.tsx',
      },
      // Share dependencies with the shell (singletons)
      shared: {
        react: { singleton: true, requiredVersion: '^19.2.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.2.0' },
        'react-router-dom': { singleton: true, requiredVersion: '^7.1.1' },
        '@mui/material': { singleton: true },
        '@emotion/react': { singleton: true },
        '@emotion/styled': { singleton: true },
        i18next: { singleton: true, requiredVersion: '^25.5.2' },
        'react-i18next': { singleton: true, requiredVersion: '^16.1.4' },
      },
    }),
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  server: {
    port: 3002,
    strictPort: true,
    cors: true,
  },
  preview: {
    port: 3002,
    strictPort: true,
    cors: true,
  },
})
