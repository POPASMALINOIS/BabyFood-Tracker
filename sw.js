const CACHE_NAME = "babyfood-tracker-v27";

const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=27",
  "./styles-v2-fix.css?v=27",
  "./styles-v3.css?v=27",
  "./app.js?v=27",
  "./enhancements.js?v=27",
  "./ui-v2.js?v=27",
  "./v3-features.js?v=27",
  "./manifest.json?v=27",
  "./data/recipes.json",
  "./assets/background.png",
  "./assets/splash.png",
  "./assets/icon-192.png?v=27",
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