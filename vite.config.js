import restart from 'vite-plugin-restart'

export default {
  root: 'src/', // your index.html lives here
  publicDir: '../static/',
  server: {
    host: true,
    open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env)
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: 'bundle.js',   // ✅ direct in dist/
        chunkFileNames: '[name].js',   // ✅ clean naming
        assetFileNames: '[name][extname]'
      }
    }
  },
  plugins: [
    restart({ restart: ['../static/**'] })
  ]
}
