"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import type { JuseEvent } from "@/types/event";
import { cn, calculateDuration } from "@/lib/utils";
import {
  getEventColors,
} from "@/lib/calendar-utils";

interface EventBlockProps {
  event: JuseEvent;
  style?: CSSProperties;
  onClick?: () => void;
  compact?: boolean;
}

function EventBlock({ event, style, onClick, compact = false }: EventBlockProps) {
  const { bg, text, dot, colorValue } = getEventColors(event.color);
  const hasSaldo = event.saldo > 0;
  const missingStaff = event.dj.length === 0 || event.animadoras.length === 0;

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
          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dot)}
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
  
  // Logic for responsive rendering based on time
  const duration = calculateDuration(event.startTime, event.endTime);
  const isMicro = duration <= 30;
  const isCompact = duration > 30 && duration <= 60;
  const isLarge = duration > 90;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{ zIndex: 20 }}
      whileTap={{ scale: 0.98 }}
      style={{ ...style, borderLeftColor: colorValue.includes('var') ? `var(${colorValue.replace('var(', '').replace(')', '')})` : colorValue }}
      className={cn(
        "absolute overflow-hidden rounded-md border border-slate-200 border-l-[4px] text-left group bg-white",
        "transition-all duration-200 hover:shadow-md hover:border-slate-300",
        isMicro ? "p-0.5 px-1" : "p-1.5"
      )}
    >
      {/* Content Container */}
      <div className={cn("flex h-full flex-col min-w-0", isMicro ? "gap-0" : "gap-0.5")}>
        {isMicro ? (
          <div className="flex w-full items-center gap-1 h-full min-w-0">
            <span className={cn("font-display text-[10.5px] font-bold truncate flex-1 min-w-0 text-slate-900")}>
              {event.eventType}
            </span>
            <span className={cn("text-[9px] font-medium shrink-0 whitespace-nowrap text-slate-700 opacity-80")}>
              {event.startTime}
            </span>
            {hasSaldo && <span className="size-1 rounded-full bg-red-500 shrink-0 ml-auto" />}
          </div>
        ) : (
          <>
            {/* Title Full Width */}
            <span className={cn("font-display text-xs font-bold leading-tight truncate block w-full text-slate-900")}>
              {event.eventType}
            </span>
            
            {/* Time Pill Row (Below title, strictly single line) */}
            <div className="flex w-full items-center justify-between mt-px">
              <span className={cn(
                "inline-block rounded-sm px-1 py-0.5 text-[9.5px] font-semibold leading-none",
                "whitespace-nowrap truncate max-w-[85%]", 
                bg, text
              )}>
                {isCompact ? event.startTime : `${event.startTime} - ${event.endTime}`}
              </span>
              
              {/* Extremely compact badges if Compact */}
              {isCompact && (hasSaldo || missingStaff) && (
                <div className="flex items-center gap-0.5 shrink-0 pl-0.5">
                  {hasSaldo && <span className={cn("size-1.5 rounded-full", dot)} />}
                  {missingStaff && <span className="size-1.5 rounded-full bg-amber-500" />}
                </div>
              )}
            </div>

            {/* Normal/Large Details */}
            {!isCompact && (
              <>
                {/* Location */}
                <div className="flex w-full items-center gap-0.5 mt-0.5 text-slate-500">
                  <MapPin className="size-3 shrink-0" />
                  <span className="text-[10px] font-medium truncate">{event.location}</span>
                </div>

                {/* Description */}
                {isLarge && event.observacion && (
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight mt-0.5">
                    {event.observacion}
                  </p>
                )}

                {/* Full Badges */}
                {(hasSaldo || missingStaff) && (
                  <div className="flex shrink-0 flex-wrap items-center gap-1 mt-auto pt-1">
                    {hasSaldo && (
                      <span className="px-1 py-px rounded bg-red-500 text-white text-[9px] font-bold">
                        Saldo
                      </span>
                    )}
                    {missingStaff && (
                      <span className="flex items-center gap-0.5 px-1 py-px rounded bg-amber-100 text-amber-700 text-[9px] font-bold">
                        Staff
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </motion.button>
  );
}

export { EventBlock };
export type { EventBlockProps };
export default EventBlock;
