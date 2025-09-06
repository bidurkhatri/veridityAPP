import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Zap } from "lucide-react";

interface FormOptimizationProps {
  currentStep: number;
  totalSteps: number;
  timeElapsed: number; // in seconds
  targetTime: number; // in seconds (90s)
  onOptimize?: () => void;
  className?: string;
}

export function FormOptimization({
  currentStep,
  totalSteps,
  timeElapsed,
  targetTime = 90,
  onOptimize,
  className
}: FormOptimizationProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;
  const timePercentage = Math.min((timeElapsed / targetTime) * 100, 100);
  const isOnTrack = timeElapsed <= (targetTime * (currentStep / totalSteps));
  const remainingTime = Math.max(targetTime - timeElapsed, 0);
  
  const getTimeStatus = () => {
    if (timeElapsed <= targetTime * 0.5) return { color: 'text-success-text', status: 'Excellent pace' };
    if (timeElapsed <= targetTime * 0.8) return { color: 'text-warning-text', status: 'Good pace' };
    if (timeElapsed <= targetTime) return { color: 'text-warning-text', status: 'Keep going' };
    return { color: 'text-danger-text', status: 'Take your time' };
  };

  const timeStatus = getTimeStatus();

  return (
    <div className={cn("fixed bottom-4 right-4 z-40 max-w-xs", className)}>
      {/* Floating progress indicator */}
      <div className="bg-surface border border-border-default rounded-lg shadow-lg p-3 space-y-2">
        {/* Progress bar */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary">Step {currentStep} of {totalSteps}</span>
          <span className={cn("font-medium", timeStatus.color)}>
            {Math.floor(remainingTime)}s left
          </span>
        </div>
        
        <Progress value={progressPercentage} className="h-1.5" />
        
        {/* Time indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {isOnTrack ? (
              <CheckCircle className="h-3 w-3 text-success-text" />
            ) : timeElapsed <= targetTime ? (
              <Clock className="h-3 w-3 text-warning-text" />
            ) : (
              <Zap className="h-3 w-3 text-danger-text" />
            )}
            <span className={cn("text-xs", timeStatus.color)}>
              {timeStatus.status}
            </span>
          </div>
          
          {onOptimize && !isOnTrack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOptimize}
              className="h-6 px-2 text-xs"
            >
              Speed up
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Auto-advancing form hook
export function useFormTimer(targetTime: number = 90) {
  const [timeElapsed, setTimeElapsed] = React.useState(0);
  const [isActive, setIsActive] = React.useState(false);
  const startTimeRef = React.useRef<number>();

  const start = React.useCallback(() => {
    setIsActive(true);
    startTimeRef.current = Date.now();
  }, []);

  const pause = React.useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = React.useCallback(() => {
    setTimeElapsed(0);
    setIsActive(false);
    startTimeRef.current = undefined;
  }, []);

  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isActive) {
      intervalId = setInterval(() => {
        if (startTimeRef.current) {
          setTimeElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 1000);
    }
    
    return () => clearInterval(intervalId);
  }, [isActive]);

  const isOnTrack = timeElapsed <= targetTime;
  const remainingTime = Math.max(targetTime - timeElapsed, 0);

  return {
    timeElapsed,
    isActive,
    isOnTrack,
    remainingTime,
    start,
    pause,
    reset,
  };
}

// Layout overlap prevention
export function useLayoutOverlapPrevention() {
  const [overlaps, setOverlaps] = React.useState<string[]>([]);

  const checkOverlaps = React.useCallback(() => {
    const elements = document.querySelectorAll('[data-form-element]');
    const newOverlaps: string[] = [];
    
    elements.forEach((el, index) => {
      const rect1 = el.getBoundingClientRect();
      
      elements.forEach((otherEl, otherIndex) => {
        if (index >= otherIndex) return;
        
        const rect2 = otherEl.getBoundingClientRect();
        
        // Check for overlap
        const isOverlapping = !(
          rect1.right < rect2.left ||
          rect1.left > rect2.right ||
          rect1.bottom < rect2.top ||
          rect1.top > rect2.bottom
        );
        
        if (isOverlapping) {
          newOverlaps.push(`${el.getAttribute('data-form-element')} overlaps ${otherEl.getAttribute('data-form-element')}`);
        }
      });
    });
    
    setOverlaps(newOverlaps);
  }, []);

  React.useEffect(() => {
    // Check on mount and window resize
    checkOverlaps();
    window.addEventListener('resize', checkOverlaps);
    
    // Check periodically for dynamic content
    const interval = setInterval(checkOverlaps, 2000);
    
    return () => {
      window.removeEventListener('resize', checkOverlaps);
      clearInterval(interval);
    };
  }, [checkOverlaps]);

  return { overlaps, checkOverlaps };
}

// Smart form field focuser - guides user through optimal path
export function useSmartFormFocus() {
  const [currentFieldIndex, setCurrentFieldIndex] = React.useState(0);
  const [completedFields, setCompletedFields] = React.useState<Set<string>>(new Set());

  const focusNextField = React.useCallback(() => {
    const fields = Array.from(document.querySelectorAll('[data-form-field]'));
    const nextField = fields[currentFieldIndex + 1] as HTMLElement;
    
    if (nextField) {
      nextField.focus();
      setCurrentFieldIndex(currentFieldIndex + 1);
      
      // Smooth scroll to field
      nextField.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentFieldIndex]);

  const markFieldComplete = React.useCallback((fieldId: string) => {
    setCompletedFields(prev => new Set([...prev, fieldId]));
  }, []);

  const getCompletionPercentage = React.useCallback(() => {
    const totalFields = document.querySelectorAll('[data-form-field]').length;
    return totalFields > 0 ? (completedFields.size / totalFields) * 100 : 0;
  }, [completedFields]);

  return {
    currentFieldIndex,
    completedFields,
    focusNextField,
    markFieldComplete,
    getCompletionPercentage,
  };
}