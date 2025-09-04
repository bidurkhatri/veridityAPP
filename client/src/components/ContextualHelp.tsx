/**
 * Contextual help system with smart assistance
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Lightbulb, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HelpTip {
  id: string;
  title: { en: string; ne: string };
  content: { en: string; ne: string };
  trigger: string; // Page or component that triggers this tip
  priority: 'low' | 'medium' | 'high';
  showOnce?: boolean;
}

interface ContextualHelpProps {
  currentPage: string;
  language: 'en' | 'ne';
}

export function ContextualHelp({ currentPage, language }: ContextualHelpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTips, setCurrentTips] = useState<HelpTip[]>([]);
  const [shownTips, setShownTips] = useState<Set<string>>(new Set());

  // Help tips database
  const helpTips: HelpTip[] = [
    {
      id: 'proof-generation-intro',
      title: {
        en: 'Your First Identity Proof',
        ne: 'तपाईंको पहिलो पहिचान प्रमाण'
      },
      content: {
        en: 'Choose the type of proof you want to create. Your personal information stays private - only the proof that you meet the requirement is shared.',
        ne: 'तपाईंले सिर्जना गर्न चाहनुभएको प्रमाणको प्रकार छान्नुहोस्। तपाईंको व्यक्तिगत जानकारी निजी रहन्छ - केवल तपाईंले आवश्यकता पूरा गर्ने प्रमाण साझा गरिन्छ।'
      },
      trigger: '/proof-generation',
      priority: 'high',
      showOnce: true
    },
    {
      id: 'voice-commands-tip',
      title: {
        en: 'Try Voice Commands',
        ne: 'आवाज आदेशहरू प्रयास गर्नुहोस्'
      },
      content: {
        en: 'You can control Veridity with voice commands! Say "Help" to see all available commands or "Go home" to navigate.',
        ne: 'तपाईं आवाज आदेशहरूसँग भेरिडिटी नियन्त्रण गर्न सक्नुहुन्छ! सबै उपलब्ध आदेशहरू हेर्न "सहायता" भन्नुहोस् वा नेभिगेट गर्न "घर जानुहोस्" भन्नुहोस्।'
      },
      trigger: '/dashboard',
      priority: 'medium'
    },
    {
      id: 'qr-sharing-tip',
      title: {
        en: 'Share Proofs Securely',
        ne: 'प्रमाणहरू सुरक्षित रूपमा साझा गर्नुहोस्'
      },
      content: {
        en: 'Use QR codes to share your proofs instantly. The QR code contains only the proof, not your personal data.',
        ne: 'तपाईंका प्रमाणहरू तुरुन्तै साझा गर्न QR कोडहरू प्रयोग गर्नुहोस्। QR कोडमा केवल प्रमाण हुन्छ, तपाईंको व्यक्तिगत डेटा हुँदैन।'
      },
      trigger: '/proofs',
      priority: 'medium'
    },
    {
      id: 'offline-usage-tip',
      title: {
        en: 'Works Offline Too',
        ne: 'अफलाइनमा पनि काम गर्छ'
      },
      content: {
        en: 'You can view existing proofs and generate new ones even without internet. Changes will sync when you come back online.',
        ne: 'तपाईं इन्टरनेट बिना नै अवस्थित प्रमाणहरू हेर्न र नयाँहरू उत्पादन गर्न सक्नुहुन्छ। तपाईं अनलाइन आएपछि परिवर्तनहरू सिंक हुनेछन्।'
      },
      trigger: '/dashboard',
      priority: 'low'
    }
  ];

  // Load shown tips from storage
  useEffect(() => {
    const stored = localStorage.getItem('veridity-shown-tips');
    if (stored) {
      setShownTips(new Set(JSON.parse(stored)));
    }
  }, []);

  // Update tips when page changes
  useEffect(() => {
    const relevantTips = helpTips.filter(tip => {
      const isRelevant = tip.trigger === currentPage;
      const shouldShow = !tip.showOnce || !shownTips.has(tip.id);
      return isRelevant && shouldShow;
    });

    // Sort by priority
    relevantTips.sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });

    setCurrentTips(relevantTips);

    // Auto-show high priority tips
    if (relevantTips.some(tip => tip.priority === 'high')) {
      setIsOpen(true);
    }
  }, [currentPage, shownTips]);

  const markTipAsShown = (tipId: string) => {
    const newShownTips = new Set([...shownTips, tipId]);
    setShownTips(newShownTips);
    localStorage.setItem('veridity-shown-tips', JSON.stringify(Array.from(newShownTips)));
  };

  const dismissTip = (tipId: string) => {
    markTipAsShown(tipId);
    setCurrentTips(tips => tips.filter(tip => tip.id !== tipId));
    
    // Close if no more tips
    if (currentTips.length <= 1) {
      setIsOpen(false);
    }
  };

  const dismissAll = () => {
    currentTips.forEach(tip => markTipAsShown(tip.id));
    setCurrentTips([]);
    setIsOpen(false);
  };

  const labels = {
    en: {
      helpTitle: 'Helpful Tips',
      dismissAll: 'Dismiss All',
      gotIt: 'Got it',
      next: 'Next Tip'
    },
    ne: {
      helpTitle: 'उपयोगी सुझावहरू',
      dismissAll: 'सबै हटाउनुहोस्',
      gotIt: 'बुझें',
      next: 'अर्को सुझाव'
    }
  };

  const t = labels[language];

  if (currentTips.length === 0) {
    return null;
  }

  return (
    <>
      {/* Help Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-40 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="contextual-help-button"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>

      {/* Help Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed bottom-20 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]"
          >
            <Card className="shadow-xl border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center space-x-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    <span>{t.helpTitle}</span>
                  </CardTitle>
                  
                  <div className="flex items-center space-x-1">
                    <Badge variant="secondary" className="text-xs">
                      {currentTips.length}
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      data-testid="close-help"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {currentTips.slice(0, 2).map((tip, index) => (
                  <motion.div
                    key={tip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-l-2 border-primary/20 pl-3"
                  >
                    <h4 className="font-medium text-sm mb-1">
                      {tip.title[language]}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                      {tip.content[language]}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <Badge 
                        variant={tip.priority === 'high' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {tip.priority}
                      </Badge>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissTip(tip.id)}
                        data-testid={`dismiss-tip-${tip.id}`}
                      >
                        {t.gotIt}
                      </Button>
                    </div>
                  </motion.div>
                ))}

                {currentTips.length > 2 && (
                  <div className="text-center pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={dismissAll}
                      data-testid="dismiss-all-tips"
                    >
                      {t.dismissAll}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Hook for contextual help management
export function useContextualHelp(currentPage: string) {
  const [hasNewTips, setHasNewTips] = useState(false);

  useEffect(() => {
    // Check if there are new tips for this page
    const stored = localStorage.getItem('veridity-shown-tips');
    const shownTips = stored ? new Set(JSON.parse(stored)) : new Set();
    
    // Simple check - this could be more sophisticated
    const pageTips = ['proof-generation-intro', 'voice-commands-tip'].filter(
      id => !shownTips.has(id)
    );
    
    setHasNewTips(pageTips.length > 0);
  }, [currentPage]);

  return {
    hasNewTips,
    markTipsSeen: () => setHasNewTips(false)
  };
}