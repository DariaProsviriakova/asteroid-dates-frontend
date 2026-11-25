import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const output = 'dist-pages';
const publicFiles = [
  'favicon.svg',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'media/default-date.png',
];

for (const file of publicFiles) {
  const destination = join(output, file);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(join('public', file), destination);
}

const bundles = (await readdir(join(output, 'bundle'))).sort().map(file => 'bundle/' + file);
const files = ['index.html', ...bundles, ...publicFiles];
const hash = createHash('sha256');
for (const file of files) {
  hash.update(file);
  hash.update(await readFile(join(output, file)));
}

await writeFile(join(output, 'sw.js'), `
const scope = self.registration.scope;
const cachePrefix = 'asteroid-dates-pwa:' + scope + ':';
const cacheName = cachePrefix + '${hash.digest('hex').slice(0, 16)}';
const assets = new Set(${JSON.stringify(files)}.map(file => new URL(file, scope).href));
const entry = new URL('index.html', scope).href;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll([...assets])));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith(cachePrefix) && key !== cacheName)
    .map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const { url } = request;
  const navigationUrl = url.split(/[?#]/, 1)[0];
  if (request.mode === 'navigate' && (navigationUrl === scope || navigationUrl === entry)) {
    event.respondWith(fetch(request).catch(() => caches.open(cacheName).then(cache => cache.match(entry))));
  } else if (assets.has(url)) {
    // Precache and crossorigin requests can differ by Origin for these static files.
    event.respondWith(caches.open(cacheName).then(async cache =>
      (await cache.match(request, { ignoreVary: true })) || fetch(request)));
  }
});
`.trimStart());
await writeFile(join(output, '.nojekyll'), '');
