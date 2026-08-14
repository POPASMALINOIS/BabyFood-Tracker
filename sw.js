const CACHE_NAME = "babyfood-tracker-v28";

const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=28",
  "./styles-v2-fix.css?v=28",
  "./styles-v3.css?v=28",
  "./app.js?v=28",
  "./enhancements.js?v=28",
  "./ui-v2.js?v=28",
  "./v3-features.js?v=28",
  "./manifest.json?v=28",
  "./data/recipes.json",
  "./assets/background.png",
  "./assets/splash.png",
  "./assets/icon-192.png?v=28",
  "./assets/icon-512.png",
  "./assets/recipes/001-pure-calabaza-patata-pollo.webp"
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});