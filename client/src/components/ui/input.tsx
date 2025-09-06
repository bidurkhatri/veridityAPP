import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  helperText?: string;
  label?: string;
  required?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, helperText, label, required, ...props }, ref) => {
    const inputId = React.useId();

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium text-text-primary",
              required && "after:content-['*'] after:ml-0.5 after:text-danger-600"
            )}
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary",
            "transition-colors duration-fast",
            "focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-danger-border focus:border-danger-border focus:ring-danger-500",
            className
          )}
          ref={ref}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-danger-text" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-sm text-text-tertiary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
