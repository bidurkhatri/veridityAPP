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

export function VoiceNavigation() {
  const { t } = useTranslation('en');
  const [, navigate] = useLocation();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
  const [settings, setSettings] = useState<VoiceSettings>({
    enabled: false,
    language: 'en',
    speechRate: 1.0,
    speechVolume: 1.0,
    micSensitivity: 0.8,
    continuousListening: false,
    confirmCommands: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const [transcript, setTranscript] = useState('');

  // Voice commands
  const voiceCommands: VoiceCommand[] = [
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
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
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
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('veridity-voice-settings', JSON.stringify(settings));
  }, [settings]);

  const processVoiceCommand = (transcript: string) => {
    const command = voiceCommands.find(cmd => 
      transcript.includes(cmd.phrase) || 
      cmd.phrase.includes(transcript)
    );

    if (command) {
      setLastCommand(command.phrase);
      
      if (settings.confirmCommands) {
        speak(`Executing ${command.description}`);
        setTimeout(() => command.action(), 1000);
      } else {
        command.action();
      }
    } else {
      speak("Sorry, I didn't understand that command. Say 'help me' for available commands.");
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

  const startListening = () => {
    if (recognition && settings.enabled) {
      recognition.start();
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
    const helpText = `Available voice commands: ${voiceCommands.map(cmd => cmd.phrase).join(', ')}. 
                     You can also say "read page" to hear the current content, or "stop speaking" to interrupt.`;
    speak(helpText);
  };

  const toggleVoiceNavigation = () => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
    
    if (!settings.enabled) {
      speak("Voice navigation enabled. Say 'help me' for available commands.");
    } else {
      stopSpeaking();
      stopListening();
    }
  };

  if (!settings.enabled) {
    return (
      <Button
        onClick={toggleVoiceNavigation}
        className="fixed bottom-32 left-4 z-40 rounded-full w-12 h-12 p-0 apple-shadow"
        variant="outline"
        aria-label="Enable voice navigation"
      >
        <Accessibility className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <>
      {/* Voice Control Interface */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-32 left-4 z-40 space-y-2"
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
            className="fixed bottom-56 left-4 right-4 z-40"
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
                        onClick={() => setSettings(prev => ({ ...prev, language: 'en' }))}
                        className="flex-1 apple-button"
                      >
                        English
                      </Button>
                      <Button
                        variant={settings.language === 'np' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSettings(prev => ({ ...prev, language: 'np' }))}
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
                      {voiceCommands.map((cmd, index) => (
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
                      onClick={() => speak("Voice navigation test. This is how I sound.")}
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