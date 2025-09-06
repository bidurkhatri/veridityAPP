/**
 * Voice command help overlay with bilingual support
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Volume2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface VoiceCommand {
  phrase: string;
  description: string;
  category: string;
}

interface VoiceHelpOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'ne';
}

export function VoiceHelpOverlay({ isOpen, onClose, language }: VoiceHelpOverlayProps) {
  const [currentPage, setCurrentPage] = useState(0);

  // Voice commands for both languages
  const commands = {
    en: [
      // Navigation
      { phrase: "Go home", description: "Navigate to dashboard", category: "navigation" },
      { phrase: "Show proofs", description: "View your identity proofs", category: "navigation" },
      { phrase: "Generate proof", description: "Create new proof", category: "navigation" },
      { phrase: "Settings", description: "Open settings page", category: "navigation" },
      { phrase: "Help", description: "Show help information", category: "navigation" },
      
      // Actions
      { phrase: "Create age proof", description: "Generate age verification proof", category: "proofs" },
      { phrase: "Create citizenship proof", description: "Generate citizenship proof", category: "proofs" },
      { phrase: "Scan QR code", description: "Open QR code scanner", category: "actions" },
      { phrase: "Share proof", description: "Share selected proof", category: "actions" },
      
      // Interface
      { phrase: "Switch to Nepali", description: "Change language to Nepali", category: "interface" },
      { phrase: "Dark mode", description: "Enable dark theme", category: "interface" },
      { phrase: "Light mode", description: "Enable light theme", category: "interface" },
      { phrase: "Read this", description: "Read current page content aloud", category: "interface" },
      { phrase: "Stop reading", description: "Stop text-to-speech", category: "interface" },
    ],
    ne: [
      // Navigation
      { phrase: "घर जानुहोस्", description: "डिशबोर्डमा जानुहोस्", category: "navigation" },
      { phrase: "प्रमाण देखाउनुहोस्", description: "तपाईंको पहिचान प्रमाणहरू हेर्नुहोस्", category: "navigation" },
      { phrase: "प्रमाण उत्पादन गर्नुहोस्", description: "नयाँ प्रमाण सिर्जना गर्नुहोस्", category: "navigation" },
      { phrase: "सेटिङहरू", description: "सेटिङ पृष्ठ खोल्नुहोस्", category: "navigation" },
      { phrase: "सहायता", description: "सहायता जानकारी देखाउनुहोस्", category: "navigation" },
      
      // Actions
      { phrase: "उमेर प्रमाण बनाउनुहोस्", description: "उमेर प्रमाणीकरण प्रमाण उत्पादन गर्नुहोस्", category: "proofs" },
      { phrase: "नागरिकता प्रमाण बनाउनुहोस्", description: "नागरिकता प्रमाण उत्पादन गर्नुहोस्", category: "proofs" },
      { phrase: "QR कोड स्क्यान गर्नुहोस्", description: "QR कोड स्क्यानर खोल्नुहोस्", category: "actions" },
      { phrase: "प्रमाण साझा गर्नुहोस्", description: "चयनित प्रमाण साझा गर्नुहोस्", category: "actions" },
      
      // Interface
      { phrase: "अंग्रेजीमा बदल्नुहोस्", description: "भाषा अंग्रेजीमा परिवर्तन गर्नुहोस्", category: "interface" },
      { phrase: "डार्क मोड", description: "डार्क थिम सक्षम गर्नुहोस्", category: "interface" },
      { phrase: "लाइट मोड", description: "लाइट थिम सक्षम गर्नुहोस्", category: "interface" },
      { phrase: "यो पढ्नुहोस्", description: "हालको पृष्ठ सामग्री ठूलो स्वरमा पढ्नुहोस्", category: "interface" },
      { phrase: "पढ्न रोक्नुहोस्", description: "टेक्स्ट-टु-स्पिच रोक्नुहोस्", category: "interface" },
    ]
  };

  const labels = {
    en: {
      title: "Voice Commands",
      subtitle: "Speak these commands to control Veridity",
      categories: {
        navigation: "Navigation",
        proofs: "Proof Generation",
        actions: "Actions",
        interface: "Interface"
      },
      tips: {
        title: "Voice Tips",
        items: [
          "Speak clearly and at normal pace",
          "Commands work in English and Nepali",
          "Use the microphone button to start listening",
          "Commands are case-insensitive"
        ]
      },
      close: "Close Help"
    },
    ne: {
      title: "आवाज आदेशहरू",
      subtitle: "भेरिडिटी नियन्त्रण गर्न यी आदेशहरू भन्नुहोस्",
      categories: {
        navigation: "नेभिगेसन",
        proofs: "प्रमाण उत्पादन",
        actions: "कार्यहरू",
        interface: "इन्टरफेस"
      },
      tips: {
        title: "आवाज सुझावहरू",
        items: [
          "स्पष्ट र सामान्य गतिमा बोल्नुहोस्",
          "आदेशहरू अंग्रेजी र नेपालीमा काम गर्छ",
          "सुन्न सुरु गर्न माइक्रोफोन बटन प्रयोग गर्नुहोस्",
          "आदेशहरू केस-संवेदनशील छैनन्"
        ]
      },
      close: "सहायता बन्द गर्नुहोस्"
    }
  };

  const t = labels[language];
  const voiceCommands = commands[language];

  // Group commands by category
  const groupedCommands = voiceCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, VoiceCommand[]>);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-2xl max-h-[80vh] overflow-auto"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Mic className="h-5 w-5" />
                    <span>{t.title}</span>
                  </CardTitle>
                  <p className="text-sm text-text-secondary mt-1">
                    {t.subtitle}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  data-testid="voice-help-close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Commands by category */}
                {Object.entries(groupedCommands).map(([category, cmds]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="font-medium text-sm text-text-tertiary uppercase tracking-wide">
                      {t.categories[category as keyof typeof t.categories]}
                    </h3>
                    <div className="space-y-2">
                      {cmds.map((cmd, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-surface-secondary/50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="font-mono text-xs">
                              "{cmd.phrase}"
                            </Badge>
                          </div>
                          <span className="text-sm text-text-tertiary">
                            {cmd.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <Separator />

                {/* Tips section */}
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center space-x-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>{t.tips.title}</span>
                  </h3>
                  <ul className="space-y-2">
                    {t.tips.items.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={onClose} data-testid="voice-help-done">
                    {t.close}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}