import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, User, Zap } from "lucide-react";

interface SupportQueue {
  id: string;
  name: string;
  activeChats: number;
  queueLength: number;
  averageWaitTime: number;
  sla: {
    target: number; // minutes
    current: number; // minutes
    status: 'good' | 'warning' | 'critical';
  };
}

interface SupportConsoleProps {
  queues: SupportQueue[];
  onOpenConsole?: () => void;
  className?: string;
}

const slaStatusConfig = {
  good: {
    color: 'text-success-text bg-success-bg border-success-border',
    label: 'On Track',
  },
  warning: {
    color: 'text-warning-text bg-warning-bg border-warning-border',
    label: 'At Risk',
  },
  critical: {
    color: 'text-danger-text bg-danger-bg border-danger-border',
    label: 'Critical',
  },
};

export function SupportConsole({ queues, onOpenConsole, className }: SupportConsoleProps) {
  const totalActiveChats = queues.reduce((sum, queue) => sum + queue.activeChats, 0);
  const totalInQueue = queues.reduce((sum, queue) => sum + queue.queueLength, 0);
  const averageWaitTime = queues.length > 0 
    ? queues.reduce((sum, queue) => sum + queue.averageWaitTime, 0) / queues.length
    : 0;

  const criticalQueues = queues.filter(queue => queue.sla.status === 'critical').length;

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Support Console
          </CardTitle>
          <Button
            onClick={onOpenConsole}
            className="flex items-center gap-2"
            data-testid="open-chat-console"
          >
            <Zap className="h-4 w-4" />
            Open Console
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overview Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-text-primary">
              {totalActiveChats}
            </div>
            <div className="text-xs text-text-tertiary">Active Chats</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-text-primary">
              {totalInQueue}
            </div>
            <div className="text-xs text-text-tertiary">In Queue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-text-primary">
              {Math.round(averageWaitTime)}m
            </div>
            <div className="text-xs text-text-tertiary">Avg Wait</div>
          </div>
          <div className="text-center">
            <div className={cn(
              "text-2xl font-semibold",
              criticalQueues > 0 ? "text-danger-text" : "text-success-text"
            )}>
              {criticalQueues}
            </div>
            <div className="text-xs text-text-tertiary">Critical</div>
          </div>
        </div>

        {/* Queue Details */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-text-primary">Queue Status</h4>
          
          {queues.map((queue) => {
            const slaConfig = slaStatusConfig[queue.sla.status];
            const slaPercentage = (queue.sla.current / queue.sla.target) * 100;

            return (
              <div
                key={queue.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border-default bg-surface-secondary/50"
                data-testid={`queue-${queue.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-medium text-text-primary">{queue.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-text-secondary">
                    <User className="h-3 w-3" />
                    <span>{queue.activeChats}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-text-secondary">
                    <Clock className="h-3 w-3" />
                    <span>{queue.queueLength}</span>
                  </div>
                  
                  <Badge className={cn("text-xs", slaConfig.color)}>
                    {slaConfig.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* SLA Overview */}
        <div className="pt-4 border-t border-border-default">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Overall SLA Performance</span>
            <span className="font-medium">
              {queues.filter(q => q.sla.status === 'good').length} / {queues.length} on track
            </span>
          </div>
          <div className="mt-2 w-full bg-surface-secondary rounded-full h-2">
            <div
              className="bg-success-bg h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(queues.filter(q => q.sla.status === 'good').length / queues.length) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            data-testid="escalate-critical"
          >
            <Zap className="h-3 w-3" />
            Escalate Critical
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            data-testid="view-analytics"
          >
            <MessageSquare className="h-3 w-3" />
            View Analytics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Mock data generator for development
export function generateMockSupportQueues(): SupportQueue[] {
  return [
    {
      id: 'general',
      name: 'General Support',
      activeChats: 12,
      queueLength: 5,
      averageWaitTime: 3.5,
      sla: {
        target: 5,
        current: 3.5,
        status: 'good',
      },
    },
    {
      id: 'technical',
      name: 'Technical Issues',
      activeChats: 8,
      queueLength: 12,
      averageWaitTime: 8.2,
      sla: {
        target: 10,
        current: 8.2,
        status: 'warning',
      },
    },
    {
      id: 'billing',
      name: 'Billing & Payments',
      activeChats: 3,
      queueLength: 2,
      averageWaitTime: 2.1,
      sla: {
        target: 3,
        current: 2.1,
        status: 'good',
      },
    },
    {
      id: 'enterprise',
      name: 'Enterprise Support',
      activeChats: 2,
      queueLength: 8,
      averageWaitTime: 15.3,
      sla: {
        target: 15,
        current: 15.3,
        status: 'critical',
      },
    },
  ];
}