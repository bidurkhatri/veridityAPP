import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Circle, AlertCircle, ArrowRight } from "lucide-react";

interface StepperStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'current' | 'completed' | 'error';
  optional?: boolean;
}

interface ProofStepperProps {
  steps: StepperStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
  showProgress?: boolean;
  variant?: 'horizontal' | 'vertical';
}

export function ProofStepper({
  steps,
  currentStep,
  onStepClick,
  className,
  showProgress = true,
  variant = 'horizontal',
}: ProofStepperProps) {
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progressPercentage = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  const getStepIcon = (step: StepperStep, index: number) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success-text" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-danger-text" />;
      case 'current':
        return (
          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">
              {index + 1}
            </span>
          </div>
        );
      default:
        return (
          <Circle className={cn(
            "h-5 w-5",
            step.optional ? "text-text-tertiary" : "text-text-secondary"
          )} />
        );
    }
  };

  if (variant === 'vertical') {
    return (
      <div className={cn("space-y-4", className)}>
        {showProgress && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium">Progress</span>
              <span>{completedSteps} of {steps.length}</span>
            </div>
            <div className="w-full bg-surface-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "flex gap-4 pb-4",
              index !== steps.length - 1 && "border-l-2 border-border-subtle ml-2.5 pl-6"
            )}
          >
            <div className="flex-shrink-0 -ml-6">
              {getStepIcon(step, index)}
            </div>
            
            <div className="flex-1">
              <button
                onClick={() => onStepClick?.(index)}
                disabled={!onStepClick || step.status === 'pending'}
                className={cn(
                  "text-left w-full",
                  onStepClick && step.status !== 'pending' && "hover:opacity-80 cursor-pointer"
                )}
                data-testid={`step-${step.id}`}
              >
                <h4 className={cn(
                  "font-medium",
                  step.status === 'current' ? "text-primary" :
                  step.status === 'completed' ? "text-success-text" :
                  step.status === 'error' ? "text-danger-text" :
                  "text-text-secondary"
                )}>
                  {step.title}
                  {step.optional && (
                    <span className="text-xs text-text-tertiary ml-2">(Optional)</span>
                  )}
                </h4>
                {step.description && (
                  <p className="text-sm text-text-secondary mt-1">
                    {step.description}
                  </p>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Horizontal variant
  return (
    <div className={cn("", className)}>
      {showProgress && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-text-secondary">{Math.round(progressPercentage)}% complete</span>
          </div>
          <div className="w-full bg-surface-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <button
                onClick={() => onStepClick?.(index)}
                disabled={!onStepClick || step.status === 'pending'}
                className={cn(
                  "flex items-center justify-center mb-2",
                  onStepClick && step.status !== 'pending' && "hover:opacity-80 cursor-pointer"
                )}
                data-testid={`step-${step.id}`}
              >
                {getStepIcon(step, index)}
              </button>
              
              <div className="text-center max-w-24">
                <p className={cn(
                  "text-xs font-medium",
                  step.status === 'current' ? "text-primary" :
                  step.status === 'completed' ? "text-success-text" :
                  step.status === 'error' ? "text-danger-text" :
                  "text-text-secondary"
                )}>
                  {step.title}
                </p>
                {step.optional && (
                  <span className="text-xs text-text-tertiary">(Optional)</span>
                )}
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-px mx-4 mt-6",
                index < currentStep ? "bg-primary" : "bg-border-default"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// Mobile sticky footer with CTA
interface MobileCTAFooterProps {
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onPrev?: () => void;
  nextLabel?: string;
  prevLabel?: string;
  isNextDisabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function MobileCTAFooter({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  nextLabel = "Continue",
  prevLabel = "Back",
  isNextDisabled = false,
  isLoading = false,
  className,
}: MobileCTAFooterProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <Card className={cn(
      "fixed bottom-0 left-0 right-0 z-50 rounded-t-lg border-t border-b-0 md:hidden",
      "safe-area-pb bg-surface shadow-lg",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">
              {currentStep + 1} of {totalSteps}
            </span>
            <div className="w-16 bg-surface-secondary rounded-full h-1">
              <div
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {!isFirstStep && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPrev}
                disabled={isLoading}
                data-testid="mobile-prev-button"
              >
                {prevLabel}
              </Button>
            )}
            
            <Button
              onClick={onNext}
              disabled={isNextDisabled || isLoading}
              size="sm"
              className="min-w-20"
              data-testid="mobile-next-button"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <>
                  {isLastStep ? "Complete" : nextLabel}
                  {!isLastStep && <ArrowRight className="h-4 w-4 ml-2" />}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}