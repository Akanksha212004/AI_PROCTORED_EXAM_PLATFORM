/**
 * ProctorEd Service Worker
 * ------------------------------------------------------------------
 * Scope: caches ONLY static, non-sensitive assets (app shell, Next.js
 * build assets, icons, fonts) so the app installs cleanly and boots
 * fast/offline-tolerant on repeat visits.
 *
 * It deliberately NEVER intercepts:
 *   - any /api/* request
 *   - auth/login/session endpoints
 *   - exam, proctoring, webcam/AI-monitoring, or realtime (ws/socket) traffic
 *   - any non-GET request
 *   - cross-origin requests
 *
 * Those requests are left completely untouched and go straight to the
 * network exactly as if no service worker were installed, so exam
 * integrity, live proctoring streams, and auth are unaffected.
 */

const SW_VERSION = "v1";
const STATIC_CACHE = `proctored-static-${SW_VERSION}`;
const OFFLINE_URL = "/offline.html";

// Minimal app-shell assets to pre-cache on install.
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-192.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
];

// Paths that must NEVER be handled by the service worker.
// Matched against request.url pathname. Extend this list if new
// sensitive route prefixes are added to the app.
const NEVER_INTERCEPT = [
  /^\/api\//,
  /^\/auth/,
  /^\/login/,
  /^\/exam/,
  /^\/proctor/,
  /^\/session/,
  /^\/live/,
  /^\/ws/,
  /^\/socket/,
  /\/_next\/webpack-hmr/,
];

function isNeverIntercepted(pathname) {
  return NEVER_INTERCEPT.some((pattern) => pattern.test(pathname));
}

// Static, safely-cacheable Next.js/browser asset types.
function isStaticAsset(pathname) {
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/icons/") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.webmanifest" ||
    /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff2?|ttf|css)$/.test(pathname)
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("proctored-static-") && key !== STATIC_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only ever handle same-origin GET requests.
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Hard exclusion list: exam, proctoring, auth, API, realtime traffic
  // is left completely untouched — pass straight through to network.
  if (isNeverIntercepted(url.pathname)) {
    return;
  }

  // Navigations (HTML documents): network-first, falling back to a
  // cached offline page only when the network is unavailable. This
  // guarantees the freshest page (and therefore freshest exam state)
  // whenever the device is online.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then((cached) => cached || Response.error())
      )
    );
    return;
  }

  // Static assets: cache-first with a network fallback that seeds the
  // cache for next time (stale-while-revalidate-ish, but simple).
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const clone = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  // Everything else: default network behavior, no interception.
});
