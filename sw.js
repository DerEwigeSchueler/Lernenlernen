// Offline-Speicher für die App. Bei jeder Änderung der App VERSION erhöhen.
const VERSION = 'll-v1';
const FILES = [
  './', './index.html', './manifest.webmanifest',
  './fonts/lora.woff', './fonts/lora-italic.woff',
  './fonts/poppins-400.woff', './fonts/poppins-500.woff', './fonts/poppins-700.woff',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-192.png', './icons/maskable-512.png',
  './icons/apple-touch-icon.png', './icons/favicon-32.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // Seite: erst Netz (damit Änderungen ankommen), sonst Offline-Kopie
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put('./index.html', copy)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  // Schriften und Symbole: erst Offline-Kopie, sonst Netz
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
