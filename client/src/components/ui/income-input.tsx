import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface IncomeInputProps {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  className?: string;
  error?: string;
  disabled?: boolean;
  showKeypad?: boolean;
  placeholder?: string;
}

const KEYPAD_NUMBERS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['00', '0', '⌫'],
];

export function IncomeInput({
  value,
  onChange,
  currency = 'NPR',
  className,
  error,
  disabled = false,
  showKeypad = true,
  placeholder = "0",
}: IncomeInputProps) {
  const [displayValue, setDisplayValue] = React.useState("");
  const [showKeypadModal, setShowKeypadModal] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    if (value === 0) {
      setDisplayValue("");
    } else {
      setDisplayValue(formatNumberWithSeparators(value.toString()));
    }
  }, [value]);

  const formatNumberWithSeparators = (num: string): string => {
    // Remove any non-digits
    const cleaned = num.replace(/\D/g, "");
    
    if (!cleaned) return "";
    
    // Add thousand separators using Nepal's numbering system
    // Format: X,XX,XXX (lakhs system)
    const reversed = cleaned.split("").reverse().join("");
    const formatted = reversed.replace(/(\d{3})(?=\d)/g, "$1,");
    return formatted.split("").reverse().join("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = rawValue.replace(/[^\d]/g, "");
    
    if (numericValue === "") {
      setDisplayValue("");
      onChange(0);
      return;
    }

    const formatted = formatNumberWithSeparators(numericValue);
    setDisplayValue(formatted);
    onChange(parseInt(numericValue));
  };

  const handleKeypadInput = (key: string) => {
    const currentNumeric = displayValue.replace(/[^\d]/g, "");
    
    if (key === '⌫') {
      const newValue = currentNumeric.slice(0, -1);
      if (newValue === "") {
        setDisplayValue("");
        onChange(0);
      } else {
        const formatted = formatNumberWithSeparators(newValue);
        setDisplayValue(formatted);
        onChange(parseInt(newValue));
      }
    } else {
      const newValue = currentNumeric + key;
      // Limit to reasonable income amounts (up to 999,999,999)
      if (newValue.length <= 9) {
        const formatted = formatNumberWithSeparators(newValue);
        setDisplayValue(formatted);
        onChange(parseInt(newValue));
      }
    }
  };

  const handleInputFocus = () => {
    if (isMobile && showKeypad) {
      setShowKeypadModal(true);
    }
  };

  const currencySymbols = {
    NPR: 'रू',
    USD: '$',
    EUR: '€',
    INR: '₹',
  };

  const currencySymbol = currencySymbols[currency as keyof typeof currencySymbols] || currency;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-medium">
          {currencySymbol}
        </div>
        
        <Input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={cn(
            "pl-12 text-right font-mono text-lg",
            error && "border-danger-border focus:border-danger-border focus:ring-danger-500"
          )}
          disabled={disabled}
          readOnly={isMobile && showKeypad}
          data-testid="income-input"
        />
        
        {showKeypad && isMobile && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
            onClick={() => setShowKeypadModal(true)}
            disabled={disabled}
            data-testid="income-keypad-button"
          >
            123
          </Button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="text-sm text-danger-text" data-testid="income-error">
          {error}
        </div>
      )}

      {/* Format hint */}
      <div className="text-xs text-text-tertiary">
        Monthly income in {currency}. Use commas for thousands.
      </div>

      {/* Mobile Keypad Modal */}
      {showKeypadModal && isMobile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <Card className="w-full rounded-t-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Enter Amount</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKeypadModal(false)}
                  data-testid="keypad-close"
                >
                  Done
                </Button>
              </div>
              
              {/* Display */}
              <div className="mb-4 p-3 bg-surface-secondary rounded-lg">
                <div className="text-right">
                  <div className="text-sm text-text-tertiary">{currency}</div>
                  <div className="text-2xl font-mono">
                    {displayValue || "0"}
                  </div>
                </div>
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-3">
                {KEYPAD_NUMBERS.flat().map((key) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="lg"
                    onClick={() => handleKeypadInput(key)}
                    className={cn(
                      "h-12 text-lg font-mono",
                      key === '⌫' && "text-danger-text"
                    )}
                    data-testid={`keypad-${key}`}
                  >
                    {key}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Desktop Keypad */}
      {showKeypad && !isMobile && (
        <Card className="p-3">
          <div className="text-xs text-text-tertiary mb-2 text-center">
            Quick Entry
          </div>
          <div className="grid grid-cols-3 gap-2">
            {KEYPAD_NUMBERS.flat().map((key) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => handleKeypadInput(key)}
                className={cn(
                  "h-8 text-sm font-mono",
                  key === '⌫' && "text-danger-text"
                )}
                data-testid={`keypad-${key}`}
                disabled={disabled}
              >
                {key}
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}