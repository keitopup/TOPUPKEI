/* Service worker: menerima notifikasi pesanan baru walau website ditutup. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) {}
  e.waitUntil((async function () {
    var cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    /* Kalau websitenya sedang terbuka dan terlihat, pop-up di halaman sudah cukup. */
    if (cs.some(function (c) { return c.visibilityState === 'visible'; })) {
      cs.forEach(function (c) { c.postMessage({ type: 'order-push', data: d }); });
      return;
    }
    await self.registration.showNotification(d.title || 'Pesanan baru', {
      body: d.body || '',
      tag: d.tag || 'kp-order',
      renotify: true,
      icon: d.icon || undefined,
      vibrate: [200, 100, 200],
      data: { url: d.url || './#riwayat' }
    });
  })());
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || './#riwayat';
  e.waitUntil((async function () {
    var cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (cs.length) {
      var c = cs[0];
      try { await c.focus(); } catch (_) {}
      c.postMessage({ type: 'goto-hist' });
      return;
    }
    await self.clients.openWindow(new URL(url, self.registration.scope).href);
  })());
});
