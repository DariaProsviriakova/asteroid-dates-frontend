const scope = self.registration.scope;
const cachePrefix = 'asteroid-dates-pwa:' + scope + ':';
const cacheName = cachePrefix + 'f9f38342cc9cb338';
const assets = new Set(["index.html","bundle/index-BPvVn2Mu.css","bundle/index-yWBvA3MC.js","favicon.svg","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","media/default-date.png"].map(file => new URL(file, scope).href));
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
