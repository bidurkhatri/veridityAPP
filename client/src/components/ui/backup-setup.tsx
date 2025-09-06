import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Download, 
  Copy, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Eye,
  EyeOff
} from "lucide-react";

interface BackupSetupProps {
  step?: 1 | 2;
  onComplete?: (step: number) => void;
  className?: string;
}

export function BackupSetup({ step = 1, onComplete, className }: BackupSetupProps) {
  const [currentStep, setCurrentStep] = React.useState(step);
  const [duration, setDuration] = React.useState<'3months' | '6months' | '1year' | 'never'>('6months');
  const [phraseRevealed, setPhraseRevealed] = React.useState(false);
  const [phraseConfirmed, setPhraseConfirmed] = React.useState(false);

  // Mock recovery phrase (in real app, this would be generated securely)
  const recoveryPhrase = [
    "mountain", "village", "secure", "harmony", "bright", "forest",
    "gentle", "river", "wisdom", "peace", "nature", "trust"
  ];

  const handleStepComplete = (stepNumber: number) => {
    if (stepNumber === 1 && duration) {
      setCurrentStep(2);
    } else if (stepNumber === 2 && phraseConfirmed) {
      onComplete?.(stepNumber);
    }
  };

  const copyPhrase = async () => {
    const phrase = recoveryPhrase.join(' ');
    try {
      await navigator.clipboard.writeText(phrase);
    } catch (err) {
      console.error('Failed to copy phrase');
    }
  };

  const downloadPhrase = () => {
    const phrase = recoveryPhrase.join(' ');
    const blob = new Blob([phrase], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'veridity-recovery-phrase.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (currentStep === 1) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Account Recovery Setup
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Step 1 of 2
            </Badge>
          </div>
          <Progress value={50} className="h-2" />
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-text-primary">
              Choose Recovery Duration
            </h3>
            <p className="text-text-secondary">
              Select how long your account recovery should remain valid
            </p>
          </div>

          {/* Duration Options */}
          <div className="grid gap-3">
            {[
              { 
                value: '3months', 
                label: '3 Months', 
                description: 'Good for temporary use',
                risk: 'low'
              },
              { 
                value: '6months', 
                label: '6 Months', 
                description: 'Recommended for most users',
                risk: 'low'
              },
              { 
                value: '1year', 
                label: '1 Year', 
                description: 'Long-term security',
                risk: 'medium'
              },
              { 
                value: 'never', 
                label: 'Never Expire', 
                description: 'Maximum security risk',
                risk: 'high'
              },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setDuration(option.value as any)}
                className={cn(
                  "w-full p-4 text-left rounded-lg border transition-all",
                  duration === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border-default hover:bg-surface-secondary/50"
                )}
                data-testid={`duration-${option.value}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2",
                        duration === option.value
                          ? "border-primary bg-primary"
                          : "border-border-default"
                      )}>
                        {duration === option.value && (
                          <div className="w-full h-full rounded-full bg-white scale-50" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-text-primary">
                          {option.label}
                        </h4>
                        <p className="text-sm text-text-secondary">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Badge className={cn(
                    "text-xs",
                    option.risk === 'low' ? "text-success-text bg-success-bg border-success-border" :
                    option.risk === 'medium' ? "text-warning-text bg-warning-bg border-warning-border" :
                    "text-danger-text bg-danger-bg border-danger-border"
                  )}>
                    {option.risk} risk
                  </Badge>
                </div>
              </button>
            ))}
          </div>

          <Button
            onClick={() => handleStepComplete(1)}
            disabled={!duration}
            className="w-full"
            size="lg"
            data-testid="continue-to-step2"
          >
            Continue to Recovery Phrase
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Save Recovery Phrase
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Step 2 of 2
          </Badge>
        </div>
        <Progress value={100} className="h-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-text-primary">
            Secure Your Recovery Phrase
          </h3>
          <p className="text-text-secondary">
            Store this phrase safely. You'll need it to recover your account.
          </p>
        </div>

        {/* Security Warning */}
        <div className="flex items-start gap-3 p-3 bg-warning-bg/20 border border-warning-border rounded-lg">
          <AlertTriangle className="h-5 w-5 text-warning-text flex-shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="font-medium text-warning-text">Important Security Notice</p>
            <p className="text-text-secondary">
              Never share this phrase. Anyone with access can control your account.
            </p>
          </div>
        </div>

        {/* Recovery Phrase */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-text-primary">Your Recovery Phrase</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPhraseRevealed(!phraseRevealed)}
              data-testid="toggle-phrase-visibility"
            >
              {phraseRevealed ? (
                <>
                  <EyeOff className="h-3 w-3 mr-2" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-2" />
                  Reveal
                </>
              )}
            </Button>
          </div>

          <div className={cn(
            "p-4 bg-surface-secondary border border-border-default rounded-lg",
            !phraseRevealed && "filter blur-sm select-none"
          )}>
            <div className="grid grid-cols-3 gap-3 text-sm font-mono">
              {recoveryPhrase.map((word, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-surface rounded border"
                >
                  <span className="text-text-tertiary text-xs w-6">
                    {index + 1}.
                  </span>
                  <span className="text-text-primary">{word}</span>
                </div>
              ))}
            </div>
          </div>

          {phraseRevealed && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyPhrase}
                className="flex-1"
                data-testid="copy-phrase"
              >
                <Copy className="h-3 w-3 mr-2" />
                Copy to Clipboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadPhrase}
                className="flex-1"
                data-testid="download-phrase"
              >
                <Download className="h-3 w-3 mr-2" />
                Download as File
              </Button>
            </div>
          )}
        </div>

        {/* Confirmation */}
        <div className="space-y-3">
          <button
            onClick={() => setPhraseConfirmed(!phraseConfirmed)}
            className="flex items-start gap-3 w-full p-3 text-left rounded-lg border border-border-default hover:bg-surface-secondary/50 transition-colors"
            data-testid="confirm-phrase-saved"
          >
            <div className={cn(
              "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
              phraseConfirmed
                ? "border-primary bg-primary"
                : "border-border-default"
            )}>
              {phraseConfirmed && (
                <CheckCircle className="h-3 w-3 text-white" />
              )}
            </div>
            <div>
              <p className="font-medium text-text-primary">
                I have safely stored my recovery phrase
              </p>
              <p className="text-sm text-text-secondary">
                I understand that losing this phrase means I cannot recover my account
              </p>
            </div>
          </button>
        </div>

        <Button
          onClick={() => handleStepComplete(2)}
          disabled={!phraseConfirmed || !phraseRevealed}
          className="w-full"
          size="lg"
          data-testid="complete-backup-setup"
        >
          Complete Backup Setup
        </Button>

        {/* Progress Indicator */}
        <div className="text-center text-xs text-text-tertiary">
          Recovery will expire: {duration === 'never' ? 'Never' : 
            new Date(Date.now() + (
              duration === '3months' ? 90 :
              duration === '6months' ? 180 : 365
            ) * 24 * 60 * 60 * 1000).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}