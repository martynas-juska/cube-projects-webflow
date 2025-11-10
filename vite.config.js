import restart from 'vite-plugin-restart'

export default {
  root: 'src/', // where index.html lives
  publicDir: '../static/', // optional static folder
  server: {
    host: true, // allow LAN access for local testing
    open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env)
  },
  build: {
    outDir: '../dist', // production build output
    emptyOutDir: true,
    sourcemap: false, // no need for Webflow
    rollupOptions: {
      output: {
        entryFileNames: 'assets/bundle.js',   // ✅ keeps file in /assets/
        chunkFileNames: 'assets/[name].js',   // ✅ avoids overwriting
        assetFileNames: 'assets/[name][extname]' // ✅ cleaner asset path
      }
    }
  },
  plugins: [
    restart({ restart: ['../static/**'] })
  ]
}
