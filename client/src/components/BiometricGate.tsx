import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import {
  Fingerprint,
  Eye,
  Shield,
  Lock,
  Unlock,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Key
} from "lucide-react";

interface BiometricGateProps {
  isOpen: boolean;
  onAuthenticate: (success: boolean) => void;
  onClose: () => void;
  operation: string;
  level: 'standard' | 'high' | 'critical';
}

interface BiometricMethod {
  id: string;
  name: string;
  icon: React.ElementType;
  available: boolean;
  description: string;
  securityLevel: 'standard' | 'high' | 'critical';
}

export function BiometricGate({ isOpen, onAuthenticate, onClose, operation, level }: BiometricGateProps) {
  const { t } = useTranslation('en');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStep, setAuthStep] = useState<'select' | 'authenticate' | 'success' | 'error'>('select');
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  const biometricMethods: BiometricMethod[] = [
    {
      id: 'faceId',
      name: 'Face ID',
      icon: Eye,
      available: true,
      description: 'Use your face to authenticate',
      securityLevel: 'high'
    },
    {
      id: 'touchId',
      name: 'Touch ID',
      icon: Fingerprint,
      available: true,
      description: 'Use your fingerprint to authenticate',
      securityLevel: 'high'
    },
    {
      id: 'devicePin',
      name: 'Device PIN',
      icon: Key,
      available: true,
      description: 'Use your device PIN or password',
      securityLevel: 'standard'
    }
  ];

  const availableMethods = biometricMethods.filter(method => {
    if (level === 'critical') return method.securityLevel === 'high';
    if (level === 'high') return method.securityLevel !== 'standard';
    return method.available;
  });

  useEffect(() => {
    if (isOpen) {
      setAuthStep('select');
      setAttempts(0);
      setSelectedMethod('');
    }
  }, [isOpen]);

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setAuthStep('authenticate');
    performAuthentication(methodId);
  };

  const performAuthentication = async (methodId: string) => {
    setIsAuthenticating(true);
    
    try {
      let success = false;
      
      if (methodId === 'faceId' || methodId === 'touchId') {
        // WebAuthn API for biometric authentication
        if (window.PublicKeyCredential) {
          try {
            const credential = await navigator.credentials.get({
              publicKey: {
                challenge: new Uint8Array(32),
                allowCredentials: [],
                userVerification: "required",
                timeout: 60000,
              },
            });
            success = !!credential;
          } catch (error) {
            console.error('Biometric authentication failed:', error);
            success = false;
          }
        } else {
          // Fallback: simulate biometric check
          await new Promise(resolve => setTimeout(resolve, 2000));
          success = Math.random() > 0.2; // 80% success rate for demo
        }
      } else if (methodId === 'devicePin') {
        // Simulate PIN entry
        await new Promise(resolve => setTimeout(resolve, 1500));
        success = Math.random() > 0.1; // 90% success rate for PIN
      }

      if (success) {
        setAuthStep('success');
        setTimeout(() => {
          onAuthenticate(true);
          onClose();
        }, 1500);
      } else {
        setAttempts(prev => prev + 1);
        setAuthStep('error');
        
        if (attempts + 1 >= maxAttempts) {
          setTimeout(() => {
            onAuthenticate(false);
            onClose();
          }, 2000);
        } else {
          setTimeout(() => {
            setAuthStep('select');
          }, 2000);
        }
      }
    } catch (error) {
      setAuthStep('error');
      setAttempts(prev => prev + 1);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getLevelConfig = (level: string) => {
    switch (level) {
      case 'critical':
        return {
          color: 'text-destructive',
          bgColor: 'bg-destructive/10 border-destructive/20',
          title: 'Critical Security Check',
          description: 'This operation requires the highest level of authentication'
        };
      case 'high':
        return {
          color: 'text-warning',
          bgColor: 'bg-warning/10 border-warning/20',
          title: 'High Security Check',
          description: 'Enhanced authentication required for this operation'
        };
      default:
        return {
          color: 'text-primary',
          bgColor: 'bg-primary/10 border-primary/20',
          title: 'Security Check',
          description: 'Please authenticate to continue'
        };
    }
  };

  const levelConfig = getLevelConfig(level);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/95 backdrop-blur-lg z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md"
        >
          <Card className="apple-card apple-glass border-0 apple-shadow">
            <CardHeader className="text-center">
              <motion.div
                className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${levelConfig.bgColor}`}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Shield className={`h-8 w-8 ${levelConfig.color}`} />
              </motion.div>
              
              <CardTitle className="text-xl">{levelConfig.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {levelConfig.description}
              </p>
              
              <div className={`p-3 rounded-lg ${levelConfig.bgColor} mt-4`}>
                <p className="text-sm font-medium">Operation: {operation}</p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {authStep === 'select' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <h3 className="font-semibold text-center mb-4">Choose Authentication Method</h3>
                  
                  {availableMethods.map(method => {
                    const Icon = method.icon;
                    return (
                      <motion.button
                        key={method.id}
                        className="w-full p-4 border border-border/20 rounded-xl hover:bg-muted/10 transition-colors text-left"
                        onClick={() => handleMethodSelect(method.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{method.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {method.description}
                            </p>
                          </div>
                          <Badge variant={method.securityLevel === 'high' ? 'default' : 'secondary'} className="text-xs">
                            {method.securityLevel}
                          </Badge>
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}

              {authStep === 'authenticate' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6"
                >
                  <div className="relative">
                    <motion.div
                      className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-primary-600 rounded-full flex items-center justify-center"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        boxShadow: [
                          "0 0 0 0 rgba(20, 184, 166, 0.7)",
                          "0 0 0 20px rgba(20, 184, 166, 0)",
                          "0 0 0 0 rgba(20, 184, 166, 0)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {selectedMethod === 'faceId' && <Eye className="h-12 w-12 text-white" />}
                      {selectedMethod === 'touchId' && <Fingerprint className="h-12 w-12 text-white" />}
                      {selectedMethod === 'devicePin' && <Key className="h-12 w-12 text-white" />}
                    </motion.div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Authenticating...</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedMethod === 'faceId' && 'Look at your device camera'}
                      {selectedMethod === 'touchId' && 'Place your finger on the sensor'}
                      {selectedMethod === 'devicePin' && 'Enter your device PIN or password'}
                    </p>
                  </div>
                </motion.div>
              )}

              {authStep === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4"
                >
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-success to-emerald-500 rounded-full mx-auto flex items-center justify-center"
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.6 }}
                  >
                    <CheckCircle className="h-8 w-8 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-semibold text-success">Authenticated!</h3>
                    <p className="text-sm text-muted-foreground">Proceeding with operation...</p>
                  </div>
                </motion.div>
              )}

              {authStep === 'error' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-center space-y-4"
                >
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-destructive to-red-600 rounded-full mx-auto flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    <AlertTriangle className="h-8 w-8 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-semibold text-destructive">Authentication Failed</h3>
                    <p className="text-sm text-muted-foreground">
                      {attempts >= maxAttempts 
                        ? 'Too many failed attempts. Access denied.'
                        : `Please try again. ${maxAttempts - attempts} attempts remaining.`
                      }
                    </p>
                  </div>
                  
                  {attempts < maxAttempts && (
                    <Button
                      onClick={() => setAuthStep('select')}
                      className="apple-gradient apple-button border-0"
                    >
                      Try Again
                    </Button>
                  )}
                </motion.div>
              )}

              {/* Attempt Counter */}
              {attempts > 0 && authStep !== 'error' && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    {attempts}/{maxAttempts} attempts used
                  </p>
                </div>
              )}

              {/* Cancel Button */}
              {authStep === 'select' && (
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 apple-button"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}