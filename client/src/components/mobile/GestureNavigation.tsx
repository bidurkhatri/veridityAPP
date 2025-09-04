/**
 * Gesture-Based Navigation and Voice Commands for Veridity Mobile
 * Optimized for one-handed usage and accessibility
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface GestureConfig {
  swipeThreshold: number;
  velocityThreshold: number;
  maxTime: number;
}

interface VoiceCommand {
  command: string;
  action: () => void;
  nepali: string;
  english: string;
}

export function GestureNavigation({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { t, language } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [lastSpoken, setLastSpoken] = useState<string>('');
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Gesture configuration
  const gestureConfig: GestureConfig = {
    swipeThreshold: 100, // minimum distance for swipe
    velocityThreshold: 0.3, // minimum velocity
    maxTime: 1000 // maximum time for gesture
  };

  // Voice commands in both languages
  const voiceCommands: VoiceCommand[] = [
    {
      command: 'generate|बनाउनुहोस्|proof|प्रमाण',
      action: () => setLocation('/generate'),
      nepali: 'प्रमाण बनाउनुहोस्',
      english: 'Generate proof'
    },
    {
      command: 'verify|प्रमाणीकरण|check|जाँच',
      action: () => setLocation('/verify'),
      nepali: 'प्रमाणीकरण गर्नुहोस्',
      english: 'Verify proof'
    },
    {
      command: 'home|dashboard|ड्यासबोर्ड|घर',
      action: () => setLocation('/'),
      nepali: 'घर जानुहोस्',
      english: 'Go home'
    },
    {
      command: 'settings|सेटिङ|preferences|प्राथमिकता',
      action: () => setLocation('/settings'),
      nepali: 'सेटिङ खोल्नुहोस्',
      english: 'Open settings'
    },
    {
      command: 'help|सहायता|support|समर्थन',
      action: () => setLocation('/help'),
      nepali: 'सहायता पाउनुहोस्',
      english: 'Get help'
    }
  ];

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'np' ? 'ne-NP' : 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        setLastSpoken(transcript);
        handleVoiceCommand(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      (window as any).speechRecognition = recognition;
    }
  }, [language]);

  const handleVoiceCommand = (transcript: string) => {
    const matchedCommand = voiceCommands.find(cmd => {
      const regex = new RegExp(cmd.command, 'i');
      return regex.test(transcript);
    });

    if (matchedCommand) {
      // Provide haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
      
      // Speak confirmation
      speakConfirmation(matchedCommand);
      
      // Execute command
      setTimeout(() => {
        matchedCommand.action();
      }, 500);
    } else {
      // Speak "command not recognized"
      const message = language === 'np' ? 'आदेश बुझिएन' : 'Command not recognized';
      speak(message);
    }
  };

  const speakConfirmation = (command: VoiceCommand) => {
    const message = language === 'np' 
      ? `${command.nepali} गर्दै...` 
      : `${command.english}...`;
    speak(message);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'np' ? 'ne-NP' : 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const startVoiceCommand = () => {
    if ('speechRecognition' in window || 'webkitSpeechRecognition' in window) {
      setIsListening(true);
      const recognition = (window as any).speechRecognition;
      recognition.start();
      
      // Provide audio prompt
      const prompt = language === 'np' ? 'आदेश दिनुहोस्...' : 'Say a command...';
      speak(prompt);
    }
  };

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const touchEnd = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    const deltaX = touchEnd.x - touchStartRef.current.x;
    const deltaY = touchEnd.y - touchStartRef.current.y;
    const deltaTime = touchEnd.time - touchStartRef.current.time;
    
    // Calculate distance and velocity
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;

    // Check if it's a valid swipe
    if (distance > gestureConfig.swipeThreshold && 
        velocity > gestureConfig.velocityThreshold &&
        deltaTime < gestureConfig.maxTime) {
      
      handleSwipeGesture(deltaX, deltaY);
    }

    touchStartRef.current = null;
  };

  const handleSwipeGesture = (deltaX: number, deltaY: number) => {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Determine swipe direction
    if (absX > absY) {
      // Horizontal swipe
      if (deltaX > 0) {
        // Swipe right - go back or to dashboard
        handleSwipeRight();
      } else {
        // Swipe left - forward navigation or quick actions
        handleSwipeLeft();
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        // Swipe down - refresh or notifications
        handleSwipeDown();
      } else {
        // Swipe up - quick generate proof
        handleSwipeUp();
      }
    }

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleSwipeRight = () => {
    // Go back or to dashboard
    const currentPath = window.location.pathname;
    if (currentPath !== '/') {
      setLocation('/');
      speak(language === 'np' ? 'घर फर्कियो' : 'Returned home');
    }
  };

  const handleSwipeLeft = () => {
    // Quick actions menu or forward navigation
    const currentPath = window.location.pathname;
    if (currentPath === '/') {
      setLocation('/generate');
      speak(language === 'np' ? 'प्रमाण बनाउने पेजमा गयो' : 'Navigated to generate proof');
    }
  };

  const handleSwipeDown = () => {
    // Refresh data or pull-to-refresh
    window.location.reload();
    speak(language === 'np' ? 'पुनः लोड गर्दै' : 'Refreshing');
  };

  const handleSwipeUp = () => {
    // Quick generate proof
    setLocation('/generate');
    speak(language === 'np' ? 'तुरुन्त प्रमाण बनाउनुहोस्' : 'Quick generate proof');
  };

  // Long press handler for context menu
  const handleLongPress = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    showContextMenu();
    
    if ('vibrate' in navigator) {
      navigator.vibrate(200); // Longer vibration for long press
    }
  };

  const showContextMenu = () => {
    // Show quick action context menu
    const actions = [
      { 
        label: language === 'np' ? 'प्रमाण बनाउनुहोस्' : 'Generate Proof',
        action: () => setLocation('/generate')
      },
      {
        label: language === 'np' ? 'प्रमाणीकरण गर्नुहोस्' : 'Verify Proof',
        action: () => setLocation('/verify')
      },
      {
        label: language === 'np' ? 'आवाज आदेश' : 'Voice Command',
        action: startVoiceCommand
      }
    ];

    // Create and show context menu (simplified for demo)
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 1000;
      padding: 8px;
    `;

    actions.forEach(action => {
      const button = document.createElement('button');
      button.textContent = action.label;
      button.style.cssText = `
        display: block;
        width: 100%;
        padding: 12px 16px;
        border: none;
        background: none;
        text-align: left;
        border-radius: 8px;
        margin: 2px 0;
        cursor: pointer;
      `;
      button.onclick = () => {
        action.action();
        document.body.removeChild(menu);
      };
      menu.appendChild(button);
    });

    document.body.appendChild(menu);

    // Remove menu after 5 seconds
    setTimeout(() => {
      if (document.body.contains(menu)) {
        document.body.removeChild(menu);
      }
    }, 5000);
  };

  return (
    <div
      ref={containerRef}
      className="gesture-container h-full"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={handleLongPress}
      style={{ 
        touchAction: 'pan-y', // Allow vertical scrolling but handle horizontal swipes
        userSelect: 'none' // Prevent text selection during gestures
      }}
    >
      {children}
      
      {/* Voice Command Indicator */}
      {isListening && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              {language === 'np' ? 'सुन्दै...' : 'Listening...'}
            </span>
          </div>
        </div>
      )}

      {/* Gesture Hints (show on first visit) */}
      <GestureHints />

      {/* Voice Command Button */}
      <button
        className="fixed bottom-20 right-4 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-40"
        onClick={startVoiceCommand}
        disabled={isListening}
        aria-label={t('voice.command')}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

// Component to show gesture hints to new users
function GestureHints() {
  const [showHints, setShowHints] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Check if user has seen hints before
    const hasSeenHints = localStorage.getItem('gesture-hints-seen');
    if (!hasSeenHints) {
      setShowHints(true);
    }
  }, []);

  const dismissHints = () => {
    setShowHints(false);
    localStorage.setItem('gesture-hints-seen', 'true');
  };

  if (!showHints) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-bold mb-4 text-center">
          {t('gesture.hints.title')}
        </h3>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              ←
            </div>
            <span className="text-sm">{t('gesture.swipeRight')}: {t('nav.dashboard')}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              →
            </div>
            <span className="text-sm">{t('gesture.swipeLeft')}: {t('proof.generate')}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              ↑
            </div>
            <span className="text-sm">{t('gesture.swipeUp')}: {t('proof.generate')}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              🎤
            </div>
            <span className="text-sm">{t('gesture.longPress')}: {t('voice.command')}</span>
          </div>
        </div>
        
        <button
          onClick={dismissHints}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium"
        >
          {t('button.gotIt')}
        </button>
      </div>
    </div>
  );
}