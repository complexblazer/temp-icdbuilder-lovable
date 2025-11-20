import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      fastRefresh: true,
      babel: {
        plugins: []
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities']
  },
  resolve: {
    dedupe: ['react', 'react-dom']
  }
})
