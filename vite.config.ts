import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type ViteDevServer} from 'vite';
import {handleApiRequest} from './server.js';

const localApiPlugin = {
  name: 'salapeed-local-api',
  configureServer(server: ViteDevServer) {
    server.middlewares.use((request, response, next) => {
      if (!request.url?.startsWith('/api/')) {
        next();
        return;
      }
      handleApiRequest(request, response, next);
    });
  },
};

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), localApiPlugin],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
