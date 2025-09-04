/**
 * Cultural adaptations for Nepal
 */

export interface CulturalConfig {
  dateFormat: string;
  numberFormat: string;
  currency: string;
  timeFormat: '12' | '24';
  calendar: 'gregorian' | 'nepali';
  firstDayOfWeek: number; // 0 = Sunday, 1 = Monday
}

export const nepalCulturalConfig: CulturalConfig = {
  dateFormat: 'YYYY/MM/DD', // Nepal uses YYYY/MM/DD
  numberFormat: 'ne-NP',
  currency: 'NPR',
  timeFormat: '24',
  calendar: 'gregorian', // Most digital systems use Gregorian
  firstDayOfWeek: 0 // Sunday is first day
};

// Nepali calendar conversion utilities
export class NepaliCalendar {
  // BS to AD conversion (simplified)
  static bsToAd(year: number, month: number, day: number): Date {
    // Simplified conversion - real implementation would use lookup table
    const adYear = year - 57; // Approximate conversion
    return new Date(adYear, month - 1, day);
  }

  static adToBs(date: Date): { year: number; month: number; day: number } {
    // Simplified conversion - real implementation would use lookup table
    const bsYear = date.getFullYear() + 57;
    return {
      year: bsYear,
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  }

  static formatNepaliDate(date: Date, language: 'en' | 'ne' = 'ne'): string {
    const bs = this.adToBs(date);
    
    const months = {
      en: ['Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'],
      ne: ['बैशाख', 'जेष्ठ', 'आषाढ', 'श्रावण', 'भद्र', 'आश्विन', 'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फागुन', 'चैत्र']
    };

    const monthName = months[language][bs.month - 1];
    
    if (language === 'ne') {
      // Convert numbers to Nepali
      const nepaliNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      const yearStr = bs.year.toString().split('').map(d => nepaliNumerals[parseInt(d)]).join('');
      const dayStr = bs.day.toString().split('').map(d => nepaliNumerals[parseInt(d)]).join('');
      return `${yearStr} ${monthName} ${dayStr}`;
    }
    
    return `${bs.year} ${monthName} ${bs.day}`;
  }
}

// Number formatting for Nepal
export function formatNepaliNumber(num: number, language: 'en' | 'ne' = 'ne'): string {
  if (language === 'en') {
    return num.toLocaleString('en-NP');
  }
  
  // Convert to Nepali numerals
  const nepaliNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return num.toString().split('').map(d => {
    if (/\d/.test(d)) {
      return nepaliNumerals[parseInt(d)];
    }
    return d;
  }).join('');
}

// Currency formatting
export function formatCurrency(amount: number, language: 'en' | 'ne' = 'en'): string {
  const formatter = new Intl.NumberFormat(language === 'en' ? 'en-NP' : 'ne-NP', {
    style: 'currency',
    currency: 'NPR',
    currencyDisplay: 'symbol'
  });
  
  return formatter.format(amount);
}

// Time formatting
export function formatTime(date: Date, language: 'en' | 'ne' = 'en'): string {
  const formatter = new Intl.DateTimeFormat(language === 'en' ? 'en-NP' : 'ne-NP', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false // Nepal uses 24-hour format
  });
  
  return formatter.format(date);
}

// Cultural greetings based on time
export function getCulturalGreeting(language: 'en' | 'ne' = 'en'): string {
  const hour = new Date().getHours();
  
  if (language === 'ne') {
    if (hour < 12) return 'शुभ प्रभात'; // Good morning
    if (hour < 17) return 'शुभ दिन'; // Good day
    return 'शुभ संध्या'; // Good evening
  }
  
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// Respectful address forms in Nepali
export function getPoliteAddress(language: 'en' | 'ne' = 'en'): string {
  if (language === 'ne') {
    return 'तपाईं'; // Respectful 'you'
  }
  return 'you';
}

// Cultural color meanings for UI
export const culturalColors = {
  auspicious: '#FF6B35', // Saffron/Orange - auspicious in Hindu culture
  sacred: '#8B0000',     // Dark red - sacred color
  prosperity: '#228B22', // Green - prosperity and growth
  purity: '#FFFFFF',     // White - purity and peace
  wisdom: '#FFD700',     // Gold - wisdom and knowledge
  warning: '#FFA500',    // Orange - caution but not harsh
  success: '#00AA00',    // Bright green - success and go
  error: '#CC0000'       // Red - error but not too aggressive
};

// Respectful error messages
export function getCulturalErrorMessage(errorType: string, language: 'en' | 'ne'): string {
  const messages = {
    en: {
      network: 'We apologize for the connectivity issue. Please check your internet connection and try again.',
      validation: 'Please kindly review your information and make any necessary corrections.',
      permission: 'We need your permission to access this feature. Please check your settings.',
      notFound: 'We were unable to find the requested information. Please try again or contact support.',
      server: 'We are experiencing technical difficulties. We apologize for the inconvenience and are working to resolve this quickly.'
    },
    ne: {
      network: 'जडान समस्याको लागि हामी माफी चाहन्छौं। कृपया आफ्नो इन्टरनेट जडान जाँच गरेर फेरि प्रयास गर्नुहोस्।',
      validation: 'कृपया आफ्नो जानकारी समीक्षा गर्नुहोस् र आवश्यक सुधारहरू गर्नुहोस्।',
      permission: 'यो सुविधा पहुँच गर्न हामीलाई तपाईंको अनुमति चाहिन्छ। कृपया आफ्ना सेटिङहरू जाँच गर्नुहोस्।',
      notFound: 'हामीले अनुरोध गरिएको जानकारी फेला पार्न सकेनौं। कृपया फेरि प्रयास गर्नुहोस् वा समर्थनलाई सम्पर्क गर्नुहोस्।',
      server: 'हामी प्राविधिक कठिनाइहरू भोगिरहेका छौं। असुविधाको लागि हामी माफी चाहन्छौं र यसलाई छिटो समाधान गर्न काम गरिरहेका छौं।'
    }
  };

  return messages[language][errorType as keyof typeof messages.en] || 
         messages[language].server;
}

// Traditional Nepali success messages
export function getCulturalSuccessMessage(language: 'en' | 'ne'): string {
  if (language === 'ne') {
    return 'बधाई छ! काम सफलतापूर्वक सम्पन्न भयो।'; // Congratulations! Work completed successfully.
  }
  return 'Congratulations! Your task has been completed successfully.';
}