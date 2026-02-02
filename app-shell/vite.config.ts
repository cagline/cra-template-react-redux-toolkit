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
      shared: ['react', 'react-dom', 'react-router-dom', '@mui/material', '@emotion/react', '@emotion/styled'],
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
