// Enhanced PWA functionality with advanced offline capabilities
export class PWAEnhancement {
  private static instance: PWAEnhancement;
  private serviceWorker: ServiceWorker | null = null;
  private installPrompt: any = null;
  private isOnline = navigator.onLine;
  private syncQueue: SyncOperation[] = [];
  private notificationPermission: NotificationPermission = 'default';

  static getInstance(): PWAEnhancement {
    if (!PWAEnhancement.instance) {
      PWAEnhancement.instance = new PWAEnhancement();
    }
    return PWAEnhancement.instance;
  }

  // Initialize PWA features
  async initialize(): Promise<void> {
    await this.registerServiceWorker();
    this.setupInstallPrompt();
    this.setupNetworkListeners();
    this.setupNotifications();
    this.startBackgroundSync();
    console.log('🚀 Enhanced PWA features initialized');
  }

  // Register service worker with enhanced features
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateNotification();
              }
            });
          }
        });

        this.serviceWorker = registration.active;
        console.log('✅ Service worker registered successfully');
      } catch (error) {
        console.error('❌ Service worker registration failed:', error);
      }
    }
  }

  // Setup app installation prompt
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e;
      this.showInstallBanner();
    });

    window.addEventListener('appinstalled', () => {
      console.log('🎉 PWA installed successfully');
      this.hideInstallBanner();
      this.installPrompt = null;
    });
  }

  // Enhanced network monitoring
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Network connection restored');
      this.showNetworkStatus('online');
      this.processOfflineSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📵 Network connection lost');
      this.showNetworkStatus('offline');
    });

    // Monitor connection quality
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', () => {
        this.updateConnectionInfo(connection);
      });
    }
  }

  // Setup push notifications
  private async setupNotifications(): Promise<void> {
    if ('Notification' in window) {
      this.notificationPermission = await Notification.requestPermission();
      
      if (this.notificationPermission === 'granted') {
        console.log('✅ Notification permission granted');
        
        // Register for push notifications
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: this.urlB64ToUint8Array(
                'BEl62iUYgUivxIkv69yViEuiBIa40HI0DLLSr8RNhLgN17FWhzO_tNGqFHQ-_T84qd_hA1kKl_Md2-s6mKC8VQc'
              )
            });
            
            console.log('🔔 Push subscription successful:', subscription);
            await this.sendSubscriptionToServer(subscription);
          } catch (error) {
            console.error('❌ Push subscription failed:', error);
          }
        }
      }
    }
  }

  // Start background synchronization
  private startBackgroundSync(): void {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        return registration.sync.register('background-sync');
      }).catch((error) => {
        console.error('❌ Background sync registration failed:', error);
      });
    }

    // Fallback polling for sync
    setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.processOfflineSync();
      }
    }, 30000); // Every 30 seconds
  }

  // Show app installation banner
  private showInstallBanner(): void {
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML = `
      <div style="
        position: fixed; 
        bottom: 0; 
        left: 0; 
        right: 0; 
        background: #2563eb; 
        color: white; 
        padding: 16px; 
        display: flex; 
        justify-content: space-between; 
        align-items: center;
        z-index: 1000;
        animation: slideUp 0.3s ease-out;
      ">
        <div>
          <strong>Install Veridity</strong>
          <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">
            Add to your home screen for quick access and offline use
          </p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="pwa-install-btn" style="
            background: white; 
            color: #2563eb; 
            border: none; 
            padding: 8px 16px; 
            border-radius: 6px; 
            font-weight: 600;
            cursor: pointer;
          ">Install</button>
          <button id="pwa-dismiss-btn" style="
            background: transparent; 
            color: white; 
            border: 1px solid rgba(255,255,255,0.3); 
            padding: 8px 16px; 
            border-radius: 6px;
            cursor: pointer;
          ">Later</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Add event listeners
    document.getElementById('pwa-install-btn')?.addEventListener('click', () => {
      this.triggerInstall();
    });

    document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
      this.hideInstallBanner();
    });
  }

  // Hide installation banner
  private hideInstallBanner(): void {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.remove();
    }
  }

  // Trigger app installation
  async triggerInstall(): Promise<void> {
    if (this.installPrompt) {
      this.installPrompt.prompt();
      const result = await this.installPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
      } else {
        console.log('❌ User dismissed the install prompt');
      }
      
      this.installPrompt = null;
      this.hideInstallBanner();
    }
  }

  // Show network status notification
  private showNetworkStatus(status: 'online' | 'offline'): void {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${status === 'online' ? '#10b981' : '#ef4444'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      z-index: 1000;
      animation: fadeInOut 3s ease-in-out forwards;
    `;
    notification.textContent = status === 'online' 
      ? '🌐 Back online - syncing data...' 
      : '📵 You\'re offline - changes will sync when reconnected';

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Show update notification
  private showUpdateNotification(): void {
    if (this.notificationPermission === 'granted') {
      new Notification('Veridity Update Available', {
        body: 'A new version of Veridity is available. Refresh to update.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        actions: [
          { action: 'update', title: 'Update Now' },
          { action: 'dismiss', title: 'Later' }
        ]
      });
    }
  }

  // Add operation to sync queue
  addToSyncQueue(operation: SyncOperation): void {
    this.syncQueue.push(operation);
    console.log(`📝 Added operation to sync queue: ${operation.type}`);

    // Try immediate sync if online
    if (this.isOnline) {
      this.processOfflineSync();
    }
  }

  // Process offline synchronization
  private async processOfflineSync(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    console.log(`🔄 Processing ${this.syncQueue.length} queued operations...`);

    const operationsToProcess = [...this.syncQueue];
    this.syncQueue = [];

    for (const operation of operationsToProcess) {
      try {
        await this.executeOperation(operation);
        console.log(`✅ Synced operation: ${operation.type}`);
      } catch (error) {
        console.error(`❌ Failed to sync operation: ${operation.type}`, error);
        // Re-queue failed operations with exponential backoff
        operation.retryCount = (operation.retryCount || 0) + 1;
        if (operation.retryCount < 3) {
          setTimeout(() => {
            this.syncQueue.push(operation);
          }, Math.pow(2, operation.retryCount) * 1000);
        }
      }
    }
  }

  // Execute sync operation
  private async executeOperation(operation: SyncOperation): Promise<void> {
    const response = await fetch(operation.url, {
      method: operation.method,
      headers: {
        'Content-Type': 'application/json',
        ...operation.headers
      },
      body: operation.data ? JSON.stringify(operation.data) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Update connection information
  private updateConnectionInfo(connection: any): void {
    const connectionType = connection.effectiveType || 'unknown';
    const downlink = connection.downlink || 0;
    
    console.log(`📶 Connection: ${connectionType}, Speed: ${downlink}Mbps`);
    
    // Adjust sync behavior based on connection quality
    if (connectionType === 'slow-2g' || downlink < 0.5) {
      console.log('🐌 Slow connection detected - reducing sync frequency');
    }
  }

  // Convert VAPID key
  private urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Send push subscription to server
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.error('❌ Failed to send subscription to server:', error);
    }
  }

  // Get PWA status
  getStatus(): PWAStatus {
    return {
      isInstalled: window.matchMedia('(display-mode: standalone)').matches,
      isOnline: this.isOnline,
      hasServiceWorker: !!this.serviceWorker,
      notificationPermission: this.notificationPermission,
      syncQueueLength: this.syncQueue.length,
      canInstall: !!this.installPrompt
    };
  }
}

interface SyncOperation {
  type: string;
  url: string;
  method: string;
  data?: any;
  headers?: Record<string, string>;
  retryCount?: number;
}

interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  hasServiceWorker: boolean;
  notificationPermission: NotificationPermission;
  syncQueueLength: number;
  canInstall: boolean;
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateX(100%); }
    15% { opacity: 1; transform: translateX(0); }
    85% { opacity: 1; transform: translateX(0); }
    100% { opacity: 0; transform: translateX(100%); }
  }
`;
document.head.appendChild(style);

export const pwaEnhancement = PWAEnhancement.getInstance();