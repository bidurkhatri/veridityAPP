import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Globe,
  Building,
  GraduationCap,
  Heart,
  Zap,
  X
} from "lucide-react";
import { CoachMarks, useCoachMarks, useCustomerPortalCoachMarks } from "@/components/ui/coach-marks";

interface OnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  content: React.ReactNode;
  animation?: string;
}

export function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const { t } = useTranslation('en');
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Coach marks integration
  const coachMarks = useCustomerPortalCoachMarks();
  const { isVisible: showCoachMarks, hideCoachMarks } = useCoachMarks('veridity-onboarding-coach-marks');

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Veridity',
      subtitle: 'Privacy-first digital identity for Nepal',
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-600 rounded-full flex items-center justify-center mx-auto apple-shadow animate-pulse">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Secure Digital Identity</h3>
            <p className="text-muted-foreground leading-relaxed">
              Prove who you are without revealing personal data. Built for Nepal's digital future.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Government Ready</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Bank Approved</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>University Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Privacy Protected</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'privacy',
      title: 'Your Data Stays Private',
      subtitle: 'Zero-knowledge proofs keep your information secure',
      content: (
        <div className="space-y-6">
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="text-center flex-1">
                <div className="w-16 h-16 bg-muted/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Smartphone className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">Your Device</p>
              </div>
              <div className="flex-1 flex justify-center">
                <ArrowRight className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <div className="text-center flex-1">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Building className="h-8 w-8 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">Verifier</p>
              </div>
            </div>
            
            <div className="bg-success/10 border border-success/20 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Eye className="h-5 w-5 text-success mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-success mb-1">What They See:</p>
                  <p className="text-muted-foreground">"✓ Age verified (18+)"</p>
                </div>
              </div>
            </div>
            
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mt-3">
              <div className="flex items-start space-x-3">
                <EyeOff className="h-5 w-5 text-destructive mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-destructive mb-1">What They Don't See:</p>
                  <p className="text-muted-foreground">Your exact birth date, address, or any personal data</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Lock className="h-3 w-3 mr-1" />
              Cryptographically Secured
            </Badge>
          </div>
        </div>
      )
    },
    {
      id: 'usecases',
      title: 'Real-World Use Cases',
      subtitle: 'How Veridity helps in everyday situations',
      content: (
        <div className="space-y-4">
          <div className="p-4 border border-border/20 rounded-xl hover:bg-muted/10 transition-colors">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Building className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Banking & Finance</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Open bank accounts, apply for loans, verify income without sharing sensitive documents
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 border border-border/20 rounded-xl hover:bg-muted/10 transition-colors">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Education & Jobs</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Apply to universities, verify degrees, prove qualifications for employment
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 border border-border/20 rounded-xl hover:bg-muted/10 transition-colors">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Healthcare & Services</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Access medical care, insurance claims, age-restricted services securely
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: 'Military-Grade Security',
      subtitle: 'Built with the same encryption that protects national secrets',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 border border-border/20 rounded-xl">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <p className="text-xs font-medium">Zero-Knowledge</p>
              <p className="text-xs text-muted-foreground">Proofs</p>
            </div>
            <div className="text-center p-3 border border-border/20 rounded-xl">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <p className="text-xs font-medium">End-to-End</p>
              <p className="text-xs text-muted-foreground">Encryption</p>
            </div>
            <div className="text-center p-3 border border-border/20 rounded-xl">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <p className="text-xs font-medium">Device-Only</p>
              <p className="text-xs text-muted-foreground">Processing</p>
            </div>
            <div className="text-center p-3 border border-border/20 rounded-xl">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <p className="text-xs font-medium">Global</p>
              <p className="text-xs text-muted-foreground">Standards</p>
            </div>
          </div>
          
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Zap className="h-5 w-5 text-accent mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-accent mb-1">Industry Leading</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Used by banks, governments, and universities worldwide. Audited by security experts.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'Ready to Get Started!',
      subtitle: 'Your secure digital identity awaits',
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-success to-emerald-500 rounded-full flex items-center justify-center mx-auto apple-shadow">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">You're All Set!</h3>
            <p className="text-muted-foreground leading-relaxed">
              Start generating your first proof and experience the future of digital identity.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Next Steps:</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>1. Generate your first age verification proof</p>
              <p>2. Share it securely with a QR code</p>
              <p>3. Set up backup for extra security</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <>
      {showCoachMarks && currentStep === steps.length - 1 && (
        <CoachMarks
          marks={coachMarks}
          onComplete={hideCoachMarks}
          onSkip={hideCoachMarks}
          isVisible={showCoachMarks}
        />
      )}
      <div className="fixed inset-0 bg-background/95 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md apple-card apple-glass border-0 apple-shadow">
        <CardHeader className="relative">
          <Button
            variant="quiet"
            size="sm"
            onClick={onSkip}
            className="absolute top-0 right-0 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="text-center">
            <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {currentStepData.subtitle}
            </p>
          </div>
          
          {/* Progress Indicators */}
          <div className="flex justify-center space-x-2 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-primary'
                    : index < currentStep
                    ? 'bg-success'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className={`transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
            {currentStepData.content}
          </div>
          
          <div className="flex justify-between items-center">
            <Button
              variant="quiet"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="apple-button"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="text-xs text-muted-foreground">
              {currentStep + 1} of {steps.length}
            </div>
            
            <Button
              onClick={nextStep}
              className="apple-gradient apple-button border-0"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              {currentStep !== steps.length - 1 && (
                <ArrowRight className="h-4 w-4 ml-2" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}