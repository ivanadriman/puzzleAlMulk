import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base allows deploying to GitHub Pages under /<repo-name>/ or custom domain without breaking asset links
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  server: {
    port: 5173,
    open: false
  }
});
