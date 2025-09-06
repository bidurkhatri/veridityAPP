import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
  category?: string;
  status?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  icon?: React.ReactNode;
  metadata?: Record<string, any>;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
  showCategories?: boolean;
  compact?: boolean;
}

const statusColors = {
  success: 'text-success-text bg-success-bg border-success-border',
  warning: 'text-warning-text bg-warning-bg border-warning-border',
  danger: 'text-danger-text bg-danger-bg border-danger-border',
  info: 'text-info-text bg-info-bg border-info-border',
  neutral: 'text-text-secondary bg-surface-secondary border-border-default',
};

const categoryColors = {
  Security: 'text-danger-text bg-danger-bg border-danger-border',
  Billing: 'text-success-text bg-success-bg border-success-border',
  Team: 'text-info-text bg-info-bg border-info-border',
  System: 'text-warning-text bg-warning-bg border-warning-border',
  User: 'text-text-primary bg-surface-secondary border-border-default',
};

export function Timeline({ items, className, showCategories = true, compact = false }: TimelineProps) {
  const sortedItems = React.useMemo(() => 
    [...items].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    [items]
  );

  if (!items.length) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-text-tertiary">No activity to display</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)} data-testid="timeline">
      {sortedItems.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            "relative flex gap-3",
            !compact && "pb-4",
            index !== sortedItems.length - 1 && "border-l-2 border-border-subtle ml-4 pl-6"
          )}
          data-testid={`timeline-item-${item.id}`}
        >
          {/* Timeline dot/icon */}
          <div className={cn(
            "absolute left-0 top-0 flex items-center justify-center rounded-full border-2",
            "w-4 h-4 -ml-2 bg-surface",
            item.status ? `border-${item.status === 'success' ? 'success-border' : 
                            item.status === 'warning' ? 'warning-border' :
                            item.status === 'danger' ? 'danger-border' :
                            item.status === 'info' ? 'info-border' : 'border-default'}` : 'border-border-default'
          )}>
            {item.icon || (
              <div className={cn(
                "w-2 h-2 rounded-full",
                item.status === 'success' ? 'bg-success-bg' :
                item.status === 'warning' ? 'bg-warning-bg' :
                item.status === 'danger' ? 'bg-danger-bg' :
                item.status === 'info' ? 'bg-info-bg' : 'bg-surface-secondary'
              )} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-text-primary truncate">
                  {item.title}
                </h4>
                {item.description && (
                  <p className={cn(
                    "text-text-secondary leading-relaxed",
                    compact ? "text-xs" : "text-sm"
                  )}>
                    {item.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {showCategories && item.category && (
                  <Badge 
                    className={cn(
                      "text-xs px-2 py-1",
                      categoryColors[item.category as keyof typeof categoryColors] || 
                      categoryColors.User
                    )}
                  >
                    {item.category}
                  </Badge>
                )}
                <time className="text-xs text-text-tertiary whitespace-nowrap">
                  {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                </time>
              </div>
            </div>

            {/* Metadata */}
            {item.metadata && Object.keys(item.metadata).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(item.metadata).map(([key, value]) => (
                  <span
                    key={key}
                    className="text-xs text-text-tertiary bg-surface-secondary px-2 py-1 rounded"
                  >
                    <span className="font-medium">{key}:</span> {String(value)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper component for common timeline categories
export function ActivityTimeline({ 
  activities, 
  className 
}: { 
  activities: Array<{
    id: string;
    type: 'security' | 'billing' | 'team' | 'system';
    title: string;
    description?: string;
    timestamp: Date;
    severity?: 'low' | 'medium' | 'high';
  }>;
  className?: string;
}) {
  const timelineItems: TimelineItem[] = activities.map(activity => ({
    id: activity.id,
    title: activity.title,
    description: activity.description,
    timestamp: activity.timestamp,
    category: activity.type.charAt(0).toUpperCase() + activity.type.slice(1),
    status: activity.type === 'security' ? 
      (activity.severity === 'high' ? 'danger' : 
       activity.severity === 'medium' ? 'warning' : 'info') :
      activity.type === 'billing' ? 'success' :
      activity.type === 'team' ? 'info' : 'neutral',
    metadata: activity.severity ? { severity: activity.severity } : undefined,
  }));

  return <Timeline items={timelineItems} className={className} />;
}