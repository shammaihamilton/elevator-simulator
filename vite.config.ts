import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const currentDir = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.join(currentDir, 'src'),
      '@components': path.join(currentDir, 'src/components'),
      '@core': path.join(currentDir, 'src/core'),
      '@store': path.join(currentDir, 'src/store'),
      '@types': path.join(currentDir, 'src/types'),
      '@utils': path.join(currentDir, 'src/utils'),
      '@assets': path.join(currentDir, 'src/assets')
    }
  }
})
