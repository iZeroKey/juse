import * as React from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useMediaQuery } from '@/hooks/use-media-query';

interface StaffTagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  label: string;
  id: string;
  placeholder?: string;
}

function StaffTagInput({
  value,
  onChange,
  label,
  id,
  placeholder = 'Escribe un nombre y presiona Enter',
}: StaffTagInputProps) {
  const [inputValue, setInputValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const addTag = (name: string) => {
    const trimmed = name.trim();
    if (trimmed === '') return;

    // Case-insensitive duplicate check
    const isDuplicate = value.some(
      (existing) => existing.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) return;

    onChange([...value, trimmed]);
    setInputValue('');
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    }

    if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div
        role="group"
        aria-label={label}
        onClick={handleContainerClick}
        className={cn(
          'flex min-h-[42px] w-full flex-wrap items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 shadow-sm transition-colors',
          'focus-within:border-[var(--color-juse-blue)] focus-within:ring-2 focus-within:ring-[var(--color-juse-blue)]/20',
          'cursor-text'
        )}
      >
        <AnimatePresence mode="popLayout">
          {value.map((tag, index) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              layout
            >
              <Badge
                variant="secondary"
                className="gap-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              >
                {tag}
                <button
                  type="button"
                  aria-label={`Quitar ${tag}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(index);
                  }}
                  className="ml-0.5 rounded-full p-0.5 outline-none transition-colors hover:bg-indigo-200 focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            </motion.span>
          ))}
        </AnimatePresence>
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <p className="text-[11px] text-muted-foreground mt-1 px-1">
        {isDesktop ? 'Presiona Enter para agregar' : 'Presiona Ir / Enter en el teclado para agregar'}
      </p>
    </div>
  );
}

export { StaffTagInput };
export default StaffTagInput;
