import * as React from "react";
import { TrendingUp, TrendingDown, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiTileProps {
  label: string;
  value: number;
  trend?: {
    value: number;
    direction: "up" | "down";
    period?: string;
  };
  sparklineData?: number[];
  formatType?: "percentage" | "currency" | "number";
  decimals?: number;
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
  onClick?: () => void;
}

// Sparkline mini chart component
const Sparkline = ({ data, trend }: { data: number[]; trend?: "up" | "down" }) => {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 48; // 48px width
    const y = 16 - ((value - min) / range) * 16; // 16px height
    return `${x},${y}`;
  }).join(" ");

  const strokeColor = trend === "up" ? "rgb(34 197 94)" : trend === "down" ? "rgb(239 68 68)" : "rgb(100 116 139)";

  return (
    <svg width="48" height="16" className="flex-shrink-0">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        points={points}
      />
    </svg>
  );
};

// Format numbers with 1-decimal precision as per brief
const formatValue = (value: number, type: "percentage" | "currency" | "number" = "number", decimals: number = 1): string => {
  const formatted = value.toFixed(decimals);
  
  switch (type) {
    case "percentage":
      return `${formatted}%`;
    case "currency":
      return `$${formatted}`;
    default:
      return formatted;
  }
};

export function KpiTile({
  label,
  value,
  trend,
  sparklineData,
  formatType = "number",
  decimals = 1,
  icon,
  className,
  loading = false,
  onClick,
}: KpiTileProps) {
  if (loading) {
    return (
      <div className={cn(
        "rounded-md border border-border-default bg-surface p-4 transition-all hover:shadow-sm",
        onClick && "cursor-pointer hover:bg-surface-secondary",
        className
      )}>
        <div className="space-y-3">
          <div className="h-4 bg-surface-secondary rounded animate-pulse" />
          <div className="h-8 bg-surface-secondary rounded animate-pulse" />
          <div className="h-3 bg-surface-secondary rounded animate-pulse w-3/4" />
        </div>
      </div>
    );
  }

  const formattedValue = formatValue(value, formatType, decimals);
  const trendDirection = trend?.direction;

  return (
    <div
      className={cn(
        "rounded-md border border-border-default bg-surface p-4 transition-all hover:shadow-sm",
        onClick && "cursor-pointer hover:bg-surface-secondary",
        className
      )}
      onClick={onClick}
      data-testid={`kpi-tile-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Label and Icon */}
          <div className="flex items-center gap-2 mb-2">
            {icon && (
              <div className="h-4 w-4 text-text-tertiary flex-shrink-0">
                {icon}
              </div>
            )}
            <p className="text-sm font-medium text-text-secondary truncate">
              {label}
            </p>
          </div>

          {/* Value with proper typography */}
          <p className="text-2xl font-bold text-text-primary font-mono tabular-nums mb-1">
            {formattedValue}
          </p>

          {/* Trend with chevron + sparkline */}
          {trend && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {trendDirection === "up" ? (
                  <ChevronUp className="h-3 w-3 text-success-text" />
                ) : (
                  <ChevronDown className="h-3 w-3 text-error-text" />
                )}
                <span
                  className={cn(
                    "text-xs font-medium",
                    trendDirection === "up" ? "text-success-text" : "text-error-text"
                  )}
                >
                  {formatValue(Math.abs(trend.value), formatType, 1)}
                </span>
                {trend.period && (
                  <span className="text-xs text-text-tertiary">
                    {trend.period}
                  </span>
                )}
              </div>
              
              {/* Sparkline */}
              {sparklineData && sparklineData.length > 1 && (
                <Sparkline data={sparklineData} trend={trendDirection} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Grid container for multiple KPI tiles
interface KpiGridProps {
  tiles: Array<Omit<KpiTileProps, 'className'>>;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function KpiGrid({ tiles, columns = 3, className }: KpiGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", 
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {tiles.map((tile, index) => (
        <KpiTile key={`${tile.label}-${index}`} {...tile} />
      ))}
    </div>
  );
}