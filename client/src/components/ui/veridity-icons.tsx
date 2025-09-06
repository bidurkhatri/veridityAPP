import * as React from "react";
import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
  size?: number;
}

// Complete Veridity icon set to eliminate blank squares
export function VeridityLogo({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <path
        d="M12 2L4 7V12C4 16.55 7.84 20.74 12 21C16.16 20.74 20 16.55 20 12V7L12 2Z"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        d="M12 2L4 7V12C4 16.55 7.84 20.74 12 21C16.16 20.74 20 16.55 20 12V7L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9 12L11 14L15 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AgeVerificationIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cn("text-primary", className)}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M12 12v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 18h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CitizenshipIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cn("text-primary", className)}>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="9" cy="11" r="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M15 9h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 13h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 19l2-2 2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IncomeIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cn("text-primary", className)}>
      <rect x="2" y="7" width="20" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M6 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 7V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function EducationIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cn("text-primary", className)}>
      <path d="M12 2l8 4-8 4-8-4z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
      <path d="M4 10v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

export function SecurityIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cn("text-primary", className)}>
      <path d="M12 2l8 3v7c0 5.55-3.84 10.74-8 11-4.16-.26-8-5.45-8-11V5l8-3z" 
            stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
      <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function VerificationIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cn("text-primary", className)}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PrivacyIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cn("text-primary", className)}>
      <rect x="3" y="11" width="18" height="10" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

export function BiometricsIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cn("text-primary", className)}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" 
            stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M8 12h8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8v8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 10l4 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M14 10l-4 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function ProofIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cn("text-primary", className)}>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 15l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

export function ScanIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cn("text-primary", className)}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="7" y="7" width="10" height="10" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M9 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ShareIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cn("text-primary", className)}>
      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M8.59 13.51l6.83 3.98" stroke="currentColor" strokeWidth="2" />
      <path d="M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function DocumentIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cn("text-primary", className)}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" 
            stroke="currentColor" strokeWidth="2" fill="none" />
      <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Icon mapping for dynamic usage
export const VeridityIcons = {
  logo: VeridityLogo,
  age: AgeVerificationIcon,
  citizenship: CitizenshipIcon,
  income: IncomeIcon,
  education: EducationIcon,
  security: SecurityIcon,
  verification: VerificationIcon,
  privacy: PrivacyIcon,
  biometrics: BiometricsIcon,
  proof: ProofIcon,
  scan: ScanIcon,
  share: ShareIcon,
  document: DocumentIcon,
} as const;

export type VeridityIconName = keyof typeof VeridityIcons;