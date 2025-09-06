import * as React from "react";
import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
  size?: number;
}

// ZK Shield - Zero Knowledge Proof Protection
export function ZKShieldIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide", className)}
    >
      <path d="M12 2L3 7v5c0 6 9 10 9 10s9-4 9-10V7l-9-5z" />
      <circle cx="12" cy="10" r="3" />
      <path d="M12 7v6" opacity="0.3" />
      <path d="M9.5 9.5l5 1" opacity="0.3" />
      <path d="M14.5 9.5l-5 1" opacity="0.3" />
    </svg>
  );
}

// QR Verify - QR Code Verification
export function QRVerifyIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide", className)}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <rect x="5" y="5" width="4" height="4" />
      <rect x="15" y="5" width="4" height="4" />
      <rect x="5" y="15" width="4" height="4" />
      <path d="M15 11h4v4h-2v2" />
      <circle cx="12" cy="12" r="1" />
      <path d="M9 9h.01" />
      <path d="M9 15h.01" />
      <path d="M15 9h.01" />
    </svg>
  );
}

// Proof Certificate
export function ProofIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide", className)}
    >
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8" />
      <path d="M8 10h8" />
      <path d="M8 14h5" />
      <circle cx="18" cy="18" r="3" />
      <path d="M16.5 18.5l1 1 2.5-2.5" />
    </svg>
  );
}

// Digital Wallet
export function WalletIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide", className)}
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 8h20" />
      <circle cx="18" cy="14" r="2" />
      <path d="M6 12h2" />
    </svg>
  );
}

// Audit Trail
export function AuditIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide", className)}
    >
      <path d="M3 3v18h18" />
      <path d="M7 16l4-4 4 4 6-6" />
      <circle cx="7" cy="16" r="1" />
      <circle cx="11" cy="12" r="1" />
      <circle cx="15" cy="16" r="1" />
      <circle cx="21" cy="10" r="1" />
    </svg>
  );
}

// AI Shield - AI-Powered Security
export function AIShieldIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide", className)}
    >
      <path d="M12 2L3 7v5c0 6 9 10 9 10s9-4 9-10V7l-9-5z" />
      <path d="M8 12l2 2 4-4" />
      <circle cx="8" cy="8" r="1" opacity="0.5" />
      <circle cx="16" cy="8" r="1" opacity="0.5" />
      <circle cx="12" cy="6" r="1" opacity="0.7" />
    </svg>
  );
}

// Blockchain Chain
export function ChainIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide", className)}
    >
      <rect x="2" y="8" width="6" height="8" rx="1" />
      <rect x="16" y="8" width="6" height="8" rx="1" />
      <path d="M8 12h8" />
      <circle cx="5" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </svg>
  );
}

// Government/Official
export function GOVIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide", className)}
    >
      <path d="M3 21h18" />
      <path d="M5 21V7l8-4v18" />
      <path d="M19 21V7l-8-4" />
      <path d="M9 9h.01" />
      <path d="M9 12h.01" />
      <path d="M9 15h.01" />
      <path d="M15 9h.01" />
      <path d="M15 12h.01" />
      <path d="M15 15h.01" />
    </svg>
  );
}

// Address Location
export function AddressIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide", className)}
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
      <path d="M10 10h4" />
      <path d="M12 8v4" />
    </svg>
  );
}

// Age Verification
export function AgeIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide", className)}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
      <path d="M8 8l1 1" />
      <path d="M15 9l1-1" />
    </svg>
  );
}

// Citizenship Badge
export function CitizenshipIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide", className)}
    >
      <path d="M7 10v12l5-3 5 3V10" />
      <path d="M7 10c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2" />
      <path d="M7 6c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v4" />
      <circle cx="12" cy="8" r="1" />
    </svg>
  );
}

// Education Degree
export function EducationIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide", className)}
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
      <circle cx="8" cy="15" r="1" />
      <circle cx="16" cy="15" r="1" />
    </svg>
  );
}

// Income/Money
export function IncomeIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide", className)}
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M2 7h20" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 9v6" />
      <path d="M10.5 10.5l3-1" />
      <path d="M10.5 13.5l3 1" />
    </svg>
  );
}

export const VeridityIcons = {
  ZKShield: ZKShieldIcon,
  QRVerify: QRVerifyIcon,
  Proof: ProofIcon,
  Wallet: WalletIcon,
  Audit: AuditIcon,
  AIShield: AIShieldIcon,
  Chain: ChainIcon,
  GOV: GOVIcon,
  Address: AddressIcon,
  Age: AgeIcon,
  Citizenship: CitizenshipIcon,
  Education: EducationIcon,
  Income: IncomeIcon,
};