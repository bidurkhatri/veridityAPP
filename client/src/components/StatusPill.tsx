import { cn } from "@/lib/utils";

interface StatusPillProps {
  status: 'verified' | 'pending' | 'failed';
  className?: string;
  children: React.ReactNode;
}

export function StatusPill({ status, className, children }: StatusPillProps) {
  const variants = {
    verified: "bg-success-bg text-success-text border border-success-border",
    pending: "bg-warning-bg text-warning-text border border-warning-border", 
    failed: "bg-danger-bg text-danger-text border border-danger-border"
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
        variants[status],
        className
      )}
    >
      {children}
    </span>
  );
}