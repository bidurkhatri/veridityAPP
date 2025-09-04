// Simple but effective cache management system
export class CacheManager {
  private static instance: CacheManager;
  private caches: Map<string, Map<string, { value: any; expiry: number }>> = new Map();
  private stats = { hits: 0, misses: 0, sets: 0 };

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Create a new cache
  createCache(name: string, defaultTTL: number = 15 * 60 * 1000): void {
    if (!this.caches.has(name)) {
      this.caches.set(name, new Map());
      console.log(`✅ Created cache: ${name} with TTL: ${defaultTTL}ms`);
    }
  }

  // Set cache value with TTL
  set(cacheName: string, key: string, value: any, ttl?: number): boolean {
    if (!this.caches.has(cacheName)) {
      this.createCache(cacheName);
    }

    const cache = this.caches.get(cacheName)!;
    const expiry = Date.now() + (ttl || 15 * 60 * 1000);
    cache.set(key, { value, expiry });
    this.stats.sets++;
    return true;
  }

  // Get cache value
  get(cacheName: string, key: string): any {
    const cache = this.caches.get(cacheName);
    if (!cache) {
      this.stats.misses++;
      return undefined;
    }

    const item = cache.get(key);
    if (!item || item.expiry < Date.now()) {
      if (item) cache.delete(key);
      this.stats.misses++;
      return undefined;
    }

    this.stats.hits++;
    return item.value;
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    this.caches.forEach((cache, name) => {
      const sizeBefore = cache.size;
      for (const [key, item] of Array.from(cache.entries())) {
        if (item.expiry < now) {
          cache.delete(key);
          cleaned++;
        }
      }
      const sizeAfter = cache.size;
      if (sizeBefore !== sizeAfter) {
        console.log(`🧹 Cleaned ${name}: ${sizeBefore - sizeAfter} expired entries`);
      }
    });

    if (cleaned > 0) {
      console.log(`🗑️ Total cleaned entries: ${cleaned}`);
    }
  }

  // Get cache statistics
  getStats() {
    const cacheInfo = Array.from(this.caches.entries()).map(([name, cache]) => ({
      name,
      entries: cache.size,
      memoryEstimate: this.estimateMemory(cache)
    }));

    return {
      caches: cacheInfo,
      operations: this.stats,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) * 100 || 0
    };
  }

  private estimateMemory(cache: Map<string, any>): string {
    let size = 0;
    cache.forEach((item, key) => {
      size += key.length * 2; // UTF-16
      size += JSON.stringify(item.value).length * 2;
    });
    return `${Math.round(size / 1024)}KB`;
  }
}

export const cacheManager = CacheManager.getInstance();

// Initialize caches
export const initializeCaching = () => {
  cacheManager.createCache('api-responses', 10 * 60 * 1000);
  cacheManager.createCache('user-sessions', 30 * 60 * 1000);
  cacheManager.createCache('proof-data', 60 * 60 * 1000);
  
  // Cleanup every 5 minutes
  setInterval(() => cacheManager.cleanup(), 5 * 60 * 1000);
  
  console.log('🚀 Caching system initialized');
};