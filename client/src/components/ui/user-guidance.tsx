import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowRight, Clock, Zap } from "lucide-react";

interface GuidanceStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: number; // in seconds
  isOptional?: boolean;
  completed?: boolean;
}

interface UserGuidanceProps {
  steps: GuidanceStep[];
  currentStep: number;
  timeElapsed: number;
  targetTime?: number; // default 120 seconds (2 minutes)
  onStepComplete?: (stepId: string) => void;
  onSkip?: () => void;
  className?: string;
}

export function UserGuidance({
  steps,
  currentStep,
  timeElapsed,
  targetTime = 120,
  onStepComplete,
  onSkip,
  className
}: UserGuidanceProps) {
  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;
  const timePercentage = Math.min((timeElapsed / targetTime) * 100, 100);
  const remainingTime = Math.max(targetTime - timeElapsed, 0);
  
  const currentStepData = steps[currentStep];
  const isOnTrack = timeElapsed <= (targetTime * (currentStep / steps.length));
  
  const getTimeStatus = () => {
    if (timeElapsed <= targetTime * 0.5) return { 
      color: 'text-success-text bg-success-bg border-success-border', 
      message: 'Great pace! You\'re ahead of schedule.' 
    };
    if (timeElapsed <= targetTime * 0.8) return { 
      color: 'text-info-text bg-info-bg border-info-border', 
      message: 'Good progress, keep going!' 
    };
    if (timeElapsed <= targetTime) return { 
      color: 'text-warning-text bg-warning-bg border-warning-border', 
      message: 'Almost there, just a bit more!' 
    };
    return { 
      color: 'text-text-secondary bg-surface-secondary border-border-default', 
      message: 'Take your time, no rush.' 
    };
  };

  const timeStatus = getTimeStatus();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress Header */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text-primary">
                First-Time Setup Guide
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-text-tertiary" />
                <span className="text-text-secondary">
                  {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')} left
                </span>
              </div>
            </div>
            
            <Progress value={progressPercentage} className="h-2" />
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">
                Step {currentStep + 1} of {steps.length} • {completedSteps} completed
              </span>
              <span className={cn("px-2 py-1 rounded text-xs border", timeStatus.color)}>
                {timeStatus.message}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step */}
      {currentStepData && (
        <Card className="border-primary/30">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary font-semibold text-sm">
                    {currentStep + 1}
                  </span>
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-text-primary">
                      {currentStepData.title}
                    </h4>
                    {currentStepData.isOptional && (
                      <span className="text-xs text-text-tertiary bg-surface-secondary px-2 py-1 rounded">
                        Optional
                      </span>
                    )}
                  </div>
                  
                  <p className="text-text-secondary leading-relaxed">
                    {currentStepData.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm text-text-tertiary">
                    <Clock className="h-3 w-3" />
                    <span>~{currentStepData.estimatedTime} seconds</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-11">
                <Button
                  onClick={() => onStepComplete?.(currentStepData.id)}
                  className="flex items-center gap-2"
                  data-testid={`complete-step-${currentStepData.id}`}
                >
                  Complete this step
                  <ArrowRight className="h-4 w-4" />
                </Button>
                
                {currentStepData.isOptional && (
                  <Button
                    variant="ghost"
                    onClick={onSkip}
                    data-testid={`skip-step-${currentStepData.id}`}
                  >
                    Skip for now
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Steps Overview */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <h4 className="font-medium text-text-primary">All Steps</h4>
            
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg transition-colors",
                    index === currentStep ? "bg-primary/10" : "hover:bg-surface-secondary/50",
                    step.completed && "opacity-75"
                  )}
                  data-testid={`step-overview-${step.id}`}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                    step.completed ? "bg-success-bg text-success-text" :
                    index === currentStep ? "bg-primary text-white" :
                    "bg-surface-secondary text-text-tertiary"
                  )}>
                    {step.completed ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium truncate",
                      step.completed ? "text-text-tertiary" :
                      index === currentStep ? "text-primary" :
                      "text-text-secondary"
                    )}>
                      {step.title}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {step.estimatedTime}s • {step.isOptional ? 'Optional' : 'Required'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="border-info-border bg-info-bg/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Zap className="h-4 w-4 text-info-text mt-0.5 flex-shrink-0" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-info-text">Quick Tips</p>
              <ul className="text-text-secondary space-y-0.5">
                <li>• All proof generation happens on your device</li>
                <li>• Your personal data never leaves your control</li>
                <li>• You can pause and return to setup anytime</li>
                <li>• Skip optional steps if you're in a hurry</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for managing 2-minute completion guidance
export function useTwoMinuteGuidance() {
  const [startTime, setStartTime] = React.useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = React.useState(0);
  const [isActive, setIsActive] = React.useState(false);
  
  const startGuidance = React.useCallback(() => {
    const now = Date.now();
    setStartTime(now);
    setIsActive(true);
  }, []);
  
  const pauseGuidance = React.useCallback(() => {
    setIsActive(false);
  }, []);
  
  const resetGuidance = React.useCallback(() => {
    setStartTime(null);
    setTimeElapsed(0);
    setIsActive(false);
  }, []);

  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isActive && startTime) {
      intervalId = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    
    return () => clearInterval(intervalId);
  }, [isActive, startTime]);

  const isUnderTwoMinutes = timeElapsed < 120;
  const completionRate = Math.min((timeElapsed / 120) * 100, 100);

  return {
    timeElapsed,
    isActive,
    isUnderTwoMinutes,
    completionRate,
    startGuidance,
    pauseGuidance,
    resetGuidance,
  };
}