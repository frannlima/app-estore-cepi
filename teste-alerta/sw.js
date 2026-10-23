self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = new URL('../', self.registration.scope).href;
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(list => {
    for (const client of list) { if (client.url.startsWith(new URL('../',self.registration.scope).href) && 'focus' in client) return client.focus(); }
    return self.clients.openWindow(url);
  }));
});
