/**
 * Input sanitization and validation utilities
 */

import DOMPurify from 'dompurify';

export interface SanitizationOptions {
  allowedTags?: string[];
  allowedAttributes?: string[];
  stripTags?: boolean;
  maxLength?: number;
}

export class InputSanitizer {
  // Default safe configuration
  private static readonly DEFAULT_OPTIONS: Required<SanitizationOptions> = {
    allowedTags: [],
    allowedAttributes: [],
    stripTags: true,
    maxLength: 1000
  };

  /**
   * Sanitize HTML content using DOMPurify
   */
  static sanitizeHtml(input: string, options: SanitizationOptions = {}): string {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    if (input.length > opts.maxLength) {
      throw new Error(`Input too long: ${input.length} > ${opts.maxLength}`);
    }

    const config: any = {
      ALLOWED_TAGS: opts.allowedTags,
      ALLOWED_ATTR: opts.allowedAttributes,
      STRIP_TAGS: opts.stripTags
    };

    return DOMPurify.sanitize(input, config);
  }

  /**
   * Sanitize plain text input
   */
  static sanitizeText(input: string, maxLength: number = 1000): string {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }

    if (input.length > maxLength) {
      throw new Error(`Input too long: ${input.length} > ${maxLength}`);
    }

    // Remove control characters and normalize
    return input
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Sanitize email addresses
   */
  static sanitizeEmail(email: string): string {
    const sanitized = this.sanitizeText(email, 254); // RFC max length
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(sanitized)) {
      throw new Error('Invalid email format');
    }

    return sanitized.toLowerCase();
  }

  /**
   * Sanitize phone numbers (Nepal format)
   */
  static sanitizePhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, ''); // Remove non-digits
    
    // Nepal phone validation: 10 digits, optionally with +977
    if (cleaned.length === 10) {
      return cleaned;
    } else if (cleaned.length === 13 && cleaned.startsWith('977')) {
      return cleaned.substring(3);
    }
    
    throw new Error('Invalid phone number format');
  }

  /**
   * Sanitize names (for identity proofs)
   */
  static sanitizeName(name: string): string {
    const sanitized = this.sanitizeText(name, 100);
    
    // Allow only letters, spaces, hyphens, and common diacritics
    const nameRegex = /^[a-zA-Z\u0900-\u097F\s'-]+$/;
    if (!nameRegex.test(sanitized)) {
      throw new Error('Name contains invalid characters');
    }

    return sanitized;
  }

  /**
   * Sanitize addresses
   */
  static sanitizeAddress(address: string): string {
    const sanitized = this.sanitizeText(address, 500);
    
    // Allow alphanumeric, spaces, common punctuation
    const addressRegex = /^[a-zA-Z0-9\u0900-\u097F\s\-,./]+$/;
    if (!addressRegex.test(sanitized)) {
      throw new Error('Address contains invalid characters');
    }

    return sanitized;
  }

  /**
   * Sanitize numeric inputs
   */
  static sanitizeNumber(input: string, min?: number, max?: number): number {
    const num = parseFloat(input);
    
    if (isNaN(num)) {
      throw new Error('Invalid number format');
    }

    if (min !== undefined && num < min) {
      throw new Error(`Number too small: ${num} < ${min}`);
    }

    if (max !== undefined && num > max) {
      throw new Error(`Number too large: ${num} > ${max}`);
    }

    return num;
  }

  /**
   * Sanitize date inputs
   */
  static sanitizeDate(dateStr: string): Date {
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }

    // Reasonable date range check (1900 - 2100)
    if (date.getFullYear() < 1900 || date.getFullYear() > 2100) {
      throw new Error('Date out of valid range');
    }

    return date;
  }

  /**
   * Sanitize URLs
   */
  static sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      
      // Only allow https and http
      if (!['https:', 'http:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol');
      }

      return parsed.toString();
    } catch (error) {
      throw new Error('Invalid URL format');
    }
  }

  /**
   * General purpose sanitizer for form data
   */
  static sanitizeFormData(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeText(value);
      } else if (typeof value === 'number') {
        sanitized[key] = value;
      } else if (value instanceof Date) {
        sanitized[key] = value;
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? this.sanitizeText(item) : item
        );
      } else {
        // For objects, recursively sanitize
        sanitized[key] = typeof value === 'object' ? this.sanitizeFormData(value) : value;
      }
    }

    return sanitized;
  }
}

// React hook for sanitized input
import { useState, useMemo, useCallback } from 'react';

export function useSanitizedInput(initialValue: string = '') {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string>('');

  const sanitizedValue = useMemo(() => {
    try {
      return InputSanitizer.sanitizeText(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid input');
      return value;
    }
  }, [value]);

  const updateValue = useCallback((newValue: string) => {
    setError('');
    setValue(newValue);
  }, []);

  return {
    value: sanitizedValue,
    rawValue: value,
    error,
    setValue: updateValue,
    isValid: !error
  };
}