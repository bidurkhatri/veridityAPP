import { useState, useEffect } from 'react';

export type Language = 'en' | 'np';

// Load translation files
let translations: Record<Language, Record<string, any>> = {
  en: {},
  np: {}
};

// Load translations asynchronously
const loadTranslations = async () => {
  try {
    const [enData, npData] = await Promise.all([
      import('../locales/en.json'),
      import('../locales/np.json')
    ]);
    
    translations.en = enData.default || enData;
    translations.np = npData.default || npData;
  } catch (error) {
    console.error('Failed to load translations:', error);
  }
};

// Initialize translations
loadTranslations();

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

export function useTranslation(language: Language = 'en') {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkLoaded = () => {
      if (Object.keys(translations.en).length > 0) {
        setIsLoaded(true);
      } else {
        setTimeout(checkLoaded, 50);
      }
    };
    checkLoaded();
  }, []);

  const t = (key: string, params?: Record<string, any>): string => {
    // Get value from current language
    let value = getNestedValue(translations[language], key);
    
    // Fallback to English if not found
    if (!value && language !== 'en') {
      value = getNestedValue(translations.en, key);
    }
    
    // Log missing keys in development
    if (!value) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: "${key}" for language: ${language}`);
      }
      return key; // Return key as fallback to prevent breaking UI
    }
    
    // Simple parameter substitution
    if (params && typeof value === 'string') {
      return value.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param] || match;
      });
    }
    
    return value;
  };

  return { t, isLoaded };
}