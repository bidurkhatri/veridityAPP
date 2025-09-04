/**
 * Offline indicator with proper feedback
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Auto-hide offline message after 10 seconds
    if (!isOnline) {
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 10000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  return (
    <>
      {/* Status Badge */}
      <div className="fixed top-4 right-4 z-50">
        <Badge 
          variant={isOnline ? 'default' : 'destructive'}
          className="flex items-center space-x-1"
          data-testid="connection-status"
        >
          {isOnline ? (
            <Wifi className="h-3 w-3" />
          ) : (
            <WifiOff className="h-3 w-3" />
          )}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </Badge>
      </div>

      {/* Offline Message */}
      <AnimatePresence>
        {showOfflineMessage && !isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-16 left-4 right-4 z-50"
          >
            <Card className="bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                      You're currently offline
                    </p>
                    <p className="text-xs text-orange-700 dark:text-orange-300">
                      Some features are available offline, including:
                    </p>
                    <ul className="text-xs text-orange-600 dark:text-orange-400 ml-4 list-disc">
                      <li>View existing proofs</li>
                      <li>Generate new proofs (cached)</li>
                      <li>Voice navigation</li>
                      <li>Settings and help pages</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Hook to check online status
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}