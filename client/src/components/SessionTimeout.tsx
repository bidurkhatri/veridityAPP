/**
 * Session timeout warning component
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, LogOut, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useVoiceFeedback } from '@/lib/voice-feedback';

interface SessionTimeoutProps {
  warningThresholdMs?: number; // Show warning when this much time is left
  sessionTimeoutMs?: number; // Total session time
  onTimeout?: () => void;
  onExtend?: () => void;
}

export function SessionTimeout({ 
  warningThresholdMs = 5 * 60 * 1000, // 5 minutes
  sessionTimeoutMs = 24 * 60 * 60 * 1000, // 24 hours
  onTimeout,
  onExtend
}: SessionTimeoutProps) {
  const [timeLeft, setTimeLeft] = useState(sessionTimeoutMs);
  const [showWarning, setShowWarning] = useState(false);
  const { announceWarning } = useVoiceFeedback();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1000;
        
        // Show warning when threshold reached
        if (newTime <= warningThresholdMs && newTime > 0 && !showWarning) {
          setShowWarning(true);
          announceWarning('Your session will expire soon. Click extend session to continue.');
        }
        
        // Session expired
        if (newTime <= 0) {
          setShowWarning(false);
          onTimeout?.();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [warningThresholdMs, showWarning, onTimeout, announceWarning]);

  const extendSession = () => {
    setTimeLeft(sessionTimeoutMs);
    setShowWarning(false);
    onExtend?.();
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.max(0, (timeLeft / warningThresholdMs) * 100);

  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-amber-600">
                <Clock className="h-5 w-5" />
                <span>Session Expiring</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Your session will expire in:
                </p>
                <div className="text-2xl font-mono font-bold text-amber-600">
                  {formatTime(timeLeft)}
                </div>
              </div>

              <Progress 
                value={progressPercent} 
                className="h-2"
                data-testid="session-timeout-progress"
              />

              <p className="text-xs text-muted-foreground text-center">
                Click "Extend Session" to continue working, or your session will automatically log out for security.
              </p>

              <div className="flex space-x-2">
                <Button
                  onClick={extendSession}
                  className="flex-1"
                  data-testid="extend-session-button"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Extend Session
                </Button>
                
                <Button
                  variant="outline"
                  onClick={onTimeout}
                  data-testid="logout-now-button"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for session timeout management
export function useSessionTimeout(sessionTimeoutMs: number = 24 * 60 * 60 * 1000) {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isActive, setIsActive] = useState(true);

  // Track user activity
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    
    const updateActivity = () => {
      setLastActivity(Date.now());
      setIsActive(true);
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, []);

  // Check for inactivity
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivity;
      
      if (timeSinceActivity > sessionTimeoutMs) {
        setIsActive(false);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [lastActivity, sessionTimeoutMs]);

  return {
    isActive,
    lastActivity,
    timeUntilExpiry: Math.max(0, sessionTimeoutMs - (Date.now() - lastActivity)),
    extendSession: () => {
      setLastActivity(Date.now());
      setIsActive(true);
    }
  };
}