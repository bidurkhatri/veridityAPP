import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ExternalLink, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

interface UptimeData {
  percentage: number;
  totalDays: number;
  incidents: number;
  lastIncident?: Date;
}

interface UptimeDisplayProps {
  data: UptimeData;
  className?: string;
  showDetails?: boolean;
}

export function UptimeDisplay({ data, className, showDetails = true }: UptimeDisplayProps) {
  const getUptimeStatus = (percentage: number) => {
    if (percentage >= 99.9) return { status: 'excellent', color: 'text-success-text', label: 'Excellent' };
    if (percentage >= 99.5) return { status: 'good', color: 'text-success-text', label: 'Good' };
    if (percentage >= 99.0) return { status: 'fair', color: 'text-warning-text', label: 'Fair' };
    return { status: 'poor', color: 'text-danger-text', label: 'Poor' };
  };

  const statusInfo = getUptimeStatus(data.percentage);

  // Generate mock daily uptime data for visualization
  const dailyUptime = React.useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      uptime: Math.random() > 0.05 ? 100 : Math.random() * 50 + 50, // 95% chance of 100% uptime
      incidents: Math.random() > 0.9 ? Math.floor(Math.random() * 3) + 1 : 0,
    }));
  }, []);

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            System Uptime (30 Days)
          </CardTitle>
          <Badge 
            className={cn(
              "text-xs",
              data.percentage >= 99.9 ? "text-success-text bg-success-bg border-success-border" :
              data.percentage >= 99.0 ? "text-warning-text bg-warning-bg border-warning-border" :
              "text-danger-text bg-danger-bg border-danger-border"
            )}
          >
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Uptime Percentage */}
        <div className="text-center py-4">
          <div className="text-4xl font-bold text-text-primary mb-2">
            {data.percentage.toFixed(2)}%
          </div>
          <p className="text-text-secondary">
            Rolling 30-day availability
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={data.percentage} 
            className={cn(
              "h-3",
              data.percentage >= 99.9 ? "[&>div]:bg-success-bg" :
              data.percentage >= 99.0 ? "[&>div]:bg-warning-bg" :
              "[&>div]:bg-danger-bg"
            )} 
          />
          <div className="flex justify-between text-xs text-text-tertiary">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <div className="text-2xl font-semibold text-text-primary">
              {data.totalDays}
            </div>
            <p className="text-xs text-text-secondary">Days Tracked</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-semibold text-text-primary">
              {data.incidents}
            </div>
            <p className="text-xs text-text-secondary">Total Incidents</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-semibold text-text-primary">
              {Math.round((data.percentage / 100) * 24 * data.totalDays)}h
            </div>
            <p className="text-xs text-text-secondary">Uptime Hours</p>
          </div>
        </div>

        {/* Daily Uptime Visualization */}
        {showDetails && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Daily Uptime (Last 30 Days)</h4>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                data-testid="incidents-log-link"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Incidents Log
              </Button>
            </div>
            
            <div className="grid grid-cols-15 gap-1">
              {dailyUptime.map((day) => (
                <div
                  key={day.day}
                  className={cn(
                    "aspect-square rounded-sm cursor-pointer transition-colors",
                    day.uptime === 100 
                      ? "bg-success-bg hover:bg-success-bg/80"
                      : day.uptime >= 95 
                      ? "bg-warning-bg hover:bg-warning-bg/80"
                      : "bg-danger-bg hover:bg-danger-bg/80"
                  )}
                  title={`Day ${day.day}: ${day.uptime.toFixed(1)}% uptime${day.incidents > 0 ? `, ${day.incidents} incidents` : ''}`}
                  data-testid={`uptime-day-${day.day}`}
                />
              ))}
            </div>
            
            <div className="flex items-center justify-between text-xs text-text-tertiary">
              <span>30 days ago</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-success-bg" />
                  <span>100%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-warning-bg" />
                  <span>95-99%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-danger-bg" />
                  <span>&lt;95%</span>
                </div>
              </div>
              <span>Today</span>
            </div>
          </div>
        )}

        {/* Last Incident */}
        {data.lastIncident && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-surface-secondary/50 border border-border-default">
            <AlertCircle className="h-4 w-4 text-warning-text mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">Last Incident</p>
              <p className="text-xs text-text-secondary">
                {data.lastIncident.toLocaleDateString()} at {data.lastIncident.toLocaleTimeString()}
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                Service experienced brief connectivity issues. All systems restored within 15 minutes.
              </p>
            </div>
          </div>
        )}

        {/* Current Status */}
        <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-success-bg/50 border border-success-border">
          <CheckCircle className="h-4 w-4 text-success-text" />
          <span className="text-sm font-medium text-success-text">
            All Systems Operational
          </span>
        </div>
      </CardContent>
    </Card>
  );
}