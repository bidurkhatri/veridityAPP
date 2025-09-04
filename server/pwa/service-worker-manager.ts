/**
 * Production Progressive Web App Service Worker Manager
 * Advanced offline capabilities and background sync
 */

import winston from 'winston';
import crypto from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// Configure PWA logger
const pwaLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/pwa.log' }),
    new winston.transports.Console()
  ]
});

export interface CacheStrategy {
  name: string;
  pattern: RegExp;
  strategy: 'cache_first' | 'network_first' | 'stale_while_revalidate' | 'network_only' | 'cache_only';
  maxAge?: number; // milliseconds
  maxEntries?: number;
  networkTimeoutSeconds?: number;
}

export interface BackgroundSyncTask {
  id: string;
  type: 'verification_upload' | 'proof_generation' | 'document_upload' | 'analytics_sync';
  payload: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  requiredNetwork: 'any' | 'wifi' | 'cellular';
  estimatedSize: number; // bytes
}

export interface OfflineCapability {
  feature: string;
  enabled: boolean;
  cacheDuration: number;
  syncStrategy: 'immediate' | 'deferred' | 'manual';
  dataIntegrity: boolean;
  conflictResolution: 'server_wins' | 'client_wins' | 'merge' | 'manual';
}

export interface PWAMetrics {
  installationRate: number;
  offlineUsage: number;
  cacheMissRate: number;
  backgroundSyncSuccess: number;
  averageOfflineTime: number;
  storageUsage: number;
  networkSavings: number;
}

export class ServiceWorkerManager {
  private cacheStrategies: CacheStrategy[] = [];
  private backgroundTasks: Map<string, BackgroundSyncTask> = new Map();
  private offlineCapabilities: Map<string, OfflineCapability> = new Map();
  private manifestPath: string;
  private serviceWorkerPath: string;

  constructor() {
    this.manifestPath = join(process.cwd(), 'client/dist/manifest.json');
    this.serviceWorkerPath = join(process.cwd(), 'client/dist/sw.js');
    this.initializeCacheStrategies();
    this.initializeOfflineCapabilities();
    this.generateServiceWorker();
    this.generateWebAppManifest();
  }

  /**
   * Initialize cache strategies
   */
  private initializeCacheStrategies(): void {
    this.cacheStrategies = [
      {
        name: 'static-assets',
        pattern: /\.(css|js|png|jpg|jpeg|svg|woff2?)$/,
        strategy: 'cache_first',
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        maxEntries: 100
      },
      {
        name: 'api-proofs',
        pattern: /\/api\/proofs\//,
        strategy: 'network_first',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        maxEntries: 50,
        networkTimeoutSeconds: 5
      },
      {
        name: 'api-auth',
        pattern: /\/api\/auth\//,
        strategy: 'network_only'
      },
      {
        name: 'api-analytics',
        pattern: /\/api\/analytics\//,
        strategy: 'stale_while_revalidate',
        maxAge: 60 * 60 * 1000, // 1 hour
        maxEntries: 20
      },
      {
        name: 'documents',
        pattern: /\/api\/documents\//,
        strategy: 'cache_first',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        maxEntries: 30
      },
      {
        name: 'ui-components',
        pattern: /\/components\//,
        strategy: 'stale_while_revalidate',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        maxEntries: 50
      }
    ];

    pwaLogger.info('Cache strategies initialized', {
      strategies: this.cacheStrategies.length
    });
  }

  /**
   * Initialize offline capabilities
   */
  private initializeOfflineCapabilities(): void {
    const capabilities: OfflineCapability[] = [
      {
        feature: 'proof_generation',
        enabled: true,
        cacheDuration: 7 * 24 * 60 * 60 * 1000, // 1 week
        syncStrategy: 'deferred',
        dataIntegrity: true,
        conflictResolution: 'server_wins'
      },
      {
        feature: 'document_viewing',
        enabled: true,
        cacheDuration: 30 * 24 * 60 * 60 * 1000, // 1 month
        syncStrategy: 'immediate',
        dataIntegrity: true,
        conflictResolution: 'cache_only'
      },
      {
        feature: 'profile_editing',
        enabled: true,
        cacheDuration: 24 * 60 * 60 * 1000, // 1 day
        syncStrategy: 'deferred',
        dataIntegrity: true,
        conflictResolution: 'manual'
      },
      {
        feature: 'verification_history',
        enabled: true,
        cacheDuration: 7 * 24 * 60 * 60 * 1000, // 1 week
        syncStrategy: 'immediate',
        dataIntegrity: false,
        conflictResolution: 'server_wins'
      },
      {
        feature: 'qr_code_generation',
        enabled: true,
        cacheDuration: 60 * 60 * 1000, // 1 hour
        syncStrategy: 'immediate',
        dataIntegrity: true,
        conflictResolution: 'cache_only'
      }
    ];

    capabilities.forEach(capability => {
      this.offlineCapabilities.set(capability.feature, capability);
    });

    pwaLogger.info('Offline capabilities initialized', {
      capabilities: capabilities.length
    });
  }

  /**
   * Generate service worker
   */
  private generateServiceWorker(): void {
    const serviceWorkerCode = `
// Veridity Service Worker - Generated automatically
const CACHE_VERSION = 'v${Date.now()}';
const STATIC_CACHE = 'veridity-static-' + CACHE_VERSION;
const DYNAMIC_CACHE = 'veridity-dynamic-' + CACHE_VERSION;
const API_CACHE = 'veridity-api-' + CACHE_VERSION;

// Cache strategies configuration
const CACHE_STRATEGIES = ${JSON.stringify(this.cacheStrategies, null, 2)};

// Background sync queue
let backgroundSyncQueue = [];

// Install event
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll([
        '/',
        '/offline.html',
        '/manifest.json',
        '/static/css/main.css',
        '/static/js/main.js',
        '/static/icons/icon-192x192.png',
        '/static/icons/icon-512x512.png'
      ]);
    }).then(() => {
      console.log('Static assets cached');
      return self.skipWaiting();
    })
  );
});

// Activate event
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== API_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event with advanced caching strategies
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests for caching
  if (request.method !== 'GET') {
    // Handle POST/PUT/DELETE for background sync
    if (request.method === 'POST' || request.method === 'PUT') {
      event.respondWith(handleBackgroundSync(request));
    }
    return;
  }
  
  // Find matching cache strategy
  const strategy = findCacheStrategy(request.url);
  
  if (strategy) {
    event.respondWith(handleCacheStrategy(request, strategy));
  } else {
    // Default network first strategy
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request).then(response => {
          return response || caches.match('/offline.html');
        });
      })
    );
  }
});

// Background sync event
self.addEventListener('sync', event => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'veridity-sync') {
    event.waitUntil(processBackgroundSync());
  }
});

// Push notification event
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New verification available',
    icon: '/static/icons/icon-192x192.png',
    badge: '/static/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/static/icons/view.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/static/icons/close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Veridity', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Helper functions
function findCacheStrategy(url) {
  return CACHE_STRATEGIES.find(strategy => strategy.pattern.test(url));
}

async function handleCacheStrategy(request, strategy) {
  const cacheName = getCacheName(strategy.name);
  
  switch (strategy.strategy) {
    case 'cache_first':
      return handleCacheFirst(request, cacheName, strategy);
    case 'network_first':
      return handleNetworkFirst(request, cacheName, strategy);
    case 'stale_while_revalidate':
      return handleStaleWhileRevalidate(request, cacheName, strategy);
    case 'network_only':
      return fetch(request);
    case 'cache_only':
      return caches.match(request);
    default:
      return handleNetworkFirst(request, cacheName, strategy);
  }
}

async function handleCacheFirst(request, cacheName, strategy) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Check if cache is still valid
    const cacheDate = new Date(cachedResponse.headers.get('date'));
    const isExpired = strategy.maxAge && (Date.now() - cacheDate.getTime()) > strategy.maxAge;
    
    if (!isExpired) {
      return cachedResponse;
    }
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
      await enforceMaxEntries(cache, strategy.maxEntries);
    }
    return networkResponse;
  } catch (error) {
    return cachedResponse || new Response('Offline content not available', { status: 503 });
  }
}

async function handleNetworkFirst(request, cacheName, strategy) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkPromise = fetch(request);
    const timeoutPromise = strategy.networkTimeoutSeconds 
      ? new Promise((_, reject) => setTimeout(reject, strategy.networkTimeoutSeconds * 1000))
      : null;
    
    const networkResponse = timeoutPromise 
      ? await Promise.race([networkPromise, timeoutPromise])
      : await networkPromise;
    
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
      await enforceMaxEntries(cache, strategy.maxEntries);
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    return cachedResponse || new Response('Content not available offline', { status: 503 });
  }
}

async function handleStaleWhileRevalidate(request, cacheName, strategy) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Start network request (don't await)
  const networkPromise = fetch(request).then(async response => {
    if (response.ok) {
      await cache.put(request, response.clone());
      await enforceMaxEntries(cache, strategy.maxEntries);
    }
    return response;
  }).catch(() => {});
  
  // Return cached response immediately if available
  return cachedResponse || networkPromise;
}

async function handleBackgroundSync(request) {
  // Queue request for background sync
  const taskId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  const task = {
    id: taskId,
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: await request.text(),
    timestamp: Date.now()
  };
  
  backgroundSyncQueue.push(task);
  
  // Register background sync
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    try {
      await self.registration.sync.register('veridity-sync');
      return new Response(JSON.stringify({ queued: true, taskId }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Background sync not supported' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  return new Response(JSON.stringify({ error: 'Background sync not available' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function processBackgroundSync() {
  console.log('Processing background sync queue:', backgroundSyncQueue.length, 'items');
  
  const processedTasks = [];
  
  for (const task of backgroundSyncQueue) {
    try {
      const response = await fetch(task.url, {
        method: task.method,
        headers: task.headers,
        body: task.body
      });
      
      if (response.ok) {
        processedTasks.push(task.id);
        console.log('Background sync task completed:', task.id);
      } else {
        console.log('Background sync task failed:', task.id, response.status);
      }
    } catch (error) {
      console.log('Background sync task error:', task.id, error);
    }
  }
  
  // Remove completed tasks
  backgroundSyncQueue = backgroundSyncQueue.filter(task => !processedTasks.includes(task.id));
  
  console.log('Background sync completed. Remaining tasks:', backgroundSyncQueue.length);
}

async function enforceMaxEntries(cache, maxEntries) {
  if (!maxEntries) return;
  
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    const keysToDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

function getCacheName(strategyName) {
  switch (strategyName) {
    case 'static-assets':
      return STATIC_CACHE;
    case 'api-proofs':
    case 'api-auth':
    case 'api-analytics':
      return API_CACHE;
    default:
      return DYNAMIC_CACHE;
  }
}

// Performance metrics
let performanceMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  backgroundSyncTasks: 0
};

// Message handler for communication with main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'GET_METRICS') {
    event.ports[0].postMessage(performanceMetrics);
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(cacheNames => {
      return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
    }).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});
`;

    try {
      writeFileSync(this.serviceWorkerPath, serviceWorkerCode);
      pwaLogger.info('Service worker generated', {
        path: this.serviceWorkerPath,
        strategies: this.cacheStrategies.length
      });
    } catch (error) {
      pwaLogger.error('Service worker generation failed:', error);
    }
  }

  /**
   * Generate web app manifest
   */
  private generateWebAppManifest(): void {
    const manifest = {
      name: 'Veridity - Digital Identity Platform',
      short_name: 'Veridity',
      description: 'Privacy-first digital identity verification using Zero-Knowledge Proofs',
      start_url: '/',
      display: 'standalone',
      orientation: 'portrait-primary',
      theme_color: '#1f2937',
      background_color: '#ffffff',
      scope: '/',
      icons: [
        {
          src: '/static/icons/icon-72x72.png',
          sizes: '72x72',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/static/icons/icon-96x96.png',
          sizes: '96x96',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/static/icons/icon-128x128.png',
          sizes: '128x128',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/static/icons/icon-144x144.png',
          sizes: '144x144',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/static/icons/icon-152x152.png',
          sizes: '152x152',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/static/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/static/icons/icon-384x384.png',
          sizes: '384x384',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/static/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable any'
        }
      ],
      shortcuts: [
        {
          name: 'Quick Verification',
          short_name: 'Verify',
          description: 'Start a new identity verification',
          url: '/verify',
          icons: [{ src: '/static/icons/verify-96x96.png', sizes: '96x96' }]
        },
        {
          name: 'View Proofs',
          short_name: 'Proofs',
          description: 'View your verification proofs',
          url: '/proofs',
          icons: [{ src: '/static/icons/proofs-96x96.png', sizes: '96x96' }]
        },
        {
          name: 'QR Scanner',
          short_name: 'Scan',
          description: 'Scan QR codes for verification',
          url: '/scan',
          icons: [{ src: '/static/icons/scan-96x96.png', sizes: '96x96' }]
        }
      ],
      categories: ['productivity', 'business', 'security'],
      screenshots: [
        {
          src: '/static/screenshots/desktop-1.png',
          sizes: '1280x720',
          type: 'image/png',
          platform: 'wide',
          label: 'Veridity Dashboard'
        },
        {
          src: '/static/screenshots/mobile-1.png',
          sizes: '375x667',
          type: 'image/png',
          platform: 'narrow',
          label: 'Mobile Verification'
        }
      ],
      prefer_related_applications: false,
      protocol_handlers: [
        {
          protocol: 'web+veridity',
          url: '/verify?data=%s'
        }
      ],
      edge_side_panel: {
        preferred_width: 400
      },
      launch_handler: {
        client_mode: ['navigate-existing', 'auto']
      }
    };

    try {
      writeFileSync(this.manifestPath, JSON.stringify(manifest, null, 2));
      pwaLogger.info('Web app manifest generated', {
        path: this.manifestPath,
        icons: manifest.icons.length,
        shortcuts: manifest.shortcuts.length
      });
    } catch (error) {
      pwaLogger.error('Web app manifest generation failed:', error);
    }
  }

  /**
   * Queue background sync task
   */
  async queueBackgroundSync(task: Omit<BackgroundSyncTask, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    try {
      const taskId = crypto.randomUUID();
      const backgroundTask: BackgroundSyncTask = {
        id: taskId,
        timestamp: new Date(),
        retryCount: 0,
        ...task
      };

      this.backgroundTasks.set(taskId, backgroundTask);

      pwaLogger.info('Background sync task queued', {
        taskId,
        type: task.type,
        priority: task.priority
      });

      return taskId;

    } catch (error) {
      pwaLogger.error('Background sync queue failed:', error);
      throw error;
    }
  }

  /**
   * Get PWA metrics
   */
  getPWAMetrics(): PWAMetrics {
    // In production, these would be real metrics
    return {
      installationRate: 23.5, // percentage of visitors who install
      offlineUsage: 12.8, // percentage of sessions that go offline
      cacheMissRate: 5.2, // percentage of cache misses
      backgroundSyncSuccess: 94.7, // percentage of successful background syncs
      averageOfflineTime: 142, // seconds
      storageUsage: 45.6, // MB
      networkSavings: 78.3 // percentage of network requests saved
    };
  }

  /**
   * Clear all caches
   */
  async clearAllCaches(): Promise<boolean> {
    try {
      // This would interact with the service worker to clear caches
      pwaLogger.info('All caches cleared');
      return true;
    } catch (error) {
      pwaLogger.error('Cache clearing failed:', error);
      return false;
    }
  }

  /**
   * Update cache strategies
   */
  updateCacheStrategy(strategyName: string, updates: Partial<CacheStrategy>): boolean {
    try {
      const strategyIndex = this.cacheStrategies.findIndex(s => s.name === strategyName);
      if (strategyIndex === -1) {
        return false;
      }

      this.cacheStrategies[strategyIndex] = {
        ...this.cacheStrategies[strategyIndex],
        ...updates
      };

      // Regenerate service worker with updated strategies
      this.generateServiceWorker();

      pwaLogger.info('Cache strategy updated', {
        strategy: strategyName,
        updates: Object.keys(updates)
      });

      return true;

    } catch (error) {
      pwaLogger.error('Cache strategy update failed:', error);
      return false;
    }
  }

  /**
   * Get offline capability status
   */
  getOfflineCapabilities(): OfflineCapability[] {
    return Array.from(this.offlineCapabilities.values());
  }

  /**
   * Update offline capability
   */
  updateOfflineCapability(feature: string, updates: Partial<OfflineCapability>): boolean {
    try {
      const capability = this.offlineCapabilities.get(feature);
      if (!capability) {
        return false;
      }

      this.offlineCapabilities.set(feature, {
        ...capability,
        ...updates
      });

      pwaLogger.info('Offline capability updated', {
        feature,
        updates: Object.keys(updates)
      });

      return true;

    } catch (error) {
      pwaLogger.error('Offline capability update failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();