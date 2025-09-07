import React from 'react';
import { cn } from '@/lib/utils';
import { 
  formatNumber, 
  formatPercentage, 
  formatCurrency, 
  formatCompactNumber,
  formatUptime,
  formatUptimePercentage,
  formatResponseTime,
  formatNepalese,
} from '@/lib/formatters';

interface NumberDisplayProps {
  value: number;
  type?: 'number' | 'percentage' | 'currency' | 'compact' | 'uptime' | 'uptime-percentage' | 'response-time';
  currency?: string;
  locale?: string;
  decimals?: number;
  totalTime?: number; // For uptime percentage calculation
  className?: string;
  tabular?: boolean;
  nepali?: boolean;
}

export function NumberDisplay({
  value,
  type = 'number',
  currency = 'USD',
  locale = 'en-US',
  decimals = 1,
  totalTime,
  className,
  tabular = false,
  nepali = false,
}: NumberDisplayProps) {
  const formatValue = () => {
    if (nepali && (type === 'number' || type === 'currency')) {
      return formatNepalese(value, type);
    }

    switch (type) {
      case 'percentage':
        return formatPercentage(value, decimals, locale);
      case 'currency':
        return formatCurrency(value, currency, locale, decimals);
      case 'compact':
        return formatCompactNumber(value, decimals, locale);
      case 'uptime':
        return formatUptime(value);
      case 'uptime-percentage':
        return formatUptimePercentage(value, totalTime || 0, decimals);
      case 'response-time':
        return formatResponseTime(value);
      default:
        return formatNumber(value, decimals, locale);
    }
  };

  return (
    <span
      className={cn(
        "text-text-primary",
        tabular && "font-mono tabular-nums",
        className
      )}
      data-testid={`number-display-${type}`}
    >
      {formatValue()}
    </span>
  );
}

// Specialized components for common use cases
export function PercentageDisplay({ 
  value, 
  decimals = 1, 
  className, 
  showSign = false 
}: { 
  value: number; 
  decimals?: number; 
  className?: string;
  showSign?: boolean;
}) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  
  return (
    <span
      className={cn(
        "font-mono tabular-nums",
        showSign && isPositive && "text-success-text",
        showSign && isNegative && "text-error-text",
        className
      )}
    >
      {showSign && isPositive && "+"}
      <NumberDisplay value={value} type="percentage" decimals={decimals} />
    </span>
  );
}

export function CurrencyDisplay({ 
  value, 
  currency = 'USD', 
  className,
  nepali = false,
}: { 
  value: number; 
  currency?: string; 
  className?: string;
  nepali?: boolean;
}) {
  return (
    <NumberDisplay
      value={value}
      type="currency"
      currency={currency}
      className={cn("font-mono tabular-nums", className)}
      nepali={nepali}
    />
  );
}

export function UptimeDisplay({ 
  value, 
  totalTime, 
  className 
}: { 
  value: number; 
  totalTime: number; 
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <NumberDisplay
        value={value}
        type="uptime-percentage"
        totalTime={totalTime}
        className="font-mono tabular-nums"
      />
      <span className="text-text-tertiary text-sm">
        (<NumberDisplay value={value} type="uptime" />)
      </span>
    </div>
  );
}