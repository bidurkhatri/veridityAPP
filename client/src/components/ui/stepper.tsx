import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  id: string;
  title: string;
  description?: string;
  isComplete?: boolean;
  isError?: boolean;
}

interface StepperProps {
  steps: Step[];
  currentStepId: string;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function Stepper({
  steps,
  currentStepId,
  orientation = "horizontal",
  className,
}: StepperProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStepId);

  return (
    <div
      className={cn(
        "flex",
        orientation === "horizontal" ? "items-center space-x-4" : "flex-col space-y-4",
        className
      )}
      data-testid="stepper-container"
    >
      {steps.map((step, index) => {
        const isActive = step.id === currentStepId;
        const isComplete = step.isComplete || index < currentIndex;
        const isError = step.isError;

        return (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                "flex items-center",
                orientation === "vertical" && "flex-col text-center"
              )}
            >
              <div
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  isComplete && !isError
                    ? "border-success-border bg-success-bg text-success-text"
                    : isActive && !isError
                    ? "border-primary-border bg-primary text-primary-foreground"
                    : isError
                    ? "border-danger-border bg-danger-bg text-danger-text"
                    : "border-border-default bg-surface text-text-tertiary"
                )}
                data-testid={`step-indicator-${step.id}`}
              >
                {isComplete && !isError ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <div
                className={cn(
                  "ml-3 flex-1",
                  orientation === "vertical" && "ml-0 mt-2"
                )}
              >
                <h3
                  className={cn(
                    "text-sm font-medium",
                    isActive ? "text-text-primary" : "text-text-secondary"
                  )}
                >
                  {step.title}
                </h3>
                {step.description && (
                  <p className="text-xs text-text-tertiary">{step.description}</p>
                )}
              </div>
            </div>
            {index < steps.length - 1 && orientation === "horizontal" && (
              <div
                className={cn(
                  "h-px flex-1 bg-border-default transition-colors",
                  index < currentIndex && "bg-success-border"
                )}
                data-testid={`step-connector-${index}`}
              />
            )}
            {index < steps.length - 1 && orientation === "vertical" && (
              <div
                className={cn(
                  "w-px h-8 bg-border-default transition-colors ml-5",
                  index < currentIndex && "bg-success-border"
                )}
                data-testid={`step-connector-${index}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}