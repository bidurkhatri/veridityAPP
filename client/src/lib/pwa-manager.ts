/**
 * Progressive Web App features and service worker management
 */

export interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export class PWAManager {
  private installPrompt: InstallPromptEvent | null = null;
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.initializeServiceWorker();
    this.setupInstallPrompt();
    this.setupBackgroundSync();
  }

  private async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', this.registration);

        // Listen for updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration!.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available, show update prompt
                this.showUpdatePrompt();
              }
            });
          }
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.installPrompt = event as InstallPromptEvent;
      
      // Show install banner or button
      this.showInstallPrompt();
    });

    // Track installation
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully');
      this.installPrompt = null;
      
      // Track analytics
      this.trackEvent('pwa_installed');
    });
  }

  private setupBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      // Register background sync for offline proof generation
      navigator.serviceWorker.ready.then((registration) => {
        return registration.sync.register('background-proof-sync');
      });
    }
  }

  private showInstallPrompt() {
    // You can customize this to show your own install UI
    console.log('PWA install prompt available');
    
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  }

  private showUpdatePrompt() {
    // Notify user of app update
    const event = new CustomEvent('pwa-update-available');
    window.dispatchEvent(event);
  }

  async installApp(): Promise<boolean> {
    if (!this.installPrompt) {
      console.warn('Install prompt not available');
      return false;
    }

    try {
      await this.installPrompt.prompt();
      const choice = await this.installPrompt.userChoice;
      
      if (choice.outcome === 'accepted') {
        console.log('User accepted PWA install');
        this.trackEvent('pwa_install_accepted');
        return true;
      } else {
        console.log('User dismissed PWA install');
        this.trackEvent('pwa_install_dismissed');
        return false;
      }
    } catch (error) {
      console.error('PWA install failed:', error);
      return false;
    }
  }

  async updateApp(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      await this.registration.update();
      
      if (this.registration.waiting) {
        // Tell waiting service worker to skip waiting
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('App update failed:', error);
      return false;
    }
  }

  isInstallable(): boolean {
    return this.installPrompt !== null;
  }

  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches ||
           (window.navigator as any).standalone === true;
  }

  // Offline capability check
  isOfflineCapable(): boolean {
    return 'serviceWorker' in navigator && 
           'caches' in window && 
           'BackgroundSync' in window;
  }

  // Cache management
  async clearCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
    }
  }

  async getCacheSize(): Promise<number> {
    if (!('caches' in window)) return 0;

    let totalSize = 0;
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const size = response.headers.get('content-length');
          if (size) {
            totalSize += parseInt(size, 10);
          }
        }
      }
    }
    
    return totalSize;
  }

  private trackEvent(eventName: string, data?: any) {
    // Send to analytics service
    console.log('PWA Event:', eventName, data);
    
    // You can integrate with analytics here
    if (window.gtag) {
      window.gtag('event', eventName, data);
    }
  }
}

// Global PWA manager instance
export const pwaManager = new PWAManager();

// React hooks for PWA features
export function usePWAInstall() {
  const [isInstallable, setIsInstallable] = React.useState(pwaManager.isInstallable());
  const [isInstalled, setIsInstalled] = React.useState(pwaManager.isInstalled());

  React.useEffect(() => {
    const handleInstallAvailable = () => setIsInstallable(true);
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return {
    isInstallable,
    isInstalled,
    install: () => pwaManager.installApp()
  };
}

export function usePWAUpdate() {
  const [updateAvailable, setUpdateAvailable] = React.useState(false);

  React.useEffect(() => {
    const handleUpdateAvailable = () => setUpdateAvailable(true);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, []);

  return {
    updateAvailable,
    update: () => pwaManager.updateApp()
  };
}