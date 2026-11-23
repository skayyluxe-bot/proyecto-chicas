import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ isSsrBuild }) => ({
  base: './',
  plugins: [react()],
  build: { copyPublicDir: !isSsrBuild },
  server: {
    proxy: { '/api/try-on': 'http://127.0.0.1:4174' },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    clearMocks: true,
  },
}))
