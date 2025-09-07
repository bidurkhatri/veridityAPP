import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface StickyFooterProps {
  children?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: "primary" | "secondary" | "destructive";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  className?: string;
  showProgress?: boolean;
  progressValue?: number;
}

export function StickyFooter({
  children,
  primaryAction,
  secondaryAction,
  className,
  showProgress,
  progressValue,
}: StickyFooterProps) {
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-40",
      "bg-surface/95 backdrop-blur-sm border-t border-border-default",
      "safe-area-inset-bottom",
      className
    )}>
      {showProgress && (
        <div className="h-1 bg-surface-secondary">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressValue || 0}%` }}
          />
        </div>
      )}
      
      <div className="container mx-auto px-4 py-4">
        {children || (
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
            {secondaryAction && (
              <Button
                variant="quiet"
                onClick={secondaryAction.onClick}
                disabled={secondaryAction.disabled}
                className="order-2 sm:order-1"
                data-testid="secondary-action"
              >
                {secondaryAction.label}
              </Button>
            )}
            
            {primaryAction && (
              <Button
                variant={primaryAction.variant || "primary"}
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled || primaryAction.loading}
                className="order-1 sm:order-2 w-full sm:w-auto"
                data-testid="primary-action"
              >
                {primaryAction.loading ? "Loading..." : primaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}