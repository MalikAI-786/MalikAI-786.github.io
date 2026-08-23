'use strict';

// Retirement worker: remove every cache created by the former public coach test
// and stop providing an offline copy of the old client-side gate/calendar page.
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('mizan-coach-test')).map(k => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
  );
});
