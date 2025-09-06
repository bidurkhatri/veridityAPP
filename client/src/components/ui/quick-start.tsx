import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, QrCode, FileText, Play, Clock, CheckCircle } from "lucide-react";

interface QuickStartAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  estimatedTime?: string;
  difficulty?: 'easy' | 'medium' | 'advanced';
  completed?: boolean;
  onClick: () => void;
}

interface QuickStartProps {
  actions: QuickStartAction[];
  title?: string;
  subtitle?: string;
  className?: string;
}

const difficultyConfig = {
  easy: { label: 'Easy', color: 'text-success-text bg-success-bg border-success-border' },
  medium: { label: 'Medium', color: 'text-warning-text bg-warning-bg border-warning-border' },
  advanced: { label: 'Advanced', color: 'text-info-text bg-info-bg border-info-border' },
};

export function QuickStart({
  actions,
  title = "Quick Start",
  subtitle = "Get started with these essential actions",
  className,
}: QuickStartProps) {
  const completedCount = actions.filter(action => action.completed).length;
  const progressPercentage = actions.length > 0 ? (completedCount / actions.length) * 100 : 0;

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <p className="text-sm text-text-secondary mt-1">
              {subtitle}
            </p>
          </div>
          
          {actions.length > 0 && (
            <div className="text-right">
              <div className="text-sm font-medium text-text-primary">
                {completedCount} / {actions.length}
              </div>
              <div className="text-xs text-text-tertiary">
                {Math.round(progressPercentage)}% complete
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {actions.length > 0 && (
          <div className="w-full bg-surface-secondary rounded-full h-2 mt-3">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const difficulty = action.difficulty ? difficultyConfig[action.difficulty] : null;

          return (
            <div
              key={action.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
                action.completed 
                  ? "bg-success-bg/50 border-success-border/50" 
                  : "bg-surface-secondary/50 border-border-default hover:border-primary/30 hover:bg-surface-secondary"
              )}
              data-testid={`quick-start-${action.id}`}
            >
              {/* Step number or completed check */}
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium flex-shrink-0",
                action.completed
                  ? "bg-success-bg text-success-text"
                  : "bg-primary text-primary-foreground"
              )}>
                {action.completed ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Icon */}
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0",
                action.completed
                  ? "bg-success-bg text-success-text"
                  : "bg-primary/10 text-primary"
              )}>
                <Icon className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={cn(
                    "font-medium truncate",
                    action.completed ? "text-success-text" : "text-text-primary"
                  )}>
                    {action.title}
                  </h4>
                  
                  {difficulty && (
                    <Badge className={cn("text-xs", difficulty.color)}>
                      {difficulty.label}
                    </Badge>
                  )}
                  
                  {action.estimatedTime && (
                    <div className="flex items-center gap-1 text-xs text-text-tertiary">
                      <Clock className="h-3 w-3" />
                      {action.estimatedTime}
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-text-secondary leading-relaxed">
                  {action.description}
                </p>
              </div>

              {/* Action button */}
              <Button
                onClick={action.onClick}
                variant={action.completed ? "outline" : "default"}
                size="sm"
                className="flex-shrink-0"
                data-testid={`quick-start-action-${action.id}`}
              >
                {action.completed ? "Review" : "Start"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// Pre-configured quick start for Customer Portal
export function CustomerQuickStart() {
  const [completedActions, setCompletedActions] = React.useState<Set<string>>(new Set());

  const handleActionClick = (actionId: string) => {
    // Mark action as completed (in real app, this would be based on actual completion)
    setCompletedActions(prev => new Set([...prev, actionId]));
    
    // Route to appropriate page based on action
    switch (actionId) {
      case 'generate-proof':
        // Navigate to proof generation
        break;
      case 'scan-qr':
        // Open QR scanner
        break;
      case 'view-docs':
        // Open documentation
        break;
    }
  };

  const actions: QuickStartAction[] = [
    {
      id: 'generate-proof',
      title: 'Generate Your First Proof',
      description: 'Create a privacy-preserving proof to verify your identity attributes',
      icon: Shield,
      estimatedTime: '2-3 min',
      difficulty: 'easy',
      completed: completedActions.has('generate-proof'),
      onClick: () => handleActionClick('generate-proof'),
    },
    {
      id: 'scan-qr',
      title: 'Scan QR Code',
      description: 'Use your camera to verify proofs or share your credentials instantly',
      icon: QrCode,
      estimatedTime: '30 sec',
      difficulty: 'easy',
      completed: completedActions.has('scan-qr'),
      onClick: () => handleActionClick('scan-qr'),
    },
    {
      id: 'view-docs',
      title: 'View Documentation',
      description: 'Learn how zero-knowledge proofs protect your privacy',
      icon: FileText,
      estimatedTime: '5 min',
      difficulty: 'medium',
      completed: completedActions.has('view-docs'),
      onClick: () => handleActionClick('view-docs'),
    },
  ];

  return (
    <QuickStart
      actions={actions}
      title="Get Started"
      subtitle="Complete these steps to start using Veridity securely"
    />
  );
}