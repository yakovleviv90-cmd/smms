const scope = self.registration.scope;
const prefix = 'smms-offline:' + scope + ':';
const cacheName = prefix + '8bc901e2d8e052140457';
const assets = ['index.html', 'manifest.webmanifest', 'wide.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
const urls = assets.map(path => new URL(path, scope).href);

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll(urls.map(url => new Request(url, {cache: 'reload'})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(prefix) && name !== cacheName) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  url.search = '';
  const key = url.href === scope ? urls[0] : url.href;
  if (!urls.includes(key)) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    const response = await cache.match(key);
    if (response) return response;
    const fresh = await fetch(new Request(key, {cache: 'reload'}));
    if (fresh.ok) await cache.put(key, fresh.clone());
    return fresh;
  })());
});
