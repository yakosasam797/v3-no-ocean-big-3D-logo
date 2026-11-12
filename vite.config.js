import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: { input: {
      main: resolve(__dirname, 'index.html'),
      paryatech: resolve(__dirname, 'work/paryatech/index.html'),
      wingman: resolve(__dirname, 'work/wingman/index.html'),
    } },
  },
});
