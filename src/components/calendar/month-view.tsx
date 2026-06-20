'use client';

import {
  format,
  getEventsForDate,
  getEventTypeDotColor,
  getMonthGrid,
  isToday,
} from '@/lib/calendar-utils';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { EventBlock } from "@/components/calendar/event-block";
import { MobileAgendaItem } from '@/components/calendar/mobile-agenda-item';
import { HOUR_HEIGHT } from "@/components/calendar/time-grid";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEvents } from '@/hooks/use-events';
import { calculateOverlaps, computeTimeBlocks, timeToMinutes } from "@/lib/calendar-utils";
import { cn } from '@/lib/utils';
import type { JuseEvent } from '@/types/event';
// unused imports removed
import { es } from 'date-fns/locale';

// ── Constants ──────────────────────────────────────────────

const DAY_HEADERS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const;

const MAX_VISIBLE_PILLS = 3;

// ── Types ──────────────────────────────────────────────────

interface MonthViewProps {
  date: Date;
  onEventClick: (event: JuseEvent) => void;
  onDayClick?: (date: Date) => void;
  onNewEvent?: (initialDate?: string) => void;
}

// ── Sub-components ─────────────────────────────────────────

function EventPill({ event }: { event: JuseEvent }) {
  const dotColor = getEventTypeDotColor(event.eventType);

  return (
    <div
      className={cn(
        'hidden w-full items-center gap-1.5 rounded-md px-1.5 py-0.5 text-left',
        'text-[11px] leading-tight text-text-primary/80',
        'md:flex',
      )}
    >
      <span
        className={cn('size-1.5 shrink-0 rounded-full', dotColor)}
        aria-hidden="true"
      />
      <span className="truncate">{event.eventType}</span>
    </div>
  );
}

function EventDotMobile({ event }: { event: JuseEvent }) {
  const dotColor = getEventTypeDotColor(event.eventType);

  return (
    <div
      className={cn('size-1.5 rounded-full', dotColor)}
      aria-label={`${event.eventType} — ${event.location}`}
    />
  );
}

function DayCell({
  day,
  currentMonth,
  events,
  onDayClick,
  isSelected,
}: {
  day: Date;
  currentMonth: number;
  events: JuseEvent[];
  onDayClick: (date: Date) => void;
  isSelected?: boolean;
}) {
  const isCurrentMonth = day.getMonth() === currentMonth;
  const dayIsToday = isToday(day);
  const dayNumber = format(day, 'd');
  const overflowCount = events.length - MAX_VISIBLE_PILLS;

  const handleDayClick = useCallback(() => {
    onDayClick(day);
  }, [day, onDayClick]);

  const handleOverflowClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDayClick(day);
    },
    [day, onDayClick],
  );

  return (
    <motion.button
      type="button"
      onClick={handleDayClick}
      className={cn(
        'relative flex flex-col items-start border-b border-r border-border p-1 md:p-2',
        'min-h-[80px] md:min-h-[120px]',
        'text-left cursor-pointer transition-colors duration-200 hover:bg-accent-soft',
        !isCurrentMonth && 'opacity-40',
      )}
    >
      {/* Day number */}
      <span
        className={cn(
          'mb-1 flex size-6 md:size-7 items-center justify-center rounded-full text-xs md:text-sm font-medium transition-colors',
          isSelected
            ? 'bg-accent text-white font-semibold shadow-sm'
            : dayIsToday
              ? 'bg-accent/15 text-accent font-semibold'
              : 'text-text-primary',
        )}
      >
        {dayNumber}
      </span>

      {/* Desktop: event pills */}
      <div className="hidden w-full flex-col gap-0.5 md:flex">
        {events.slice(0, MAX_VISIBLE_PILLS).map((event) => (
          <EventPill key={event.id} event={event} />
        ))}
        {overflowCount > 0 && (
          <span
            role="button"
            tabIndex={0}
            onClick={handleOverflowClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                onDayClick(day);
              }
            }}
            className="mt-0.5 cursor-pointer px-1.5 text-[11px] font-medium text-accent hover:underline"
          >
            +{overflowCount} más
          </span>
        )}
      </div>

      {/* Mobile: colored dots only */}
      <div className="flex flex-wrap gap-1 md:hidden">
        {events.slice(0, 5).map((event) => (
          <EventDotMobile
            key={event.id}
            event={event}
          />
        ))}
        {events.length > 5 && (
          <span className="text-[9px] text-text-secondary font-medium">
            +{events.length - 5}
          </span>
        )}
      </div>
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Desktop: Day Sidebar Grid
// ---------------------------------------------------------------------------

function DesktopDaySidebar({
  date,
  events,
  onEventClick,
  onNewEvent,
}: {
  date: Date;
  events: JuseEvent[];
  onEventClick: (event: JuseEvent) => void;
  onNewEvent?: (initialDate?: string) => void;
}) {
  const timeBlocks = useMemo(() => computeTimeBlocks(events), [events]);
  const positioned = useMemo(() => calculateOverlaps(events), [events]);

  const [timeOffset, setTimeOffset] = useState<number | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours() + now.getMinutes() / 60;
      setTimeOffset(h);
    };
    updateTime();
    const interval = setInterval(updateTime, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (events.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center bg-slate-50/30">
        <button
          type="button"
          onClick={() => onNewEvent?.(format(date, 'yyyy-MM-dd'))}
          className="rounded-full bg-white p-4 shadow-sm mb-4 border border-slate-200 text-slate-400 hover:text-accent hover:border-accent hover:shadow-md transition-all cursor-pointer"
        >
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <p className="text-sm font-medium text-slate-600">Sin eventos</p>
        <p className="text-xs text-slate-400 mt-1">No hay eventos programados para este día.</p>
      </div>
    );
  }

  return (
    <ScrollArea scrollFade className="flex-1 min-h-0 bg-white">
      <div className="flex flex-col gap-4 p-4">
        {timeBlocks.map((block, blockIndex) => {
          const blockHours = block.endHour - block.startHour;
          const blockHeight = blockHours * HOUR_HEIGHT;
          const hours = Array.from({ length: blockHours + 1 }, (_, i) => block.startHour + i);

          return (
            <div
              key={blockIndex}
              className="flex relative bg-white animate-in fade-in duration-500"
              style={{ height: blockHeight }}
            >
              {/* Fades */}
              {block.startHour > 0 && (
                <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-white to-transparent z-40 pointer-events-none" />
              )}
              {block.endHour < 24 && (
                <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-white to-transparent z-40 pointer-events-none" />
              )}
              {/* Current time indicator */}
              {timeOffset !== null && isToday(date) && timeOffset >= block.startHour && timeOffset <= block.endHour && (
                <div
                  className="pointer-events-none absolute left-12 right-0 z-30 flex items-center"
                  style={{ top: (timeOffset - block.startHour) * HOUR_HEIGHT }}
                >
                  <div className="h-2 w-2 -translate-x-[4px] rounded-full bg-red-500 shadow-sm shadow-red-500/50 ring-2 ring-white" />
                  <div className="h-[1px] flex-1 bg-red-500/80 shadow-sm" />
                </div>
              )}

              {/* Time labels */}
              <div className="relative w-12 shrink-0 border-r border-slate-200 bg-white/50 backdrop-blur-sm z-10">
                {hours.map((hour) => {
                  if (hour === block.startHour && block.startHour > 0) return null;
                  if (hour === block.endHour && block.endHour < 24) return null;

                  const top = (hour - block.startHour) * HOUR_HEIGHT;
                  const displayHour = hour === 24 ? "00" : String(hour).padStart(2, "0");
                  return (
                    <span
                      key={hour}
                      className="absolute right-2 font-sans text-[10px] font-medium text-slate-400"
                      style={{ top: top - 6 }}
                    >
                      {displayHour}:00
                    </span>
                  );
                })}
              </div>

              {/* Day column */}
              <div className="relative flex-1">
                {/* Hour lines */}
                {hours.map((hour) => {
                  const top = (hour - block.startHour) * HOUR_HEIGHT;
                  const showSolidLine = !(hour === block.startHour && block.startHour > 0) && !(hour === block.endHour && block.endHour < 24);
                  return (
                    <div key={`line-${hour}`}>
                      {showSolidLine && (
                        <div
                          className="absolute inset-x-0 border-t border-slate-200/60"
                          style={{ top }}
                        />
                      )}
                      {hour < block.endHour && (
                        <div
                          className="absolute inset-x-0 border-t border-dashed border-slate-200/30"
                          style={{ top: top + HOUR_HEIGHT / 2 }}
                        />
                      )}
                    </div>
                  );
                })}

                {/* Events */}
                {positioned.map(({ event, column, totalColumns }) => {
                  const startMin = timeToMinutes(event.startTime);
                  const endMin = timeToMinutes(event.endTime);
                  const durationMin = endMin > startMin ? endMin - startMin : endMin + 24 * 60 - startMin;
                  const blockStartMin = block.startHour * 60;
                  const blockEndMin = block.endHour * 60;

                  if (startMin >= blockEndMin || endMin <= blockStartMin) {
                    return null;
                  }

                  const topPx = (startMin - blockStartMin) * (HOUR_HEIGHT / 60);
                  const heightPx = durationMin * (HOUR_HEIGHT / 60);
                  const widthPct = 100 / totalColumns;
                  const leftPct = column * widthPct;

                  return (
                      <EventBlock
                        key={event.id}
                        event={event}
                        onClick={() => onEventClick(event)}
                        style={{
                          top: `${topPx}px`,
                          height: `${heightPx}px`,
                          left: `calc(${leftPct}% + 4px)`,
                          width: `calc(${widthPct}% - 8px)`,
                          minHeight: 20,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

// ── Main component ─────────────────────────────────────────

export function MonthView({ date, onEventClick, onDayClick, onNewEvent }: MonthViewProps) {
  const { events } = useEvents();
  const [selectedDay, setSelectedDay] = useState<Date>(date);

  // Sync selected day when the date prop changes (e.g., clicking "Hoy" or changing months)
  useEffect(() => {
    setSelectedDay(date);
  }, [date]);

  const weeks = useMemo(() => getMonthGrid(date), [date]);
  const currentMonth = date.getMonth();

  // Pre-compute events for each day in the grid to avoid redundant filtering
  const eventsByDay = useMemo(() => {
    const map = new Map<string, JuseEvent[]>();
    for (const week of weeks) {
      for (const day of week) {
        const key = format(day, 'yyyy-MM-dd');
        if (!map.has(key)) {
          map.set(key, getEventsForDate(events, day));
        }
      }
    }
    return map;
  }, [events, weeks]);

  const getEvents = useCallback(
    (day: Date): JuseEvent[] => {
      return eventsByDay.get(format(day, 'yyyy-MM-dd')) ?? [];
    },
    [eventsByDay],
  );

  return (
    <div className="flex h-full flex-col md:flex-row overflow-y-auto md:overflow-hidden border border-border bg-surface">
      <div className="flex flex-none min-h-[400px] md:min-h-0 md:flex-1 flex-col overflow-hidden">
        {/* Day-of-week header row */}
        <div className="grid grid-cols-7 border-b border-border bg-slate-50/60">
          {DAY_HEADERS.map((label) => (
            <div
              key={label}
              className="px-2 py-2 text-center text-[11px] md:text-xs font-semibold uppercase tracking-wider text-text-secondary"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Week rows */}
        <div className="flex flex-1 flex-col">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 flex-1">
              {week.map((day) => (
                <DayCell
                  key={day.toISOString()}
                  day={day}
                  currentMonth={currentMonth}
                  events={getEvents(day)}
                  isSelected={day.toDateString() === selectedDay.toDateString()}
                  onDayClick={(d) => {
                    setSelectedDay(d);
                    onDayClick?.(d);
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar: Agenda on Mobile, Dynamic Grid on Desktop */}
      <div className="flex-none md:w-80 lg:w-[400px] border-t md:border-t-0 md:border-l border-border bg-slate-50/30 flex flex-col md:overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <span className="font-display text-3xl font-bold">
                {format(selectedDay, 'd')}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold uppercase tracking-wide text-slate-800">
                {format(selectedDay, 'EEEE', { locale: es })}
              </span>
              <span className="text-xs font-medium text-slate-500 mt-0.5">
                {format(selectedDay, 'MMMM, yyyy', { locale: es })}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile View: Agenda List */}
        <div className="md:hidden flex-none p-4 pb-12">
          <div className="space-y-2">
            {getEvents(selectedDay).length > 0 ? (
              getEvents(selectedDay).map((event) => (
                <MobileAgendaItem
                  key={event.id}
                  event={event}
                  onClick={() => onEventClick(event)}
                />
              ))
            ) : (
              <p className="py-8 text-center font-sans text-sm italic text-slate-400 bg-white/50 rounded-lg border border-slate-100 border-dashed">
                Sin eventos para este día
              </p>
            )}
          </div>
        </div>

        {/* Desktop View: Dynamic Smart Bounds Grid */}
        <div className="hidden md:flex flex-1 overflow-hidden">
          <DesktopDaySidebar
            date={selectedDay}
            events={getEvents(selectedDay)}
            onEventClick={onEventClick}
            onNewEvent={onNewEvent}
          />
        </div>
      </div>
    </div>
  );
}

export default MonthView;
