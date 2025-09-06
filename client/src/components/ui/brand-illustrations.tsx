import * as React from "react";
import { cn } from "@/lib/utils";

interface IllustrationProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24', 
  lg: 'w-32 h-32',
  xl: 'w-48 h-48',
};

// Empty state illustrations
export function EmptyProofsIllustration({ className, size = 'lg' }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 160"
      className={cn(sizeClasses[size], "text-text-tertiary", className)}
      fill="none"
    >
      {/* Shield outline */}
      <path
        d="M100 20L60 35V70C60 95 75 115 100 120C125 115 140 95 140 70V35L100 20Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="4 4"
        fill="none"
        opacity="0.4"
      />
      
      {/* Dotted placeholder circles */}
      <circle cx="85" cy="55" r="3" fill="currentColor" opacity="0.3" />
      <circle cx="100" cy="65" r="3" fill="currentColor" opacity="0.3" />
      <circle cx="115" cy="55" r="3" fill="currentColor" opacity="0.3" />
      
      {/* Plus icon for adding */}
      <circle cx="100" cy="140" r="12" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <path d="M94 140h12M100 134v12" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      
      <text 
        x="100" 
        y="155" 
        textAnchor="middle" 
        className="text-xs fill-current opacity-60 font-medium"
      >
        No proofs yet
      </text>
    </svg>
  );
}

export function EmptyVerificationIllustration({ className, size = 'lg' }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 160"
      className={cn(sizeClasses[size], "text-text-tertiary", className)}
      fill="none"
    >
      {/* QR code outline */}
      <rect x="70" y="30" width="60" height="60" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" opacity="0.4" />
      
      {/* QR corner markers */}
      <rect x="75" y="35" width="8" height="8" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <rect x="117" y="35" width="8" height="8" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <rect x="75" y="77" width="8" height="8" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      
      {/* Scan lines */}
      <path d="M65 50L135 50" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <path d="M65 60L135 60" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <path d="M65 70L135 70" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      
      {/* Magnifying glass */}
      <circle cx="100" cy="120" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <path d="M108 128l6 6" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      
      <text 
        x="100" 
        y="150" 
        textAnchor="middle" 
        className="text-xs fill-current opacity-60 font-medium"
      >
        No QR code scanned
      </text>
    </svg>
  );
}

// Proof type illustrations
export function AgeProofIllustration({ className, size = 'md' }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn(sizeClasses[size], "text-primary", className)}
      fill="none"
    >
      {/* Person silhouette */}
      <circle cx="50" cy="25" r="12" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
      <path 
        d="M30 85V75C30 65 38 60 50 60C62 60 70 65 70 75V85" 
        stroke="currentColor" 
        strokeWidth="2" 
        fill="currentColor" 
        fillOpacity="0.1"
      />
      
      {/* Age badge */}
      <circle cx="70" cy="30" r="8" fill="currentColor" fillOpacity="0.2" />
      <text x="70" y="33" textAnchor="middle" className="text-xs fill-current font-bold">18+</text>
    </svg>
  );
}

export function CitizenshipProofIllustration({ className, size = 'md' }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn(sizeClasses[size], "text-primary", className)}
      fill="none"
    >
      {/* ID Card outline */}
      <rect x="20" y="30" width="60" height="40" rx="4" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.05" />
      
      {/* Photo placeholder */}
      <rect x="25" y="35" width="15" height="20" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.1" />
      
      {/* Text lines */}
      <line x1="45" y1="40" x2="70" y2="40" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="45" y1="45" x2="65" y2="45" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="25" y1="60" x2="55" y2="60" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      
      {/* Nepal flag colors hint */}
      <circle cx="70" cy="55" r="3" fill="#DC143C" opacity="0.7" />
      <circle cx="75" cy="55" r="3" fill="#003893" opacity="0.7" />
    </svg>
  );
}

export function IncomeProofIllustration({ className, size = 'md' }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn(sizeClasses[size], "text-primary", className)}
      fill="none"
    >
      {/* Banknote */}
      <rect x="15" y="40" width="70" height="30" rx="4" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.05" />
      
      {/* Currency symbol */}
      <text x="50" y="60" textAnchor="middle" className="text-sm fill-current font-bold opacity-60">₨</text>
      
      {/* Amount indicators */}
      <circle cx="30" cy="55" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="70" cy="55" r="2" fill="currentColor" opacity="0.4" />
      
      {/* Privacy bars */}
      <rect x="35" y="48" width="4" height="4" fill="currentColor" opacity="0.3" />
      <rect x="41" y="48" width="4" height="4" fill="currentColor" opacity="0.3" />
      <rect x="47" y="48" width="4" height="4" fill="currentColor" opacity="0.3" />
      <rect x="55" y="48" width="4" height="4" fill="currentColor" opacity="0.3" />
      <rect x="61" y="48" width="4" height="4" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export function EducationProofIllustration({ className, size = 'md' }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn(sizeClasses[size], "text-primary", className)}
      fill="none"
    >
      {/* Graduation cap */}
      <path 
        d="M50 25L20 35L50 45L80 35L50 25Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        fill="currentColor" 
        fillOpacity="0.1"
      />
      <path d="M20 35V55C20 65 32 70 50 70C68 70 80 65 80 55V35" stroke="currentColor" strokeWidth="2" fill="none" />
      
      {/* Tassel */}
      <circle cx="55" cy="30" r="2" fill="currentColor" />
      <line x1="55" y1="32" x2="55" y2="40" stroke="currentColor" strokeWidth="1" />
      
      {/* Diploma */}
      <rect x="35" y="75" width="30" height="4" rx="2" fill="currentColor" fillOpacity="0.3" />
      <circle cx="40" cy="77" r="1" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

// Success state illustration
export function SuccessIllustration({ className, size = 'lg' }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={cn(sizeClasses[size], "text-success-text", className)}
      fill="none"
    >
      {/* Outer success ring */}
      <circle 
        cx="60" 
        cy="60" 
        r="50" 
        stroke="currentColor" 
        strokeWidth="2" 
        fill="currentColor" 
        fillOpacity="0.1"
      />
      
      {/* Inner shield */}
      <path
        d="M60 20L35 30V55C35 72 47 85 60 87C73 85 85 72 85 55V30L60 20Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.1"
      />
      
      {/* Check mark */}
      <path d="M45 55L55 65L75 45" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Celebration particles */}
      <circle cx="25" cy="25" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="95" cy="25" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="25" cy="95" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="95" cy="95" r="2" fill="currentColor" opacity="0.6" />
      
      {/* Sparkles */}
      <path d="M30 40L32 35L34 40L39 42L34 44L32 49L30 44L25 42Z" fill="currentColor" opacity="0.4" />
      <path d="M90 80L92 75L94 80L99 82L94 84L92 89L90 84L85 82Z" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

// Loading state illustration  
export function LoadingIllustration({ className, size = 'md' }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn(sizeClasses[size], "text-primary", className)}
      fill="none"
    >
      {/* Spinning shield */}
      <g className="animate-spin" style={{ transformOrigin: '50px 50px' }}>
        <path
          d="M50 10L25 20V45C25 62 37 75 50 77C63 75 75 62 75 45V20L50 10Z"
          stroke="currentColor"
          strokeWidth="2"
          fill="currentColor"
          fillOpacity="0.1"
        />
        <circle cx="50" cy="15" r="2" fill="currentColor" />
      </g>
      
      {/* Progress dots */}
      <circle cx="50" cy="85" r="2" fill="currentColor" opacity="0.8" className="animate-pulse" />
      <circle cx="45" cy="85" r="1.5" fill="currentColor" opacity="0.6" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
      <circle cx="55" cy="85" r="1.5" fill="currentColor" opacity="0.6" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
    </svg>
  );
}

// Collection of all illustrations for easy import
export const BrandIllustrations = {
  EmptyProofs: EmptyProofsIllustration,
  EmptyVerification: EmptyVerificationIllustration,
  AgeProof: AgeProofIllustration,
  CitizenshipProof: CitizenshipProofIllustration,
  IncomeProof: IncomeProofIllustration,
  EducationProof: EducationProofIllustration,
  Success: SuccessIllustration,
  Loading: LoadingIllustration,
} as const;