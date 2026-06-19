// The Guitar Hunters — service worker
// Page : reseau d'abord (toujours le dernier rapport) avec repli cache hors-ligne.
// Assets (polices/icones/logo/images) : cache d'abord (rapide + hors-ligne).
const CACHE = 'guitar-hunters-v2';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './logo.png',
  './fonts/MetalMania-Regular.ttf', './fonts/Anton-Regular.ttf', './fonts/BarlowCondensed-Bold.ttf',
  './fonts/BarlowCondensed-SemiBold.ttf', './fonts/Barlow-Regular.ttf', './fonts/Barlow-SemiBold.ttf'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const req = e.request;
  const isDoc = req.mode === 'navigate' || req.destination === 'document';
  if (isDoc) {
    e.respondWith(fetch(req).then(r => {
      const c = r.clone(); caches.open(CACHE).then(ca => ca.put(req, c)).catch(() => {});
      return r;
    }).catch(() => caches.match(req).then(h => h || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    const c = r.clone(); caches.open(CACHE).then(ca => ca.put(req, c)).catch(() => {});
    return r;
  }).catch(() => {})));
});
