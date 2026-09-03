import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import chatApiHandler from './api/chat.js';
import verifyProductHandler from './api/verify-product.js';
import findStandardHandler from './api/find-standard.js';

function mountDevApi(server, path, handler) {
  server.middlewares.use(path, async (req, res) => {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          req.body = body ? JSON.parse(body) : {};
        } catch {
          req.body = {};
        }

        const customRes = {
          status(code) {
            res.statusCode = code;
            return this;
          },
          json(data) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return this;
          }
        };

        try {
          await handler(req, customRes);
        } catch (err) {
          console.error('Dev API Error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Internal server error in dev api' }));
        }
      });
    } else {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Method not allowed' }));
    }
  });
}

function devApiPlugin() {
  return {
    name: 'dev-api-middleware',
    configureServer(server) {
      mountDevApi(server, '/api/chat', chatApiHandler);
      mountDevApi(server, '/api/verify-product', verifyProductHandler);
      mountDevApi(server, '/api/find-standard', findStandardHandler);
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env.GEMINI_API_KEY = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

  return {
    plugins: [react(), devApiPlugin()],
    server: {
      port: 3000,
      open: false
    }
  };
});
