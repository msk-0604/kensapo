/* KenSapo Service Worker — Web Push 通知 */

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {
    title: "KenSapo",
    body: "更新がありました",
    url: "/dashboard",
    tag: "kensapo-update",
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch {
    // デフォルト文面を使う
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "KenSapo", {
      body: data.body || "更新がありました",
      icon: "/icon.png",
      badge: "/icon.png",
      tag: data.tag || "kensapo-update",
      renotify: true,
      data: { url: data.url || "/dashboard" },
      requireInteraction: false,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of allClients) {
        if ("focus" in client) {
          await client.focus();
          if ("navigate" in client) {
            await client.navigate(targetUrl);
          }
          return;
        }
      }
      await self.clients.openWindow(targetUrl);
    })()
  );
});
