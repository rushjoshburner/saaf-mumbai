// SAAF Mumbai — service worker (hand-written; Turbopack-safe).
// Makes the app installable and gives basic offline support.
// Caching strategy follows TRD §8.2 in spirit:
//   - API routes: never cached (always network) — writes must hit the server.
//   - Pages (navigations): network-first, fall back to cache when offline.
//   - Static assets (JS/CSS/images/fonts/tiles): cache-first.

const CACHE = "saaf-mumbai-v1";
const SHELL = ["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // never touch POST/PUT (reports, votes)

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // ignore cross-origin
  if (url.pathname.startsWith("/api/")) return; // API always hits network

  // Page navigations: network-first, fall back to cache, then the app shell.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/"))),
    );
    return;
  }

  // Static assets: cache-first, fill the cache on first network hit.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        }),
    ),
  );
});
