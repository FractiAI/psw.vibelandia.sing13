import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const CATALOG_PROXY =
  process.env.VITE_CATALOG_PIPE_ORIGIN?.trim() ||
  'https://psw-vibelandia-sing13-nine.vercel.app';

const catalogProxy = {
  '/api': { target: CATALOG_PROXY, changeOrigin: true },
  '/media': { target: CATALOG_PROXY, changeOrigin: true },
};

export default defineConfig({
  plugins: [react()],
  base: '/interfaces/questfest-bridge/',
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: { proxy: catalogProxy },
  preview: { proxy: catalogProxy },
  build: {
    outDir: path.resolve(__dirname, '../../interfaces/questfest-bridge'),
    emptyOutDir: true,
  },
});
