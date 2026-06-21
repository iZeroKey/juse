'use client';

import { useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addWeeks, addMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
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
  appView: 'calendar' | 'contracts';
  onAppViewChange: (view: 'calendar' | 'contracts') => void;
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
  appView,
  onAppViewChange,
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
        {/* Navigation Drawer */}
        <NavDrawer currentView={appView} onViewChange={onAppViewChange} />

        {/* Wordmark */}
        <h1 className="select-none font-display text-lg font-bold tracking-tight md:text-xl flex items-center shrink-0">
          <img src="/juse.png" alt="Juse Logo" className="h-6 md:h-8 object-contain" />
        </h1>

        {/* Separator */}
        <div className="mx-0.5 h-5 w-px bg-border-strong md:mx-1 shrink-0" aria-hidden="true" />

        {/* Navigation controls grouped */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToday}
            className={cn(
              "flex items-center justify-center h-8 px-3.5 text-xs font-semibold shadow-xs transition-colors rounded-[14px] border",
              isCurrentDateToday
                ? "text-[var(--color-juse-blue)] bg-[var(--color-juse-blue)]/5 border-[var(--color-juse-blue)]/30 hover:bg-[var(--color-juse-blue)]/10"
                : "text-slate-700 bg-white border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            Hoy
            <span
              className={cn(
                "ml-1.5 size-1.5 rounded-full transition-colors",
                isCurrentDateToday ? "bg-[var(--color-juse-blue)]" : "bg-slate-300"
              )}
            />
          </button>

          <div className="flex items-center rounded-[14px] border border-slate-200 bg-white shadow-xs overflow-hidden h-8">
            <button
              onClick={handlePrev}
              aria-label="Período anterior"
              className="flex items-center justify-center h-full w-9 border-r border-slate-200 bg-transparent hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="size-4 text-slate-600" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Período siguiente"
              className="flex items-center justify-center h-full w-9 bg-transparent hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <ChevronRight className="size-4 text-slate-600" />
            </button>
          </div>
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
