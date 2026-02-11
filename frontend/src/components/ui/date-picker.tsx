"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "./utils";

interface DatePickerProps {
  name?: string;
  defaultValue?: string | Date | null;
  placeholder?: string;
  className?: string;
  required?: boolean;
  id?: string;
}

function toDateInputValue(value?: string | Date | null): string {
  if (!value) return "";
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDisplayValue(value: string): string {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return "";
  return `${day}/${month}/${year.slice(-2)}`;
}

export function DatePicker({
  name,
  defaultValue,
  placeholder = "dd/mm/yy",
  className,
  required,
  id,
}: DatePickerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [value, setValue] = React.useState<string>(toDateInputValue(defaultValue));

  React.useEffect(() => {
    setValue(toDateInputValue(defaultValue));
  }, [defaultValue]);

  const openNativePicker = () => {
    const input = inputRef.current;
    if (!input) return;

    const inputWithPicker = input as HTMLInputElement & {
      showPicker?: () => void;
    };

    if (typeof inputWithPicker.showPicker === "function") {
      inputWithPicker.showPicker();
    } else {
      input.focus();
      input.click();
    }
  };

  const displayValue = toDisplayValue(value);

  return (
    <div className={cn("relative", className)}>
      <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <div
        className={cn(
          "h-10 w-full rounded-md border border-input bg-background px-3 pl-12 pr-3 text-sm leading-10",
          value ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {displayValue || placeholder}
      </div>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="date"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onClick={openNativePicker}
        required={required}
        aria-label={placeholder}
        className="absolute inset-0 h-10 w-full cursor-pointer opacity-0"
      />
    </div>
  );
}
