/**
 * Utility formatters for numbers, percentages, uptime - Brief requirements
 * Remove long decimals and provide consistent formatting
 */

// Format numbers with maximum 1 decimal as per brief
export function formatNumber(value: number, decimals: number = 1, locale: string = 'en-US'): string {
  if (isNaN(value)) return '0';
  
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
  
  return formatter.format(value);
}

// Format percentages with 1 decimal maximum
export function formatPercentage(value: number, decimals: number = 1, locale: string = 'en-US'): string {
  if (isNaN(value)) return '0%';
  
  const formatter = new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
  
  return formatter.format(value / 100);
}

// Format currency with appropriate decimals
export function formatCurrency(
  value: number, 
  currency: string = 'USD',
  locale: string = 'en-US',
  decimals?: number
): string {
  if (isNaN(value)) return '$0';
  
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals ?? (value % 1 === 0 ? 0 : 2),
    maximumFractionDigits: decimals ?? 2,
  });
  
  return formatter.format(value);
}

// Format large numbers with appropriate suffixes
export function formatCompactNumber(value: number, decimals: number = 1, locale: string = 'en-US'): string {
  if (isNaN(value)) return '0';
  
  const formatter = new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
  
  return formatter.format(value);
}

// Format uptime with human-readable units
export function formatUptime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0s';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

// Format uptime as percentage with rolling periods
export function formatUptimePercentage(
  uptime: number, 
  totalTime: number, 
  decimals: number = 1
): string {
  if (totalTime === 0) return '100.0%';
  
  const percentage = (uptime / totalTime) * 100;
  const clamped = Math.min(100, Math.max(0, percentage));
  
  return formatPercentage(clamped, decimals);
}

// Format duration in human-readable format
export function formatDuration(milliseconds: number): string {
  if (isNaN(milliseconds) || milliseconds < 0) return '0ms';
  
  if (milliseconds < 1000) {
    return `${Math.round(milliseconds)}ms`;
  }
  
  const seconds = milliseconds / 1000;
  if (seconds < 60) {
    return `${formatNumber(seconds, 1)}s`;
  }
  
  const minutes = seconds / 60;
  if (minutes < 60) {
    return `${formatNumber(minutes, 1)}m`;
  }
  
  const hours = minutes / 60;
  return `${formatNumber(hours, 1)}h`;
}

// Format file sizes
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (isNaN(bytes) || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${formatNumber(bytes / Math.pow(k, i), decimals)} ${sizes[i]}`;
}

// Format dates with locale support
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
  locale: string = 'en-US'
): string {
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    
    const formatter = new Intl.DateTimeFormat(locale, options ?? defaultOptions);
    return formatter.format(dateObj);
  } catch {
    return 'Invalid Date';
  }
}

// Format time ago (relative time)
export function formatTimeAgo(date: Date | string | number, locale: string = 'en-US'): string {
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    
    if (Math.abs(diffInSeconds) < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (Math.abs(diffInSeconds) < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (Math.abs(diffInSeconds) < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (Math.abs(diffInSeconds) < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (Math.abs(diffInSeconds) < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
  } catch {
    return 'Invalid Date';
  }
}

// Format API response time
export function formatResponseTime(milliseconds: number): string {
  if (isNaN(milliseconds) || milliseconds < 0) return '0ms';
  
  if (milliseconds < 1000) {
    return `${Math.round(milliseconds)}ms`;
  } else {
    return `${formatNumber(milliseconds / 1000, 2)}s`;
  }
}

// Nepali number formatting
export function formatNepalese(value: number, type: 'number' | 'currency' = 'number'): string {
  if (isNaN(value)) return '०';
  
  // Convert to Nepali numerals
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  const formatted = formatNumber(value, 1);
  
  const nepaliFormatted = formatted.replace(/\d/g, (digit) => nepaliDigits[parseInt(digit)]);
  
  if (type === 'currency') {
    return `रू ${nepaliFormatted}`;
  }
  
  return nepaliFormatted;
}