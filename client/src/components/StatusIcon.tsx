import { CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusIconProps {
  status: 'verified' | 'pending' | 'failed' | 'processing';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusIcon({ status, size = 'md', className }: StatusIconProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6"
  };

  const statusConfig = {
    verified: {
      icon: CheckCircle,
      color: "text-success-text",
      bgColor: "bg-success-bg"
    },
    pending: {
      icon: Clock,
      color: "text-warning-text",
      bgColor: "bg-warning-bg"
    },
    failed: {
      icon: XCircle,
      color: "text-danger-text", 
      bgColor: "bg-danger-bg"
    },
    processing: {
      icon: Loader2,
      color: "text-brand-primary",
      bgColor: "bg-brand-primary/10"
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <div className={cn(
      "inline-flex items-center justify-center rounded-full p-1.5",
      config.bgColor,
      className
    )}>
      <Icon 
        className={cn(
          sizes[size],
          config.color,
          status === 'processing' && "animate-spin"
        )} 
      />
    </div>
  );
}