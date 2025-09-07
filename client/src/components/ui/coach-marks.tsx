import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

interface CoachMark {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface CoachMarksProps {
  marks: CoachMark[];
  onComplete?: () => void;
  onSkip?: () => void;
  isVisible?: boolean;
}

export function CoachMarks({ marks, onComplete, onSkip, isVisible = true }: CoachMarksProps) {
  const [currentMark, setCurrentMark] = React.useState(0);
  const [isActive, setIsActive] = React.useState(isVisible);

  React.useEffect(() => {
    setIsActive(isVisible);
  }, [isVisible]);

  const handleNext = () => {
    if (currentMark < marks.length - 1) {
      setCurrentMark(currentMark + 1);
    } else {
      setIsActive(false);
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentMark > 0) {
      setCurrentMark(currentMark - 1);
    }
  };

  const handleSkip = () => {
    setIsActive(false);
    onSkip?.();
  };

  if (!isActive || marks.length === 0) {
    return null;
  }

  const mark = marks[currentMark];
  const isLast = currentMark === marks.length - 1;
  const isFirst = currentMark === 0;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" />
      
      {/* Coach Mark */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="pointer-events-auto w-full max-w-sm">
            <CardContent className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary">
                    {mark.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-text-tertiary">
                      {currentMark + 1} of {marks.length}
                    </span>
                    <div className="flex gap-1">
                      {marks.map((_, index) => (
                        <div
                          key={index}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            index === currentMark ? "bg-primary" : "bg-border-default"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  variant="quiet"
                  size="sm"
                  onClick={handleSkip}
                  className="p-1"
                  data-testid="coach-marks-close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <p className="text-text-secondary leading-relaxed">
                  {mark.description}
                </p>

                {mark.action && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={mark.action.onClick}
                    className="w-full"
                    data-testid={`coach-action-${mark.id}`}
                  >
                    {mark.action.label}
                  </Button>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="quiet"
                  size="sm"
                  onClick={handleSkip}
                  data-testid="coach-marks-skip"
                >
                  Skip tour
                </Button>

                <div className="flex items-center gap-2">
                  {!isFirst && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handlePrevious}
                      data-testid="coach-marks-previous"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleNext}
                    size="sm"
                    data-testid="coach-marks-next"
                  >
                    {isLast ? 'Done' : 'Next'}
                    {!isLast && <ChevronRight className="h-4 w-4 ml-1" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

// Hook for managing coach marks state
export function useCoachMarks(storageKey: string = 'veridity-coach-marks') {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasSeenMarks, setHasSeenMarks] = React.useState(false);

  React.useEffect(() => {
    const seen = localStorage.getItem(storageKey);
    const hasSeen = seen === 'true';
    setHasSeenMarks(hasSeen);
    
    // Show marks for first-time users after a delay
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const showCoachMarks = React.useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideCoachMarks = React.useCallback(() => {
    setIsVisible(false);
    localStorage.setItem(storageKey, 'true');
    setHasSeenMarks(true);
  }, [storageKey]);

  return {
    isVisible,
    hasSeenMarks,
    showCoachMarks,
    hideCoachMarks,
  };
}

// Pre-configured coach marks for Customer Portal
export function useCustomerPortalCoachMarks() {
  const coachMarks: CoachMark[] = [
    {
      id: 'welcome',
      title: 'Welcome to Veridity',
      description: 'Your privacy-first digital identity platform. Let\'s take a quick tour of the key features.',
      position: 'center',
    },
    {
      id: 'generate-proof',
      title: 'Generate Identity Proofs',
      description: 'Create zero-knowledge proofs to verify your identity attributes without revealing personal data.',
      position: 'center',
      action: {
        label: 'Try generating a proof',
        onClick: () => {
          // Navigate to proof generation
        },
      },
    },
    {
      id: 'scan-qr',
      title: 'Quick Verification',
      description: 'Scan QR codes to instantly verify proofs shared by others or verify your own.',
      position: 'center',
    },
    {
      id: 'history',
      title: 'Proof History',
      description: 'View all your generated proofs, their status, and export verification records.',
      position: 'center',
    },
    {
      id: 'privacy-first',
      title: 'Privacy Protected',
      description: 'All proofs are generated locally on your device. Your personal data never leaves your control.',
      position: 'center',
    },
  ];

  return coachMarks;
}