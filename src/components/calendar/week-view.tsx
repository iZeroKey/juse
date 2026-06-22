"use client";

import { EventBlock } from "@/components/calendar/event-block";
import { MobileAgendaItem } from "@/components/calendar/mobile-agenda-item";
import { HOUR_HEIGHT } from "@/components/calendar/time-grid";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEvents } from "@/hooks/use-events";
import {
  calculateOverlaps,
  computeTimeBlocks,
  getDayNumber,
  getDayOfWeekName,
  getEventsForDate,
  getWeekDays,
  isToday,
  timeToMinutes,
} from "@/lib/calendar-utils";
import { cn } from "@/lib/utils";
import type { JuseEvent } from "@/types/event";
import { useEffect, useMemo, useState } from "react";

interface WeekViewProps {
  date: Date;
  onEventClick: (event: JuseEvent) => void;
  onDayClick?: (date: Date) => void;
  onNewEvent?: (initialDate?: string) => void;
  onEditEvent?: (event: JuseEvent) => void;
  onDeleteEvent?: (id: string) => void;
}

function DesktopWeekGrid({
  date,
  onEventClick,
  onEditEvent,
  onDeleteEvent,
}: WeekViewProps) {
  const { events } = useEvents();
  const weekDays = useMemo(() => getWeekDays(date), [date]);

  const weekEvents = useMemo(() => {
    return weekDays.flatMap((d) => getEventsForDate(events, d));
  }, [events, weekDays]);

  const timeBlocks = useMemo(() => computeTimeBlocks(weekEvents), [weekEvents]);

  const dayData = useMemo(
    () =>
      weekDays.map((d) => ({
        date: d,
        positioned: calculateOverlaps(getEventsForDate(events, d)),
      })),
    [events, weekDays],
  );

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

  return (
    <div className='flex h-full flex-col'>
      <div className='flex border-b border-border'>
        <div className='w-14 shrink-0' />
        {weekDays.map((d) => {
          const today = isToday(d);
          return (
            <div
              key={d.toISOString()}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 border-l border-border py-3",
                today && "bg-muted/50",
              )}>
              <span
                className={cn(
                  "font-sans text-[11px] font-semibold uppercase tracking-wider",
                  today ? "text-accent" : "text-muted-foreground",
                )}>
                {getDayOfWeekName(d)}
              </span>
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full font-display text-base font-semibold",
                  today ? "bg-accent text-white" : "text-muted-foreground",
                )}>
                {getDayNumber(d)}
              </span>
            </div>
          );
        })}
      </div>

      <ScrollArea scrollFade className='flex-1 min-h-0 bg-surface'>
        <div className='flex flex-col gap-4 py-4'>
          {timeBlocks.map((block, blockIndex) => {
            const blockHours = block.endHour - block.startHour;
            const blockHeight = blockHours * HOUR_HEIGHT;
            const hours = Array.from(
              { length: blockHours + 1 },
              (_, i) => block.startHour + i,
            );

            return (
              <div
                key={blockIndex}
                className='flex relative bg-surface animate-in fade-in duration-500'
                style={{ height: blockHeight }}>
                {block.startHour > 0 && (
                  <div className='absolute top-0 inset-x-0 h-10 bg-linear-to-b from-surface to-transparent z-40 pointer-events-none' />
                )}
                {block.endHour < 24 && (
                  <div className='absolute bottom-0 inset-x-0 h-10 bg-linear-to-t from-surface to-transparent z-40 pointer-events-none' />
                )}

                {timeOffset !== null &&
                  timeOffset >= block.startHour &&
                  timeOffset <= block.endHour && (
                    <div
                      className='pointer-events-none absolute left-14 right-0 z-30 flex items-center'
                      style={{
                        top: (timeOffset - block.startHour) * HOUR_HEIGHT,
                      }}>
                      <div className='h-2.5 w-2.5 -translate-x-1.25 rounded-full bg-red-500 shadow-sm shadow-red-500/50 ring-2 ring-white' />
                      <div className='h-px flex-1 bg-red-500 shadow-sm shadow-red-500/20' />
                    </div>
                  )}

                <div className='relative w-14 shrink-0 border-r border-border bg-surface'>
                  {hours.map((hour) => {
                    if (hour === block.startHour && block.startHour > 0)
                      return null;
                    if (hour === block.endHour && block.endHour < 24)
                      return null;

                    const top = (hour - block.startHour) * HOUR_HEIGHT;
                    const displayHour =
                      hour === 24 ? "00" : String(hour).padStart(2, "0");
                    return (
                      <span
                        key={hour}
                        className='absolute right-2 font-sans text-[11px] leading-none text-muted-foreground'
                        style={{ top: top - 6 }}>
                        {displayHour}:00
                      </span>
                    );
                  })}
                </div>

                {dayData.map(({ date: d, positioned }) => (
                  <div
                    key={d.toISOString()}
                    className={cn(
                      "relative flex-1 border-l border-border",
                      isToday(d) && "bg-accent/10",
                    )}>
                    {hours.map((hour) => {
                      const top = (hour - block.startHour) * HOUR_HEIGHT;
                      const showSolidLine =
                        !(hour === block.startHour && block.startHour > 0) &&
                        !(hour === block.endHour && block.endHour < 24);
                      return (
                        <div key={`line-${hour}`}>
                          {showSolidLine && (
                            <div
                              className='absolute inset-x-0 border-t border-border/60'
                              style={{ top }}
                            />
                          )}
                          {hour < block.endHour && (
                            <div
                              className='absolute inset-x-0 border-t border-dashed border-border/30'
                              style={{ top: top + HOUR_HEIGHT / 2 }}
                            />
                          )}
                        </div>
                      );
                    })}

                    {positioned.map(({ event, column, totalColumns }) => {
                      const startMin = timeToMinutes(event.startTime);
                      const endMin = timeToMinutes(event.endTime);
                      const durationMin =
                        endMin > startMin
                          ? endMin - startMin
                          : endMin + 24 * 60 - startMin;
                      const blockStartMin = block.startHour * 60;
                      const blockEndMin = block.endHour * 60;

                      if (startMin >= blockEndMin || endMin <= blockStartMin) {
                        return null;
                      }

                      const topPx =
                        (startMin - blockStartMin) * (HOUR_HEIGHT / 60);
                      const heightPx = durationMin * (HOUR_HEIGHT / 60);
                      const widthPct = 100 / totalColumns;
                      const leftPct = column * widthPct;

                      return (
                        <EventBlock
                          key={event.id}
                          event={event}
                          onClick={() => onEventClick(event)}
                          onEdit={
                            onEditEvent ? () => onEditEvent(event) : undefined
                          }
                          onDelete={
                            onDeleteEvent
                              ? () => onDeleteEvent(event.id)
                              : undefined
                          }
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
                ))}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

function MobileWeekView({
  date,
  onEventClick,
  onEditEvent,
  onDeleteEvent,
}: WeekViewProps) {
  const { events } = useEvents();
  const weekDays = useMemo(() => getWeekDays(date), [date]);

  const weekData = useMemo(() => {
    return weekDays.map((d) => ({
      date: d,
      events: getEventsForDate(events, d),
    }));
  }, [events, weekDays]);

  return (
    <div className='flex h-full flex-col overflow-hidden min-w-0'>
      <ScrollArea
        scrollFade
        className='flex-1 min-h-0 bg-muted/50 [&>div>div]:block!'>
        <div className='space-y-6 p-4 pb-12 w-full max-w-full'>
          {weekData.map(({ date: d, events: dayEvents }) => {
            const today = isToday(d);
            const hasEvents = dayEvents.length > 0;

            return (
              <div key={d.toISOString()} className='space-y-3'>
                <div className='sticky top-0 z-10 -mx-4 px-4 py-2 bg-muted border-b border-transparent'>
                  <div className='flex items-center gap-3'>
                    <div
                      className={cn(
                        "flex flex-col items-center justify-center w-11 h-11 rounded-xl shrink-0",
                        today
                          ? "bg-accent text-white shadow-sm"
                          : "bg-surface border border-border text-muted-foreground",
                      )}>
                      <span className='font-sans text-[10px] font-semibold uppercase leading-none mb-0.5'>
                        {getDayOfWeekName(d)}
                      </span>
                      <span className='font-display font-bold leading-none'>
                        {getDayNumber(d)}
                      </span>
                    </div>
                    <div className='h-px flex-1 bg-border' />
                  </div>
                </div>

                <div className='space-y-2'>
                  {hasEvents ? (
                    dayEvents.map((event) => (
                      <MobileAgendaItem
                        key={event.id}
                        event={event}
                        onClick={() => onEventClick(event)}
                        onEdit={
                          onEditEvent ? () => onEditEvent(event) : undefined
                        }
                        onDelete={
                          onDeleteEvent
                            ? () => onDeleteEvent(event.id)
                            : undefined
                        }
                      />
                    ))
                  ) : (
                    <p className='py-3 text-center font-sans text-sm italic text-muted-foreground bg-surface/50 rounded-lg border border-border border-dashed'>
                      Sin eventos
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

function WeekView(props: WeekViewProps) {
  return (
    <>
      <div className='hidden h-full md:block'>
        <DesktopWeekGrid {...props} />
      </div>

      <div className='block h-full md:hidden'>
        <MobileWeekView {...props} />
      </div>
    </>
  );
}

export { WeekView };
export type { WeekViewProps };
export default WeekView;
