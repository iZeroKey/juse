"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef, useState, type ReactNode } from "react";

interface TimeGridProps {
  gridStartHour?: number;
  gridEndHour?: number;
  children: ReactNode;
  showCurrentTime?: boolean;
}

export const HOUR_HEIGHT = 80; // px per hour

function getCurrentTimeOffset(gridStartHour: number, gridEndHour: number): number | null {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const gridStartMinutes = gridStartHour * 60;
  const gridEndMinutes = gridEndHour * 60;

  if (currentMinutes < gridStartMinutes || currentMinutes > gridEndMinutes) {
    return null;
  }

  return ((currentMinutes - gridStartMinutes) / 60) * HOUR_HEIGHT;
}

function TimeGrid({
  gridStartHour = 0,
  gridEndHour = 24,
  children,
  showCurrentTime = true,
}: TimeGridProps) {
  const totalHours = gridEndHour - gridStartHour;
  const totalHeight = totalHours * HOUR_HEIGHT;

  const [timeOffset, setTimeOffset] = useState<number | null>(() =>
    showCurrentTime ? getCurrentTimeOffset(gridStartHour, gridEndHour) : null
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  // Update current time indicator every 60 seconds
  useEffect(() => {
    if (!showCurrentTime) return;

    setTimeOffset(getCurrentTimeOffset(gridStartHour, gridEndHour));

    const interval = setInterval(() => {
      setTimeOffset(getCurrentTimeOffset(gridStartHour, gridEndHour));
    }, 60_000);

    return () => clearInterval(interval);
  }, [showCurrentTime, gridStartHour, gridEndHour]);

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (hasScrolled.current || timeOffset === null) return;

    const viewport = scrollRef.current?.querySelector(
      '[data-slot="scroll-area-viewport"]'
    );
    if (viewport instanceof HTMLElement) {
      const scrollTarget = Math.max(0, timeOffset - 120);
      viewport.scrollTop = scrollTarget;
      hasScrolled.current = true;
    }
  }, [timeOffset]);

  const hours = Array.from(
    { length: totalHours },
    (_, i) => gridStartHour + i
  );

  return (
    <ScrollArea scrollFade ref={scrollRef} className="h-full w-full">
      <div className="flex" style={{ height: totalHeight }}>
        {/* Hour labels column */}
        <div className="relative w-14 shrink-0 border-r border-border">
          {hours.map((hour) => {
            const top = (hour - gridStartHour) * HOUR_HEIGHT;
            return (
              <span
                key={hour}
                className="absolute right-2 font-sans text-[11px] leading-none text-muted-foreground"
                style={{ top: top - 6 }}
              >
                {String(hour).padStart(2, "0")}:00
              </span>
            );
          })}
        </div>

        {/* Grid + events area */}
        <div className="relative flex-1">
          {/* Hour grid lines */}
          {hours.map((hour) => {
            const top = (hour - gridStartHour) * HOUR_HEIGHT;
            return (
              <div key={`h-${hour}`}>
                {/* Full hour line */}
                <div
                  className="absolute inset-x-0 border-t border-border/60"
                  style={{ top }}
                />
                {/* Half-hour dashed line */}
                <div
                  className="absolute inset-x-0 border-t border-dashed border-border/30"
                  style={{ top: top + HOUR_HEIGHT / 2 }}
                />
              </div>
            );
          })}

          {/* Current time indicator */}
          {showCurrentTime && timeOffset !== null && (
            <div
              className="pointer-events-none absolute inset-x-0 z-30 flex items-center"
              style={{ top: timeOffset }}
            >
              <div className="h-2.5 w-2.5 -translate-x-[5px] rounded-full bg-red-500 shadow-sm shadow-red-500/50 ring-2 ring-white" />
              <div className="h-px flex-1 bg-red-500 shadow-sm shadow-red-500/20" />
            </div>
          )}

          {/* Events container */}
          <div className="relative h-full">{children}</div>
        </div>
      </div>
    </ScrollArea>
  );
}

export { TimeGrid };
export type { TimeGridProps };
export default TimeGrid;
