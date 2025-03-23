import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// ⬇️ EZ A PLUSZ IMPORT KELL
import history from 'connect-history-api-fallback';
import { fileURLToPath } from 'url';

export default defineConfig({
  plugins: [vue()],
  server: {
    middlewareMode: false, // ha true lenne, akkor másképp kéne fallback
    fs: {
      strict: false
    },
    setupMiddlewares(middlewares) {
      middlewares.unshift(
          history({
            verbose: true,
            rewrites: [
              { from: /^\/$/, to: '/index.html' },
              { from: /^\/hu\/.*$/, to: '/index.html' },
              { from: /^\/en\/.*$/, to: '/index.html' }
            ]
          })
      );
      return middlewares;
    }
  }
});
