'use strict';
// Worl Inc. service worker: notifications only. Deliberately NO fetch
// handler — the game must always load its fresh ?v= scripts, never a
// cached copy. Tapping a notification focuses the open game (or
// opens it); a future push server can post {title, body, url} here.
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    if (cs.length) return cs[0].focus();
    const url = (e.notification.data && e.notification.data.url) || './';
    return self.clients.openWindow(url);
  }));
});
self.addEventListener('push', e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch (err) {}
  const title = data.title || 'Worl Inc.';
  const opts = { body: data.body || '', icon: 'worl-icon-192.png', data: { url: data.url || './' } };
  e.waitUntil(self.registration.showNotification(title, opts));
});
