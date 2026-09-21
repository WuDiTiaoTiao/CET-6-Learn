const CACHE_NAME = "ielts-study-pad-shell-v1";
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./src/app.js",
  "./src/logic.js",
  "./src/data.js",
  "./manifest.webmanifest"
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
