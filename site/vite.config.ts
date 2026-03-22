import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Must match the GitHub repo name (case-sensitive)
  base: '/EAROS/',
  build: {
    outDir: 'dist',
  },
})
