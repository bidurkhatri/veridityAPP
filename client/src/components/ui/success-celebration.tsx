import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Shield, Download, Share2, Eye } from "lucide-react";

interface SuccessCelebrationProps {
  title?: string;
  message?: string;
  proofType?: string;
  onViewProof?: () => void;
  onShareProof?: () => void;
  onDownloadProof?: () => void;
  className?: string;
  showAnimation?: boolean;
}

export function SuccessCelebration({
  title = "Proof Generated Successfully!",
  message = "Your zero-knowledge proof has been created and is ready to share",
  proofType = "identity",
  onViewProof,
  onShareProof,
  onDownloadProof,
  className,
  showAnimation = true,
}: SuccessCelebrationProps) {
  const [animationComplete, setAnimationComplete] = React.useState(!showAnimation);

  React.useEffect(() => {
    if (showAnimation) {
      const timer = setTimeout(() => {
        setAnimationComplete(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showAnimation]);

  return (
    <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
      <Card className="w-full max-w-md">
        <CardContent className="text-center space-y-6 p-8">
          {/* Animated Shield Check */}
          <div className="relative mx-auto w-24 h-24">
            {/* Shield Background */}
            <div className={cn(
              "absolute inset-0 rounded-full bg-success-bg/20 flex items-center justify-center",
              showAnimation && !animationComplete && "animate-pulse"
            )}>
              <div className={cn(
                "w-16 h-16 rounded-full bg-success-bg flex items-center justify-center",
                showAnimation && "animate-bounce"
              )}>
                <Shield className={cn(
                  "h-8 w-8 text-success-text",
                  showAnimation && !animationComplete && "animate-pulse"
                )} />
              </div>
            </div>

            {/* Check Mark with Burst Animation */}
            <div className={cn(
              "absolute -top-1 -right-1 w-8 h-8 bg-success-bg rounded-full flex items-center justify-center shadow-lg",
              showAnimation && animationComplete && "animate-ping"
            )}>
              <CheckCircle className="h-5 w-5 text-success-text" />
            </div>

            {/* Celebration Particles */}
            {showAnimation && animationComplete && (
              <div className="absolute inset-0">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "absolute w-1 h-1 bg-primary rounded-full",
                      "animate-ping"
                    )}
                    style={{
                      top: `${20 + Math.random() * 60}%`,
                      left: `${20 + Math.random() * 60}%`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.6s',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-text-primary">
              {title}
            </h2>
            <p className="text-text-secondary leading-relaxed">
              {message}
            </p>
          </div>

          {/* Proof Type Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary capitalize">
              {proofType} Verification
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onViewProof}
              className="w-full"
              size="lg"
              data-testid="view-proof-button"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Proof Details
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={onShareProof}
                data-testid="share-proof-button"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                onClick={onDownloadProof}
                data-testid="download-proof-button"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="text-xs text-text-tertiary bg-surface-secondary/50 p-3 rounded-lg">
            🔐 Your personal data remains private. Only the proof of verification is shared.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for managing success celebration state
export function useSuccessCelebration() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [proofData, setProofData] = React.useState<{
    type: string;
    id: string;
  } | null>(null);

  const showCelebration = React.useCallback((data: { type: string; id: string }) => {
    setProofData(data);
    setIsVisible(true);
  }, []);

  const hideCelebration = React.useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setProofData(null), 300); // Allow fade out animation
  }, []);

  return {
    isVisible,
    proofData,
    showCelebration,
    hideCelebration,
  };
}