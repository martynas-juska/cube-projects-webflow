import restart from 'vite-plugin-restart'

export default {
  root: 'src/',
  publicDir: '../static/',
  server: {
    host: true,
    open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env)
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: false, // no need for .map files on Webflow
    rollupOptions: {
      output: {
        entryFileNames: 'bundle.js',
        chunkFileNames: 'bundle.js',
        assetFileNames: '[name][extname]'
      }
    }
  },
  plugins: [
    restart({ restart: ['../static/**'] })
  ]
}
