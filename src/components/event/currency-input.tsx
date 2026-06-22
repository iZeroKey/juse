import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import * as React from "react";

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  id: string;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

function CurrencyInput({
  value,
  onChange,
  label,
  id,
  placeholder = "0.00",
  readOnly = false,
  className,
}: CurrencyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    if (raw === "") {
      onChange("");
      return;
    }

    const cleaned = raw.replace(/[^0-9.]/g, "");

    const parts = cleaned.split(".");
    const sanitized =
      parts.length <= 2 ? cleaned : `${parts[0]}.${parts.slice(1).join("")}`;

    const [integer, decimal] = sanitized.split(".");
    if (decimal !== undefined && decimal.length > 2) {
      onChange(`${integer}.${decimal.slice(0, 2)}`);
      return;
    }

    onChange(sanitized);
  };

  const handleBlur = () => {
    if (value === "" || value === ".") {
      onChange("0.00");
      return;
    }

    const num = parseFloat(value);
    if (isNaN(num)) {
      onChange("0.00");
      return;
    }

    onChange(num.toFixed(2));
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className='relative'>
        <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none'>
          S/
        </span>
        <Input
          id={id}
          type='text'
          inputMode='decimal'
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          readOnly={readOnly}
          className={cn(
            "pl-9 tabular-nums",
            readOnly && "bg-muted cursor-default",
          )}
        />
      </div>
    </div>
  );
}

export { CurrencyInput };
export default CurrencyInput;
