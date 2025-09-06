import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  minDate?: Date;
  maxDate?: Date;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled,
  className,
  label,
  required,
  error,
  helperText,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const pickerId = React.useId();

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={pickerId}
          className={cn(
            "block text-sm font-medium text-text-primary",
            required && "after:content-['*'] after:ml-0.5 after:text-danger-600"
          )}
        >
          {label}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={pickerId}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-text-tertiary",
              error && "border-danger-border focus:border-danger-border focus:ring-danger-500",
              className
            )}
            disabled={disabled}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={
              error ? `${pickerId}-error` : helperText ? `${pickerId}-helper` : undefined
            }
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              onDateChange?.(selectedDate);
              setOpen(false);
            }}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error && (
        <p id={`${pickerId}-error`} className="text-sm text-danger-text" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${pickerId}-helper`} className="text-sm text-text-tertiary">
          {helperText}
        </p>
      )}
    </div>
  );
}