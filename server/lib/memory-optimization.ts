// Simple memory management without external dependencies
class SimpleCache {
  private data = new Map<string, { value: any; expiry: number }>();
  
  set(key: string, value: any, ttl = 15 * 60 * 1000) {
    this.data.set(key, { value, expiry: Date.now() + ttl });
  }
  
  get(key: string) {
    const item = this.data.get(key);
    if (!item || item.expiry < Date.now()) {
      this.data.delete(key);
      return undefined;
    }
    return item.value;
  }
  
  clear() {
    this.data.clear();
  }
  
  size() {
    return this.data.size;
  }
}

// Memory-optimized cache management system
export class MemoryOptimizer {
  private static instance: MemoryOptimizer;
  private caches: Map<string, LRUCache<string, any>> = new Map();
  private memoryStats = {
    totalAllocated: 0,
    totalFreed: 0,
    cacheHits: 0,
    cacheMisses: 0
  };

  static getInstance(): MemoryOptimizer {
    if (!MemoryOptimizer.instance) {
      MemoryOptimizer.instance = new MemoryOptimizer();
    }
    return MemoryOptimizer.instance;
  }

  // Create optimized cache with automatic cleanup
  createCache<T>(name: string, options: {
    maxSize?: number;
    maxAge?: number;
    sizeCalculation?: (value: T) => number;
  } = {}): LRUCache<string, T> {
    const cache = new LRUCache<string, T>({
      max: options.maxSize || 1000,
      ttl: options.maxAge || 15 * 60 * 1000, // 15 minutes default
      sizeCalculation: options.sizeCalculation || ((value: T) => {
        return JSON.stringify(value).length;
      }),
      dispose: (value, key) => {
        this.memoryStats.totalFreed++;
        console.log(`🗑️ Cache entry disposed: ${name}:${key}`);
      }
    });

    this.caches.set(name, cache);
    console.log(`✅ Created optimized cache: ${name}`);
    return cache;
  }

  // Get cache with automatic creation
  getCache<T>(name: string): LRUCache<string, T> | undefined {
    return this.caches.get(name) as LRUCache<string, T>;
  }

  // Intelligent cache operations
  set<T>(cacheName: string, key: string, value: T, options?: { ttl?: number }): boolean {
    const cache = this.getCache<T>(cacheName);
    if (!cache) {
      console.warn(`⚠️ Cache not found: ${cacheName}`);
      return false;
    }

    cache.set(key, value, options);
    this.memoryStats.totalAllocated++;
    return true;
  }

  get<T>(cacheName: string, key: string): T | undefined {
    const cache = this.getCache<T>(cacheName);
    if (!cache) {
      this.memoryStats.cacheMisses++;
      return undefined;
    }

    const value = cache.get(key);
    if (value !== undefined) {
      this.memoryStats.cacheHits++;
    } else {
      this.memoryStats.cacheMisses++;
    }
    return value;
  }

  // Compress data before caching
  setCompressed(cacheName: string, key: string, data: any): boolean {
    try {
      const compressed = this.compressData(data);
      return this.set(cacheName, key, compressed);
    } catch (error) {
      console.error('❌ Failed to compress and cache data:', error);
      return false;
    }
  }

  getDecompressed(cacheName: string, key: string): any {
    try {
      const compressed = this.get(cacheName, key);
      if (!compressed) return undefined;
      return this.decompressData(compressed);
    } catch (error) {
      console.error('❌ Failed to decompress cached data:', error);
      return undefined;
    }
  }

  // Simple data compression
  private compressData(data: any): string {
    const jsonString = JSON.stringify(data);
    // Simple compression using base64 encoding
    return Buffer.from(jsonString, 'utf8').toString('base64');
  }

  private decompressData(compressed: string): any {
    const jsonString = Buffer.from(compressed, 'base64').toString('utf8');
    return JSON.parse(jsonString);
  }

  // Memory monitoring and cleanup
  getMemoryStats() {
    const memUsage = process.memoryUsage();
    const cacheStats = Array.from(this.caches.entries()).map(([name, cache]) => ({
      name,
      size: cache.size,
      calculatedSize: cache.calculatedSize,
      max: cache.max
    }));

    return {
      process: {
        rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
        external: Math.round(memUsage.external / 1024 / 1024) + ' MB'
      },
      caches: cacheStats,
      operations: this.memoryStats,
      hitRate: this.memoryStats.cacheHits / (this.memoryStats.cacheHits + this.memoryStats.cacheMisses) * 100
    };
  }

  // Force garbage collection and cleanup
  forceCleanup(): void {
    // Clear expired entries from all caches
    this.caches.forEach((cache, name) => {
      const sizeBefore = cache.size;
      cache.purgeStale();
      const sizeAfter = cache.size;
      if (sizeBefore !== sizeAfter) {
        console.log(`🧹 Cleaned ${name} cache: ${sizeBefore - sizeAfter} entries removed`);
      }
    });

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      console.log('🗑️ Forced garbage collection');
    }
  }

  // Auto-cleanup based on memory pressure
  autoCleanup(): void {
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
    const memoryPressure = heapUsedMB / heapTotalMB;

    console.log(`📊 Memory pressure: ${Math.round(memoryPressure * 100)}%`);

    if (memoryPressure > 0.8) {
      console.log('⚠️ High memory pressure detected, initiating cleanup...');
      this.forceCleanup();
      
      // Reduce cache sizes temporarily
      this.caches.forEach((cache, name) => {
        const currentMax = cache.max;
        const newMax = Math.floor(currentMax * 0.7);
        cache.max = newMax;
        console.log(`📉 Reduced ${name} cache size from ${currentMax} to ${newMax}`);
      });
    }
  }

  // Initialize automatic memory management
  startAutoManagement(): void {
    // Check memory every 5 minutes
    setInterval(() => {
      this.autoCleanup();
    }, 5 * 60 * 1000);

    // Force cleanup every hour
    setInterval(() => {
      this.forceCleanup();
    }, 60 * 60 * 1000);

    console.log('🔄 Automatic memory management started');
  }
}

// Global memory optimizer instance
export const memoryOptimizer = MemoryOptimizer.getInstance();

// Initialize common caches
export const initializeMemoryOptimization = () => {
  // Create specialized caches for different data types
  memoryOptimizer.createCache('api-responses', {
    maxSize: 500,
    maxAge: 10 * 60 * 1000 // 10 minutes
  });

  memoryOptimizer.createCache('user-sessions', {
    maxSize: 1000,
    maxAge: 30 * 60 * 1000 // 30 minutes
  });

  memoryOptimizer.createCache('proof-data', {
    maxSize: 200,
    maxAge: 60 * 60 * 1000 // 1 hour
  });

  memoryOptimizer.createCache('static-content', {
    maxSize: 100,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  // Start automatic management
  memoryOptimizer.startAutoManagement();

  console.log('🚀 Memory optimization system initialized');
};