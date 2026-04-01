// ─── Shopnexa Service Worker v2 ─────────────────────────────────────────────────
// Cache-first for static assets, network-first for API/pages, offline fallback

const CACHE_VERSION = 'shopnexa-v3';
const STATIC_CACHE = CACHE_VERSION + '-static';
const DYNAMIC_CACHE = CACHE_VERSION + '-dynamic';
const IMAGE_CACHE = CACHE_VERSION + '-images';
const MAX_DYNAMIC_ENTRIES = 200;
const MAX_IMAGE_ENTRIES = 100;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Static assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-152x152.png',
];

// ─── Install: Pre-cache essential static assets ───────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Listen for skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ─── Activate: Clean old caches ──────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== IMAGE_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// ─── Fetch Strategy ───────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET, chrome-extension, and dev server internal requests
  if (event.request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // 1. Next.js static assets (_next/static/*): Cache-first
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  // 2. Fonts: Cache-first
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  // 3. Icons & local images: Cache-first
  if (url.pathname.startsWith('/icons/') || url.pathname.startsWith('/icon')) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  // 4. External images (Unsplash, etc.): Cache-first with image cache
  if (isImageUrl(url)) {
    event.respondWith(cacheFirst(event.request, IMAGE_CACHE, MAX_IMAGE_ENTRIES));
    return;
  }

  // 5. API routes: Network-only (always fresh data)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: 'You are offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
    return;
  }

  // 6. Navigation / HTML pages: Network-first with cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, clone));
            trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_ENTRIES);
          }
          return response;
        })
        .catch(() => {
          return caches.match('/').then((cached) => {
            if (cached) return cached;
            return new Response(offlinePage(), {
              status: 503,
              headers: { 'Content-Type': 'text/html' },
            });
          });
        })
    );
    return;
  }

  // 7. Everything else: Stale-while-revalidate
  event.respondWith(staleWhileRevalidate(event.request, DYNAMIC_CACHE));
});

// ─── Helper: Cache-first strategy ────────────────────────────────────────────
async function cacheFirst(request, cacheName, maxEntries) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      if (maxEntries) trimCache(cacheName, maxEntries);
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

// ─── Helper: Stale-while-revalidate strategy ─────────────────────────────────
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
        trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_ENTRIES);
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

// ─── Helper: Check if URL points to an image ─────────────────────────────────
function isImageUrl(url) {
  const imageHosts = ['images.unsplash.com', 'picsum.photos', 'via.placeholder.com', 'i.pravatar.cc'];
  return imageHosts.some((host) => url.hostname.includes(host)) || /\.(jpg|jpeg|png|gif|webp|svg|ico)(\?.*)?$/i.test(url.pathname);
}

// ─── Helper: Limit cache size ────────────────────────────────────────────────
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    // Delete oldest entries beyond limit
    const deleteCount = keys.length - maxEntries;
    await Promise.all(keys.slice(0, deleteCount).map((key) => cache.delete(key)));
  }
}

// ─── Helper: Offline fallback HTML page ──────────────────────────────────────
function offlinePage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shopnexa - Offline</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .container { text-align: center; max-width: 400px; }
    .icon { width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #f97316, #e11d48); border-radius: 20px; display: flex; align-items: center; justify-content: center; }
    .icon svg { width: 40px; height: 40px; stroke: white; fill: none; stroke-width: 2; }
    h1 { font-size: 24px; color: #1a1a1a; margin-bottom: 8px; }
    p { color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
    .brand { color: #ea580c; font-weight: 700; }
    button { background: #ea580c; color: white; border: none; padding: 12px 32px; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; }
    button:active { background: #c2410c; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
        <line x1="1" y1="1" x2="23" y2="23" /><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" /><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" /><path d="M10.71 5.05A16 16 0 0 1 22.56 9" /><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
    </div>
    <h1>You're <span class="brand">Offline</span></h1>
    <p>It looks like you've lost your internet connection. Don't worry — your previously loaded pages are still available. Check your connection and try again.</p>
    <button onclick="window.location.reload()">Retry</button>
  </div>
</body>
</html>`;
}
