/**
 * Comprehensive Accessibility Enhancements for Veridity
 * Optimized for screen readers, high contrast, and motor accessibility
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  voiceAnnouncements: boolean;
  touchTargetSize: 'small' | 'medium' | 'large';
  fontSize: number;
  keyboardNavigation: boolean;
}

export function AccessibilityEnhancements() {
  const { t, language } = useTranslation();
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    screenReader: false,
    voiceAnnouncements: false,
    touchTargetSize: 'medium',
    fontSize: 16,
    keyboardNavigation: true
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Load saved accessibility settings
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Detect system preferences
    detectSystemPreferences();
    
    // Apply initial settings
    applyAccessibilitySettings(settings);

    // Keyboard shortcut to toggle accessibility panel (Alt + A)
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        setIsVisible(!isVisible);
        announceToScreenReader(
          language === 'np' ? 'पहुँच सेटिङ्स खोलियो' : 'Accessibility settings opened'
        );
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    applyAccessibilitySettings(settings);
    saveSettings(settings);
  }, [settings]);

  const detectSystemPreferences = () => {
    // Detect high contrast preference
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      updateSetting('highContrast', true);
    }

    // Detect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      updateSetting('reduceMotion', true);
    }

    // Detect large text preference
    if (window.matchMedia('(min-resolution: 192dpi)').matches) {
      updateSetting('largeText', true);
    }
  };

  const applyAccessibilitySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // High contrast mode
    if (newSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text mode
    if (newSettings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Reduce motion
    if (newSettings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Touch target size
    root.setAttribute('data-touch-size', newSettings.touchTargetSize);

    // Font size
    root.style.setProperty('--base-font-size', `${newSettings.fontSize}px`);

    // Screen reader optimizations
    if (newSettings.screenReader) {
      root.classList.add('screen-reader-mode');
    } else {
      root.classList.remove('screen-reader-mode');
    }
  };

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = (newSettings: AccessibilitySettings) => {
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
  };

  const announceToScreenReader = (message: string) => {
    if (settings.voiceAnnouncements && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = language === 'np' ? 'ne-NP' : 'en-US';
      utterance.rate = 0.8;
      utterance.volume = 0.7;
      speechSynthesis.speak(utterance);
    }

    // Also create ARIA live region announcement
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const handleQuickAccessToggle = (feature: string) => {
    switch (feature) {
      case 'highContrast':
        updateSetting('highContrast', !settings.highContrast);
        announceToScreenReader(
          language === 'np' ? 
            `उच्च कन्ट्रास्ट ${!settings.highContrast ? 'सक्रिय' : 'निष्क्रिय'} गरियो` :
            `High contrast ${!settings.highContrast ? 'enabled' : 'disabled'}`
        );
        break;
      case 'largeText':
        updateSetting('largeText', !settings.largeText);
        updateSetting('fontSize', !settings.largeText ? 20 : 16);
        announceToScreenReader(
          language === 'np' ? 
            `ठूलो पाठ ${!settings.largeText ? 'सक्रिय' : 'निष्क्रिय'} गरियो` :
            `Large text ${!settings.largeText ? 'enabled' : 'disabled'}`
        );
        break;
      case 'voice':
        updateSetting('voiceAnnouncements', !settings.voiceAnnouncements);
        announceToScreenReader(
          language === 'np' ? 
            `आवाज घोषणा ${!settings.voiceAnnouncements ? 'सक्रिय' : 'निष्क्रिय'} गरियो` :
            `Voice announcements ${!settings.voiceAnnouncements ? 'enabled' : 'disabled'}`
        );
        break;
    }
  };

  return (
    <>
      {/* Quick Access Toolbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black text-white text-center py-1 text-sm accessibility-toolbar">
        <div className="flex items-center justify-center gap-4 px-4">
          <span className="hidden sm:inline">
            {language === 'np' ? 'पहुँच:' : 'Accessibility:'}
          </span>
          
          <button
            className="px-2 py-1 rounded hover:bg-gray-700 focus:bg-gray-700"
            onClick={() => handleQuickAccessToggle('highContrast')}
            aria-label={language === 'np' ? 'उच्च कन्ट्रास्ट टगल गर्नुहोस्' : 'Toggle high contrast'}
          >
            🎨 {language === 'np' ? 'कन्ट्रास्ट' : 'Contrast'}
          </button>
          
          <button
            className="px-2 py-1 rounded hover:bg-gray-700 focus:bg-gray-700"
            onClick={() => handleQuickAccessToggle('largeText')}
            aria-label={language === 'np' ? 'ठूलो पाठ टगल गर्नुहोस्' : 'Toggle large text'}
          >
            🔍 {language === 'np' ? 'पाठ' : 'Text'}
          </button>
          
          <button
            className="px-2 py-1 rounded hover:bg-gray-700 focus:bg-gray-700"
            onClick={() => handleQuickAccessToggle('voice')}
            aria-label={language === 'np' ? 'आवाज घोषणा टगल गर्नुहोस्' : 'Toggle voice announcements'}
          >
            🔊 {language === 'np' ? 'आवाज' : 'Voice'}
          </button>
          
          <button
            className="px-2 py-1 rounded hover:bg-gray-700 focus:bg-gray-700"
            onClick={() => setIsVisible(!isVisible)}
            aria-label={language === 'np' ? 'पहुँच सेटिङ्स खोल्नुहोस्' : 'Open accessibility settings'}
          >
            ⚙️ {language === 'np' ? 'सेटिङ्स' : 'Settings'}
          </button>
          
          <span className="text-xs opacity-70">
            Alt+A
          </span>
        </div>
      </div>

      {/* Detailed Accessibility Panel */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {language === 'np' ? 'पहुँच सेटिङ्स' : 'Accessibility Settings'}
                </h2>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                  aria-label={language === 'np' ? 'बन्द गर्नुहोस्' : 'Close'}
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Visual Accessibility */}
                <section>
                  <h3 className="text-lg font-semibold mb-4">
                    👁️ {language === 'np' ? 'दृश्य पहुँच' : 'Visual Accessibility'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">
                          {language === 'np' ? 'उच्च कन्ट्रास्ट मोड' : 'High Contrast Mode'}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          {language === 'np' ? 'बेहतर दृश्यताको लागि' : 'For better visibility'}
                        </p>
                      </div>
                      <Switch
                        checked={settings.highContrast}
                        onCheckedChange={(checked) => updateSetting('highContrast', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">
                          {language === 'np' ? 'ठूलो पाठ' : 'Large Text'}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          {language === 'np' ? 'पढ्न सजिलो बनाउन' : 'Easier to read'}
                        </p>
                      </div>
                      <Switch
                        checked={settings.largeText}
                        onCheckedChange={(checked) => {
                          updateSetting('largeText', checked);
                          updateSetting('fontSize', checked ? 20 : 16);
                        }}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">
                        {language === 'np' ? 'फन्ट साइज' : 'Font Size'}: {settings.fontSize}px
                      </label>
                      <Slider
                        value={[settings.fontSize]}
                        onValueChange={(value) => updateSetting('fontSize', value[0])}
                        min={12}
                        max={24}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </section>

                {/* Motor Accessibility */}
                <section>
                  <h3 className="text-lg font-semibold mb-4">
                    ✋ {language === 'np' ? 'मोटर पहुँच' : 'Motor Accessibility'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        {language === 'np' ? 'टच टार्गेट साइज' : 'Touch Target Size'}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['small', 'medium', 'large'] as const).map((size) => (
                          <button
                            key={size}
                            onClick={() => updateSetting('touchTargetSize', size)}
                            className={`p-3 rounded border text-sm ${
                              settings.touchTargetSize === size
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:border-blue-300'
                            }`}
                          >
                            {size === 'small' && (language === 'np' ? 'सानो' : 'Small')}
                            {size === 'medium' && (language === 'np' ? 'मध्यम' : 'Medium')}
                            {size === 'large' && (language === 'np' ? 'ठूलो' : 'Large')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">
                          {language === 'np' ? 'गति कम गर्नुहोस्' : 'Reduce Motion'}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          {language === 'np' ? 'एनिमेसन र संक्रमण कम गर्नुहोस्' : 'Minimize animations and transitions'}
                        </p>
                      </div>
                      <Switch
                        checked={settings.reduceMotion}
                        onCheckedChange={(checked) => updateSetting('reduceMotion', checked)}
                      />
                    </div>
                  </div>
                </section>

                {/* Audio Accessibility */}
                <section>
                  <h3 className="text-lg font-semibold mb-4">
                    🔊 {language === 'np' ? 'अडियो पहुँच' : 'Audio Accessibility'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">
                          {language === 'np' ? 'आवाज घोषणा' : 'Voice Announcements'}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          {language === 'np' ? 'कार्यहरूको लागि बोली प्रतिक्रिया' : 'Spoken feedback for actions'}
                        </p>
                      </div>
                      <Switch
                        checked={settings.voiceAnnouncements}
                        onCheckedChange={(checked) => updateSetting('voiceAnnouncements', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">
                          {language === 'np' ? 'स्क्रिन रिडर अनुकूलन' : 'Screen Reader Optimization'}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          {language === 'np' ? 'स्क्रिन रिडरका लागि बेहतर समर्थन' : 'Enhanced support for screen readers'}
                        </p>
                      </div>
                      <Switch
                        checked={settings.screenReader}
                        onCheckedChange={(checked) => updateSetting('screenReader', checked)}
                      />
                    </div>
                  </div>
                </section>

                {/* Quick Actions */}
                <section>
                  <h3 className="text-lg font-semibold mb-4">
                    ⚡ {language === 'np' ? 'द्रुत कार्यहरू' : 'Quick Actions'}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Reset to defaults
                        const defaultSettings: AccessibilitySettings = {
                          highContrast: false,
                          largeText: false,
                          reduceMotion: false,
                          screenReader: false,
                          voiceAnnouncements: false,
                          touchTargetSize: 'medium',
                          fontSize: 16,
                          keyboardNavigation: true
                        };
                        setSettings(defaultSettings);
                        announceToScreenReader(
                          language === 'np' ? 'सेटिङ्स रिसेट गरियो' : 'Settings reset to defaults'
                        );
                      }}
                    >
                      {language === 'np' ? 'रिसेट गर्नुहोस्' : 'Reset to Defaults'}
                    </Button>

                    <Button
                      onClick={() => {
                        // Test voice announcement
                        announceToScreenReader(
                          language === 'np' ? 'आवाज परीक्षण सफल भयो' : 'Voice test successful'
                        );
                      }}
                    >
                      {language === 'np' ? 'आवाज परीक्षण' : 'Test Voice'}
                    </Button>
                  </div>
                </section>
              </div>

              <div className="mt-6 pt-4 border-t text-center">
                <p className="text-sm text-gray-500">
                  {language === 'np' 
                    ? 'कुनै पनि समस्याको लागि Alt+A थिच्नुहोस्'
                    : 'Press Alt+A anytime to access these settings'
                  }
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Screen Reader Only Content */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        <p>
          {language === 'np' 
            ? 'Veridity - तपाईंको गोपनीयता-प्रथम डिजिटल पहिचान प्लेटफर्म'
            : 'Veridity - Your privacy-first digital identity platform'
          }
        </p>
      </div>
    </>
  );
}

// Accessibility-aware loading component
export function AccessibleLoadingSpinner({ size = 'medium', label }: { 
  size?: 'small' | 'medium' | 'large'; 
  label?: string; 
}) {
  const { language } = useTranslation();
  
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const defaultLabel = language === 'np' ? 'लोड हुँदै...' : 'Loading...';

  return (
    <div 
      className="flex items-center justify-center"
      role="status" 
      aria-label={label || defaultLabel}
    >
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-blue-600 border-t-transparent`} />
      <span className="sr-only">{label || defaultLabel}</span>
    </div>
  );
}

// Skip navigation component
export function SkipNavigation() {
  const { language } = useTranslation();
  
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:z-50"
    >
      {language === 'np' ? 'मुख्य सामग्रीमा जानुहोस्' : 'Skip to main content'}
    </a>
  );
}