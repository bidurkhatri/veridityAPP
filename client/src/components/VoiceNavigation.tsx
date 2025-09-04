import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Headphones,
  Languages,
  Accessibility
} from "lucide-react";

interface VoiceCommand {
  phrase: string;
  action: () => void;
  description: string;
  category: 'navigation' | 'action' | 'accessibility';
}

interface VoiceSettings {
  enabled: boolean;
  language: 'en' | 'np';
  speechRate: number;
  speechVolume: number;
  micSensitivity: number;
  continuousListening: boolean;
  confirmCommands: boolean;
}

// Extended Window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceNavigationProps {
  currentLanguage?: 'en' | 'np';
  onLanguageChange?: (language: 'en' | 'np') => void;
}

export function VoiceNavigation({ currentLanguage = 'en', onLanguageChange }: VoiceNavigationProps = {}) {
  const { t } = useTranslation(currentLanguage);
  const [, navigate] = useLocation();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [recognition, setRecognition] = useState<any | null>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
  const [settings, setSettings] = useState<VoiceSettings>({
    enabled: false,
    language: currentLanguage,
    speechRate: 1.0,
    speechVolume: 1.0,
    micSensitivity: 0.8,
    continuousListening: false,
    confirmCommands: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const [transcript, setTranscript] = useState('');

  // Voice commands based on current language
  const getVoiceCommands = (): VoiceCommand[] => {
    if (settings.language === 'np') {
      return [
        {
          phrase: 'होम जानुहोस्',
          action: () => navigate('/'),
          description: 'होम पेजमा जानुहोस्',
          category: 'navigation'
        },
        {
          phrase: 'प्रमाण बनाउनुहोस्',
          action: () => navigate('/prove'),
          description: 'प्रमाण उत्पादन पेजमा जानुहोस्',
          category: 'navigation'
        },
        {
          phrase: 'प्रमाण साझा गर्नुहोस्',
          action: () => navigate('/share'),
          description: 'प्रमाण साझा पेजमा जानुहोस्',
          category: 'navigation'
        },
        {
          phrase: 'इतिहास हेर्नुहोस्',
          action: () => navigate('/history'),
          description: 'प्रमाण इतिहास हेर्नुहोस्',
          category: 'navigation'
        },
        {
          phrase: 'सेटिङ्स खोल्नुहोस्',
          action: () => navigate('/settings'),
          description: 'सेटिङ्स पेजमा जानुहोस्',
          category: 'navigation'
        },
        {
          phrase: 'पेज पढ्नुहोस्',
          action: () => readCurrentPage(),
          description: 'हालको पेजको सामग्री पढ्नुहोस्',
          category: 'accessibility'
        },
        {
          phrase: 'मद्दत गर्नुहोस्',
          action: () => speakHelp(),
          description: 'आवाज सहायता प्राप्त गर्नुहोस्',
          category: 'accessibility'
        },
        {
          phrase: 'बोल्न बन्द गर्नुहोस्',
          action: () => stopSpeaking(),
          description: 'पाठ-देखि-आवाज बन्द गर्नुहोस्',
          category: 'action'
        }
      ];
    } else {
      return [
        {
          phrase: 'go home',
          action: () => navigate('/'),
          description: 'Navigate to home page',
          category: 'navigation'
        },
        {
          phrase: 'generate proof',
          action: () => navigate('/prove'),
          description: 'Go to proof generation',
          category: 'navigation'
        },
        {
          phrase: 'share proof',
          action: () => navigate('/share'),
          description: 'Go to proof sharing',
          category: 'navigation'
        },
        {
          phrase: 'view history',
          action: () => navigate('/history'),
          description: 'Go to proof history',
          category: 'navigation'
        },
        {
          phrase: 'open settings',
          action: () => navigate('/settings'),
          description: 'Go to settings',
          category: 'navigation'
        },
        {
          phrase: 'read page',
          action: () => readCurrentPage(),
          description: 'Read current page content',
          category: 'accessibility'
        },
        {
          phrase: 'help me',
          action: () => speakHelp(),
          description: 'Get voice assistance',
          category: 'accessibility'
        },
        {
          phrase: 'stop speaking',
          action: () => stopSpeaking(),
          description: 'Stop text-to-speech',
          category: 'action'
        }
      ];
    }
  };

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = settings.language === 'np' ? 'ne-NP' : 'en-US';
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        
        setTranscript(transcript);
        
        if (event.results[event.results.length - 1].isFinal) {
          processVoiceCommand(transcript.toLowerCase().trim());
        }
      };
      
      setRecognition(recognition);
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      setSynthesis(window.speechSynthesis);
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('veridity-voice-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings({ ...parsed, language: currentLanguage });
    }
  }, [currentLanguage]);

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('veridity-voice-settings', JSON.stringify(settings));
    
    // Update recognition language when settings change
    if (recognition) {
      recognition.lang = settings.language === 'np' ? 'ne-NP' : 'en-US';
    }
  }, [settings, recognition]);

  // Update language when parent language changes
  useEffect(() => {
    setSettings(prev => ({ ...prev, language: currentLanguage }));
  }, [currentLanguage]);

  const processVoiceCommand = (transcript: string) => {
    const voiceCommands = getVoiceCommands();
    const command = voiceCommands.find(cmd => 
      transcript.includes(cmd.phrase) || 
      cmd.phrase.includes(transcript)
    );

    if (command) {
      setLastCommand(command.phrase);
      
      if (settings.confirmCommands) {
        const confirmText = settings.language === 'np' 
          ? `कार्यान्वयन गर्दै: ${command.description}`
          : `Executing ${command.description}`;
        speak(confirmText);
        setTimeout(() => command.action(), 1000);
      } else {
        command.action();
      }
    } else {
      const errorText = settings.language === 'np'
        ? "माफ गर्नुहोस्, मैले त्यो आदेश बुझिन। उपलब्ध आदेशहरूका लागि 'मद्दत गर्नुहोस्' भन्नुहोस्।"
        : "Sorry, I didn't understand that command. Say 'help me' for available commands.";
      speak(errorText);
    }
  };

  const speak = (text: string, interrupt: boolean = false) => {
    if (!synthesis || !settings.enabled) return;

    if (interrupt) {
      synthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.speechRate;
    utterance.volume = settings.speechVolume;
    utterance.lang = settings.language === 'np' ? 'ne-NP' : 'en-US';
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthesis.speak(utterance);
  };

  const startListening = async () => {
    if (recognition && settings.enabled) {
      try {
        // Request microphone permission first
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognition.start();
        console.log('Voice recognition started');
      } catch (error: any) {
        console.error('Error starting voice recognition:', error);
        if (error.name === 'NotAllowedError' || error.message === 'service-not-allowed') {
          const permissionText = settings.language === 'np'
            ? "कृपया माइक्रोफोन अनुमति दिनुहोस्। ब्राउजर सेटिङ्समा जानुहोस् र यो साइटका लागि माइक्रोफोन सक्षम पार्नुहोस्।"
            : "Please allow microphone access. Go to browser settings and enable microphone for this site.";
          speak(permissionText);
        } else {
          speak('Voice recognition is not available on this device or browser.');
        }
      }
    } else {
      console.warn('Voice recognition not available or not enabled');
      if (!recognition) {
        const errorText = settings.language === 'np'
          ? "यो ब्राउजरमा आवाज पहिचान समर्थित छैन।"
          : "Voice recognition is not supported on this browser.";
        speak(errorText);
      }
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const stopSpeaking = () => {
    if (synthesis) {
      synthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const readCurrentPage = () => {
    const pageContent = document.querySelector('main')?.textContent || 
                      document.body.textContent ||
                      'No readable content found on this page.';
    
    const cleanContent = pageContent
      .replace(/\s+/g, ' ')
      .slice(0, 500) + (pageContent.length > 500 ? '... Content truncated.' : '');
    
    speak(cleanContent);
  };

  const speakHelp = () => {
    const voiceCommands = getVoiceCommands();
    const helpText = settings.language === 'np'
      ? `उपलब्ध आवाज आदेशहरू: ${voiceCommands.map(cmd => cmd.phrase).join(', ')}। तपाईं "पेज पढ्नुहोस्" भनेर हालको सामग्री सुन्न सक्नुहुन्छ, वा "बोल्न बन्द गर्नुहोस्" भनेर रोक्न सक्नुहुन्छ।`
      : `Available voice commands: ${voiceCommands.map(cmd => cmd.phrase).join(', ')}. You can also say "read page" to hear the current content, or "stop speaking" to interrupt.`;
    speak(helpText);
  };

  const toggleVoiceNavigation = () => {
    const wasEnabled = settings.enabled;
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
    
    if (!wasEnabled) {
      // Check if speech recognition is available
      if (!recognition) {
        console.error('Speech recognition not available');
        const errorText = settings.language === 'np'
          ? "माफ गर्नुहोस्, यो ब्राउजरमा आवाज पहिचान उपलब्ध छैन।"
          : "Sorry, voice recognition is not available on this browser.";
        speak(errorText);
        return;
      }
      
      const enableText = settings.language === 'np'
        ? "आवाज नेभिगेसन सक्रिय गरियो। उपलब्ध आदेशहरूका लागि 'मद्दत गर्नुहोस्' भन्नुहोस्।"
        : "Voice navigation enabled. Say 'help me' for available commands.";
      speak(enableText);
    } else {
      stopSpeaking();
      stopListening();
    }
  };

  if (!settings.enabled) {
    return (
      <Button
        onClick={toggleVoiceNavigation}
        className="fixed bottom-24 right-4 z-50 rounded-full w-14 h-14 p-0 shadow-lg bg-accent hover:bg-accent/90 border-2 border-white"
        variant="default"
        aria-label="Enable voice navigation"
        data-testid="button-enable-voice"
      >
        <Accessibility className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <>
      {/* Voice Control Interface */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-24 right-4 z-50 space-y-2"
      >
        {/* Main Voice Button */}
        <motion.button
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-colors ${
            isListening 
              ? 'bg-destructive text-white animate-pulse' 
              : 'bg-primary text-white'
          }`}
          onClick={isListening ? stopListening : startListening}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={isListening ? "Stop listening" : "Start voice command"}
        >
          {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </motion.button>

        {/* Speaking Indicator */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-12 h-12 rounded-full bg-success text-white flex items-center justify-center shadow-lg"
              onClick={stopSpeaking}
              aria-label="Stop speaking"
            >
              <Volume2 className="h-5 w-5 animate-pulse" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Settings Button */}
        <motion.button
          className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center shadow-lg"
          onClick={() => setShowSettings(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Voice settings"
        >
          <Settings className="h-4 w-4" />
        </motion.button>
      </motion.div>

      {/* Live Transcript */}
      <AnimatePresence>
        {(isListening || transcript) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-48 left-4 right-20 z-50"
          >
            <Card className="apple-glass border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-3 h-3 bg-primary rounded-full"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Listening...</p>
                    <p className="text-xs text-muted-foreground">
                      {transcript || "Say a command"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Settings Modal */}
      <AnimatePresence>
        {showSettings && (
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
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Headphones className="h-5 w-5" />
                    <span>Voice Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Enable/Disable */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Voice Navigation</p>
                      <p className="text-xs text-muted-foreground">Enable voice commands</p>
                    </div>
                    <Button
                      variant={settings.enabled ? "default" : "outline"}
                      size="sm"
                      onClick={toggleVoiceNavigation}
                      className="apple-button"
                    >
                      {settings.enabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  {/* Language */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Language</label>
                    <div className="flex space-x-2">
                      <Button
                        variant={settings.language === 'en' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setSettings(prev => ({ ...prev, language: 'en' }));
                          onLanguageChange?.('en');
                        }}
                        className="flex-1 apple-button"
                      >
                        English
                      </Button>
                      <Button
                        variant={settings.language === 'np' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setSettings(prev => ({ ...prev, language: 'np' }));
                          onLanguageChange?.('np');
                        }}
                        className="flex-1 apple-button"
                      >
                        नेपाली
                      </Button>
                    </div>
                  </div>

                  {/* Speech Rate */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Speech Rate</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={settings.speechRate}
                      onChange={(e) => setSettings(prev => ({ ...prev, speechRate: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Slow</span>
                      <span>{settings.speechRate}x</span>
                      <span>Fast</span>
                    </div>
                  </div>

                  {/* Available Commands */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Available Commands</p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {getVoiceCommands().map((cmd, index) => (
                        <div key={index} className="text-xs p-2 bg-muted/10 rounded">
                          <p className="font-medium">"{cmd.phrase}"</p>
                          <p className="text-muted-foreground">{cmd.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Test Voice */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const testText = settings.language === 'np'
                          ? "आवाज नेभिगेसन परीक्षण। म यसरी सुनिन्छु।"
                          : "Voice navigation test. This is how I sound.";
                        speak(testText);
                      }}
                      className="flex-1 apple-button"
                      disabled={isSpeaking}
                    >
                      <Play className="h-3 w-3 mr-2" />
                      Test Voice
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={stopSpeaking}
                      className="apple-button"
                      disabled={!isSpeaking}
                    >
                      <Pause className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Close */}
                  <Button
                    onClick={() => setShowSettings(false)}
                    className="w-full apple-gradient apple-button border-0"
                  >
                    Done
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}