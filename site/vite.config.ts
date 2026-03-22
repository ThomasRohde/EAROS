import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const termynalPath = fileURLToPath(new URL('./node_modules/termynal/dist/esm/termynal.js', import.meta.url))

export default defineConfig({
  plugins: [react()],
  // Must match the GitHub repo name (case-sensitive)
  base: '/EAROS/',
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      // termynal's package.json exports field points to non-existent files;
      // alias to the actual ESM build
      'termynal': termynalPath,
    },
  },
  server: {
    fs: {
      // Allow reading markdown files from parent dirs (standard/, docs/)
      allow: ['..'],
    },
  },
})
