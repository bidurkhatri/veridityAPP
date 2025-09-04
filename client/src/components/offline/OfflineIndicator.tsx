import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  Smartphone,
  Signal
} from 'lucide-react';
import { offlineService } from '@/lib/offline-first';

interface OfflineStats {
  networkStatus: {
    isOnline: boolean;
    connectionType: string;
    isSlowConnection: boolean;
  };
  proofs: {
    total: number;
    pending: number;
    synced: number;
    failed: number;
  };
  cacheEntries: number;
  syncQueueLength: number;
}

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [stats, setStats] = useState<OfflineStats | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Load offline stats
    loadStats();
    
    // Update stats periodically
    const interval = setInterval(loadStats, 10000); // Every 10 seconds
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  const loadStats = async () => {
    try {
      const offlineStats = await offlineService.getOfflineStats();
      setStats(offlineStats);
    } catch (error) {
      console.error('Failed to load offline stats:', error);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await offlineService.forceSyncAll();
      await loadStats(); // Refresh stats after sync
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const getConnectionIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />;
    
    if (stats?.networkStatus.isSlowConnection) {
      return <Signal className="h-4 w-4 text-yellow-500" />;
    }
    
    return <Wifi className="h-4 w-4 text-green-500" />;
  };

  const getConnectionText = () => {
    if (!isOnline) return 'Offline';
    
    const type = stats?.networkStatus.connectionType || 'unknown';
    const speed = stats?.networkStatus.isSlowConnection ? ' (Slow)' : '';
    
    return `${type.toUpperCase()}${speed}`;
  };

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-100 text-red-800';
    if (stats?.networkStatus.isSlowConnection) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (!stats) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="space-y-2">
        {/* Main indicator */}
        <div 
          className="cursor-pointer"
          onClick={() => setShowDetails(!showDetails)}
        >
          <Badge className={`${getStatusColor()} flex items-center gap-2 px-3 py-2`}>
            {getConnectionIcon()}
            <span className="font-medium">{getConnectionText()}</span>
            {stats.proofs.pending > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {stats.proofs.pending}
              </span>
            )}
          </Badge>
        </div>

        {/* Detailed stats card */}
        {showDetails && (
          <Card className="w-80 shadow-lg">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Offline Status
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSync}
                  disabled={!isOnline || syncing || stats.proofs.pending === 0}
                  className="text-xs"
                >
                  {syncing ? (
                    <>
                      <Upload className="h-3 w-3 mr-1 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3 w-3 mr-1" />
                      Sync Now
                    </>
                  )}
                </Button>
              </div>

              {/* Network Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Connection:</span>
                  <div className="flex items-center gap-1">
                    {getConnectionIcon()}
                    <span className="font-medium">{getConnectionText()}</span>
                  </div>
                </div>
              </div>

              {/* Proof Statistics */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Proofs</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Pending:</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-yellow-500" />
                      <span className="font-medium">{stats.proofs.pending}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Synced:</span>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="font-medium">{stats.proofs.synced}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Failed:</span>
                    <div className="flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-red-500" />
                      <span className="font-medium">{stats.proofs.failed}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Cached:</span>
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3 text-blue-500" />
                      <span className="font-medium">{stats.cacheEntries}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Offline capabilities message */}
              {!isOnline && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Smartphone className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Offline Mode Active</p>
                      <p className="text-xs mt-1">
                        You can continue generating proofs. They'll sync automatically when connection is restored.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Slow connection message */}
              {isOnline && stats.networkStatus.isSlowConnection && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Signal className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-700">
                      <p className="font-medium">Slow Connection</p>
                      <p className="text-xs mt-1">
                        Using cached data where possible to improve performance.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}