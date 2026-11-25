import { ServerResponse } from 'node:http';
import { readFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import { loadEnv, type ProxyOptions } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode, isPreview }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const pages = mode === 'pages';
  const lan = mode === 'lan';
  const base = pages ? env.PAGES_BASE || '/asteroid-dates-frontend/' : '/';
  const tls = lan && isPreview ? {
    key: readFileSync(env.HTTPS_KEY_FILE || 'certificates/cert.key'),
    cert: readFileSync(env.HTTPS_CERT_FILE || 'certificates/cert.crt'),
  } : undefined;
  const backend = env.API_PROXY_TARGET || 'http://127.0.0.1:3000';
  const minio = env.S3_PROXY_TARGET || 'http://127.0.0.1:9000';
  const proxy: Record<string, ProxyOptions> = {
    '^/api(?:/|$)': {
      target: backend,
      changeOrigin: true,
      proxyTimeout: 8000,
      xfwd: lan,
      configure(server) {
        server.on('proxyReq', (outgoing, request) => {
          if (lan) outgoing.setHeader('x-forwarded-proto', 'https');
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
    base,
    publicDir: pages ? false : 'public',
    build: { assetsDir: 'bundle', outDir: pages ? 'dist-pages' : 'dist' },
    plugins: [react(), {
      name: 'pages-manifest',
      transformIndexHtml() {
        if (!pages) return;
        return [
          { tag: 'link', attrs: { rel: 'manifest', href: `${base}manifest.webmanifest` }, injectTo: 'head' },
          { tag: 'link', attrs: { rel: 'apple-touch-icon', href: `${base}icons/icon-192.png` }, injectTo: 'head' },
        ];
      },
    }],
    server: { port: 5173, strictPort: true, proxy: pages ? {} : proxy },
    preview: {
      host: lan ? env.LAN_HOST || '0.0.0.0' : '127.0.0.1',
      port: lan ? Number(env.HTTPS_PORT || 8443) : 4173,
      strictPort: true,
      https: tls,
      proxy: pages ? {} : proxy,
    },
    test: { environment: 'node', include: ['src/**/*.test.ts'] },
  };
});
