/**
 * Loading spinner component for consistent loading states
 */

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <div 
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function LoadingButton({ 
  loading, 
  children, 
  className,
  disabled,
  ...props 
}: any) {
  return (
    <button
      className={cn('flex items-center justify-center space-x-2', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      <span>{children}</span>
    </button>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="border rounded-lg p-4 animate-pulse">
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="h-8 bg-muted rounded w-full"></div>
      </div>
    </div>
  );
}