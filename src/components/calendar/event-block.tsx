"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import type { JuseEvent } from "@/types/event";
import { cn } from "@/lib/utils";
import {
  getEventTypeColor,
  getEventTypeDotColor,
} from "@/lib/calendar-utils";

interface EventBlockProps {
  event: JuseEvent;
  style?: CSSProperties;
  onClick?: () => void;
  compact?: boolean;
}

function EventBlock({ event, style, onClick, compact = false }: EventBlockProps) {
  const colorClasses = getEventTypeColor(event.eventType);
  const dotColor = getEventTypeDotColor(event.eventType);
  const hasSaldo = event.saldo > 0;
  const missingStaff = event.dj.length === 0 || event.animadoras.length === 0;

  // Extract border color from the colorClasses string for the left accent
  const borderAccent = colorClasses
    .split(" ")
    .find((c) => c.startsWith("border-"));

  if (compact) {
    return (
      <motion.button
        type="button"
        layoutId={`event-${event.id}`}
        onClick={onClick}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-full px-2 py-0.5",
          "cursor-pointer overflow-hidden text-left",
          "transition-colors hover:bg-slate-50"
        )}
      >
        <span
          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotColor)}
          aria-hidden
        />
        <span className="truncate font-sans text-[11px] text-slate-600">
          {event.eventType}
        </span>
        {hasSaldo && (
          <span
            className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-red-500"
            aria-label="Saldo pendiente"
          />
        )}
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      layoutId={`event-${event.id}`}
      onClick={onClick}
      whileHover={{ scale: 1.02, zIndex: 20 }}
      whileTap={{ scale: 0.98 }}
      style={style}
      className={cn(
        "absolute overflow-hidden rounded-md border-l-[3px] border border-transparent px-2 py-1.5",
        "cursor-pointer text-left backdrop-blur-sm bg-white/40",
        "transition-all duration-200 hover:shadow-lg hover:border-slate-200/50 hover:brightness-[1.02]",
        colorClasses,
        borderAccent
      )}
    >
      {/* Title row */}
      <div className="flex items-start gap-1">
        <span className="min-w-0 flex-1 truncate font-display text-[11px] font-semibold leading-tight">
          {event.eventType} — {event.location}
        </span>

        {/* Status indicators */}
        <span className="flex shrink-0 items-center gap-1 pt-px">
          {hasSaldo && (
            <span
              className="h-2 w-2 rounded-full bg-red-500"
              title={`Saldo pendiente: S/ ${event.saldo.toFixed(2)}`}
              aria-label="Saldo pendiente"
            />
          )}
          {missingStaff && (
            <AlertTriangle
              className="h-3 w-3 text-amber-500"
              aria-label="Personal incompleto"
            />
          )}
        </span>
      </div>

      {/* Time subtitle */}
      <p className="mt-0.5 truncate font-sans text-[10px] leading-tight opacity-70">
        {event.startTime} – {event.endTime}
      </p>
    </motion.button>
  );
}

export { EventBlock };
export type { EventBlockProps };
export default EventBlock;
