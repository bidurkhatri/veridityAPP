/**
 * Locale-aware formatting for dates, numbers, and currency
 */

import { format, parseISO } from 'date-fns';
import { enUS, hi } from 'date-fns/locale'; // Using Hindi as closest to Nepali

export type Locale = 'en' | 'ne';

// Locale configuration
const localeConfig = {
  en: {
    bcp47: 'en-NP',
    dateFns: enUS,
    dateFormat: 'MMM dd, yyyy',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'MMM dd, yyyy HH:mm',
    currency: 'NPR',
    numberGrouping: 'western' // 1,000,000
  },
  ne: {
    bcp47: 'ne-NP',
    dateFns: hi, // Fallback to Hindi
    dateFormat: 'yyyy/MM/dd',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'yyyy/MM/dd HH:mm',
    currency: 'NPR',
    numberGrouping: 'nepali' // 10,00,000 (lakhs/crores)
  }
};

export class LocaleFormatter {
  private locale: Locale;

  constructor(locale: Locale = 'en') {
    this.locale = locale;
  }

  setLocale(locale: Locale) {
    this.locale = locale;
  }

  // Date formatting
  formatDate(date: Date | string, pattern?: string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const config = localeConfig[this.locale];
    const formatPattern = pattern || config.dateFormat;

    try {
      return format(dateObj, formatPattern, { locale: config.dateFns });
    } catch (error) {
      console.warn('Date formatting failed:', error);
      return dateObj.toLocaleDateString(config.bcp47);
    }
  }

  formatTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const config = localeConfig[this.locale];

    try {
      return format(dateObj, config.timeFormat, { locale: config.dateFns });
    } catch (error) {
      console.warn('Time formatting failed:', error);
      return dateObj.toLocaleTimeString(config.bcp47);
    }
  }

  formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const config = localeConfig[this.locale];

    try {
      return format(dateObj, config.dateTimeFormat, { locale: config.dateFns });
    } catch (error) {
      console.warn('DateTime formatting failed:', error);
      return dateObj.toLocaleString(config.bcp47);
    }
  }

  // Relative time formatting
  formatRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (this.locale === 'ne') {
      if (diffMinutes < 1) return 'अहिले';
      if (diffMinutes < 60) return `${diffMinutes} मिनेट अगाडि`;
      if (diffHours < 24) return `${diffHours} घण्टा अगाडि`;
      if (diffDays < 7) return `${diffDays} दिन अगाडि`;
      return this.formatDate(dateObj);
    }

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return this.formatDate(dateObj);
  }

  // Number formatting with Nepali numerals
  formatNumber(num: number): string {
    if (this.locale === 'ne') {
      // Convert to Nepali numerals
      const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      
      // Use Indian numbering system for large numbers
      const formatted = this.formatIndianNumber(num);
      
      return formatted.split('').map(char => {
        if (/\d/.test(char)) {
          return nepaliDigits[parseInt(char)];
        }
        return char;
      }).join('');
    }

    return num.toLocaleString('en-NP');
  }

  // Indian/Nepali numbering system (lakhs, crores)
  private formatIndianNumber(num: number): string {
    if (num < 1000) return num.toString();
    
    const numStr = num.toString();
    let result = '';
    let count = 0;
    
    // Add commas in Indian style: xx,xx,xxx
    for (let i = numStr.length - 1; i >= 0; i--) {
      result = numStr[i] + result;
      count++;
      
      if (count === 3 && i > 0) {
        result = ',' + result;
        count = 0;
      } else if (count === 2 && i > 0 && numStr.length > 5) {
        result = ',' + result;
        count = 0;
      }
    }
    
    return result;
  }

  // Currency formatting
  formatCurrency(amount: number): string {
    const config = localeConfig[this.locale];
    
    try {
      const formatter = new Intl.NumberFormat(config.bcp47, {
        style: 'currency',
        currency: config.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
      
      let formatted = formatter.format(amount);
      
      // Convert to Nepali numerals if needed
      if (this.locale === 'ne') {
        const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
        formatted = formatted.split('').map(char => {
          if (/\d/.test(char)) {
            return nepaliDigits[parseInt(char)];
          }
          return char;
        }).join('');
      }
      
      return formatted;
    } catch (error) {
      console.warn('Currency formatting failed:', error);
      return `${config.currency} ${this.formatNumber(amount)}`;
    }
  }

  // Percentage formatting
  formatPercentage(value: number, decimals: number = 1): string {
    if (this.locale === 'ne') {
      const formatted = (value * 100).toFixed(decimals) + '%';
      const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      return formatted.split('').map(char => {
        if (/\d/.test(char)) {
          return nepaliDigits[parseInt(char)];
        }
        return char;
      }).join('');
    }

    return new Intl.NumberFormat('en-NP', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }

  // Phone number formatting for Nepal
  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      // Format as: 98xx-xxx-xxx
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 13 && cleaned.startsWith('977')) {
      // Format as: +977 98xx-xxx-xxx
      const local = cleaned.slice(3);
      return `+977 ${local.slice(0, 4)}-${local.slice(4, 7)}-${local.slice(7)}`;
    }
    
    return phone; // Return as-is if unrecognized format
  }
}

// Singleton formatter
export const formatter = new LocaleFormatter();

// React hook for locale formatting
export function useLocaleFormatter(locale: Locale) {
  const formatter = new LocaleFormatter(locale);
  
  return {
    formatDate: formatter.formatDate.bind(formatter),
    formatTime: formatter.formatTime.bind(formatter),
    formatDateTime: formatter.formatDateTime.bind(formatter),
    formatRelativeTime: formatter.formatRelativeTime.bind(formatter),
    formatNumber: formatter.formatNumber.bind(formatter),
    formatCurrency: formatter.formatCurrency.bind(formatter),
    formatPercentage: formatter.formatPercentage.bind(formatter),
    formatPhoneNumber: formatter.formatPhoneNumber.bind(formatter),
    setLocale: (newLocale: Locale) => formatter.setLocale(newLocale)
  };
}