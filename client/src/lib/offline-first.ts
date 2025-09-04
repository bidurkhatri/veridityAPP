/**
 * Offline-First Capabilities for Veridity
 * 
 * Designed for Nepal's rural areas with intermittent connectivity.
 * Provides seamless operation when network is unavailable.
 */

import { openDB, type IDBPDatabase } from 'idb';

interface OfflineProof {
  id: string;
  proofType: string;
  privateInputs: any;
  publicInputs: any;
  generatedAt: string;
  status: 'pending_sync' | 'synced' | 'failed';
  retryCount: number;
}

interface CachedData {
  key: string;
  data: any;
  timestamp: number;
  expiresAt?: number;
}

interface NetworkStatus {
  isOnline: boolean;
  connectionType: 'wifi' | '4g' | '3g' | '2g' | 'unknown';
  isSlowConnection: boolean;
}

export class OfflineFirstService {
  private db: IDBPDatabase | null = null;
  private networkStatus: NetworkStatus = {
    isOnline: navigator.onLine,
    connectionType: 'unknown',
    isSlowConnection: false
  };
  private syncQueue: OfflineProof[] = [];
  private syncInProgress = false;

  constructor() {
    this.initializeDatabase();
    this.setupNetworkListeners();
    this.detectConnectionSpeed();
    this.startPeriodicSync();
  }

  // Initialize IndexedDB for offline storage
  private async initializeDatabase() {
    try {
      this.db = await openDB('VeridityOffline', 1, {
        upgrade(db) {
          // Store for offline proofs
          if (!db.objectStoreNames.contains('proofs')) {
            const proofStore = db.createObjectStore('proofs', { keyPath: 'id' });
            proofStore.createIndex('status', 'status');
            proofStore.createIndex('generatedAt', 'generatedAt');
          }

          // Store for cached API responses
          if (!db.objectStoreNames.contains('cache')) {
            const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
            cacheStore.createIndex('timestamp', 'timestamp');
          }

          // Store for user settings and preferences
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
          }

          // Store for proof types and metadata
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata', { keyPath: 'id' });
          }
        },
      });

      console.log('📱 Offline database initialized');
    } catch (error) {
      console.error('❌ Failed to initialize offline database:', error);
    }
  }

  // Network monitoring and status detection
  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.networkStatus.isOnline = true;
      console.log('🌐 Network connection restored');
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.networkStatus.isOnline = false;
      console.log('📵 Network connection lost - switching to offline mode');
    });

    // Monitor connection changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', () => {
        this.updateConnectionInfo();
      });
      this.updateConnectionInfo();
    }
  }

  private updateConnectionInfo() {
    const connection = (navigator as any).connection;
    if (!connection) return;

    // Map connection types
    const typeMapping: Record<string, 'wifi' | '4g' | '3g' | '2g' | 'unknown'> = {
      'wifi': 'wifi',
      'cellular': '4g',
      '4g': '4g',
      '3g': '3g',
      '2g': '2g',
    };

    this.networkStatus.connectionType = typeMapping[connection.type] || 'unknown';
    this.networkStatus.isSlowConnection = connection.downlink < 1; // Less than 1 Mbps

    console.log(`📶 Connection: ${this.networkStatus.connectionType}, Speed: ${connection.downlink}Mbps`);
  }

  // Detect connection speed for adaptive behavior
  private async detectConnectionSpeed() {
    if (!this.networkStatus.isOnline) return;

    try {
      const startTime = Date.now();
      const response = await fetch('/api/ping', { 
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });
      const endTime = Date.now();
      
      const latency = endTime - startTime;
      this.networkStatus.isSlowConnection = latency > 3000; // 3+ seconds = slow

      console.log(`🏃‍♂️ Network latency: ${latency}ms`);
    } catch (error) {
      this.networkStatus.isSlowConnection = true;
    }
  }

  // Generate proof offline
  async generateProofOffline(proofType: string, privateInputs: any, publicInputs: any): Promise<string> {
    if (!this.db) throw new Error('Offline database not initialized');

    const proofId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const offlineProof: OfflineProof = {
      id: proofId,
      proofType,
      privateInputs,
      publicInputs,
      generatedAt: new Date().toISOString(),
      status: 'pending_sync',
      retryCount: 0
    };

    try {
      // Store proof locally
      await this.db.put('proofs', offlineProof);
      this.syncQueue.push(offlineProof);

      console.log(`💾 Proof generated offline: ${proofId}`);

      // Try to sync immediately if online
      if (this.networkStatus.isOnline && !this.networkStatus.isSlowConnection) {
        this.syncOfflineData();
      }

      return proofId;
    } catch (error) {
      console.error('❌ Failed to store offline proof:', error);
      throw error;
    }
  }

  // Sync offline data when connection is available
  private async syncOfflineData() {
    if (this.syncInProgress || !this.networkStatus.isOnline) return;

    this.syncInProgress = true;
    console.log('🔄 Starting offline data sync...');

    try {
      if (!this.db) return;

      // Get all pending proofs
      const pendingProofs = await this.db.getAllFromIndex('proofs', 'status', 'pending_sync');
      
      for (const proof of pendingProofs) {
        try {
          await this.syncProof(proof);
        } catch (error) {
          console.error(`❌ Failed to sync proof ${proof.id}:`, error);
          
          // Increment retry count
          proof.retryCount++;
          
          if (proof.retryCount >= 3) {
            proof.status = 'failed';
          }
          
          await this.db.put('proofs', proof);
        }
      }

      console.log(`✅ Sync completed. Processed ${pendingProofs.length} offline proofs`);
    } catch (error) {
      console.error('❌ Sync process failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncProof(proof: OfflineProof) {
    try {
      const response = await fetch('/api/proofs/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proofTypeId: proof.proofType,
          privateInputs: proof.privateInputs,
          publicInputs: proof.publicInputs,
          offlineId: proof.id
        }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (response.ok) {
        const result = await response.json();
        
        // Mark as synced
        proof.status = 'synced';
        await this.db!.put('proofs', proof);
        
        console.log(`✅ Synced offline proof: ${proof.id} -> ${result.id}`);
        
        // Remove from sync queue
        this.syncQueue = this.syncQueue.filter(p => p.id !== proof.id);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`❌ Failed to sync proof ${proof.id}:`, error);
      throw error;
    }
  }

  // Cache API responses for offline access
  async cacheResponse(key: string, data: any, ttl: number = 3600000): Promise<void> { // 1 hour default TTL
    if (!this.db) return;

    const cacheEntry: CachedData = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    };

    try {
      await this.db.put('cache', cacheEntry);
      console.log(`💾 Cached response: ${key}`);
    } catch (error) {
      console.error('❌ Failed to cache response:', error);
    }
  }

  // Retrieve cached data
  async getCachedResponse(key: string): Promise<any | null> {
    if (!this.db) return null;

    try {
      const cached = await this.db.get('cache', key);
      
      if (!cached) return null;
      
      // Check if expired
      if (cached.expiresAt && Date.now() > cached.expiresAt) {
        await this.db.delete('cache', key);
        return null;
      }

      console.log(`📁 Retrieved cached response: ${key}`);
      return cached.data;
    } catch (error) {
      console.error('❌ Failed to retrieve cached response:', error);
      return null;
    }
  }

  // Smart API request with offline fallback
  async smartFetch(url: string, options: RequestInit = {}): Promise<any> {
    const cacheKey = `${url}_${JSON.stringify(options)}`;

    // Try network request first if online and not slow
    if (this.networkStatus.isOnline && !this.networkStatus.isSlowConnection) {
      try {
        const response = await fetch(url, {
          ...options,
          signal: AbortSignal.timeout(5000) // 5 second timeout for slow connections
        });

        if (response.ok) {
          const data = await response.json();
          
          // Cache successful responses
          if (options.method === 'GET' || !options.method) {
            await this.cacheResponse(cacheKey, data);
          }
          
          return data;
        }
      } catch (error) {
        console.warn('⚠️ Network request failed, falling back to cache:', error);
      }
    }

    // Fallback to cached data
    const cached = await this.getCachedResponse(cacheKey);
    if (cached) {
      console.log('📱 Using cached data (offline mode)');
      return cached;
    }

    throw new Error('No network connection and no cached data available');
  }

  // Get offline statistics
  async getOfflineStats() {
    if (!this.db) return null;

    try {
      const totalProofs = await this.db.count('proofs');
      const pendingProofs = await this.db.countFromIndex('proofs', 'status', 'pending_sync');
      const syncedProofs = await this.db.countFromIndex('proofs', 'status', 'synced');
      const failedProofs = await this.db.countFromIndex('proofs', 'status', 'failed');
      
      const cacheSize = await this.db.count('cache');
      
      return {
        networkStatus: this.networkStatus,
        proofs: {
          total: totalProofs,
          pending: pendingProofs,
          synced: syncedProofs,
          failed: failedProofs
        },
        cacheEntries: cacheSize,
        syncQueueLength: this.syncQueue.length
      };
    } catch (error) {
      console.error('❌ Failed to get offline stats:', error);
      return null;
    }
  }

  // Periodic sync for background operation
  private startPeriodicSync() {
    // Sync every 5 minutes when online
    setInterval(() => {
      if (this.networkStatus.isOnline && this.syncQueue.length > 0) {
        this.syncOfflineData();
      }
    }, 5 * 60 * 1000);
  }

  // Clear old cache entries
  async cleanupCache() {
    if (!this.db) return;

    try {
      const tx = this.db.transaction('cache', 'readwrite');
      const store = tx.objectStore('cache');
      const allEntries = await store.getAll();
      
      const now = Date.now();
      let cleaned = 0;
      
      for (const entry of allEntries) {
        if (entry.expiresAt && now > entry.expiresAt) {
          await store.delete(entry.key);
          cleaned++;
        }
      }
      
      console.log(`🧹 Cleaned up ${cleaned} expired cache entries`);
    } catch (error) {
      console.error('❌ Failed to cleanup cache:', error);
    }
  }

  // Force sync all pending data
  async forceSyncAll() {
    console.log('🚀 Force syncing all offline data...');
    await this.syncOfflineData();
  }

  // Check if device can handle offline operations
  isOfflineCapable(): boolean {
    return 'indexedDB' in window && 'serviceWorker' in navigator;
  }
}

// Global instance
export const offlineService = new OfflineFirstService();