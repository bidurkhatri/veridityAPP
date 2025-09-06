import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Shield, AlertTriangle, Info, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SecurityEvent {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  category: 'authentication' | 'access' | 'data' | 'network' | 'policy';
  timestamp: Date;
  resolved: boolean;
  source?: string;
  affectedUsers?: number;
}

interface SecurityEventsProps {
  events: SecurityEvent[];
  onEventClick?: (event: SecurityEvent) => void;
  className?: string;
  showFilters?: boolean;
}

const severityConfig = {
  high: {
    label: 'High',
    color: 'text-danger-text bg-danger-bg border-danger-border',
    icon: AlertTriangle,
  },
  medium: {
    label: 'Medium',
    color: 'text-warning-text bg-warning-bg border-warning-border',
    icon: AlertTriangle,
  },
  low: {
    label: 'Low',
    color: 'text-info-text bg-info-bg border-info-border',
    icon: Info,
  },
};

const categoryConfig = {
  authentication: { label: 'Authentication', icon: Shield },
  access: { label: 'Access Control', icon: Shield },
  data: { label: 'Data Security', icon: Shield },
  network: { label: 'Network', icon: Shield },
  policy: { label: 'Policy', icon: Shield },
};

export function SecurityEvents({ 
  events, 
  onEventClick, 
  className,
  showFilters = false 
}: SecurityEventsProps) {
  const [selectedSeverity, setSelectedSeverity] = React.useState<string>('all');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  const filteredEvents = React.useMemo(() => {
    return events.filter(event => {
      if (selectedSeverity !== 'all' && event.severity !== selectedSeverity) return false;
      if (selectedCategory !== 'all' && event.category !== selectedCategory) return false;
      return true;
    });
  }, [events, selectedSeverity, selectedCategory]);

  const priorityEvents = filteredEvents.filter(e => e.severity === 'high' && !e.resolved);
  const recentEvents = filteredEvents.slice(0, 10);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Priority Alerts */}
      {priorityEvents.length > 0 && (
        <Card className="border-danger-border/50 bg-danger-bg/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-danger-text flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Priority Security Alerts ({priorityEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {priorityEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-surface border border-danger-border/30"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-danger-text">{event.title}</p>
                    <p className="text-sm text-text-secondary">{event.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEventClick?.(event)}
                    className="border-danger-border text-danger-text"
                  >
                    Review
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Severity:</label>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="px-2 py-1 border border-border-default rounded text-sm"
                >
                  <option value="all">All</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Category:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2 py-1 border border-border-default rounded text-sm"
                >
                  <option value="all">All</option>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Security Events</span>
            <Badge variant="outline">{filteredEvents.length} events</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              No security events found matching your filters
            </div>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event) => {
                const severityInfo = severityConfig[event.severity];
                const categoryInfo = categoryConfig[event.category];
                const SeverityIcon = severityInfo.icon;
                const CategoryIcon = categoryInfo.icon;

                return (
                  <div
                    key={event.id}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-lg border transition-colors",
                      event.resolved 
                        ? "border-border-default bg-surface-secondary/50" 
                        : "border-border-default hover:bg-surface-secondary/30 cursor-pointer"
                    )}
                    onClick={() => !event.resolved && onEventClick?.(event)}
                    data-testid={`security-event-${event.id}`}
                  >
                    {/* Severity Icon */}
                    <div className={cn(
                      "p-2 rounded-lg flex-shrink-0",
                      event.severity === 'high' ? "bg-danger-bg text-danger-text" :
                      event.severity === 'medium' ? "bg-warning-bg text-warning-text" :
                      "bg-info-bg text-info-text"
                    )}>
                      <SeverityIcon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className={cn(
                            "font-medium",
                            event.resolved ? "text-text-secondary" : "text-text-primary"
                          )}>
                            {event.title}
                            {event.resolved && (
                              <span className="text-success-text text-sm ml-2">(Resolved)</span>
                            )}
                          </h4>
                          <p className="text-sm text-text-secondary mt-1">
                            {event.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={cn("text-xs", severityInfo.color)}>
                            {severityInfo.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {categoryInfo.label}
                          </Badge>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-text-tertiary">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                        </div>
                        {event.source && (
                          <span>Source: {event.source}</span>
                        )}
                        {event.affectedUsers && (
                          <span>Affected: {event.affectedUsers} users</span>
                        )}
                      </div>

                      {/* Action Button */}
                      {!event.resolved && (
                        <div className="pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick?.(event);
                            }}
                            data-testid={`event-detail-${event.id}`}
                          >
                            <ExternalLink className="h-3 w-3 mr-2" />
                            View Details
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}