const CACHE_NAME = "kaoyan-study-pad-shell-v3";
const SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=kaoyan-3",
  "./src/app.js?v=kaoyan-3",
  "./src/logic.js?v=kaoyan-3",
  "./src/data.js?v=kaoyan-3",
  "./manifest.webmanifest?v=kaoyan-3"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const cleanup = caches.keys().then((keys) => {
    const oldKeys = keys.filter((key) => key !== CACHE_NAME);
    return Promise.all(oldKeys.map((key) => caches.delete(key)));
  });
  event.waitUntil(cleanup);
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (new URL(event.request.url).origin === self.location.origin) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      }
      return response;
    }))
  );
});
