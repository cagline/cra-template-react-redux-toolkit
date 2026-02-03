import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import federation from '@originjs/vite-plugin-federation'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    federation({
      name: 'shell',
      // Remote modules will be loaded at runtime from env-config.js
      // For build-time, we just need the type definitions
      remotes: {
        // These URLs are placeholders - actual URLs come from runtime config (env-config.js)
        // In development, remotes run on different ports
        moduleA: 'http://localhost:3001/assets/remoteEntry.js',
        moduleB: 'http://localhost:3002/assets/remoteEntry.js',
      },
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
    port: 3000,
    strictPort: true,
  },
})
