/**
 * Shared language types and BCP-47 mappings for consistent voice/UI language handling
 */

export type Lang = 'en' | 'ne';

export const langToBCP47: Record<Lang, string> = {
  en: 'en-US',
  ne: 'ne-NP'
};

export const langToDisplay: Record<Lang, string> = {
  en: 'English',
  ne: 'नेपाली'
};

export const supportedLanguages: Lang[] = ['en', 'ne'];

export function isValidLang(lang: string): lang is Lang {
  return supportedLanguages.includes(lang as Lang);
}

export function getLangFromBCP47(bcp47: string): Lang {
  if (bcp47.startsWith('ne')) return 'ne';
  return 'en';
}

export function getFallbackLang(lang: Lang): string {
  // For Nepali, fallback to Hindi if Nepali not available
  if (lang === 'ne') return 'hi-IN';
  return 'en-US';
}