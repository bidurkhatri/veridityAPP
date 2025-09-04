/**
 * Smart Sync Indicator with Nepal-focused Offline Experience
 * Provides clear status updates and trust-building messaging
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  Cloud, 
  CloudOff,
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Smartphone,
  Signal,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { offlineService } from '@/lib/offline-first';

interface SyncStatus {
  isOnline: boolean;
  connectionType: 'wifi' | '4g' | '3g' | '2g' | 'unknown';
  isSlowConnection: boolean;
  pendingItems: number;
  syncProgress: number;
  lastSyncTime?: Date;
  estimatedSyncTime?: number;
}

export function SmartSyncIndicator() {
  const { t, language } = useTranslation();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    connectionType: 'unknown',
    isSlowConnection: false,
    pendingItems: 0,
    syncProgress: 0
  });
  const [showDetails, setShowDetails] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncAnimation, setSyncAnimation] = useState(false);

  useEffect(() => {
    // Monitor network status
    const updateOnlineStatus = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: navigator.onLine }));
      if (navigator.onLine) {
        handleConnectionRestored();
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Load sync status periodically
    const statusInterval = setInterval(loadSyncStatus, 5000);
    loadSyncStatus();

    // Monitor connection speed
    monitorConnectionSpeed();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(statusInterval);
    };
  }, []);

  const loadSyncStatus = async () => {
    try {
      const stats = await offlineService.getOfflineStats();
      if (stats) {
        setSyncStatus(prev => ({
          ...prev,
          pendingItems: stats.proofs.pending,
          connectionType: stats.networkStatus.connectionType as any,
          isSlowConnection: stats.networkStatus.isSlowConnection
        }));
      }
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  };

  const monitorConnectionSpeed = async () => {
    if (!navigator.onLine) return;

    try {
      const startTime = Date.now();
      await fetch('/api/ping', { 
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });
      const endTime = Date.now();
      const latency = endTime - startTime;

      setSyncStatus(prev => ({
        ...prev,
        isSlowConnection: latency > 3000,
        connectionType: latency < 100 ? 'wifi' : latency < 500 ? '4g' : latency < 1000 ? '3g' : '2g'
      }));
    } catch (error) {
      setSyncStatus(prev => ({ ...prev, isSlowConnection: true }));
    }
  };

  const handleConnectionRestored = async () => {
    setSyncAnimation(true);
    
    // Show connection restored message
    showSyncMessage(
      language === 'np' ? 'इन्टरनेट फर्कियो! डेटा sync गर्दै...' : 'Internet restored! Syncing data...',
      'success'
    );

    // Auto-sync after connection is restored
    setTimeout(() => {
      handleManualSync();
    }, 1000);

    setTimeout(() => setSyncAnimation(false), 3000);
  };

  const handleManualSync = async () => {
    if (!syncStatus.isOnline || isSyncing) return;

    setIsSyncing(true);
    setSyncStatus(prev => ({ ...prev, syncProgress: 0 }));

    try {
      // Simulate sync progress
      const progressInterval = setInterval(() => {
        setSyncStatus(prev => ({
          ...prev,
          syncProgress: Math.min(prev.syncProgress + 10, 90)
        }));
      }, 200);

      await offlineService.forceSyncAll();

      clearInterval(progressInterval);
      setSyncStatus(prev => ({ 
        ...prev, 
        syncProgress: 100,
        lastSyncTime: new Date(),
        pendingItems: 0
      }));

      showSyncMessage(
        language === 'np' ? 'सफलतापूर्वक sync भयो!' : 'Successfully synced!',
        'success'
      );

      // Reset progress after animation
      setTimeout(() => {
        setSyncStatus(prev => ({ ...prev, syncProgress: 0 }));
      }, 2000);

    } catch (error) {
      showSyncMessage(
        language === 'np' ? 'Sync गर्न सकिएन' : 'Sync failed',
        'error'
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const showSyncMessage = (message: string, type: 'success' | 'error' | 'info') => {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${
      type === 'success' ? 'bg-green-600' : 
      type === 'error' ? 'bg-red-600' : 'bg-blue-600'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };

  const getConnectionIcon = () => {
    if (!syncStatus.isOnline) return <WifiOff className="h-4 w-4 text-red-500" />;
    
    if (syncStatus.isSlowConnection) {
      return <Signal className="h-4 w-4 text-yellow-500" />;
    }
    
    return syncStatus.connectionType === 'wifi' 
      ? <Wifi className="h-4 w-4 text-green-500" />
      : <Signal className="h-4 w-4 text-blue-500" />;
  };

  const getConnectionText = () => {
    if (!syncStatus.isOnline) {
      return language === 'np' ? 'अफलाइन' : 'Offline';
    }
    
    const typeText = syncStatus.connectionType.toUpperCase();
    const speedText = syncStatus.isSlowConnection 
      ? (language === 'np' ? ' (ढिलो)' : ' (Slow)')
      : '';
    
    return `${typeText}${speedText}`;
  };

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return 'bg-red-100 text-red-800 border-red-200';
    if (syncStatus.isSlowConnection) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 space-y-2">
      {/* Main Status Indicator */}
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all duration-200 ${getStatusColor()} ${syncAnimation ? 'scale-105' : ''}`}
        onClick={() => setShowDetails(!showDetails)}
      >
        {getConnectionIcon()}
        <span className="text-sm font-medium">{getConnectionText()}</span>
        
        {syncStatus.pendingItems > 0 && (
          <Badge variant="secondary" className="ml-1 bg-blue-600 text-white text-xs">
            {syncStatus.pendingItems}
          </Badge>
        )}

        {isSyncing && (
          <RefreshCw className="h-3 w-3 animate-spin ml-1" />
        )}
      </div>

      {/* Detailed Status Panel */}
      {showDetails && (
        <Card className="w-80 p-4 shadow-xl border-2">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                {language === 'np' ? 'नेटवर्क स्थिति' : 'Network Status'}
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {/* Connection Details */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{language === 'np' ? 'कनेक्शन:' : 'Connection:'}</span>
                <div className="flex items-center gap-1">
                  {getConnectionIcon()}
                  <span className="font-medium">{getConnectionText()}</span>
                </div>
              </div>

              {syncStatus.lastSyncTime && (
                <div className="flex items-center justify-between text-sm">
                  <span>{language === 'np' ? 'अन्तिम sync:' : 'Last sync:'}</span>
                  <span className="text-gray-600">
                    {syncStatus.lastSyncTime.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>

            {/* Sync Progress */}
            {isSyncing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{language === 'np' ? 'Sync प्रगति:' : 'Sync progress:'}</span>
                  <span>{syncStatus.syncProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${syncStatus.syncProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Pending Items */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span>{language === 'np' ? 'पर्खाइमा:' : 'Pending:'}</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-yellow-500" />
                  <span className="font-medium">{syncStatus.pendingItems}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>{language === 'np' ? 'Cache:' : 'Cached:'}</span>
                <div className="flex items-center gap-1">
                  <Download className="h-3 w-3 text-blue-500" />
                  <span className="font-medium">12</span> {/* Mock data */}
                </div>
              </div>
            </div>

            {/* Status Messages */}
            <div className="space-y-2">
              {!syncStatus.isOnline && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <CloudOff className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">
                        {language === 'np' ? 'अफलाइन मोड सक्रिय' : 'Offline Mode Active'}
                      </p>
                      <p className="text-xs mt-1">
                        {language === 'np' 
                          ? 'तपाईं अझै पनि प्रमाण बनाउन सक्नुहुन्छ। इन्टरनेट फर्किएपछि स्वचालित sync हुनेछ।'
                          : 'You can still generate proofs. They will sync automatically when connection is restored.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {syncStatus.isOnline && syncStatus.isSlowConnection && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Signal className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-700">
                      <p className="font-medium">
                        {language === 'np' ? 'ढिलो कनेक्शन' : 'Slow Connection'}
                      </p>
                      <p className="text-xs mt-1">
                        {language === 'np'
                          ? 'प्रदर्शन सुधार गर्न cached डेटा प्रयोग गर्दै।'
                          : 'Using cached data to improve performance.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {syncStatus.isOnline && !syncStatus.isSlowConnection && syncStatus.pendingItems === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      {language === 'np' ? 'सबै कुरा अद्यावधिक छ!' : 'Everything is up to date!'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleManualSync}
                disabled={!syncStatus.isOnline || isSyncing}
                className="flex-1"
              >
                {isSyncing ? (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Upload className="h-3 w-3 mr-1" />
                )}
                {language === 'np' ? 'Sync गर्नुहोस्' : 'Sync Now'}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={loadSyncStatus}
                className="px-3"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>

            {/* Nepal-specific offline message */}
            <div className="text-xs text-gray-500 text-center border-t pt-2">
              {language === 'np' 
                ? '🏔️ नेपालको ग्रामीण क्षेत्रको लागि अफलाइन-फर्स्ट डिजाइन'
                : '🏔️ Offline-first design for rural Nepal'
              }
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}