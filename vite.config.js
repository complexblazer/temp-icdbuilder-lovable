import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(async ({ mode }) => {
  const plugins = [
    react({
      fastRefresh: true,
      babel: {
        plugins: []
      }
    })
  ];

  if (mode === 'development') {
    const { componentTagger } = await import("lovable-tagger");
    plugins.push(componentTagger());
  }

  return {
    plugins,
  server: {
    host: '::',
    port: 8080,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities']
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      "@": path.resolve(import.meta.dirname || __dirname, "./src"),
    },
  }
}})
