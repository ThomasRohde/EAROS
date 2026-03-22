import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // Must match the GitHub repo name (case-sensitive)
  base: '/EAROS/',
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      // termynal's package.json exports field is broken (points to non-existent files)
      'termynal': path.resolve(__dirname, 'node_modules/termynal/dist/esm/termynal.js'),
    },
  },
  server: {
    fs: {
      // Allow reading markdown files from parent dirs (standard/, docs/)
      allow: ['..'],
    },
  },
})
