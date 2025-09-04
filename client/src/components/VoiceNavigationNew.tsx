/**
 * Completely rewritten Voice Navigation with high-quality TTS/ASR and fixed language selector
 */

import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  Play,
  Pause,
  Headphones,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

import { Lang, langToBCP47 } from '@/lib/lang';
import { LanguageSegment } from '@/components/LanguageSegment';
import { ttsService, type TTSOptions } from '@/lib/tts';
import { asrService, type ASROptions } from '@/lib/asr';
import { detectIntent, getAvailableCommands } from '@/lib/intents';
import { useTranslation } from '@/lib/i18n';

interface VoiceSettings {
  enabled: boolean;
  lang: Lang;
  speechRate: number;
  speechVolume: number;
  confirmCommands: boolean;
}

interface VoiceNavigationProps {
  currentLanguage?: Lang;
  onLanguageChange?: (lang: Lang) => void;
}

export function VoiceNavigationNew({ 
  currentLanguage = 'en', 
  onLanguageChange 
}: VoiceNavigationProps) {
  const { t } = useTranslation(currentLanguage as any);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Voice system state - single source of truth
  const [settings, setSettings] = useState<VoiceSettings>({
    enabled: false,
    lang: currentLanguage,
    speechRate: 1.0,
    speechVolume: 0.8,
    confirmCommands: true
  });

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [lastTTSResult, setLastTTSResult] = useState<any>(null);

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('veridity-voice-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsed, lang: currentLanguage }));
      } catch (error) {
        console.error('Failed to parse saved voice settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('veridity-voice-settings', JSON.stringify(settings));
  }, [settings]);

  // Single source of truth: sync language across UI, TTS, and ASR
  useEffect(() => {
    if (settings.lang !== currentLanguage) {
      setSettings(prev => ({ ...prev, lang: currentLanguage }));
    }
    
    // Notify parent of language change
    if (onLanguageChange && settings.lang !== currentLanguage) {
      onLanguageChange(settings.lang);
    }
  }, [settings.lang, currentLanguage, onLanguageChange]);

  // Check voice support on mount
  useEffect(() => {
    const supported = asrService.isSupported() && 'speechSynthesis' in window;
    setVoiceSupported(supported);
    
    if (!supported) {
      toast({
        title: 'Voice Features Limited',
        description: 'Your browser has limited voice support. Some features may not work.',
        variant: 'destructive'
      });
    }
  }, [toast]);

  /**
   * Handle language change from segmented control
   */
  const handleLanguageChange = (newLang: Lang) => {
    setSettings(prev => ({ ...prev, lang: newLang }));
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  /**
   * Process voice command using intent detection
   */
  const processVoiceCommand = async (text: string) => {
    const intent = detectIntent(text, settings.lang);
    
    if (intent) {
      setLastCommand(intent.description[settings.lang]);
      
      if (settings.confirmCommands) {
        const confirmText = settings.lang === 'ne' 
          ? `कार्यान्वयन गर्दै: ${intent.description.ne}`
          : `Executing: ${intent.description.en}`;
          
        await speak(confirmText);
        setTimeout(() => navigate(intent.action), 1000);
      } else {
        navigate(intent.action);
      }
      
      toast({
        title: 'Voice Command Executed',
        description: intent.description[settings.lang],
        duration: 2000
      });
    } else {
      const errorText = settings.lang === 'ne'
        ? 'माफ गर्नुहोस्, मैले त्यो आदेश बुझिन। मद्दतका लागि "मद्दत" भन्नुहोस्।'
        : 'Sorry, I didn\'t understand that command. Say "help" for available commands.';
      
      await speak(errorText);
      
      toast({
        title: 'Command Not Recognized',
        description: 'Try saying one of the available commands',
        variant: 'destructive'
      });
    }
  };

  /**
   * High-quality speech synthesis
   */
  const speak = async (text: string, options?: Partial<TTSOptions>) => {
    if (!settings.enabled) return;
    
    try {
      setIsSpeaking(true);
      
      const result = await ttsService.speak(text, {
        lang: settings.lang,
        rate: settings.speechRate,
        volume: settings.speechVolume,
        cache: true,
        ...options
      });
      
      setLastTTSResult(result);
      
      // Show fallback notice if needed
      if (result.fallbackUsed) {
        toast({
          title: settings.lang === 'ne' 
            ? 'नेपाली आवाज उपलब्ध छैन'
            : 'Nepali voice unavailable',
          description: settings.lang === 'ne'
            ? 'हिन्दी आवाज प्रयोग गरिएको छ'
            : 'Using Hindi voice as fallback',
          variant: 'default'
        });
      }
      
    } catch (error) {
      console.error('Speech synthesis failed:', error);
      toast({
        title: 'Speech Error',
        description: 'Failed to generate speech',
        variant: 'destructive'
      });
    } finally {
      setIsSpeaking(false);
    }
  };

  /**
   * Start voice recognition
   */
  const startListening = async () => {
    if (!voiceSupported || !settings.enabled) return;
    
    try {
      const hasPermission = await asrService.requestPermission();
      if (!hasPermission) {
        throw new Error('Microphone permission denied');
      }
      
      setIsListening(true);
      setTranscript('');
      
      const result = await asrService.recordAndTranscribe({
        lang: settings.lang,
        maxDuration: 10
      });
      
      setTranscript(result.text);
      
      if (result.text) {
        await processVoiceCommand(result.text);
      }
      
      // Show fallback notice if needed
      if (result.fallbackUsed) {
        toast({
          title: 'Language Fallback Used',
          description: `Recognition used ${result.usedLang} instead of ${langToBCP47[settings.lang]}`,
          variant: 'default'
        });
      }
      
    } catch (error: any) {
      console.error('Voice recognition failed:', error);
      
      let errorMsg = 'Voice recognition failed';
      if (error.message.includes('permission')) {
        errorMsg = 'Microphone permission required';
      } else if (error.message.includes('not supported')) {
        errorMsg = 'Voice recognition not supported in this browser';
      }
      
      toast({
        title: 'Recognition Error',
        description: errorMsg,
        variant: 'destructive'
      });
    } finally {
      setIsListening(false);
    }
  };

  /**
   * Stop listening
   */
  const stopListening = () => {
    setIsListening(false);
    asrService.cleanup();
  };

  /**
   * Test voice with sample text
   */
  const testVoice = async () => {
    const testText = settings.lang === 'ne'
      ? 'यो आवाज परीक्षण हो। म यसरी सुनिन्छु।'
      : 'This is a voice test. This is how I sound.';
    
    setIsTestingVoice(true);
    
    try {
      await speak(testText, { cache: false }); // Don't cache test audio
    } finally {
      setIsTestingVoice(false);
    }
  };

  const availableCommands = getAvailableCommands(settings.lang);

  return (
    <>
      {/* Main Voice Control Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <div className="flex flex-col items-end space-y-2">
          {/* Settings Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="rounded-full"
            data-testid="voice-settings-button"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* Main Voice Button */}
          <Button
            variant={isListening ? "destructive" : "default"}
            size="lg"
            onClick={isListening ? stopListening : startListening}
            disabled={!voiceSupported || !settings.enabled}
            className="rounded-full w-16 h-16 shadow-lg"
            data-testid="voice-button"
          >
            {isListening ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>

          {/* Speaking Indicator */}
          {isSpeaking && (
            <Badge variant="secondary" className="animate-pulse">
              <Volume2 className="h-3 w-3 mr-1" />
              Speaking
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Listening Feedback */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 left-4 right-24 z-50"
          >
            <Card className="border-primary/20 bg-primary/5">
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
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <Card className="bg-background border border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Headphones className="h-5 w-5" />
                      <span>Voice Settings</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSettings(false)}
                      data-testid="close-voice-settings"
                    >
                      ×
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Voice Navigation Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Voice Navigation</p>
                      <p className="text-xs text-muted-foreground">
                        Enable voice commands and speech feedback
                      </p>
                    </div>
                    <Switch
                      checked={settings.enabled}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, enabled: checked }))
                      }
                      data-testid="voice-enabled-switch"
                    />
                  </div>

                  {/* Language Selector - FIXED */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Language</label>
                    <LanguageSegment
                      value={settings.lang}
                      onChange={handleLanguageChange}
                      data-testid="language-segment"
                    />
                  </div>

                  {/* Speech Rate */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Speech Rate — {settings.speechRate.toFixed(1)}×
                    </label>
                    <Slider
                      value={[settings.speechRate]}
                      onValueChange={([value]) => 
                        setSettings(prev => ({ ...prev, speechRate: value }))
                      }
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                      data-testid="speech-rate-slider"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Slow</span>
                      <span>Fast</span>
                    </div>
                  </div>

                  {/* Available Commands */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Available Commands</p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {availableCommands.map((cmd, index) => (
                        <div key={index} className="text-xs p-2 bg-background border rounded">
                          <p className="font-medium">• {cmd.command}</p>
                          <p className="text-muted-foreground ml-2">— {cmd.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Test Voice & Quality Info */}
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={testVoice}
                        disabled={isTestingVoice || !settings.enabled}
                        className="flex-1"
                        data-testid="test-voice-button"
                      >
                        {isTestingVoice ? (
                          <Pause className="h-4 w-4 mr-2" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        Test Voice
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => ttsService.clearCache()}
                        className="flex-1"
                        data-testid="clear-cache-button"
                      >
                        Clear Cache
                      </Button>
                    </div>
                    
                    {/* Voice Quality Status */}
                    {lastTTSResult && (
                      <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded">
                        <div className="flex items-center space-x-1 mb-1">
                          {lastTTSResult.fallbackUsed ? (
                            <AlertCircle className="h-3 w-3 text-orange-500" />
                          ) : (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                          <span>
                            Provider: {lastTTSResult.provider} 
                            {lastTTSResult.cached && ' (cached)'}
                          </span>
                        </div>
                        <div>Language: {lastTTSResult.usedLang}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}