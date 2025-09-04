/**
 * Enhanced form validation with real-time feedback
 */

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

interface ValidatedInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  rules?: ValidationRule[];
  required?: boolean;
  className?: string;
  'data-testid'?: string;
}

export function ValidatedInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  rules = [],
  required = false,
  className,
  'data-testid': testId,
}: ValidatedInputProps) {
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (touched || value.length > 0) {
      const newErrors: string[] = [];
      
      if (required && !value.trim()) {
        newErrors.push(`${label} is required`);
      } else if (value.trim()) {
        rules.forEach(rule => {
          if (!rule.test(value)) {
            newErrors.push(rule.message);
          }
        });
      }
      
      setErrors(newErrors);
    }
  }, [value, touched, rules, required, label]);

  const hasError = errors.length > 0;
  const isValid = touched && value.length > 0 && !hasError;

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={testId} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={testId}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          className={cn(
            'pr-10',
            hasError && 'border-destructive focus-visible:ring-destructive',
            isValid && 'border-green-500 focus-visible:ring-green-500'
          )}
          data-testid={testId}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground"
              data-testid={`${testId}-password-toggle`}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
          
          {type !== 'password' && (touched || value.length > 0) && (
            <>
              {hasError && (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
              {isValid && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Error Messages */}
      {hasError && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-xs text-destructive flex items-center space-x-1">
              <AlertCircle className="h-3 w-3" />
              <span>{error}</span>
            </p>
          ))}
        </div>
      )}
      
      {/* Success Message */}
      {isValid && (
        <p className="text-xs text-green-600 flex items-center space-x-1">
          <CheckCircle className="h-3 w-3" />
          <span>Looks good!</span>
        </p>
      )}
    </div>
  );
}

interface ValidatedTextareaProps extends Omit<ValidatedInputProps, 'type'> {
  rows?: number;
}

export function ValidatedTextarea({
  label,
  placeholder,
  value,
  onChange,
  rules = [],
  required = false,
  className,
  rows = 3,
  'data-testid': testId,
}: ValidatedTextareaProps) {
  const [touched, setTouched] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (touched || value.length > 0) {
      const newErrors: string[] = [];
      
      if (required && !value.trim()) {
        newErrors.push(`${label} is required`);
      } else if (value.trim()) {
        rules.forEach(rule => {
          if (!rule.test(value)) {
            newErrors.push(rule.message);
          }
        });
      }
      
      setErrors(newErrors);
    }
  }, [value, touched, rules, required, label]);

  const hasError = errors.length > 0;
  const isValid = touched && value.length > 0 && !hasError;

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={testId} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Textarea
          id={testId}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          rows={rows}
          className={cn(
            hasError && 'border-destructive focus-visible:ring-destructive',
            isValid && 'border-green-500 focus-visible:ring-green-500'
          )}
          data-testid={testId}
        />
      </div>
      
      {/* Error Messages */}
      {hasError && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-xs text-destructive flex items-center space-x-1">
              <AlertCircle className="h-3 w-3" />
              <span>{error}</span>
            </p>
          ))}
        </div>
      )}
      
      {/* Success Message */}
      {isValid && (
        <p className="text-xs text-green-600 flex items-center space-x-1">
          <CheckCircle className="h-3 w-3" />
          <span>Looks good!</span>
        </p>
      )}
    </div>
  );
}

// Common validation rules
export const validationRules = {
  email: {
    test: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address'
  },
  
  minLength: (length: number) => ({
    test: (value: string) => value.length >= length,
    message: `Must be at least ${length} characters long`
  }),
  
  maxLength: (length: number) => ({
    test: (value: string) => value.length <= length,
    message: `Must be no more than ${length} characters long`
  }),
  
  phone: {
    test: (value: string) => /^(\+977)?[0-9]{10}$/.test(value.replace(/\s/g, '')),
    message: 'Please enter a valid Nepali phone number'
  },
  
  strongPassword: {
    test: (value: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value),
    message: 'Password must contain uppercase, lowercase, number and special character'
  }
};