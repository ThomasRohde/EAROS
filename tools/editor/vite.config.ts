import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { earosApiPlugin } from './src/server'

export default defineConfig({
  plugins: [react(), earosApiPlugin()],
  build: {
    outDir: 'dist',
  },
})
