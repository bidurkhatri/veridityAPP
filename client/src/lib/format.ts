/**
 * Formatting utilities for numbers, dates, and metrics
 * Fixes excessive decimal places and inconsistent formatting
 */

/**
 * Format a number as a percentage with one decimal place maximum
 */
export function formatPercentage(value: number | undefined | null, decimals: number = 1): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0%';
  }
  
  // Ensure we don't show ridiculous precision
  const rounded = Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  return `${rounded}%`;
}

/**
 * Format memory size in bytes to human readable format
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format uptime in seconds to human readable format
 */
export function formatUptime(seconds: number | undefined | null): string {
  if (!seconds || isNaN(seconds)) {
    return '0 days, 0 hours';
  }

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
}

/**
 * Format large numbers with locale-appropriate thousand separators
 */
export function formatNumber(value: number | undefined | null, locale: string = 'en-US'): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  
  return new Intl.NumberFormat(locale).format(Math.round(value));
}

/**
 * Format currency with locale support
 */
export function formatCurrency(
  value: number, 
  currency: string = 'USD', 
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format date with locale support
 */
export function formatDate(
  date: Date | string | number, 
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {}
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };

  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: string = 'en-US'
): string {
  const now = new Date();
  const target = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (isNaN(target.getTime())) {
    return 'Invalid date';
  }

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diffInSeconds = (target.getTime() - now.getTime()) / 1000;

  const units = [
    { name: 'year' as const, seconds: 31536000 },
    { name: 'month' as const, seconds: 2592000 },
    { name: 'day' as const, seconds: 86400 },
    { name: 'hour' as const, seconds: 3600 },
    { name: 'minute' as const, seconds: 60 },
    { name: 'second' as const, seconds: 1 }
  ];

  for (const unit of units) {
    if (Math.abs(diffInSeconds) >= unit.seconds) {
      const value = Math.round(diffInSeconds / unit.seconds);
      return rtf.format(value, unit.name);
    }
  }

  return rtf.format(0, 'second');
}

/**
 * Format response time in milliseconds
 */
export function formatResponseTime(ms: number | undefined | null): string {
  if (!ms || isNaN(ms)) {
    return '0ms';
  }

  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  } else {
    return `${(ms / 1000).toFixed(1)}s`;
  }
}

/**
 * Format file size from bytes
 */
export function formatFileSize(bytes: number): string {
  return formatBytes(bytes, 1);
}

/**
 * Format success rate as percentage
 */
export function formatSuccessRate(successCount: number, totalCount: number): string {
  if (totalCount === 0) return '0%';
  const rate = (successCount / totalCount) * 100;
  return formatPercentage(rate);
}