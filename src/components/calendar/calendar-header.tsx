'use client';

import { useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addWeeks, addMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Menu } from 'lucide-react';
import { NavDrawer } from '@/components/layout/nav-drawer';
import { formatDateHeader } from '@/lib/calendar-utils';
import { cn } from '@/lib/utils';
import type { CalendarView } from '@/types/event';

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
                className="absolute inset-0 rounded-md bg-[var(--color-juse-blue)]"
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
  const isCurrentDateToday = isToday(currentDate);

  return (
    <header className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2 md:px-5 md:py-3">
      {/* ── Left section ── */}
      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
        {/* Navigation Drawer wrapping the Menu Icon */}
        <NavDrawer>
          <button
            type="button"
            className="p-1.5 md:p-2 rounded-md hover:bg-slate-100 transition-colors text-slate-600 cursor-pointer flex items-center justify-center shrink-0 mr-1"
            aria-label="Abrir menú"
          >
            <Menu className="size-5 md:size-5" />
          </button>
        </NavDrawer>

        <div className="select-none font-display text-lg font-bold tracking-tight flex items-center shrink-0">
          <img src="/juse.png" alt="Juse Logo" className="h-6 md:h-7 object-contain" />
        </div>

        {/* Separator */}
        <div className="mx-0.5 h-5 w-px bg-border-strong md:mx-1 shrink-0" aria-hidden="true" />

        {/* Navigation controls grouped */}
        <div className="flex items-center rounded-full border border-slate-200 bg-white shadow-sm overflow-hidden h-7 md:h-8 shrink-0">
          <button
            onClick={handlePrev}
            aria-label="Período anterior"
            className="flex items-center justify-center h-full w-8 md:w-9 border-r border-slate-200 bg-transparent hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
          >
            <ChevronLeft className="size-3.5 md:size-4 text-slate-600" />
          </button>

          <button
            type="button"
            onClick={handleToday}
            className={cn(
              "flex items-center justify-center h-full px-3 md:px-4 text-xs md:text-[13px] font-semibold transition-colors border-r border-slate-200 cursor-pointer",
              isCurrentDateToday
                ? "text-[var(--color-juse-blue)] bg-[var(--color-juse-blue)]/5 hover:bg-[var(--color-juse-blue)]/10"
                : "text-slate-700 bg-transparent hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            Hoy
            <span
              className={cn(
                "ml-1 md:ml-1.5 size-1.5 rounded-full transition-colors",
                isCurrentDateToday ? "bg-[var(--color-juse-blue)]" : "bg-slate-300"
              )}
            />
          </button>

          <button
            onClick={handleNext}
            aria-label="Período siguiente"
            className="flex items-center justify-center h-full w-8 md:w-9 bg-transparent hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
          >
            <ChevronRight className="size-3.5 md:size-4 text-slate-600" />
          </button>
        </div>

        {/* Date label */}
        <AnimatePresence mode="wait">
          <motion.span
            key={dateLabel}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="truncate text-sm font-medium capitalize text-text-secondary block"
          >
            {dateLabel}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* ── Right section ── */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
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
            'bg-[var(--color-juse-red)] hover:brightness-110 transition-all shadow-sm hover:shadow-md',
            // Mobile: circle FAB
            'size-9 rounded-full text-sm',
            // Desktop: pill with label
            'md:h-9 md:w-auto md:rounded-full md:px-4',
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
