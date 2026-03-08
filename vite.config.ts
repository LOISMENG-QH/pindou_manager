import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/pindou_manager/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
