/**
 * Voice feedback system for errors and notifications
 */

import { TTSService, TTSOptions } from './tts';

export type FeedbackType = 'error' | 'success' | 'warning' | 'info';

export interface VoiceFeedback {
  message: string;
  type: FeedbackType;
  priority: 'high' | 'medium' | 'low';
}

class VoiceFeedbackService {
  private tts: TTSService;
  private isEnabled: boolean = false;
  private language: 'en' | 'ne' = 'en';

  // Message templates for different types and languages
  private templates = {
    en: {
      error: {
        prefix: "Error: ",
        suffix: ". Please try again or ask for help."
      },
      success: {
        prefix: "Success: ",
        suffix: ". Action completed successfully."
      },
      warning: {
        prefix: "Warning: ",
        suffix: ". Please check your input."
      },
      info: {
        prefix: "Information: ",
        suffix: ""
      }
    },
    ne: {
      error: {
        prefix: "त्रुटि: ",
        suffix: ". कृपया फेरि प्रयास गर्नुहोस् वा सहायता मागुहोस्।"
      },
      success: {
        prefix: "सफल: ",
        suffix: ". कार्य सफलतापूर्वक पूरा भयो।"
      },
      warning: {
        prefix: "चेतावनी: ",
        suffix: ". कृपया आफ्नो इनपुट जाँच गर्नुहोस्।"
      },
      info: {
        prefix: "जानकारी: ",
        suffix: ""
      }
    }
  };

  // Common error messages in both languages
  private commonErrors = {
    en: {
      networkError: "Network connection failed. Please check your internet connection.",
      validationError: "Please check your input and try again.",
      permissionDenied: "Permission denied. Please check your settings.",
      notFound: "The requested item was not found.",
      serverError: "Server error occurred. Please try again later.",
      timeout: "The operation timed out. Please try again."
    },
    ne: {
      networkError: "नेटवर्क जडान असफल भयो। कृपया आफ्नो इन्टरनेट जडान जाँच गर्नुहोस्।",
      validationError: "कृपया आफ्नो इनपुट जाँच गरेर फेरि प्रयास गर्नुहोस्।",
      permissionDenied: "अनुमति अस्वीकार गरियो। कृपया आफ्ना सेटिङहरू जाँच गर्नुहोस्।",
      notFound: "अनुरोध गरिएको वस्तु फेला परेन।",
      serverError: "सर्भर त्रुटि भयो। कृपया पछि फेरि प्रयास गर्नुहोस्।",
      timeout: "अपरेसन समय समाप्त भयो। कृपया फेरि प्रयास गर्नुहोस्।"
    }
  };

  constructor() {
    this.tts = new TTSService();
    
    // Load settings from localStorage
    this.loadSettings();
  }

  private loadSettings() {
    const settings = localStorage.getItem('veridity-voice-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      this.isEnabled = parsed.feedbackEnabled ?? false;
      this.language = parsed.language ?? 'en';
    }
  }

  enable() {
    this.isEnabled = true;
    this.saveSettings();
  }

  disable() {
    this.isEnabled = false;
    this.saveSettings();
  }

  setLanguage(language: 'en' | 'ne') {
    this.language = language;
    this.saveSettings();
  }

  private saveSettings() {
    const settings = {
      feedbackEnabled: this.isEnabled,
      language: this.language
    };
    localStorage.setItem('veridity-voice-settings', JSON.stringify(settings));
  }

  async announceError(message: string, options?: { priority?: 'high' | 'medium' | 'low' }) {
    if (!this.isEnabled) return;

    const template = this.templates[this.language].error;
    const fullMessage = template.prefix + message + template.suffix;
    
    await this.tts.speak(fullMessage, { lang: this.language });
  }

  async announceSuccess(message: string) {
    if (!this.isEnabled) return;

    const template = this.templates[this.language].success;
    const fullMessage = template.prefix + message + template.suffix;
    
    await this.tts.speak(fullMessage, { lang: this.language });
  }

  async announceWarning(message: string) {
    if (!this.isEnabled) return;

    const template = this.templates[this.language].warning;
    const fullMessage = template.prefix + message + template.suffix;
    
    await this.tts.speak(fullMessage, { lang: this.language });
  }

  async announceInfo(message: string) {
    if (!this.isEnabled) return;

    const template = this.templates[this.language].info;
    const fullMessage = template.prefix + message + template.suffix;
    
    await this.tts.speak(fullMessage, { lang: this.language });
  }

  // Announce common errors
  async announceNetworkError() {
    const message = this.commonErrors[this.language].networkError;
    await this.announceError(message, { priority: 'high' });
  }

  async announceValidationError() {
    const message = this.commonErrors[this.language].validationError;
    await this.announceError(message, { priority: 'medium' });
  }

  async announcePermissionDenied() {
    const message = this.commonErrors[this.language].permissionDenied;
    await this.announceError(message, { priority: 'high' });
  }

  async announceNotFound() {
    const message = this.commonErrors[this.language].notFound;
    await this.announceError(message, { priority: 'medium' });
  }

  async announceServerError() {
    const message = this.commonErrors[this.language].serverError;
    await this.announceError(message, { priority: 'high' });
  }

  async announceTimeout() {
    const message = this.commonErrors[this.language].timeout;
    await this.announceError(message, { priority: 'medium' });
  }

  // Handle HTTP errors automatically
  async handleHttpError(error: any) {
    if (!this.isEnabled) return;

    if (error.status) {
      switch (error.status) {
        case 400:
          await this.announceValidationError();
          break;
        case 401:
        case 403:
          await this.announcePermissionDenied();
          break;
        case 404:
          await this.announceNotFound();
          break;
        case 408:
          await this.announceTimeout();
          break;
        case 500:
        case 502:
        case 503:
          await this.announceServerError();
          break;
        default:
          await this.announceError("An unexpected error occurred");
      }
    } else if (error.name === 'NetworkError') {
      await this.announceNetworkError();
    } else {
      await this.announceError(error.message || "An unknown error occurred");
    }
  }

  // Form validation feedback
  async announceFieldError(fieldName: string, error: string) {
    if (!this.isEnabled) return;

    const messages = {
      en: `${fieldName} error: ${error}`,
      ne: `${fieldName} त्रुटि: ${error}`
    };

    await this.announceError(messages[this.language], { priority: 'low' });
  }

  // Navigation feedback
  async announcePageChange(pageName: string) {
    if (!this.isEnabled) return;

    const messages = {
      en: `Navigated to ${pageName}`,
      ne: `${pageName} मा गएको`
    };

    await this.announceInfo(messages[this.language]);
  }

  // Proof generation feedback
  async announceProofGenerated(proofType: string) {
    if (!this.isEnabled) return;

    const messages = {
      en: `${proofType} proof generated successfully`,
      ne: `${proofType} प्रमाण सफलतापूर्वक उत्पन्न भयो`
    };

    await this.announceSuccess(messages[this.language]);
  }

  isVoiceFeedbackEnabled(): boolean {
    return this.isEnabled;
  }

  getCurrentLanguage(): 'en' | 'ne' {
    return this.language;
  }
}

// Global instance
export const voiceFeedback = new VoiceFeedbackService();

// Hook for components
export function useVoiceFeedback() {
  return {
    announceError: voiceFeedback.announceError.bind(voiceFeedback),
    announceSuccess: voiceFeedback.announceSuccess.bind(voiceFeedback),
    announceWarning: voiceFeedback.announceWarning.bind(voiceFeedback),
    announceInfo: voiceFeedback.announceInfo.bind(voiceFeedback),
    handleHttpError: voiceFeedback.handleHttpError.bind(voiceFeedback),
    announceFieldError: voiceFeedback.announceFieldError.bind(voiceFeedback),
    announcePageChange: voiceFeedback.announcePageChange.bind(voiceFeedback),
    announceProofGenerated: voiceFeedback.announceProofGenerated.bind(voiceFeedback),
    isEnabled: voiceFeedback.isVoiceFeedbackEnabled.bind(voiceFeedback),
    enable: voiceFeedback.enable.bind(voiceFeedback),
    disable: voiceFeedback.disable.bind(voiceFeedback),
    setLanguage: voiceFeedback.setLanguage.bind(voiceFeedback)
  };
}