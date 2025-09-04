/**
 * Streamlined onboarding flow for new users
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Shield, Smartphone, Globe, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface OnboardingStep {
  id: string;
  title: { en: string; ne: string };
  description: { en: string; ne: string };
  icon: React.ReactNode;
  component?: React.ReactNode;
}

interface OnboardingFlowProps {
  language: 'en' | 'ne';
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingFlow({ language, onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: {
        en: 'Welcome to Veridity',
        ne: 'भेरिडिटीमा स्वागत'
      },
      description: {
        en: 'Create privacy-preserving digital identity proofs that protect your personal information while enabling seamless verification.',
        ne: 'व्यक्तिगत जानकारी संरक्षण गर्दै निर्बाध प्रमाणीकरण सक्षम गर्ने गोपनीयता-संरक्षित डिजिटल पहिचान प्रमाणहरू सिर्जना गर्नुहोस्।'
      },
      icon: <Shield className="h-8 w-8 text-blue-600" />
    },
    {
      id: 'how-it-works',
      title: {
        en: 'How Zero-Knowledge Proofs Work',
        ne: 'शून्य-ज्ञान प्रमाणहरू कसरी काम गर्छ'
      },
      description: {
        en: 'Prove you meet requirements (like being over 18) without revealing your actual birth date or other sensitive details.',
        ne: 'आफ्नो वास्तविक जन्म मिति वा अन्य संवेदनशील विवरणहरू प्रकट नगरी आवश्यकताहरू (जस्तै १८ वर्ष भन्दा माथि हुनु) पूरा गर्ने प्रमाण गर्नुहोस्।'
      },
      icon: <Globe className="h-8 w-8 text-green-600" />
    },
    {
      id: 'mobile-first',
      title: {
        en: 'Designed for Mobile',
        ne: 'मोबाइलको लागि डिजाइन गरिएको'
      },
      description: {
        en: 'Optimized for smartphones with touch-friendly interface, offline support, and works on slow internet connections.',
        ne: 'टच-मैत्री इन्टरफेस, अफलाइन समर्थन, र ढिलो इन्टरनेट जडानमा काम गर्ने स्मार्टफोनहरूको लागि अनुकूलित।'
      },
      icon: <Smartphone className="h-8 w-8 text-purple-600" />
    },
    {
      id: 'voice-navigation',
      title: {
        en: 'Voice Commands Available',
        ne: 'आवाज आदेशहरू उपलब्ध'
      },
      description: {
        en: 'Control the app with voice commands in both English and Nepali. Perfect for accessibility and hands-free operation.',
        ne: 'अंग्रेजी र नेपाली दुवैमा आवाज आदेशहरूको साथ एप नियन्त्रण गर्नुहोस्। पहुँच र हात-मुक्त सञ्चालनको लागि उत्तम।'
      },
      icon: <Mic className="h-8 w-8 text-orange-600" />
    }
  ];

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const goNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const goPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    // Mark onboarding as skipped
    localStorage.setItem('veridity-onboarding-skipped', 'true');
    onSkip();
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold">
                {language === 'en' ? 'Getting Started' : 'सुरुवात गर्दै'}
              </h1>
              <Badge variant="secondary">
                {currentStep + 1} / {totalSteps}
              </Badge>
            </div>
            
            <Button
              variant="ghost"
              onClick={skipOnboarding}
              data-testid="skip-onboarding"
            >
              {language === 'en' ? 'Skip' : 'छोड्नुहोस्'}
            </Button>
          </div>
          
          <Progress value={progress} className="mt-3" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 min-h-[calc(100vh-200px)] flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Card className="mx-auto">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {currentStepData.icon}
                </div>
                <CardTitle className="text-2xl mb-2">
                  {currentStepData.title[language]}
                </CardTitle>
                <p className="text-muted-foreground text-base leading-relaxed">
                  {currentStepData.description[language]}
                </p>
              </CardHeader>

              {currentStepData.component && (
                <CardContent>
                  {currentStepData.component}
                </CardContent>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 bg-card border-t">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={goPrevious}
              disabled={currentStep === 0}
              data-testid="onboarding-previous"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {language === 'en' ? 'Previous' : 'पछिल्लो'}
            </Button>

            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-primary'
                      : completedSteps.has(index)
                      ? 'bg-green-500'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={goNext}
              data-testid="onboarding-next"
            >
              {isLastStep ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  {language === 'en' ? 'Get Started' : 'सुरु गर्नुहोस्'}
                </>
              ) : (
                <>
                  {language === 'en' ? 'Next' : 'अर्को'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to manage onboarding state
export function useOnboarding() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);

  useEffect(() => {
    const seen = localStorage.getItem('veridity-onboarding-completed') ||
                  localStorage.getItem('veridity-onboarding-skipped');
    setHasSeenOnboarding(!!seen);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('veridity-onboarding-completed', 'true');
    setHasSeenOnboarding(true);
  };

  const skipOnboarding = () => {
    localStorage.setItem('veridity-onboarding-skipped', 'true');
    setHasSeenOnboarding(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('veridity-onboarding-completed');
    localStorage.removeItem('veridity-onboarding-skipped');
    setHasSeenOnboarding(false);
  };

  return {
    hasSeenOnboarding,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding
  };
}