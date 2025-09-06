import * as React from "react";
import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  color?: string;
  strokeWidth?: number;
  showTrend?: boolean;
}

export function Sparkline({
  data,
  width = 60,
  height = 20,
  className,
  color = "currentColor",
  strokeWidth = 2,
  showTrend = false,
}: SparklineProps) {
  if (!data.length) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  // Calculate trend (positive, negative, or neutral)
  const trend = data.length > 1 ? data[data.length - 1] - data[0] : 0;
  const isPositiveTrend = trend > 0;
  const isNegativeTrend = trend < 0;

  // Generate SVG path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = range === 0 ? height / 2 : height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(' L ')}`;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg width={width} height={height} className="overflow-visible">
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-sm"
        />
        
        {/* Optional area fill for visual enhancement */}
        <path
          d={`${pathData} L ${width},${height} L 0,${height} Z`}
          fill={color}
          opacity="0.1"
        />
        
        {/* Last point indicator */}
        <circle
          cx={width}
          cy={range === 0 ? height / 2 : height - ((data[data.length - 1] - min) / range) * height}
          r="2"
          fill={color}
          className="drop-shadow-sm"
        />
      </svg>

      {showTrend && (
        <span className={cn(
          "text-xs font-medium flex items-center",
          isPositiveTrend ? "text-success-text" : isNegativeTrend ? "text-danger-text" : "text-text-tertiary"
        )}>
          {isPositiveTrend ? "↗" : isNegativeTrend ? "↘" : "→"}
          <span className="sr-only">
            {isPositiveTrend ? "Trending up" : isNegativeTrend ? "Trending down" : "Stable"}
          </span>
        </span>
      )}
    </div>
  );
}

interface TrendBadgeProps {
  value: number;
  previousValue?: number;
  suffix?: string;
  className?: string;
}

export function TrendBadge({ value, previousValue, suffix = "%", className }: TrendBadgeProps) {
  if (previousValue === undefined) return null;

  const change = value - previousValue;
  const percentageChange = previousValue !== 0 ? (change / previousValue) * 100 : 0;
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
      isPositive ? "bg-success-bg text-success-text" : 
      isNegative ? "bg-danger-bg text-danger-text" : 
      "bg-surface-secondary text-text-tertiary",
      className
    )}>
      {isPositive ? "↗" : isNegative ? "↘" : "→"}
      {Math.abs(percentageChange).toFixed(1)}{suffix}
      <span className="sr-only">
        {isPositive ? "Increased by" : isNegative ? "Decreased by" : "Changed by"} {Math.abs(percentageChange).toFixed(1)}{suffix}
      </span>
    </span>
  );
}