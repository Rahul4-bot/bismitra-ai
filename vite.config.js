import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import chatApiHandler from './api/chat.js';

// Custom Vite plugin to emulate Vercel Serverless Function /api/chat in local development
function devApiPlugin() {
  return {
    name: 'dev-api-middleware',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              req.body = body ? JSON.parse(body) : {};
            } catch {
              req.body = {};
            }

            // Adapt response for Express-like Vercel serverless interface
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
              await chatApiHandler(req, customRes);
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
  };
}

export default defineConfig(({ mode }) => {
  // Load server-side environment variables (including GEMINI_API_KEY)
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
