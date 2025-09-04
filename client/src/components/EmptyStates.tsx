/**
 * Empty state components for better UX
 */

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Plus, Search, Shield, Users, AlertCircle, Wifi } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-medium mb-2" data-testid="empty-state-title">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-md" data-testid="empty-state-description">
          {description}
        </p>
      )}
      
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || 'default'}
          data-testid="empty-state-action"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Specific empty states for the app
export function NoProofsEmpty({ onCreateProof }: { onCreateProof: () => void }) {
  return (
    <EmptyState
      icon={<Shield className="h-12 w-12" />}
      title="No Identity Proofs Yet"
      description="Create your first privacy-preserving identity proof to verify your credentials without revealing personal information."
      action={{
        label: "Create Your First Proof",
        onClick: onCreateProof
      }}
    />
  );
}

export function NoOrganizationsEmpty({ onAddOrganization }: { onAddOrganization: () => void }) {
  return (
    <EmptyState
      icon={<Users className="h-12 w-12" />}
      title="No Organizations"
      description="Add organizations that can verify your identity proofs. Start with government agencies, banks, or educational institutions."
      action={{
        label: "Add Organization",
        onClick: onAddOrganization
      }}
    />
  );
}

export function SearchEmpty({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<Search className="h-12 w-12" />}
      title="No Results Found"
      description={`We couldn't find anything matching "${query}". Try adjusting your search terms or filters.`}
    />
  );
}

export function OfflineEmpty() {
  return (
    <EmptyState
      icon={<Wifi className="h-12 w-12" />}
      title="You're Offline"
      description="This feature requires an internet connection. Please check your connection and try again."
    />
  );
}

export function ErrorEmpty({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon={<AlertCircle className="h-12 w-12" />}
      title="Something Went Wrong"
      description="We encountered an error loading this content. Please try again."
      action={onRetry ? {
        label: "Try Again",
        onClick: onRetry,
        variant: "outline"
      } : undefined}
    />
  );
}

// Loading empty state
export function LoadingEmpty({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// Card-based empty state
export function EmptyCard({
  icon,
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="p-8">
        <EmptyState
          icon={icon}
          title={title}
          description={description}
          action={action}
        />
      </CardContent>
    </Card>
  );
}