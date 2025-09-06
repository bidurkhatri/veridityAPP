import React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './badge';

interface CountdownPillProps {
  timeLeft: number; // in seconds
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'warning' | 'danger';
  showIcon?: boolean;
  format?: 'short' | 'long';
}

export function CountdownPill({
  timeLeft,
  className,
  size = 'md',
  variant = 'default',
  showIcon = true,
  format = 'short'
}: CountdownPillProps) {
  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return format === 'short' ? '0:00' : 'Expired';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (format === 'long') {
      if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
      }
      return `${remainingSeconds}s`;
    }
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getVariant = () => {
    if (timeLeft <= 0) return 'outline';
    if (timeLeft < 60) return 'destructive';
    if (timeLeft < 300) return 'secondary'; // warning at 5 minutes
    return 'default';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-base px-4 py-2';
      default:
        return 'text-sm px-3 py-1.5';
    }
  };

  return (
    <div className={cn('inline-flex items-center', className)}>
      <Badge
        variant={getVariant()}
        className={cn(
          'font-mono font-medium transition-all duration-fast',
          getSizeClasses(),
          timeLeft <= 0 && 'animate-pulse',
          timeLeft < 60 && timeLeft > 0 && 'animate-pulse',
          className
        )}
        data-testid="countdown-pill"
      >
        {showIcon && (
          <Clock 
            className={cn(
              'mr-1.5',
              size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
            )} 
          />
        )}
        {timeLeft <= 0 ? 'Expired' : `${formatTime(timeLeft)}`}
      </Badge>
    </div>
  );
}

interface AnimatedCountdownProps extends CountdownPillProps {
  onExpire?: () => void;
  autoRefresh?: boolean;
}

export function AnimatedCountdown({
  timeLeft: initialTime,
  onExpire,
  autoRefresh = false,
  ...props
}: AnimatedCountdownProps) {
  const [timeLeft, setTimeLeft] = React.useState(initialTime);

  React.useEffect(() => {
    if (timeLeft <= 0) {
      if (onExpire) onExpire();
      if (autoRefresh) setTimeLeft(initialTime);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire, autoRefresh, initialTime]);

  // Update timeLeft when initialTime changes
  React.useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  return <CountdownPill {...props} timeLeft={timeLeft} />;
}

export type { CountdownPillProps, AnimatedCountdownProps };