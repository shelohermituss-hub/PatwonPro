// Manual service worker (not next-pwa/workbox — see docs/PROMPTS/08-pwa.md
// for why: this project builds with Turbopack, and next-pwa only hooks
// into webpack's config, so it silently does nothing under Turbopack).
//
// Scope: cache the app shell (HTML) and static build assets so the app
// still *opens* offline. It never touches Supabase/API responses — Dexie
// (src/lib/db) is the source of truth for offline data, this worker only
// makes sure the UI that reads Dexie can load with no network at all.
const CACHE_VERSION = "patwonpro-v2";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;

const PRECACHE_URLS = ["/", "/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png"];

// Mirrors src/lib/supabase/middleware.ts's PUBLIC_PATHS — keep in sync.
// Everything else is behind auth, so it's a candidate for the "app shell"
// offline fallback below rather than the marketing landing page.
const PUBLIC_PATHS = new Set(["/", "/login", "/register"]);

// Cache key (not a real route) holding the most recently visited
// authenticated page's HTML — used as the offline fallback for any
// authenticated route that was never itself visited with a full page
// load, so losing connection lands the user back in the app (sidebar +
// Dexie-backed pages) instead of on the public landing page.
const APP_SHELL_FALLBACK_KEY = new Request("/__app-shell-fallback__");

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("patwonpro-") && key !== SHELL_CACHE && key !== ASSET_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(url) {
  return (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/"))
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Cross-origin (Supabase, MonCash, etc.) and our own API routes always
  // go straight to the network — never cached, never faked offline.
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) {
    return;
  }

  // App-shell navigations: network-first so an online user always sees
  // fresh HTML. Offline fallback order: (1) this exact URL if it was
  // ever hard-navigated to before, (2) the last authenticated page's
  // shell — so reopening the app offline lands back in the dashboard,
  // not the marketing page, even for a route that was only ever reached
  // by client-side navigation, (3) "/" as the last resort for a signed-
  // out visitor with nothing cached yet.
  if (request.mode === "navigate") {
    const isAuthenticatedRoute = !PUBLIC_PATHS.has(url.pathname);
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          void caches.open(SHELL_CACHE).then((cache) => {
            cache.put(request, copy.clone());
            if (isAuthenticatedRoute && response.ok) {
              cache.put(APP_SHELL_FALLBACK_KEY, copy);
            }
          });
          return response;
        })
        .catch(
          async () =>
            (await caches.match(request)) ??
            (await caches.match(APP_SHELL_FALLBACK_KEY)) ??
            (await caches.match("/")) ??
            Response.error(),
        ),
    );
    return;
  }

  // Hashed, immutable build assets: cache-first.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            const copy = response.clone();
            void caches.open(ASSET_CACHE).then((cache) => cache.put(request, copy));
            return response;
          }),
      ),
    );
    return;
  }

  // Everything else static (fonts, manifest, misc public/ files):
  // stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          const copy = response.clone();
          void caches.open(ASSET_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => cached);
      return cached ?? network;
    }),
  );
});
