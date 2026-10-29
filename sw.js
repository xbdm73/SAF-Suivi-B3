// Service worker du suivi AS 350 B3 : réception des alertes sur téléphone (Web Push).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("push", event => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { d = { title: "Suivi AS 350 B3", body: event.data ? event.data.text() : "" }; }
  const title = d.title || "Suivi AS 350 B3";
  event.waitUntil(self.registration.showNotification(title, {
    body: d.body || "",
    tag: d.tag || "suivi-b3",
    renotify: true,
    requireInteraction: !!d.urgent,
    vibrate: d.urgent ? [400, 150, 400, 150, 400] : [200],
    icon: "icon-192.png",
    badge: "icon-192.png",
    data: { url: d.url || "./" },
  }));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = new URL((event.notification.data && event.notification.data.url) || "./", self.registration.scope).href;
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) {
      if (c.url.startsWith(self.registration.scope)) {
        await c.focus();
        // page déjà ouverte : lui transmettre l'alerte à afficher (prise en compte)
        c.postMessage({ alertUrl: url });
        return;
      }
    }
    await self.clients.openWindow(url);
  })());
});
