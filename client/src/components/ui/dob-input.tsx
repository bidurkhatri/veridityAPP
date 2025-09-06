import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Calendar, AlertCircle } from "lucide-react";
import { format, parse, isValid, differenceInYears, subYears } from "date-fns";

interface DOBInputProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  minAge?: number;
  maxAge?: number;
  className?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function DOBInput({
  value,
  onChange,
  minAge = 13,
  maxAge = 120,
  className,
  error,
  disabled = false,
  placeholder = "DD/MM/YYYY",
}: DOBInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string>("");

  // Calculate date bounds
  const today = new Date();
  const minDate = subYears(today, maxAge);
  const maxDate = subYears(today, minAge);

  React.useEffect(() => {
    if (value) {
      setInputValue(format(value, "dd/MM/yyyy"));
    } else {
      setInputValue("");
    }
  }, [value]);

  const validateDate = (date: Date | null): string => {
    if (!date) return "";
    
    if (!isValid(date)) {
      return "Please enter a valid date";
    }

    const age = differenceInYears(today, date);
    
    if (age < minAge) {
      return `You must be at least ${minAge} years old`;
    }
    
    if (age > maxAge) {
      return `Age cannot exceed ${maxAge} years`;
    }

    if (date > today) {
      return "Date of birth cannot be in the future";
    }

    return "";
  };

  const formatInput = (input: string): string => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, "");
    
    // Format as DD/MM/YYYY
    if (digits.length >= 8) {
      return digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4, 8);
    } else if (digits.length >= 4) {
      return digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
    } else if (digits.length >= 2) {
      return digits.slice(0, 2) + "/" + digits.slice(2);
    }
    return digits;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatInput(rawValue);
    setInputValue(formatted);

    // Try to parse the date if format is complete
    if (formatted.length === 10) {
      try {
        const parsedDate = parse(formatted, "dd/MM/yyyy", new Date());
        const error = validateDate(parsedDate);
        setValidationError(error);
        
        if (!error) {
          onChange(parsedDate);
        } else {
          onChange(undefined);
        }
      } catch {
        setValidationError("Invalid date format");
        onChange(undefined);
      }
    } else {
      setValidationError("");
      onChange(undefined);
    }
  };

  const handleDatePickerSelect = (date: Date | undefined) => {
    if (date) {
      const error = validateDate(date);
      setValidationError(error);
      
      if (!error) {
        onChange(date);
        setInputValue(format(date, "dd/MM/yyyy"));
      }
    }
    setShowDatePicker(false);
  };

  const displayError = error || validationError;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn(
            "pr-10",
            displayError && "border-danger-border focus:border-danger-border focus:ring-danger-500"
          )}
          disabled={disabled}
          maxLength={10}
          data-testid="dob-input"
        />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
          onClick={() => setShowDatePicker(!showDatePicker)}
          disabled={disabled}
          data-testid="dob-calendar-button"
        >
          <Calendar className="h-4 w-4" />
          <span className="sr-only">Open calendar</span>
        </Button>

        {showDatePicker && (
          <div className="absolute top-full left-0 z-50 mt-1">
            <DatePicker
              selected={value}
              onSelect={handleDatePickerSelect}
              fromDate={minDate}
              toDate={maxDate}
              initialFocus
            />
          </div>
        )}
      </div>

      {displayError && (
        <div className="flex items-center gap-2 text-sm text-danger-text">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span data-testid="dob-error">{displayError}</span>
        </div>
      )}

      <div className="text-xs text-text-tertiary">
        Age must be between {minAge} and {maxAge} years
      </div>
    </div>
  );
}