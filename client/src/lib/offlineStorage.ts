// Offline storage and synchronization service
export interface OfflineProof {
  id: string;
  proofType: string;
  privateInputs: any;
  generatedAt: number;
  status: 'pending' | 'synced' | 'failed';
  retryCount: number;
}

export interface OfflineVerification {
  id: string;
  proofId: string;
  organizationId?: string;
  verifiedAt: number;
  result: any;
  status: 'pending' | 'synced' | 'failed';
  retryCount: number;
}

export interface SyncQueueItem {
  id: string;
  type: 'proof' | 'verification' | 'document';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export class OfflineStorage {
  private readonly STORAGE_KEYS = {
    PROOFS: 'veridity_offline_proofs',
    VERIFICATIONS: 'veridity_offline_verifications',
    SYNC_QUEUE: 'veridity_sync_queue',
    USER_DATA: 'veridity_user_data',
    SETTINGS: 'veridity_settings',
    LAST_SYNC: 'veridity_last_sync'
  };

  private syncQueue: SyncQueueItem[] = [];
  private isOnline = navigator.onLine;
  private syncInProgress = false;

  constructor() {
    this.loadSyncQueue();
    this.setupOnlineDetection();
    this.setupPeriodicSync();
  }

  // Store proof locally when offline
  storeOfflineProof(proof: Omit<OfflineProof, 'id' | 'generatedAt' | 'status' | 'retryCount'>): string {
    const proofId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const offlineProof: OfflineProof = {
      ...proof,
      id: proofId,
      generatedAt: Date.now(),
      status: 'pending',
      retryCount: 0
    };

    // Store in localStorage
    const stored = this.getStoredProofs();
    stored.push(offlineProof);
    localStorage.setItem(this.STORAGE_KEYS.PROOFS, JSON.stringify(stored));

    // Add to sync queue
    this.addToSyncQueue({
      type: 'proof',
      action: 'create',
      data: offlineProof,
      maxRetries: 5
    });

    return proofId;
  }

  // Store verification result locally when offline
  storeOfflineVerification(verification: Omit<OfflineVerification, 'id' | 'verifiedAt' | 'status' | 'retryCount'>): string {
    const verificationId = `offline_ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const offlineVerification: OfflineVerification = {
      ...verification,
      id: verificationId,
      verifiedAt: Date.now(),
      status: 'pending',
      retryCount: 0
    };

    // Store in localStorage
    const stored = this.getStoredVerifications();
    stored.push(offlineVerification);
    localStorage.setItem(this.STORAGE_KEYS.VERIFICATIONS, JSON.stringify(stored));

    // Add to sync queue
    this.addToSyncQueue({
      type: 'verification',
      action: 'create',
      data: offlineVerification,
      maxRetries: 3
    });

    return verificationId;
  }

  // Get all stored offline data
  getOfflineData(): {
    proofs: OfflineProof[];
    verifications: OfflineVerification[];
    pendingSyncItems: number;
    lastSyncAt: number | null;
  } {
    return {
      proofs: this.getStoredProofs(),
      verifications: this.getStoredVerifications(),
      pendingSyncItems: this.syncQueue.length,
      lastSyncAt: this.getLastSyncTime()
    };
  }

  // Synchronize offline data when back online
  async syncWithServer(): Promise<{
    success: boolean;
    synced: number;
    failed: number;
    errors: string[];
  }> {
    if (!this.isOnline || this.syncInProgress) {
      return { success: false, synced: 0, failed: 0, errors: ['Not online or sync in progress'] };
    }

    this.syncInProgress = true;
    const results = { success: true, synced: 0, failed: 0, errors: [] as string[] };

    try {
      // Process sync queue
      for (const item of [...this.syncQueue]) {
        try {
          await this.syncQueueItem(item);
          this.removeSyncQueueItem(item.id);
          results.synced++;
        } catch (error: any) {
          item.retryCount++;
          
          if (item.retryCount >= item.maxRetries) {
            this.removeSyncQueueItem(item.id);
            results.failed++;
            results.errors.push(`Max retries exceeded for ${item.type} ${item.action}: ${error?.message || error}`);
          } else {
            results.errors.push(`Retry ${item.retryCount}/${item.maxRetries} for ${item.type}: ${error?.message || error}`);
          }
        }
      }

      // Update last sync time
      localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC, Date.now().toString());

    } catch (error: any) {
      results.success = false;
      results.errors.push(`Sync failed: ${error?.message || error}`);
    } finally {
      this.syncInProgress = false;
      this.saveSyncQueue();
    }

    return results;
  }

  // Clear all offline data (use with caution)
  clearOfflineData(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    this.syncQueue = [];
    console.log('🧹 Offline data cleared');
  }

  // Check if device is online
  isDeviceOnline(): boolean {
    return this.isOnline;
  }

  // Get storage usage info
  getStorageInfo(): {
    usedSpace: number;
    totalSpace: number;
    itemCounts: Record<string, number>;
  } {
    const usage = {
      usedSpace: 0,
      totalSpace: 5 * 1024 * 1024, // 5MB estimate for localStorage
      itemCounts: {
        proofs: this.getStoredProofs().length,
        verifications: this.getStoredVerifications().length,
        syncQueue: this.syncQueue.length
      }
    };

    // Estimate used space
    Object.values(this.STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        usage.usedSpace += new Blob([item]).size;
      }
    });

    return usage;
  }

  // Private methods
  private getStoredProofs(): OfflineProof[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.PROOFS);
    return stored ? JSON.parse(stored) : [];
  }

  private getStoredVerifications(): OfflineVerification[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.VERIFICATIONS);
    return stored ? JSON.parse(stored) : [];
  }

  private addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): void {
    const queueItem: SyncQueueItem = {
      ...item,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.syncQueue.push(queueItem);
    this.saveSyncQueue();
  }

  private loadSyncQueue(): void {
    const stored = localStorage.getItem(this.STORAGE_KEYS.SYNC_QUEUE);
    this.syncQueue = stored ? JSON.parse(stored) : [];
  }

  private saveSyncQueue(): void {
    localStorage.setItem(this.STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(this.syncQueue));
  }

  private removeSyncQueueItem(itemId: string): void {
    this.syncQueue = this.syncQueue.filter(item => item.id !== itemId);
  }

  private getLastSyncTime(): number | null {
    const stored = localStorage.getItem(this.STORAGE_KEYS.LAST_SYNC);
    return stored ? parseInt(stored) : null;
  }

  private setupOnlineDetection(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('📶 Device is back online - starting sync');
      this.triggerSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📵 Device is offline - storing data locally');
    });
  }

  private setupPeriodicSync(): void {
    // Sync every 5 minutes when online
    setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.triggerSync();
      }
    }, 5 * 60 * 1000);
  }

  private async triggerSync(): Promise<void> {
    try {
      const result = await this.syncWithServer();
      if (result.synced > 0) {
        console.log(`✅ Synced ${result.synced} items successfully`);
      }
      if (result.failed > 0) {
        console.warn(`⚠️ Failed to sync ${result.failed} items`);
      }
    } catch (error) {
      console.error('Sync trigger failed:', error);
    }
  }

  private async syncQueueItem(item: SyncQueueItem): Promise<void> {
    const endpoint = this.getSyncEndpoint(item);
    const method = this.getSyncMethod(item.action);

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: method !== 'GET' ? JSON.stringify(item.data) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Sync failed: ${response.status} ${error}`);
    }

    // Update local data with server response if needed
    const serverData = await response.json();
    this.updateLocalDataAfterSync(item, serverData);
  }

  private getSyncEndpoint(item: SyncQueueItem): string {
    switch (item.type) {
      case 'proof':
        return '/api/proofs/generate';
      case 'verification':
        return '/api/verify';
      case 'document':
        return '/api/documents/upload';
      default:
        throw new Error(`Unknown sync type: ${item.type}`);
    }
  }

  private getSyncMethod(action: string): string {
    switch (action) {
      case 'create': return 'POST';
      case 'update': return 'PATCH';
      case 'delete': return 'DELETE';
      default: return 'POST';
    }
  }

  private updateLocalDataAfterSync(item: SyncQueueItem, serverData: any): void {
    if (item.type === 'proof') {
      // Update proof with server-generated ID
      const proofs = this.getStoredProofs();
      const proofIndex = proofs.findIndex(p => p.id === item.data.id);
      if (proofIndex !== -1) {
        proofs[proofIndex].status = 'synced';
        localStorage.setItem(this.STORAGE_KEYS.PROOFS, JSON.stringify(proofs));
      }
    }
    // Add other sync update logic as needed
  }
}

export const offlineStorage = new OfflineStorage();