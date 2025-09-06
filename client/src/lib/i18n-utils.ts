// Locale-aware formatting utilities for dates, numbers, and currencies

interface LocaleFormatOptions {
  locale?: string;
  timeZone?: string;
}

// Date formatting with locale awareness
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions & LocaleFormatOptions = {}
): string {
  const { locale = 'en-US', timeZone = 'Asia/Katmandu', ...dateOptions } = options;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  // Default options for common date formats
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone,
    ...dateOptions,
  };

  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
}

// Relative time formatting (e.g., "2 hours ago", "in 3 days")
export function formatRelativeTime(
  date: Date | string | number,
  options: LocaleFormatOptions = {}
): string {
  const { locale = 'en-US' } = options;
  
  const dateObj = new Date(date);
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  const absDiff = Math.abs(diffMs);
  const sign = diffMs < 0 ? -1 : 1;
  
  // Choose appropriate unit based on time difference
  if (absDiff < 60 * 1000) {
    return rtf.format(sign * Math.floor(absDiff / 1000), 'second');
  } else if (absDiff < 60 * 60 * 1000) {
    return rtf.format(sign * Math.floor(absDiff / (60 * 1000)), 'minute');
  } else if (absDiff < 24 * 60 * 60 * 1000) {
    return rtf.format(sign * Math.floor(absDiff / (60 * 60 * 1000)), 'hour');
  } else if (absDiff < 30 * 24 * 60 * 60 * 1000) {
    return rtf.format(sign * Math.floor(absDiff / (24 * 60 * 60 * 1000)), 'day');
  } else if (absDiff < 365 * 24 * 60 * 60 * 1000) {
    return rtf.format(sign * Math.floor(absDiff / (30 * 24 * 60 * 60 * 1000)), 'month');
  } else {
    return rtf.format(sign * Math.floor(absDiff / (365 * 24 * 60 * 60 * 1000)), 'year');
  }
}

// Number formatting with locale-specific separators
export function formatNumber(
  number: number,
  options: Intl.NumberFormatOptions & LocaleFormatOptions = {}
): string {
  const { locale = 'en-US', ...numberOptions } = options;
  
  if (isNaN(number)) {
    return 'Invalid Number';
  }

  return new Intl.NumberFormat(locale, numberOptions).format(number);
}

// Currency formatting with proper locale support
export function formatCurrency(
  amount: number,
  currency: string = 'NPR',
  options: Intl.NumberFormatOptions & LocaleFormatOptions = {}
): string {
  const { locale = 'en-US', ...currencyOptions } = options;
  
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    ...currencyOptions,
  };

  return formatNumber(amount, { locale, ...defaultOptions });
}

// Percentage formatting
export function formatPercentage(
  value: number,
  options: Intl.NumberFormatOptions & LocaleFormatOptions = {}
): string {
  const { locale = 'en-US', ...percentOptions } = options;
  
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
    ...percentOptions,
  };

  return formatNumber(value / 100, { locale, ...defaultOptions });
}

// Compact number formatting (e.g., 1.2K, 1.5M)
export function formatCompactNumber(
  number: number,
  options: LocaleFormatOptions = {}
): string {
  const { locale = 'en-US' } = options;
  
  const compactOptions: Intl.NumberFormatOptions = {
    notation: 'compact',
    compactDisplay: 'short',
  };

  return formatNumber(number, { locale, ...compactOptions });
}

// Format file sizes with locale-appropriate units
export function formatBytes(
  bytes: number,
  options: LocaleFormatOptions = {}
): string {
  const { locale = 'en-US' } = options;
  
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  const value = bytes / Math.pow(k, i);
  const formattedValue = formatNumber(value, {
    locale,
    minimumFractionDigits: 0,
    maximumFractionDigits: i === 0 ? 0 : 1,
  });
  
  return `${formattedValue} ${sizes[i]}`;
}

// Nepal-specific date formatting
export function formatNepaliDate(
  date: Date | string | number,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium'
): string {
  const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
    short: { dateStyle: 'short' },
    medium: { dateStyle: 'medium' },
    long: { dateStyle: 'long' },
    full: { dateStyle: 'full' },
  };

  return formatDate(date, {
    locale: 'ne-NP',
    timeZone: 'Asia/Katmandu',
    ...formatOptions[format],
  });
}

// Get appropriate locale based on language preference
export function getLocale(language: 'en' | 'ne'): string {
  const localeMap = {
    en: 'en-US',
    ne: 'ne-NP',
  };
  
  return localeMap[language] || 'en-US';
}

// Format duration (e.g., "2h 30m", "1d 5h")
export function formatDuration(
  milliseconds: number,
  options: LocaleFormatOptions = {}
): string {
  const { locale = 'en-US' } = options;
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  const parts: string[] = [];
  
  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours % 24 > 0) {
    parts.push(`${hours % 24}h`);
  }
  if (minutes % 60 > 0) {
    parts.push(`${minutes % 60}m`);
  }
  if (parts.length === 0 && seconds > 0) {
    parts.push(`${seconds}s`);
  }
  
  return parts.join(' ') || '0s';
}

// Export utility functions for common use cases
export const i18nUtils = {
  formatDate,
  formatRelativeTime,
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatCompactNumber,
  formatBytes,
  formatNepaliDate,
  formatDuration,
  getLocale,
};