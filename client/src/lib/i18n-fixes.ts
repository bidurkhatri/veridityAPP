// i18n Fixes - Brief Requirements
// Remove leaked i18n keys, achieve 100% EN/NE coverage with persistent switching

export const i18nFixes: {
  leakedKeys: string[];
  translations: Record<string, { en: string; np: string }>;
} = {
  // Common leaked keys that should be replaced
  leakedKeys: [
    'common.loading',
    'common.error', 
    'nav.dashboard',
    'nav.history',
    'nav.settings',
    'message.proofVerified',
    'message.proofFailed'
  ],

  // EN/NE translations with full coverage
  translations: {
    // Navigation
    'nav.dashboard': {
      en: 'Dashboard',
      np: 'डेशबोर्ड'
    },
    'nav.history': {
      en: 'History', 
      np: 'इतिहास'
    },
    'nav.settings': {
      en: 'Settings',
      np: 'सेटिङहरू'
    },
    'nav.proofGeneration': {
      en: 'Generate Proof',
      np: 'प्रमाण उत्पन्न गर्नुहोस्'
    },

    // Common actions
    'common.loading': {
      en: 'Loading...',
      np: 'लोड हुँदैछ...'
    },
    'common.error': {
      en: 'Error',
      np: 'त्रुटि'
    },
    'common.success': {
      en: 'Success',
      np: 'सफल'
    },
    'common.cancel': {
      en: 'Cancel',
      np: 'रद्द गर्नुहोस्'
    },
    'common.continue': {
      en: 'Continue',
      np: 'जारी राख्नुहोस्'
    },

    // Status messages
    'message.proofVerified': {
      en: 'Proof verified successfully',
      np: 'प्रमाण सफलतापूर्वक प्रमाणित भयो'
    },
    'message.proofFailed': {
      en: 'Proof verification failed',
      np: 'प्रमाण प्रमाणीकरण असफल भयो'
    },
    'message.proofGenerated': {
      en: 'Proof generated successfully',
      np: 'प्रमाण सफलतापूर्वक उत्पन्न भयो'
    },

    // Form labels
    'form.name': {
      en: 'Full Name',
      np: 'पूरा नाम'
    },
    'form.dateOfBirth': {
      en: 'Date of Birth',
      np: 'जन्म मिति'
    },
    'form.citizenship': {
      en: 'Citizenship Number',
      np: 'नागरिकता नम्बर'
    },
    'form.province': {
      en: 'Province',
      np: 'प्रदेश'
    }
  }
};

// Helper to check if a key is leaked (missing translation)
export function isLeakedKey(key: string): boolean {
  return i18nFixes.leakedKeys.includes(key);
}

// Get translation with fallback
export function getTranslation(key: string, language: 'en' | 'np'): string {
  const translation = i18nFixes.translations[key];
  if (!translation) {
    console.warn(`Missing translation for key: ${key}`);
    return key; // Return key as fallback
  }
  return translation[language] || translation.en || key;
}

// Language persistence helper
export function saveLanguagePreference(language: 'en' | 'np'): void {
  localStorage.setItem('veridity-language', language);
  // Also set HTML lang attribute for accessibility
  document.documentElement.lang = language === 'np' ? 'ne' : 'en';
}

export function loadLanguagePreference(): 'en' | 'np' {
  const saved = localStorage.getItem('veridity-language') as 'en' | 'np';
  return saved || 'en'; // Default to English
}

// Coverage check - returns percentage of translated keys
export function getTranslationCoverage(): { en: number; np: number } {
  const total = Object.keys(i18nFixes.translations).length;
  let enCount = 0;
  let npCount = 0;

  Object.values(i18nFixes.translations).forEach(translation => {
    if (translation.en) enCount++;
    if (translation.np) npCount++;
  });

  return {
    en: Math.round((enCount / total) * 100),
    np: Math.round((npCount / total) * 100)
  };
}