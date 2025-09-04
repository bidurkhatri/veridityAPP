/**
 * Bilingual command recognition and intent detection
 */

import { Lang } from './lang';

export interface Intent {
  id: string;
  patterns: {
    en: RegExp[];
    ne: RegExp[];
  };
  action: string;
  description: {
    en: string;
    ne: string;
  };
}

export const intents: Intent[] = [
  {
    id: 'home',
    patterns: {
      en: [/go home/i, /home page/i, /dashboard/i, /main page/i],
      ne: [/होम जानुहोस्/i, /घर जानुहोस्/i, /ड्यासबोर्ड/i, /मुख्य पेज/i]
    },
    action: '/',
    description: {
      en: 'Go to home page',
      ne: 'होम पेजमा जानुहोस्'
    }
  },
  {
    id: 'prove',
    patterns: {
      en: [/generate proof/i, /create proof/i, /new proof/i, /prove/i],
      ne: [/प्रमाण बनाउनुहोस्/i, /प्रमाण तयार गर्नुहोस्/i, /नयाँ प्रमाण/i, /प्रमाण/i]
    },
    action: '/prove',
    description: {
      en: 'Generate new proof',
      ne: 'नयाँ प्रमाण बनाउनुहोस्'
    }
  },
  {
    id: 'verify',
    patterns: {
      en: [/verify proof/i, /check proof/i, /validate/i, /verification/i],
      ne: [/प्रमाण जाँच गर्नुहोस्/i, /प्रमाण सत्यापन/i, /प्रमाणित गर्नुहोस्/i, /जाँच/i]
    },
    action: '/verify',
    description: {
      en: 'Verify proof',
      ne: 'प्रमाण सत्यापन गर्नुहोस्'
    }
  },
  {
    id: 'share',
    patterns: {
      en: [/share proof/i, /send proof/i, /share/i],
      ne: [/प्रमाण साझा गर्नुहोस्/i, /प्रमाण पठाउनुहोस्/i, /साझा गर्नुहोस्/i]
    },
    action: '/share',
    description: {
      en: 'Share proof',
      ne: 'प्रमाण साझा गर्नुहोस्'
    }
  },
  {
    id: 'history',
    patterns: {
      en: [/history/i, /past proofs/i, /previous/i, /my proofs/i],
      ne: [/इतिहास/i, /पुराना प्रमाण/i, /पहिला/i, /मेरो प्रमाण/i]
    },
    action: '/history',
    description: {
      en: 'View proof history',
      ne: 'प्रमाण इतिहास हेर्नुहोस्'
    }
  },
  {
    id: 'settings',
    patterns: {
      en: [/settings/i, /preferences/i, /options/i, /configure/i],
      ne: [/सेटिङ्स/i, /प्राथमिकता/i, /विकल्प/i, /कन्फिगर/i]
    },
    action: '/settings',
    description: {
      en: 'Open settings',
      ne: 'सेटिङ्स खोल्नुहोस्'
    }
  },
  {
    id: 'help',
    patterns: {
      en: [/help/i, /assistance/i, /support/i, /what can you do/i, /commands/i],
      ne: [/मद्दत/i, /सहायता/i, /समर्थन/i, /के गर्न सकिन्छ/i, /आदेशहरू/i]
    },
    action: '/help',
    description: {
      en: 'Get help and see available commands',
      ne: 'मद्दत लिनुहोस् र उपलब्ध आदेशहरू हेर्नुहोस्'
    }
  }
];

/**
 * Detect intent from spoken text
 */
export function detectIntent(text: string, lang: Lang): Intent | null {
  const normalizedText = text.toLowerCase().trim();
  
  for (const intent of intents) {
    const patterns = intent.patterns[lang];
    if (patterns.some(pattern => pattern.test(normalizedText))) {
      return intent;
    }
  }
  
  return null;
}

/**
 * Get all available commands for display
 */
export function getAvailableCommands(lang: Lang): Array<{
  command: string;
  description: string;
  action: string;
}> {
  return intents.map(intent => ({
    command: intent.patterns[lang][0].source.replace(/[\/\\ig]/g, '').replace(/\|.*/, ''),
    description: intent.description[lang],
    action: intent.action
  }));
}

/**
 * Test if text matches any command pattern
 */
export function matchesAnyCommand(text: string, lang: Lang): boolean {
  return detectIntent(text, lang) !== null;
}

/**
 * Get fuzzy matches for partial commands
 */
export function getFuzzyMatches(text: string, lang: Lang, threshold = 0.6): Intent[] {
  const normalizedText = text.toLowerCase().trim();
  const matches: Array<{intent: Intent, score: number}> = [];
  
  for (const intent of intents) {
    const patterns = intent.patterns[lang];
    for (const pattern of patterns) {
      const patternText = pattern.source.replace(/[\/\\ig]/g, '').toLowerCase();
      const similarity = calculateSimilarity(normalizedText, patternText);
      
      if (similarity >= threshold) {
        matches.push({ intent, score: similarity });
        break; // Only count best match per intent
      }
    }
  }
  
  return matches
    .sort((a, b) => b.score - a.score)
    .map(match => match.intent);
}

/**
 * Calculate similarity between two strings (simple Levenshtein-based)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Calculate Levenshtein distance
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}