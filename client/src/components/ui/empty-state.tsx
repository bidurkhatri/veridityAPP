import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border-default bg-surface p-8 text-center",
        className
      )}
      data-testid="empty-state"
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-secondary text-text-tertiary">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-text-primary">{title}</h3>
      {description && (
        <p className="mb-4 text-sm text-text-secondary max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
}