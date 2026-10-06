import { defineConfig } from 'vite';

export default defineConfig({
  // Use /puzzleAlMulk/ for GitHub Pages production build, / for local dev
  base: process.env.NODE_ENV === 'production' ? '/puzzleAlMulk/' : '/',
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
