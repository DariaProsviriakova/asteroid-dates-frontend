import { ServerResponse } from 'node:http';
import react from '@vitejs/plugin-react';
import { loadEnv, type ProxyOptions } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backend = env.API_PROXY_TARGET || 'http://127.0.0.1:3000';
  const minio = env.S3_PROXY_TARGET || 'http://127.0.0.1:9000';
  const proxy: Record<string, ProxyOptions> = {
    '^/api(?:/|$)': {
      target: backend,
      changeOrigin: true,
      proxyTimeout: 8000,
      configure(server) {
        server.on('proxyReq', (outgoing, request) => {
          const isPublicRead = request.method === 'GET' && /^\/api\/dates(?:\/feed)?(?:\?|$)/.test(request.url ?? '');
          if (isPublicRead && request.headers['x-asteroids-guest'] === '1') outgoing.removeHeader('cookie');
          outgoing.removeHeader('x-asteroids-guest');
        });
        server.on('error', (_error, _request, response) => {
          if (response instanceof ServerResponse && !response.headersSent && !response.writableEnded) {
            response.writeHead(502, { 'Content-Type': 'application/json' }).end('{"message":"Сервис дат недоступен."}');
          }
        });
      },
    },
    '^/s3/': {
      target: minio,
      changeOrigin: true,
      rewrite: path => path.slice(3),
      configure(server) {
        server.on('proxyReq', outgoing => {
          // MinIO хранит публичные медиа и не должен получать сессию приложения.
          outgoing.removeHeader('cookie');
        });
      },
    },
    '^/(?:seed-assets|uploads|assets)/': { target: backend, changeOrigin: true },
  };

  return {
    plugins: [react()],
    server: { port: 5173, strictPort: true, proxy },
    preview: { port: 4173, strictPort: true, proxy },
    test: { environment: 'node', include: ['src/**/*.test.ts'] },
  };
});
