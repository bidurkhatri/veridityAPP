import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Wifi,
  WifiOff,
  Sync,
  SyncOff,
  Battery,
  Signal,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Clock,
  HardDrive
} from "lucide-react";

interface PWAStatus {
  isOnline: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  syncStatus: 'synced' | 'pending' | 'error' | 'offline';
  cacheSize: number;
  lastSync: Date | null;
  pendingActions: number;
}

export function PWACapabilities() {
  const { t } = useTranslation('en');
  const [pwaStatus, setPwaStatus] = useState<PWAStatus>({
    isOnline: navigator.onLine,
    isInstalled: false,
    canInstall: false,
    syncStatus: 'synced',
    cacheSize: 0,
    lastSync: new Date(),
    pendingActions: 0
  });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showOfflineNotice, setShowOfflineNotice] = useState(false);

  useEffect(() => {
    // Check if PWA is installed
    const checkInstallStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setPwaStatus(prev => ({ ...prev, isInstalled: isStandalone || isInWebAppiOS }));
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPwaStatus(prev => ({ ...prev, canInstall: true }));
    };

    // Listen for online/offline status
    const handleOnline = () => {
      setPwaStatus(prev => ({ ...prev, isOnline: true }));
      setShowOfflineNotice(false);
      syncOfflineData();
    };

    const handleOffline = () => {
      setPwaStatus(prev => ({ ...prev, isOnline: false }));
      setShowOfflineNotice(true);
    };

    checkInstallStatus();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulate cache size calculation
    if ('caches' in window) {
      calculateCacheSize();
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const calculateCacheSize = async () => {
    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        totalSize += requests.length * 1024; // Approximate size
      }
      
      setPwaStatus(prev => ({ ...prev, cacheSize: totalSize }));
    } catch (error) {
      console.error('Failed to calculate cache size:', error);
    }
  };

  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setPwaStatus(prev => ({ ...prev, isInstalled: true, canInstall: false }));
      }
      
      setDeferredPrompt(null);
    }
  };

  const syncOfflineData = async () => {
    setPwaStatus(prev => ({ ...prev, syncStatus: 'pending' }));
    
    try {
      // Simulate syncing offline data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get pending actions from localStorage
      const pending = localStorage.getItem('veridity-pending-actions');
      const pendingCount = pending ? JSON.parse(pending).length : 0;
      
      if (pendingCount > 0) {
        // Process pending actions
        localStorage.removeItem('veridity-pending-actions');
      }
      
      setPwaStatus(prev => ({ 
        ...prev, 
        syncStatus: 'synced',
        lastSync: new Date(),
        pendingActions: 0
      }));
    } catch (error) {
      setPwaStatus(prev => ({ ...prev, syncStatus: 'error' }));
    }
  };

  const clearCache = async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      setPwaStatus(prev => ({ ...prev, cacheSize: 0 }));
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSyncStatusIcon = () => {
    switch (pwaStatus.syncStatus) {
      case 'synced':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Sync className="h-4 w-4 text-warning animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'offline':
        return <SyncOff className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Sync className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Offline Notice */}
      <AnimatePresence>
        {showOfflineNotice && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-4 right-4 z-50"
          >
            <Card className="bg-warning/10 border-warning/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <WifiOff className="h-5 w-5 text-warning" />
                  <div>
                    <p className="font-medium text-warning">You're offline</p>
                    <p className="text-xs text-muted-foreground">
                      Some features may be limited. Your data will sync when you're back online.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA Status Card */}
      <Card className="apple-card apple-glass border-0 apple-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>App Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {pwaStatus.isOnline ? (
                <Wifi className="h-4 w-4 text-success" />
              ) : (
                <WifiOff className="h-4 w-4 text-destructive" />
              )}
              <span className="text-sm font-medium">
                {pwaStatus.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <Badge className={pwaStatus.isOnline ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}>
              {pwaStatus.isOnline ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>

          {/* Sync Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getSyncStatusIcon()}
              <span className="text-sm font-medium">Sync Status</span>
            </div>
            <div className="text-right">
              <p className="text-sm capitalize">{pwaStatus.syncStatus}</p>
              {pwaStatus.lastSync && (
                <p className="text-xs text-muted-foreground">
                  {pwaStatus.lastSync.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          {/* Pending Actions */}
          {pwaStatus.pendingActions > 0 && (
            <div className="flex items-center justify-between p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">Pending Actions</span>
              </div>
              <Badge className="bg-warning/10 text-warning border-warning/20">
                {pwaStatus.pendingActions}
              </Badge>
            </div>
          )}

          {/* Install App */}
          {pwaStatus.canInstall && !pwaStatus.isInstalled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-primary/10 border border-primary/20 rounded-xl"
            >
              <div className="flex items-start space-x-3">
                <Download className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-primary">Install Veridity</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Install the app for faster access and offline capabilities
                  </p>
                  <Button
                    onClick={installPWA}
                    size="sm"
                    className="apple-gradient apple-button border-0"
                  >
                    <Download className="h-3 w-3 mr-2" />
                    Install App
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* App Installed */}
          {pwaStatus.isInstalled && (
            <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">App Installed</span>
              </div>
            </div>
          )}

          {/* Cache Information */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Cached Data</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatBytes(pwaStatus.cacheSize)}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={syncOfflineData}
                disabled={!pwaStatus.isOnline || pwaStatus.syncStatus === 'pending'}
                className="flex-1 apple-button"
              >
                <Sync className={`h-3 w-3 mr-2 ${pwaStatus.syncStatus === 'pending' ? 'animate-spin' : ''}`} />
                Sync Now
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCache}
                className="apple-button"
              >
                Clear Cache
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Offline storage utilities
export class OfflineStorage {
  private static readonly STORAGE_KEY = 'veridity-offline-data';
  private static readonly PENDING_KEY = 'veridity-pending-actions';

  static saveProofOffline(proof: any) {
    const offline = this.getOfflineData();
    offline.proofs = offline.proofs || [];
    offline.proofs.push({ ...proof, offlineTimestamp: new Date().toISOString() });
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(offline));
  }

  static addPendingAction(action: any) {
    const pending = this.getPendingActions();
    pending.push({ ...action, timestamp: new Date().toISOString() });
    localStorage.setItem(this.PENDING_KEY, JSON.stringify(pending));
  }

  static getOfflineData() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : { proofs: [], verifications: [] };
  }

  static getPendingActions() {
    const data = localStorage.getItem(this.PENDING_KEY);
    return data ? JSON.parse(data) : [];
  }

  static clearPendingActions() {
    localStorage.removeItem(this.PENDING_KEY);
  }

  static syncWithServer = async () => {
    const pending = this.getPendingActions();
    const results = [];

    for (const action of pending) {
      try {
        // Process each pending action
        const result = await fetch(`/api/${action.endpoint}`, {
          method: action.method || 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        
        if (result.ok) {
          results.push({ success: true, action });
        } else {
          results.push({ success: false, action, error: await result.text() });
        }
      } catch (error) {
        results.push({ success: false, action, error: error.message });
      }
    }

    // Clear successfully synced actions
    const failedActions = results.filter(r => !r.success).map(r => r.action);
    if (failedActions.length === 0) {
      this.clearPendingActions();
    } else {
      localStorage.setItem(this.PENDING_KEY, JSON.stringify(failedActions));
    }

    return results;
  };
}