import * as React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease";
    period?: string;
  };
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  change,
  icon,
  className,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className={cn("rounded-lg border border-border-default bg-surface p-6", className)}>
        <div className="space-y-2">
          <div className="h-4 bg-surface-secondary rounded animate-pulse" />
          <div className="h-8 bg-surface-secondary rounded animate-pulse" />
          <div className="h-3 bg-surface-secondary rounded animate-pulse w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border-default bg-surface p-6 transition-all hover:shadow-sm",
        className
      )}
      data-testid="stat-card"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-text-secondary">{label}</p>
          <p className="text-3xl font-bold text-text-primary">{value}</p>
          {change && (
            <div className="flex items-center space-x-2">
              {change.type === "increase" ? (
                <TrendingUp className="h-4 w-4 text-success-text" />
              ) : (
                <TrendingDown className="h-4 w-4 text-danger-text" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  change.type === "increase" ? "text-success-text" : "text-danger-text"
                )}
              >
                {Math.abs(change.value)}%
              </span>
              {change.period && (
                <span className="text-sm text-text-tertiary">{change.period}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-secondary text-text-tertiary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}