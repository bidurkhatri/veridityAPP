/**
 * Enhanced touch targets for mobile accessibility
 */

import { forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Minimum touch target size is 44px x 44px per accessibility guidelines
const TOUCH_TARGET_MIN = 'min-h-[44px] min-w-[44px]';

interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
}

export const TouchButton = forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          TOUCH_TARGET_MIN,
          'touch-manipulation', // Prevents zoom on double-tap
          'active:scale-95 transition-transform', // Visual feedback on touch
          className
        )}
        {...props}
      />
    );
  }
);

TouchButton.displayName = 'TouchButton';

export const TouchIconButton = forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <TouchButton
        ref={ref}
        size="icon"
        className={cn(
          'p-3', // Extra padding for better touch area
          className
        )}
        {...props}
      >
        {children}
      </TouchButton>
    );
  }
);

TouchIconButton.displayName = 'TouchIconButton';

interface TouchCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  pressable?: boolean;
}

export const TouchCard = forwardRef<HTMLDivElement, TouchCardProps>(
  ({ className, children, pressable = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border bg-card text-card-foreground shadow-sm',
          TOUCH_TARGET_MIN,
          'p-4',
          pressable && [
            'cursor-pointer touch-manipulation',
            'hover:bg-accent hover:text-accent-foreground',
            'active:scale-[0.98] transition-transform'
          ],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TouchCard.displayName = 'TouchCard';

// Touch-friendly list item
interface TouchListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  onPress?: () => void;
}

export const TouchListItem = forwardRef<HTMLDivElement, TouchListItemProps>(
  ({ className, children, onPress, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role={onPress ? 'button' : undefined}
        tabIndex={onPress ? 0 : undefined}
        onClick={onPress}
        onKeyDown={(e) => {
          if (onPress && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onPress();
          }
        }}
        className={cn(
          TOUCH_TARGET_MIN,
          'flex items-center px-4 py-3',
          onPress && [
            'cursor-pointer touch-manipulation',
            'hover:bg-accent hover:text-accent-foreground',
            'active:bg-accent/80 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
          ],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TouchListItem.displayName = 'TouchListItem';

// Swipe gesture detection
interface SwipeableProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  className?: string;
}

export function Swipeable({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  className
}: SwipeableProps) {
  let startX = 0;
  let startY = 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - startX;
    const deltaY = endY - startY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }
  };

  return (
    <div
      className={cn('touch-pan-y', className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}