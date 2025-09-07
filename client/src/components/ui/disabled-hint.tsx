import React from 'react';
import { cn } from '@/lib/utils';
import { InfoIcon, AlertCircle, Lock, Clock } from 'lucide-react';

interface DisabledHintProps {
  reason: string;
  icon?: 'info' | 'warning' | 'lock' | 'clock';
  className?: string;
  variant?: 'default' | 'subtle';
}

const iconMap = {
  info: InfoIcon,
  warning: AlertCircle,
  lock: Lock,
  clock: Clock,
};

export function DisabledHint({ 
  reason, 
  icon = 'info', 
  className,
  variant = 'default' 
}: DisabledHintProps) {
  const Icon = iconMap[icon];
  
  return (
    <div 
      className={cn(
        "flex items-center gap-2 text-xs mt-2 px-2 py-1 rounded-sm",
        variant === 'default' && "text-text-tertiary bg-surface-secondary",
        variant === 'subtle' && "text-text-tertiary",
        className
      )}
      data-testid="disabled-hint"
    >
      <Icon className="h-3 w-3 flex-shrink-0" />
      <span>{reason}</span>
    </div>
  );
}

// Enhanced Button wrapper with built-in disabled hints
interface ButtonWithHintProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  disabledReason?: string;
  disabledIcon?: 'info' | 'warning' | 'lock' | 'clock';
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'quiet';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function ButtonWithHint({
  disabled,
  disabledReason,
  disabledIcon = 'info',
  children,
  className,
  ...props
}: ButtonWithHintProps) {
  return (
    <div className="space-y-0">
      <button
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-normal ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-focus-offset disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0",
          className
        )}
        {...props}
      >
        {children}
      </button>
      {disabled && disabledReason && (
        <DisabledHint reason={disabledReason} icon={disabledIcon} variant="subtle" />
      )}
    </div>
  );
}