import React from 'react';
import { cn } from '@/lib/utils';

interface VeridityLogoProps {
  variant?: 'full' | 'icon' | 'wordmark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export function VeridityLogo({ 
  variant = 'full', 
  size = 'md', 
  className,
  theme = 'auto' 
}: VeridityLogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 40, text: 'text-2xl' },
    xl: { icon: 48, text: 'text-3xl' }
  };

  const iconSize = sizes[size].icon;
  const textSize = sizes[size].text;

  // Veridity icon - geometric shield with ZK element
  const VeridityIcon = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 32 32"
      fill="none"
      className={cn(
        "text-brand-emerald-600",
        theme === 'dark' && "text-white",
        theme === 'light' && "text-brand-emerald-600"
      )}
    >
      {/* Shield outline */}
      <path
        d="M16 2L26 6v8c0 8-4.5 12-10 14-5.5-2-10-6-10-14V6l10-4z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      
      {/* ZK proof element - interconnected nodes */}
      <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.8" />
      <circle cx="20" cy="12" r="2" fill="currentColor" opacity="0.8" />
      <circle cx="16" cy="20" r="2" fill="currentColor" opacity="0.8" />
      
      {/* Connection lines */}
      <path
        d="M12 12L20 12M16 14L16 18M14 12L16 18M18 12L16 18"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.6"
      />
      
      {/* Verification checkmark */}
      <path
        d="M11 16L14 19L21 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  );

  // Wordmark - Veridity text
  const VeridityWordmark = () => (
    <span
      className={cn(
        "font-brand font-bold tracking-tight",
        textSize,
        "text-brand-emerald-600",
        theme === 'dark' && "text-white",
        theme === 'light' && "text-brand-emerald-600"
      )}
    >
      Veridity
    </span>
  );

  if (variant === 'icon') {
    return (
      <div className={cn("flex items-center", className)}>
        <VeridityIcon />
      </div>
    );
  }

  if (variant === 'wordmark') {
    return (
      <div className={cn("flex items-center", className)}>
        <VeridityWordmark />
      </div>
    );
  }

  // Full logo - icon + wordmark
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <VeridityIcon />
      <VeridityWordmark />
    </div>
  );
}

// Usage examples for common locations
export function TopBarLogo() {
  return <VeridityLogo variant="full" size="md" />;
}

export function LoginLogo() {
  return <VeridityLogo variant="full" size="xl" className="mb-8" />;
}

export function EmptyStateLogo() {
  return <VeridityLogo variant="icon" size="lg" className="opacity-60" />;
}