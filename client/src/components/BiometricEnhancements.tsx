/**
 * Enhanced biometric authentication with better UX
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Eye, Smartphone, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BiometricEnhancementsProps {
  onSuccess: (credential: any) => void;
  onError: (error: string) => void;
  language: 'en' | 'ne';
}

export function BiometricEnhancements({ onSuccess, onError, language }: BiometricEnhancementsProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  useEffect(() => {
    // Check WebAuthn support
    const checkSupport = async () => {
      const supported = !!(window.PublicKeyCredential && 
                          await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());
      setIsSupported(supported);
    };
    
    checkSupport();
  }, []);

  const labels = {
    en: {
      title: 'Biometric Authentication',
      subtitle: 'Secure your account with fingerprint or face recognition',
      notSupported: 'Biometric authentication is not supported on this device',
      steps: {
        preparing: 'Preparing biometric registration...',
        generating: 'Generating secure credentials...',
        authenticating: 'Authenticating with device...',
        completing: 'Completing registration...'
      },
      register: 'Register Biometric',
      authenticate: 'Authenticate',
      tryAgain: 'Try Again'
    },
    ne: {
      title: 'बायोमेट्रिक प्रमाणीकरण',
      subtitle: 'फिंगरप्रिन्ट वा अनुहार पहिचानको साथ आफ्नो खाता सुरक्षित गर्नुहोस्',
      notSupported: 'यो यन्त्रमा बायोमेट्रिक प्रमाणीकरण समर्थित छैन',
      steps: {
        preparing: 'बायोमेट्रिक दर्ता तयार गर्दै...',
        generating: 'सुरक्षित प्रमाणहरू उत्पादन गर्दै...',
        authenticating: 'यन्त्रसँग प्रमाणीकरण गर्दै...',
        completing: 'दर्ता पूरा गर्दै...'
      },
      register: 'बायोमेट्रिक दर्ता गर्नुहोस्',
      authenticate: 'प्रमाणीकरण गर्नुहोस्',
      tryAgain: 'फेरि प्रयास गर्नुहोस्'
    }
  };

  const t = labels[language];

  const simulateRegistrationProgress = () => {
    const steps = Object.values(t.steps);
    let stepIndex = 0;
    
    const interval = setInterval(() => {
      setProgress((stepIndex + 1) * 25);
      setCurrentStep(steps[stepIndex]);
      stepIndex++;
      
      if (stepIndex >= steps.length) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setIsRegistering(false);
          setProgress(0);
          setCurrentStep('');
          // Simulate success
          onSuccess({ id: 'mock-credential' });
        }, 500);
      }
    }, 1000);
  };

  const handleRegister = async () => {
    setIsRegistering(true);
    setProgress(0);
    
    try {
      // For demo purposes, simulate the registration process
      simulateRegistrationProgress();
      
      // Real implementation would call WebAuthn APIs
      /*
      const response = await fetch('/api/biometric/register/challenge', {
        method: 'POST'
      });
      
      const challenge = await response.json();
      
      const credential = await navigator.credentials.create({
        publicKey: challenge
      });
      
      onSuccess(credential);
      */
      
    } catch (error) {
      setIsRegistering(false);
      setProgress(0);
      setCurrentStep('');
      onError(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  if (!isSupported) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{t.notSupported}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Fingerprint className="h-5 w-5" />
          <span>{t.title}</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t.subtitle}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Available Methods */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            className="flex flex-col items-center p-4 border rounded-lg cursor-pointer hover:bg-accent"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Fingerprint className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-xs font-medium">Fingerprint</span>
          </motion.div>

          <motion.div
            className="flex flex-col items-center p-4 border rounded-lg cursor-pointer hover:bg-accent"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Eye className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-xs font-medium">Face ID</span>
          </motion.div>
        </div>

        {/* Registration Progress */}
        {isRegistering && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3"
          >
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{currentStep}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </motion.div>
        )}

        {/* Action Button */}
        <Button
          onClick={handleRegister}
          disabled={isRegistering}
          className="w-full"
          data-testid="biometric-register-button"
        >
          {isRegistering ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {language === 'en' ? 'Registering...' : 'दर्ता गर्दै...'}
            </>
          ) : (
            <>
              <Smartphone className="h-4 w-4 mr-2" />
              {t.register}
            </>
          )}
        </Button>

        {/* Security Note */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p>
              {language === 'en' 
                ? 'Your biometric data is stored securely on your device and never shared with Veridity or third parties.'
                : 'तपाईंको बायोमेट्रिक डेटा तपाईंको यन्त्रमा सुरक्षित रूपमा भण्डारण गरिएको छ र कहिल्यै भेरिडिटी वा तेस्रो पक्षहरूसँग साझा गरिएको छैन।'
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}