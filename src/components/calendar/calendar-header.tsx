'use client';

import { useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addWeeks, addMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { formatDateHeader } from '@/lib/calendar-utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { CalendarView } from '@/types/event';
import { useEvents } from '@/hooks/use-events';

// ── Constants ──────────────────────────────────────────────

const VIEWS: { value: CalendarView; label: string; short: string }[] = [
  { value: 'week', label: 'Semana', short: 'S' },
  { value: 'month', label: 'Mes', short: 'M' },
];

// ── Types ──────────────────────────────────────────────────

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onNavigate: (date: Date) => void;
  onNewEvent: () => void;
}

// ── Helpers ────────────────────────────────────────────────

function navigateDate(date: Date, view: CalendarView, direction: 1 | -1): Date {
  switch (view) {
    case 'week':
      return addWeeks(date, direction);
    case 'month':
      return addMonths(date, direction);
  }
}

// ── Sub-components ─────────────────────────────────────────

function ViewSwitcher({
  view,
  onViewChange,
  layoutId,
}: {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  layoutId: string;
}) {
  return (
    <div className="flex items-center rounded-lg bg-slate-100 p-1">
      {VIEWS.map((v) => {
        const isActive = view === v.value;
        return (
          <button
            key={v.value}
            type="button"
            onClick={() => onViewChange(v.value)}
            className={cn(
              'relative z-10 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer',
              'md:px-3 md:py-1.5 md:text-sm',
              isActive ? 'text-white' : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {/* Active indicator (animated) */}
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-md bg-accent"
                style={{ zIndex: -1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {/* Full label on desktop, short on mobile */}
            <span className="hidden md:inline">{v.label}</span>
            <span className="md:hidden">{v.short}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onNavigate,
  onNewEvent,
}: CalendarHeaderProps) {
  const switcherLayoutId = useId();

  const handlePrev = useCallback(() => {
    onNavigate(navigateDate(currentDate, view, -1));
  }, [currentDate, view, onNavigate]);

  const handleNext = useCallback(() => {
    onNavigate(navigateDate(currentDate, view, 1));
  }, [currentDate, view, onNavigate]);

  const handleToday = useCallback(() => {
    onNavigate(new Date());
  }, [onNavigate]);

  const dateLabel = formatDateHeader(currentDate, view);

  return (
    <header className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2 md:px-5 md:py-3">
      {/* ── Left section ── */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Wordmark */}
        <h1 className="select-none font-display text-lg font-bold tracking-tight md:text-xl">
          <span className="text-accent">J</span>
          <span className="text-text-primary">USE</span>
        </h1>

        {/* Separator */}
        <div className="mx-0.5 h-5 w-px bg-border-strong md:mx-1" aria-hidden="true" />

        {/* Navigation controls */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handlePrev}
            aria-label="Período anterior"
            className="rounded-full size-8 border-slate-200"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="rounded-full px-4 h-8 text-xs font-semibold text-accent border-slate-200 hover:bg-slate-50 hover:text-accent"
          >
            Hoy
          </Button>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleNext}
            aria-label="Período siguiente"
            className="rounded-full size-8 border-slate-200"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* Date label (hidden on mobile) */}
        <AnimatePresence mode="wait">
          <motion.span
            key={dateLabel}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="hidden text-sm font-medium capitalize text-text-secondary md:block"
          >
            {dateLabel}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* ── Right section ── */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* View switcher */}
        <ViewSwitcher
          view={view}
          onViewChange={onViewChange}
          layoutId={switcherLayoutId}
        />



        {/* New event button */}
        <motion.button
          type="button"
          onClick={onNewEvent}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className={cn(
            'inline-flex items-center justify-center gap-2 font-medium text-white cursor-pointer',
            'bg-accent hover:bg-accent-hover transition-colors',
            // Mobile: circle FAB
            'size-9 rounded-full text-sm',
            // Desktop: pill with label
            'md:h-9 md:w-auto md:rounded-lg md:px-4',
          )}
          aria-label="Nuevo Evento"
        >
          <Plus className="size-4 shrink-0" />
          <span className="hidden md:inline">Nuevo Evento</span>
        </motion.button>
      </div>
    </header>
  );
}

export default CalendarHeader;
