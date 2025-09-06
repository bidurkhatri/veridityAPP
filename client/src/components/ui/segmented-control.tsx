import React from 'react';
import { cn } from '@/lib/utils';

interface SegmentedControlOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  size = 'md',
  className,
  disabled = false,
}: SegmentedControlProps) {
  const sizeClasses = {
    sm: 'p-0.5 text-xs',
    md: 'p-1 text-sm',
    lg: 'p-1.5 text-base',
  };

  const optionSizeClasses = {
    sm: 'px-2 py-1',
    md: 'px-3 py-1.5',
    lg: 'px-4 py-2',
  };

  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex rounded-lg border border-border bg-surface',
        sizeClasses[size],
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      data-testid="segmented-control"
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          disabled={disabled || option.disabled}
          data-testid={`segment-${option.value}`}
          onClick={() => !disabled && !option.disabled && onChange(option.value)}
          className={cn(
            'relative rounded-md font-medium transition-all duration-fast',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            optionSizeClasses[size],
            value === option.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export type { SegmentedControlOption, SegmentedControlProps };