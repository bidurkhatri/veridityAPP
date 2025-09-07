import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { Label } from './label';
import { Calendar, Eye, EyeOff } from 'lucide-react';

interface SmartInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

// Date of Birth input with smart masking
interface DOBInputProps extends SmartInputProps {
  format?: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
}

export function DOBInput({ 
  format = 'YYYY-MM-DD', 
  value, 
  onChange, 
  label = 'Date of Birth',
  className,
  error,
  helperText,
  required,
  disabled,
  ...props 
}: DOBInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const formatValue = (input: string) => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, '');
    
    if (format === 'YYYY-MM-DD') {
      // Format as YYYY-MM-DD
      if (digits.length <= 4) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
      return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
    } else if (format === 'DD/MM/YYYY') {
      // Format as DD/MM/YYYY
      if (digits.length <= 2) return digits;
      if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    } else {
      // Format as MM/DD/YYYY
      if (digits.length <= 2) return digits;
      if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatValue(input);
    setDisplayValue(formatted);
    onChange(formatted);
  };

  const handleFocus = () => {
    // Show numeric keypad on mobile
    if (inputRef.current) {
      inputRef.current.setAttribute('inputmode', 'numeric');
    }
  };

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={props.id}>
          {label} {required && <span className="text-error-text">*</span>}
        </Label>
      )}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder={format === 'YYYY-MM-DD' ? 'YYYY-MM-DD' : format}
          className={cn(error && "border-error-border")}
          disabled={disabled}
          {...props}
        />
        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
      </div>
      {error && (
        <p className="text-sm text-error-text" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-text-tertiary">
          {helperText}
        </p>
      )}
    </div>
  );
}

// Numeric input with pattern validation
interface NumericInputProps extends SmartInputProps {
  pattern?: 'phone' | 'citizenship' | 'currency' | 'custom';
  customPattern?: RegExp;
  maxLength?: number;
}

export function NumericInput({
  pattern = 'custom',
  customPattern,
  maxLength,
  value,
  onChange,
  label,
  className,
  error,
  helperText,
  required,
  disabled,
  ...props
}: NumericInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const patterns = {
    phone: /^\+977\s\d{2}\s\d{3}\s\d{4}$/,
    citizenship: /^\d{2}-\d{2}-\d{2}-\d{5}$/,
    currency: /^\d{1,3}(,\d{3})*(\.\d{2})?$/,
    custom: customPattern || /^\d+$/,
  };

  const formatters = {
    phone: (input: string) => {
      const digits = input.replace(/\D/g, '');
      if (digits.startsWith('977')) {
        const local = digits.slice(3);
        if (local.length <= 2) return `+977 ${local}`;
        if (local.length <= 5) return `+977 ${local.slice(0, 2)} ${local.slice(2)}`;
        return `+977 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 9)}`;
      }
      return input;
    },
    citizenship: (input: string) => {
      const digits = input.replace(/\D/g, '');
      if (digits.length <= 2) return digits;
      if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
      if (digits.length <= 6) return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
      return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 11)}`;
    },
    currency: (input: string) => {
      const digits = input.replace(/\D/g, '');
      return new Intl.NumberFormat('en-NP', { 
        style: 'currency', 
        currency: 'NPR',
        minimumFractionDigits: 0 
      }).format(parseInt(digits) || 0);
    },
    custom: (input: string) => input,
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    
    if (maxLength && input.length > maxLength) {
      input = input.slice(0, maxLength);
    }
    
    const formatted = formatters[pattern](input);
    onChange(formatted);
  };

  const handleFocus = () => {
    // Show numeric keypad on mobile
    if (inputRef.current) {
      inputRef.current.setAttribute('inputmode', 'numeric');
    }
  };

  const isValid = patterns[pattern].test(value);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={props.id}>
          {label} {required && <span className="text-error-text">*</span>}
        </Label>
      )}
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        className={cn(
          error && "border-error-border",
          value && !isValid && "border-warning-border"
        )}
        disabled={disabled}
        {...props}
      />
      {error && (
        <p className="text-sm text-error-text" role="alert">
          {error}
        </p>
      )}
      {value && !isValid && !error && (
        <p className="text-sm text-warning-text" role="alert">
          Please enter a valid {pattern} format
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-text-tertiary">
          {helperText}
        </p>
      )}
    </div>
  );
}

// Password input with visibility toggle
interface PasswordInputProps extends SmartInputProps {
  showStrength?: boolean;
}

export function PasswordInput({
  showStrength = false,
  value,
  onChange,
  label = 'Password',
  className,
  error,
  helperText,
  required,
  disabled,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return { level: 'weak', color: 'text-error-text' };
    if (score <= 3) return { level: 'medium', color: 'text-warning-text' };
    return { level: 'strong', color: 'text-success-text' };
  };

  const strength = showStrength ? getPasswordStrength(value) : null;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={props.id}>
          {label} {required && <span className="text-error-text">*</span>}
        </Label>
      )}
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(error && "border-error-border", "pr-10")}
          disabled={disabled}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-primary"
          disabled={disabled}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {showStrength && value && strength && (
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={cn(
                  "h-1 w-4 rounded-full",
                  level <= (strength.level === 'weak' ? 2 : strength.level === 'medium' ? 3 : 5)
                    ? strength.color.replace('text-', 'bg-')
                    : 'bg-surface-tertiary'
                )}
              />
            ))}
          </div>
          <span className={cn("text-xs", strength.color)}>
            {strength.level} password
          </span>
        </div>
      )}
      {error && (
        <p className="text-sm text-error-text" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-text-tertiary">
          {helperText}
        </p>
      )}
    </div>
  );
}