import React from 'react';
import { cn } from '@/lib/utils';

interface IllustratedIconProps {
  className?: string;
  size?: number;
}

// Age verification illustration
export function AgeVerificationIllustration({ className, size = 48 }: IllustratedIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={cn("text-brand-emerald-600", className)}
    >
      <rect x="8" y="12" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="16" cy="20" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M12 32h8l2-4h4l2 4h8" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M24 16h8v8h-8z" stroke="currentColor" strokeWidth="2" fill="none"/>
      <text x="28" y="22" className="text-xs fill-current font-medium">18+</text>
    </svg>
  );
}

// Citizenship verification illustration
export function CitizenshipVerificationIllustration({ className, size = 48 }: IllustratedIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={cn("text-brand-teal-500", className)}
    >
      <rect x="6" y="10" width="36" height="28" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M6 18h36" stroke="currentColor" strokeWidth="2"/>
      <circle cx="24" cy="28" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M20 28l3 3 6-6" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect x="10" y="12" width="28" height="4" rx="1" fill="currentColor" opacity="0.3"/>
    </svg>
  );
}

// Education verification illustration  
export function EducationVerificationIllustration({ className, size = 48 }: IllustratedIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={cn("text-accent-purple-500", className)}
    >
      <path d="M8 24l16-8 16 8-16 8-16-8z" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M8 24v12l16 8 16-8V24" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="38" cy="20" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M36 20h4" stroke="currentColor" strokeWidth="2"/>
      <path d="M38 18v4" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

// Income verification illustration
export function IncomeVerificationIllustration({ className, size = 48 }: IllustratedIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={cn("text-brand-emerald-600", className)}
    >
      <rect x="6" y="12" width="36" height="24" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M22 22h4v4h-4z" fill="currentColor"/>
      <path d="M6 18h36" stroke="currentColor" strokeWidth="2"/>
      <path d="M6 30h36" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 6v6" stroke="currentColor" strokeWidth="2"/>
      <path d="M18 6v6" stroke="currentColor" strokeWidth="2"/>
      <path d="M30 6v6" stroke="currentColor" strokeWidth="2"/>
      <path d="M36 6v6" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

// Success state illustration
export function SuccessIllustration({ className, size = 64 }: IllustratedIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={cn("text-success-text", className)}
    >
      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="3" fill="none"/>
      <circle cx="32" cy="32" r="20" fill="currentColor" opacity="0.1"/>
      <path d="M22 32l8 8 16-16" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="32" cy="32" r="32" stroke="currentColor" strokeWidth="1" opacity="0.2" fill="none"/>
    </svg>
  );
}

// Error state illustration  
export function ErrorIllustration({ className, size = 64 }: IllustratedIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={cn("text-error-text", className)}
    >
      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="3" fill="none"/>
      <circle cx="32" cy="32" r="20" fill="currentColor" opacity="0.1"/>
      <path d="M22 22l20 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
      <path d="M42 22l-20 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="32" cy="32" r="32" stroke="currentColor" strokeWidth="1" opacity="0.2" fill="none"/>
    </svg>
  );
}

// Processing state illustration
export function ProcessingIllustration({ className, size = 64 }: IllustratedIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={cn("text-brand-teal-500", className)}
    >
      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.3"/>
      <circle cx="32" cy="32" r="20" fill="currentColor" opacity="0.1"/>
      <path 
        d="M32 4a28 28 0 0 1 28 28" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round"
        className="animate-spin origin-center"
      />
      <circle cx="32" cy="32" r="8" fill="currentColor" opacity="0.6"/>
    </svg>
  );
}

// Helper component for proof type icons
interface ProofTypeIconProps {
  type: 'age' | 'citizenship' | 'education' | 'income';
  className?: string;
  size?: number;
}

export function ProofTypeIcon({ type, className, size = 48 }: ProofTypeIconProps) {
  const icons = {
    age: AgeVerificationIllustration,
    citizenship: CitizenshipVerificationIllustration,
    education: EducationVerificationIllustration,
    income: IncomeVerificationIllustration,
  };

  const Icon = icons[type];
  return <Icon className={className} size={size} />;
}