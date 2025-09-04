/**
 * Production Internationalization Manager
 * Complete multi-language support for global expansion
 */

import winston from 'winston';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Configure i18n logger
const i18nLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/i18n.log' }),
    new winston.transports.Console()
  ]
});

export interface LanguageResource {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  region: string;
  translations: Record<string, string>;
  dateFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
    currency: string;
  };
  addressFormat: string[];
  phoneFormat: string;
  completeness: number; // percentage
}

export interface LocalizationContext {
  language: string;
  region: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  numberFormat: string;
}

export class InternationalizationManager {
  private languages: Map<string, LanguageResource> = new Map();
  private defaultLanguage = 'en';
  private fallbackChain: string[] = ['en'];
  private translationsPath: string;

  constructor() {
    this.translationsPath = join(process.cwd(), 'translations');
    this.initializeLanguages();
    this.loadTranslations();
  }

  /**
   * Initialize supported languages
   */
  private initializeLanguages(): void {
    const supportedLanguages: Omit<LanguageResource, 'translations'>[] = [
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        direction: 'ltr',
        region: 'US',
        dateFormat: 'MM/DD/YYYY',
        numberFormat: { decimal: '.', thousands: ',', currency: '$' },
        addressFormat: ['street', 'city', 'state', 'zipCode', 'country'],
        phoneFormat: '+1 (XXX) XXX-XXXX',
        completeness: 100
      },
      {
        code: 'ne',
        name: 'Nepali',
        nativeName: 'नेपाली',
        direction: 'ltr',
        region: 'NP',
        dateFormat: 'YYYY/MM/DD',
        numberFormat: { decimal: '.', thousands: ',', currency: 'रू' },
        addressFormat: ['street', 'city', 'district', 'province', 'country'],
        phoneFormat: '+977-XXX-XXX-XXXX',
        completeness: 95
      },
      {
        code: 'zh',
        name: 'Chinese (Simplified)',
        nativeName: '简体中文',
        direction: 'ltr',
        region: 'CN',
        dateFormat: 'YYYY年MM月DD日',
        numberFormat: { decimal: '.', thousands: ',', currency: '¥' },
        addressFormat: ['country', 'province', 'city', 'district', 'street'],
        phoneFormat: '+86 XXX XXXX XXXX',
        completeness: 90
      },
      {
        code: 'zh-tw',
        name: 'Chinese (Traditional)',
        nativeName: '繁體中文',
        direction: 'ltr',
        region: 'TW',
        dateFormat: 'YYYY年MM月DD日',
        numberFormat: { decimal: '.', thousands: ',', currency: 'NT$' },
        addressFormat: ['country', 'city', 'district', 'street'],
        phoneFormat: '+886 XXX XXX XXX',
        completeness: 85
      },
      {
        code: 'ko',
        name: 'Korean',
        nativeName: '한국어',
        direction: 'ltr',
        region: 'KR',
        dateFormat: 'YYYY년 MM월 DD일',
        numberFormat: { decimal: '.', thousands: ',', currency: '₩' },
        addressFormat: ['country', 'province', 'city', 'district', 'street'],
        phoneFormat: '+82 XX-XXXX-XXXX',
        completeness: 88
      },
      {
        code: 'ja',
        name: 'Japanese',
        nativeName: '日本語',
        direction: 'ltr',
        region: 'JP',
        dateFormat: 'YYYY年MM月DD日',
        numberFormat: { decimal: '.', thousands: ',', currency: '¥' },
        addressFormat: ['country', 'prefecture', 'city', 'street'],
        phoneFormat: '+81 XX-XXXX-XXXX',
        completeness: 92
      },
      {
        code: 'hi',
        name: 'Hindi',
        nativeName: 'हिन्दी',
        direction: 'ltr',
        region: 'IN',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: { decimal: '.', thousands: ',', currency: '₹' },
        addressFormat: ['street', 'city', 'state', 'pinCode', 'country'],
        phoneFormat: '+91 XXXXX XXXXX',
        completeness: 80
      },
      {
        code: 'th',
        name: 'Thai',
        nativeName: 'ไทย',
        direction: 'ltr',
        region: 'TH',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: { decimal: '.', thousands: ',', currency: '฿' },
        addressFormat: ['street', 'district', 'city', 'province', 'zipCode', 'country'],
        phoneFormat: '+66 XX XXX XXXX',
        completeness: 75
      },
      {
        code: 'vi',
        name: 'Vietnamese',
        nativeName: 'Tiếng Việt',
        direction: 'ltr',
        region: 'VN',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: { decimal: ',', thousands: '.', currency: '₫' },
        addressFormat: ['street', 'ward', 'district', 'city', 'country'],
        phoneFormat: '+84 XXX XXX XXXX',
        completeness: 70
      }
    ];

    supportedLanguages.forEach(lang => {
      const resource: LanguageResource = {
        ...lang,
        translations: {}
      };
      this.languages.set(lang.code, resource);
    });

    i18nLogger.info('Initialized languages', {
      languages: supportedLanguages.map(l => l.code),
      count: supportedLanguages.length
    });
  }

  /**
   * Load translations from files
   */
  private loadTranslations(): void {
    for (const [langCode, language] of this.languages) {
      try {
        const translationFile = join(this.translationsPath, `${langCode}.json`);
        
        if (existsSync(translationFile)) {
          const translations = JSON.parse(readFileSync(translationFile, 'utf8'));
          language.translations = translations;
          
          i18nLogger.info('Loaded translations', {
            language: langCode,
            keys: Object.keys(translations).length
          });
        } else {
          // Create default translations
          language.translations = this.getDefaultTranslations(langCode);
          i18nLogger.warn('Using default translations', { language: langCode });
        }

      } catch (error) {
        i18nLogger.error('Failed to load translations', {
          language: langCode,
          error: error.message
        });
        language.translations = this.getDefaultTranslations(langCode);
      }
    }
  }

  /**
   * Get translated text
   */
  translate(key: string, language: string = this.defaultLanguage, variables?: Record<string, any>): string {
    try {
      const langResource = this.languages.get(language);
      let translation = langResource?.translations[key];

      // Fallback to default language if translation not found
      if (!translation && language !== this.defaultLanguage) {
        const defaultResource = this.languages.get(this.defaultLanguage);
        translation = defaultResource?.translations[key];
      }

      // Fallback to key if no translation found
      if (!translation) {
        i18nLogger.warn('Translation missing', { key, language });
        translation = key;
      }

      // Replace variables
      if (variables) {
        Object.entries(variables).forEach(([varKey, value]) => {
          translation = translation.replace(new RegExp(`{{${varKey}}}`, 'g'), String(value));
        });
      }

      return translation;

    } catch (error) {
      i18nLogger.error('Translation failed', { key, language, error: error.message });
      return key;
    }
  }

  /**
   * Get localized number format
   */
  formatNumber(number: number, language: string = this.defaultLanguage, options?: {
    style?: 'decimal' | 'currency' | 'percent';
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }): string {
    try {
      const langResource = this.languages.get(language);
      const locale = `${language}-${langResource?.region || 'US'}`;

      const formatOptions: Intl.NumberFormatOptions = {
        style: options?.style || 'decimal',
        minimumFractionDigits: options?.minimumFractionDigits,
        maximumFractionDigits: options?.maximumFractionDigits
      };

      if (options?.style === 'currency') {
        formatOptions.currency = options.currency || langResource?.numberFormat.currency || 'USD';
      }

      return new Intl.NumberFormat(locale, formatOptions).format(number);

    } catch (error) {
      i18nLogger.error('Number formatting failed', { number, language, error: error.message });
      return number.toString();
    }
  }

  /**
   * Get localized date format
   */
  formatDate(date: Date, language: string = this.defaultLanguage, options?: {
    style?: 'full' | 'long' | 'medium' | 'short';
    timeZone?: string;
  }): string {
    try {
      const langResource = this.languages.get(language);
      const locale = `${language}-${langResource?.region || 'US'}`;

      const formatOptions: Intl.DateTimeFormatOptions = {
        dateStyle: options?.style || 'medium',
        timeZone: options?.timeZone
      };

      return new Intl.DateTimeFormat(locale, formatOptions).format(date);

    } catch (error) {
      i18nLogger.error('Date formatting failed', { date, language, error: error.message });
      return date.toISOString().split('T')[0];
    }
  }

  /**
   * Format address according to locale
   */
  formatAddress(address: Record<string, string>, language: string = this.defaultLanguage): string {
    try {
      const langResource = this.languages.get(language);
      if (!langResource) {
        return Object.values(address).filter(Boolean).join(', ');
      }

      const formattedParts = langResource.addressFormat
        .map(field => address[field])
        .filter(Boolean);

      return formattedParts.join(', ');

    } catch (error) {
      i18nLogger.error('Address formatting failed', { address, language, error: error.message });
      return Object.values(address).filter(Boolean).join(', ');
    }
  }

  /**
   * Get language metadata
   */
  getLanguageMetadata(language: string): LanguageResource | null {
    return this.languages.get(language) || null;
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages(): LanguageResource[] {
    return Array.from(this.languages.values());
  }

  /**
   * Detect language from browser preferences
   */
  detectLanguage(acceptLanguageHeader: string): string {
    try {
      const preferences = acceptLanguageHeader
        .split(',')
        .map(lang => {
          const [code, quality = '1'] = lang.trim().split(';q=');
          return { code: code.toLowerCase(), quality: parseFloat(quality) };
        })
        .sort((a, b) => b.quality - a.quality);

      for (const pref of preferences) {
        // Check exact match
        if (this.languages.has(pref.code)) {
          return pref.code;
        }

        // Check language without region (e.g., 'en' for 'en-us')
        const langCode = pref.code.split('-')[0];
        if (this.languages.has(langCode)) {
          return langCode;
        }
      }

      return this.defaultLanguage;

    } catch (error) {
      i18nLogger.error('Language detection failed', { 
        acceptLanguage: acceptLanguageHeader, 
        error: error.message 
      });
      return this.defaultLanguage;
    }
  }

  /**
   * Get localized validation messages
   */
  getValidationMessages(language: string = this.defaultLanguage): Record<string, string> {
    const messages: Record<string, string> = {};
    
    const validationKeys = [
      'required_field',
      'invalid_email',
      'invalid_phone',
      'invalid_date',
      'password_too_short',
      'password_too_weak',
      'age_verification_failed',
      'document_upload_failed',
      'biometric_verification_failed'
    ];

    validationKeys.forEach(key => {
      messages[key] = this.translate(`validation.${key}`, language);
    });

    return messages;
  }

  /**
   * Get localized UI text
   */
  getUIText(component: string, language: string = this.defaultLanguage): Record<string, string> {
    const langResource = this.languages.get(language);
    if (!langResource) {
      return {};
    }

    const componentPrefix = `ui.${component}.`;
    const uiText: Record<string, string> = {};

    Object.keys(langResource.translations).forEach(key => {
      if (key.startsWith(componentPrefix)) {
        const uiKey = key.replace(componentPrefix, '');
        uiText[uiKey] = langResource.translations[key];
      }
    });

    return uiText;
  }

  /**
   * Generate translation completion report
   */
  getTranslationCompletionReport(): Array<{
    language: string;
    completeness: number;
    missingKeys: string[];
    totalKeys: number;
  }> {
    const englishKeys = Object.keys(this.languages.get('en')?.translations || {});
    const report: any[] = [];

    for (const [langCode, langResource] of this.languages) {
      if (langCode === 'en') continue;

      const translationKeys = Object.keys(langResource.translations);
      const missingKeys = englishKeys.filter(key => !translationKeys.includes(key));
      const completeness = ((translationKeys.length / englishKeys.length) * 100);

      report.push({
        language: langCode,
        completeness: Math.round(completeness),
        missingKeys,
        totalKeys: englishKeys.length
      });
    }

    return report.sort((a, b) => b.completeness - a.completeness);
  }

  /**
   * Update translation for a key
   */
  async updateTranslation(language: string, key: string, value: string): Promise<boolean> {
    try {
      const langResource = this.languages.get(language);
      if (!langResource) {
        throw new Error(`Language ${language} not supported`);
      }

      langResource.translations[key] = value;

      i18nLogger.info('Translation updated', { language, key });
      return true;

    } catch (error) {
      i18nLogger.error('Translation update failed', { language, key, error: error.message });
      return false;
    }
  }

  // Private helper methods

  private getDefaultTranslations(languageCode: string): Record<string, string> {
    // Base translations that every language should have
    const baseTranslations = {
      // Common UI elements
      'common.yes': 'Yes',
      'common.no': 'No',
      'common.ok': 'OK',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',

      // Authentication
      'auth.login': 'Login',
      'auth.logout': 'Logout',
      'auth.register': 'Register',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.forgot_password': 'Forgot Password?',

      // Verification
      'verify.title': 'Identity Verification',
      'verify.age': 'Age Verification',
      'verify.citizenship': 'Citizenship Verification',
      'verify.upload_document': 'Upload Document',
      'verify.take_photo': 'Take Photo',
      'verify.submit': 'Submit Verification',

      // Validation messages
      'validation.required_field': 'This field is required',
      'validation.invalid_email': 'Please enter a valid email address',
      'validation.invalid_phone': 'Please enter a valid phone number',
      'validation.password_too_short': 'Password must be at least 8 characters',

      // Errors
      'error.network': 'Network connection failed',
      'error.server': 'Server error occurred',
      'error.unauthorized': 'Unauthorized access',
      'error.not_found': 'Resource not found'
    };

    // Add language-specific variations if needed
    if (languageCode === 'ne') {
      // Nepali translations would go here
      return {
        ...baseTranslations,
        'common.yes': 'हो',
        'common.no': 'होइन',
        'common.ok': 'ठिक छ',
        'common.cancel': 'रद्द गर्नुहोस्',
        'auth.login': 'लगइन',
        'verify.title': 'पहिचान प्रमाणीकरण'
      };
    }

    return baseTranslations;
  }
}

// Export singleton instance
export const internationalizationManager = new InternationalizationManager();