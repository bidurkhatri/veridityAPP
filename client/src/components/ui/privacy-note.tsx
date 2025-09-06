import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Info, ExternalLink, Lock, Eye } from "lucide-react";

interface PrivacyNoteProps {
  title?: string;
  level?: 'basic' | 'detailed' | 'technical';
  className?: string;
  showLearnMore?: boolean;
  onLearnMoreClick?: () => void;
  compact?: boolean;
}

const privacyContent = {
  basic: {
    title: "Your Privacy is Protected",
    description: "We use zero-knowledge proofs to verify your information without accessing your personal data.",
    details: [
      "Your personal information never leaves your device",
      "Only mathematical proof is shared, not your data",
      "Cryptographically secure and tamper-proof"
    ]
  },
  detailed: {
    title: "How Zero-Knowledge Proofs Protect You",
    description: "Advanced cryptography ensures your privacy while enabling secure verification.",
    details: [
      "Zero-knowledge proofs verify attributes without revealing them",
      "Your sensitive data is processed locally on your device",
      "Verifiers only see proof of validity, never actual data",
      "Built on battle-tested cryptographic protocols"
    ]
  },
  technical: {
    title: "Cryptographic Privacy Guarantees",
    description: "Technical implementation details of our privacy-preserving verification system.",
    details: [
      "zk-SNARKs provide computational soundness and zero-knowledge properties",
      "Trusted setup uses multi-party computation for security",
      "Proof generation happens client-side in secure enclave",
      "Public verification key enables trustless verification"
    ]
  }
};

export function PrivacyNote({
  title,
  level = 'basic',
  className,
  showLearnMore = true,
  onLearnMoreClick,
  compact = false,
}: PrivacyNoteProps) {
  const content = privacyContent[level];
  const displayTitle = title || content.title;

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-3 p-3 bg-success-bg/20 border border-success-border rounded-lg",
        className
      )}>
        <Shield className="h-5 w-5 text-success-text flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-success-text">
            Privacy Protected
          </p>
          <p className="text-xs text-text-secondary">
            Your data stays secure with zero-knowledge proofs
          </p>
        </div>
        {showLearnMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLearnMoreClick}
            className="text-success-text hover:bg-success-bg/30"
            data-testid="privacy-learn-more"
          >
            <Info className="h-3 w-3 mr-1" />
            Learn more
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={cn(
      "border-success-border/50 bg-success-bg/10",
      className
    )}>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-success-bg/50">
            <Shield className="h-5 w-5 text-success-text" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-success-text mb-1">
              {displayTitle}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {content.description}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 ml-11">
          {content.details.map((detail, index) => (
            <div key={index} className="flex items-start gap-2 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-success-text/60 mt-2 flex-shrink-0" />
              <span className="text-text-secondary">{detail}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 ml-11">
          {showLearnMore && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLearnMoreClick}
              className="text-success-text border-success-border hover:bg-success-bg/20"
              data-testid="privacy-learn-more-detailed"
            >
              <ExternalLink className="h-3 w-3 mr-2" />
              Learn more about ZK proofs
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="text-success-text hover:bg-success-bg/20"
            data-testid="whats-shared-button"
          >
            <Eye className="h-3 w-3 mr-2" />
            What's shared?
          </Button>
        </div>

        {/* Security Indicator */}
        <div className="flex items-center gap-2 ml-11 text-xs text-success-text/80">
          <Lock className="h-3 w-3" />
          <span>End-to-end privacy guaranteed</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Info modal content for "What's shared?" 
export function WhatsSharedInfo() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-success-text" />
        <h3 className="text-lg font-semibold">What Information is Shared?</h3>
      </div>

      <div className="space-y-4">
        <div className="p-3 bg-success-bg/20 rounded-lg border border-success-border">
          <h4 className="font-medium text-success-text mb-2">✓ What IS shared:</h4>
          <ul className="space-y-1 text-sm text-text-secondary">
            <li>• Mathematical proof that your claim is valid</li>
            <li>• Timestamp of when proof was generated</li>
            <li>• Type of verification performed</li>
            <li>• Public cryptographic signature</li>
          </ul>
        </div>

        <div className="p-3 bg-danger-bg/20 rounded-lg border border-danger-border">
          <h4 className="font-medium text-danger-text mb-2">✗ What is NOT shared:</h4>
          <ul className="space-y-1 text-sm text-text-secondary">
            <li>• Your actual personal data (age, income, etc.)</li>
            <li>• Documents or photos you uploaded</li>
            <li>• Your identity or contact information</li>
            <li>• Any specific values or details</li>
          </ul>
        </div>

        <div className="text-xs text-text-tertiary bg-surface-secondary p-3 rounded-lg">
          <strong>Example:</strong> If verifying your age is over 18, the verifier only sees "TRUE" - 
          they never see your actual age, birthday, or any documents.
        </div>
      </div>
    </div>
  );
}