import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, XCircle, Loader2 } from "lucide-react";

export type StatusType = 'verified' | 'pending' | 'failed' | 'expired' | 'processing' | 'draft';

interface StatusPillProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  verified: {
    label: 'Verified',
    icon: CheckCircle,
    className: 'text-success-text bg-success-bg border-success-border',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'text-warning-text bg-warning-bg border-warning-border',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    className: 'text-danger-text bg-danger-bg border-danger-border',
  },
  expired: {
    label: 'Expired',
    icon: AlertCircle,
    className: 'text-danger-text bg-danger-bg/50 border-danger-border',
  },
  processing: {
    label: 'Processing',
    icon: Loader2,
    className: 'text-info-text bg-info-bg border-info-border',
  },
  draft: {
    label: 'Draft',
    icon: Clock,
    className: 'text-text-tertiary bg-surface-secondary border-border-default',
  },
};

const sizeConfig = {
  sm: {
    className: 'text-xs px-2 py-1',
    iconSize: 'h-3 w-3',
  },
  md: {
    className: 'text-sm px-3 py-1',
    iconSize: 'h-4 w-4',
  },
  lg: {
    className: 'text-base px-4 py-2',
    iconSize: 'h-5 w-5',
  },
};

export function StatusPill({ 
  status, 
  size = 'md', 
  showIcon = true, 
  className 
}: StatusPillProps) {
  const config = statusConfig[status];
  const sizeConfig_ = sizeConfig[size];
  const Icon = config.icon;

  return (
    <Badge
      className={cn(
        "inline-flex items-center gap-1 font-medium border",
        config.className,
        sizeConfig_.className,
        className
      )}
      data-testid={`status-pill-${status}`}
    >
      {showIcon && (
        <Icon 
          className={cn(
            sizeConfig_.iconSize,
            status === 'processing' && 'animate-spin'
          )} 
        />
      )}
      {config.label}
    </Badge>
  );
}

// Verification level indicator
interface VerificationLevelProps {
  level: 'basic' | 'standard' | 'premium' | 'enterprise';
  score?: number;
  className?: string;
}

const levelConfig = {
  basic: {
    label: 'Basic',
    description: 'Identity verified',
    className: 'text-info-text bg-info-bg border-info-border',
  },
  standard: {
    label: 'Standard',
    description: 'Enhanced verification', 
    className: 'text-success-text bg-success-bg border-success-border',
  },
  premium: {
    label: 'Premium',
    description: 'Full KYC verified',
    className: 'text-warning-text bg-warning-bg border-warning-border',
  },
  enterprise: {
    label: 'Enterprise',
    description: 'Maximum security',
    className: 'text-danger-text bg-danger-bg border-danger-border',
  },
};

export function VerificationLevel({ level, score, className }: VerificationLevelProps) {
  const config = levelConfig[level];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge className={cn("font-medium border", config.className)}>
        {config.label}
      </Badge>
      {score && (
        <span className="text-sm text-text-tertiary">
          {score}% complete
        </span>
      )}
    </div>
  );
}

// Security level indicator
interface SecurityLevelProps {
  level: 'low' | 'medium' | 'high' | 'critical';
  showDescription?: boolean;
  className?: string;
}

const securityConfig = {
  low: {
    label: 'Low',
    description: 'Minimal risk',
    className: 'text-success-text bg-success-bg border-success-border',
  },
  medium: {
    label: 'Medium', 
    description: 'Standard security',
    className: 'text-warning-text bg-warning-bg border-warning-border',
  },
  high: {
    label: 'High',
    description: 'Enhanced protection',
    className: 'text-danger-text bg-danger-bg/50 border-danger-border',
  },
  critical: {
    label: 'Critical',
    description: 'Maximum security',
    className: 'text-danger-text bg-danger-bg border-danger-border',
  },
};

export function SecurityLevel({ 
  level, 
  showDescription = false, 
  className 
}: SecurityLevelProps) {
  const config = securityConfig[level];

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <Badge className={cn("font-medium border text-xs", config.className)}>
        {config.label}
      </Badge>
      {showDescription && (
        <span className="text-xs text-text-tertiary">
          {config.description}
        </span>
      )}
    </div>
  );
}

// Risk level with color coding
interface RiskLevelProps {
  risk: 'none' | 'low' | 'moderate' | 'high' | 'severe';
  className?: string;
}

const riskConfig = {
  none: {
    label: 'No Risk',
    className: 'text-success-text bg-success-bg border-success-border',
  },
  low: {
    label: 'Low Risk',
    className: 'text-success-text bg-success-bg/50 border-success-border',
  },
  moderate: {
    label: 'Moderate',
    className: 'text-warning-text bg-warning-bg border-warning-border',
  },
  high: {
    label: 'High Risk',
    className: 'text-danger-text bg-danger-bg/50 border-danger-border',
  },
  severe: {
    label: 'Severe',
    className: 'text-danger-text bg-danger-bg border-danger-border',
  },
};

export function RiskLevel({ risk, className }: RiskLevelProps) {
  const config = riskConfig[risk];

  return (
    <Badge
      className={cn(
        "inline-flex items-center font-medium border text-xs",
        config.className,
        className
      )}
      data-testid={`risk-level-${risk}`}
    >
      {config.label}
    </Badge>
  );
}