import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_PROXY =
  process.env.VITE_LATTICE_PIPE_ORIGIN?.trim() ||
  'https://www.ssvibelandiaquestfest24x365.com';

export default defineConfig({
  plugins: [react()],
  base: '/interfaces/lattice-chat/',
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    proxy: {
      '/api': { target: API_PROXY, changeOrigin: true },
    },
  },
  preview: {
    proxy: {
      '/api': { target: API_PROXY, changeOrigin: true },
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../../interfaces/lattice-chat'),
    emptyOutDir: true,
  },
});
