// Veridity Service Worker for offline functionality
const CACHE_NAME = 'veridity-v1';
const OFFLINE_URL = '/offline';

// Assets to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/generate',
  '/verify',
  '/dashboard',
  '/settings',
  OFFLINE_URL,
  '/manifest.json'
];

// API routes that should be cached
const API_CACHE_PATTERNS = [
  '/api/proof-types',
  '/api/organizations',
  '/api/stats/user'
];

// Install event - cache critical assets
self.addEventListener('install', event => {
  console.log('📦 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker installed successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Service Worker installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🔄 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('🧹 Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === 'GET') {
    if (isStaticAsset(url)) {
      event.respondWith(cacheFirst(request));
    } else if (isApiRequest(url)) {
      event.respondWith(networkFirstWithCache(request));
    } else if (isPageRequest(url)) {
      event.respondWith(staleWhileRevalidate(request));
    }
  } else {
    // Handle POST/PUT/DELETE requests
    event.respondWith(networkOnlyWithOfflineQueue(request));
  }
});

// Caching strategy: Cache first (for static assets)
async function cacheFirst(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }

    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline - Resource not available', { status: 503 });
  }
}

// Caching strategy: Network first with cache fallback
async function networkFirstWithCache(request) {
  try {
    const response = await fetch(request);
    
    if (response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('🔄 Network failed, trying cache for:', request.url);
    
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }

    // Return offline response for API requests
    return new Response(
      JSON.stringify({ 
        error: 'OFFLINE_MODE',
        message: 'This request requires internet connection',
        timestamp: Date.now()
      }), 
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Caching strategy: Stale while revalidate (for pages)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  const networkRequest = fetch(request)
    .then(response => {
      if (response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(error => {
      console.log('📄 Network failed for page:', request.url);
      return null;
    });

  // Return cached version immediately if available
  if (cached) {
    networkRequest; // Update cache in background
    return cached;
  }

  // Wait for network if no cache available
  const networkResponse = await networkRequest;
  if (networkResponse) {
    return networkResponse;
  }

  // Fallback to offline page
  return caches.match(OFFLINE_URL) || new Response('Offline', { status: 503 });
}

// Handle non-GET requests when offline
async function networkOnlyWithOfflineQueue(request) {
  try {
    return await fetch(request);
  } catch (error) {
    // Queue the request for when back online
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.method !== 'GET' ? await request.text() : null,
      timestamp: Date.now()
    };

    // Store in IndexedDB or localStorage for sync later
    const stored = JSON.parse(localStorage.getItem('veridity_offline_requests') || '[]');
    stored.push(requestData);
    localStorage.setItem('veridity_offline_requests', JSON.stringify(stored));

    return new Response(
      JSON.stringify({
        queued: true,
        message: 'Request queued for when connection returns',
        timestamp: Date.now()
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Helper functions
function isStaticAsset(url) {
  return url.pathname.includes('.') || 
         url.pathname.includes('/assets/') ||
         url.pathname.includes('/icons/');
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/') ||
         API_CACHE_PATTERNS.some(pattern => url.pathname.includes(pattern));
}

function isPageRequest(url) {
  return !url.pathname.includes('.') && 
         !url.pathname.startsWith('/api/') &&
         url.origin === location.origin;
}

// Background sync for queued requests
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Background sync triggered');
    event.waitUntil(processOfflineQueue());
  }
});

// Process offline request queue
async function processOfflineQueue() {
  try {
    const stored = localStorage.getItem('veridity_offline_requests');
    if (!stored) return;

    const requests = JSON.parse(stored);
    const processed = [];

    for (const requestData of requests) {
      try {
        const response = await fetch(requestData.url, {
          method: requestData.method,
          headers: requestData.headers,
          body: requestData.body
        });

        if (response.ok) {
          processed.push(requestData);
          console.log('✅ Synced offline request:', requestData.url);
        }
      } catch (error) {
        console.warn('⚠️ Failed to sync request:', requestData.url, error);
      }
    }

    // Remove successfully processed requests
    const remaining = requests.filter(req => !processed.includes(req));
    localStorage.setItem('veridity_offline_requests', JSON.stringify(remaining));
    
    console.log(`🔄 Processed ${processed.length}/${requests.length} offline requests`);
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push event for notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data?.text() || 'New verification request received',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: event.data?.json() || {},
    actions: [
      {
        action: 'view',
        title: 'View Details'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Veridity', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('🔧 Veridity Service Worker loaded');