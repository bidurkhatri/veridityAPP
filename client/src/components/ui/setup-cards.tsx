import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, Clock, ArrowRight, Key, Shield } from "lucide-react";

interface SetupCard {
  id: string;
  title: string;
  description: string;
  progress: number; // 0-100
  status: 'not-started' | 'in-progress' | 'completed' | 'error';
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime?: string;
  onAction: () => void;
  actionLabel?: string;
  requirements?: string[];
}

interface SetupCardsProps {
  cards: SetupCard[];
  className?: string;
}

const statusConfig = {
  'not-started': {
    icon: Clock,
    color: 'text-text-tertiary bg-surface-secondary border-border-default',
    label: 'Not Started'
  },
  'in-progress': {
    icon: Clock,
    color: 'text-warning-text bg-warning-bg border-warning-border',
    label: 'In Progress'
  },
  'completed': {
    icon: CheckCircle,
    color: 'text-success-text bg-success-bg border-success-border',
    label: 'Completed'
  },
  'error': {
    icon: AlertTriangle,
    color: 'text-danger-text bg-danger-bg border-danger-border',
    label: 'Attention Required'
  }
};

const riskConfig = {
  low: { label: 'Low Risk', color: 'text-success-text bg-success-bg border-success-border' },
  medium: { label: 'Medium Risk', color: 'text-warning-text bg-warning-bg border-warning-border' },
  high: { label: 'High Risk', color: 'text-danger-text bg-danger-bg/50 border-danger-border' },
  critical: { label: 'Critical Risk', color: 'text-danger-text bg-danger-bg border-danger-border' }
};

export function SetupCards({ cards, className }: SetupCardsProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      {cards.map((card) => {
        const statusInfo = statusConfig[card.status];
        const riskInfo = card.riskLevel ? riskConfig[card.riskLevel] : null;
        const StatusIcon = statusInfo.icon;

        return (
          <Card
            key={card.id}
            className={cn(
              "transition-all duration-200 hover:shadow-md",
              card.status === 'error' && "border-danger-border/50"
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    {card.title}
                    {card.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-success-text" />
                    )}
                  </CardTitle>
                  <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                    {card.description}
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <Badge className={cn("text-xs", statusInfo.color)}>
                    {statusInfo.label}
                  </Badge>
                  {riskInfo && (
                    <Badge className={cn("text-xs", riskInfo.color)}>
                      {riskInfo.label}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Progress Bar */}
              {card.progress > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Progress</span>
                    <span className="font-medium">{card.progress}%</span>
                  </div>
                  <Progress value={card.progress} className="h-2" />
                </div>
              )}

              {/* Requirements */}
              {card.requirements && card.requirements.length > 0 && card.status !== 'completed' && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-text-primary">
                    Requirements:
                  </div>
                  <ul className="space-y-1">
                    {card.requirements.map((req, index) => (
                      <li
                        key={index}
                        className="text-xs text-text-secondary flex items-center gap-2"
                      >
                        <div className="w-1 h-1 bg-text-tertiary rounded-full flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Estimated Time */}
              {card.estimatedTime && card.status !== 'completed' && (
                <div className="text-xs text-text-tertiary">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Estimated time: {card.estimatedTime}
                </div>
              )}

              {/* Action Button */}
              <Button
                onClick={card.onAction}
                className="w-full"
                variant={card.status === 'completed' ? 'outline' : 'primary'}
                disabled={card.status === 'in-progress'}
                data-testid={`setup-card-action-${card.id}`}
              >
                {card.status === 'in-progress' ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : card.status === 'completed' ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {card.actionLabel || 'Review Setup'}
                  </>
                ) : (
                  <>
                    {card.actionLabel || 'Set Up Now'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Pre-configured setup cards for common security features
export function SecuritySetupCards() {
  const [passkeyProgress, setPasskeyProgress] = React.useState(0);
  const [recoveryProgress, setRecoveryProgress] = React.useState(0);

  const cards: SetupCard[] = [
    {
      id: 'passkey',
      title: 'Passkey Setup',
      description: 'Set up biometric authentication for secure, password-free access to your account.',
      progress: passkeyProgress,
      status: passkeyProgress === 100 ? 'completed' : passkeyProgress > 0 ? 'in-progress' : 'not-started',
      riskLevel: passkeyProgress === 0 ? 'high' : 'low',
      estimatedTime: '2-3 minutes',
      requirements: [
        'Device with biometric sensor (fingerprint, Face ID)',
        'Updated browser or mobile app',
        'Stable internet connection'
      ],
      onAction: () => {
        // Simulate setup process
        setPasskeyProgress(25);
        setTimeout(() => setPasskeyProgress(50), 1000);
        setTimeout(() => setPasskeyProgress(75), 2000);
        setTimeout(() => setPasskeyProgress(100), 3000);
      },
      actionLabel: passkeyProgress === 100 ? 'Manage Passkey' : 'Enable Passkey'
    },
    {
      id: 'recovery',
      title: 'Recovery Phrase',
      description: 'Generate and safely store your recovery phrase to regain access if you lose your device.',
      progress: recoveryProgress,
      status: recoveryProgress === 100 ? 'completed' : recoveryProgress > 0 ? 'in-progress' : 'not-started',
      riskLevel: recoveryProgress === 0 ? 'critical' : 'low',
      estimatedTime: '5-7 minutes',
      requirements: [
        'Secure place to write down recovery phrase',
        'Private environment without observers',
        'Pen and paper (recommended)'
      ],
      onAction: () => {
        // Simulate setup process
        setRecoveryProgress(20);
        setTimeout(() => setRecoveryProgress(40), 1500);
        setTimeout(() => setRecoveryProgress(60), 3000);
        setTimeout(() => setRecoveryProgress(80), 4500);
        setTimeout(() => setRecoveryProgress(100), 6000);
      },
      actionLabel: recoveryProgress === 100 ? 'View Recovery Options' : 'Generate Recovery Phrase'
    }
  ];

  return <SetupCards cards={cards} />;
}