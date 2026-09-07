import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type PluginOption } from 'vite';
import { createApiRouter } from './src/api/index';

function erpApiPlugin(): PluginOption {
  return {
    name: 'james-erp-api',
    async configureServer(server) {
      const apiRouter = createApiRouter();
      server.middlewares.use(apiRouter);
    },
    async configurePreviewServer(server) {
      const apiRouter = createApiRouter();
      server.middlewares.use(apiRouter);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), erpApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
