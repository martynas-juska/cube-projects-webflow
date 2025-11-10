import { defineConfig } from 'vite'
import restart from 'vite-plugin-restart'

export default defineConfig({
  root: 'src', // your HTML entry point
  publicDir: '../public', // optional static files folder
  server: {
    host: true,
    open: true,
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  plugins: [
    restart({ restart: ['../public/**'] })
  ],
})
