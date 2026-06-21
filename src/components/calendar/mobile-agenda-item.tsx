import { motion } from 'framer-motion';
import { AlertTriangle, MapPin } from 'lucide-react';
import type { JuseEvent } from '@/types/event';
import { cn } from '@/lib/utils';
import {
  getEventColors,
} from '@/lib/calendar-utils';

interface MobileAgendaItemProps {
  event: JuseEvent;
  onClick: () => void;
}

export function MobileAgendaItem({ event, onClick }: MobileAgendaItemProps) {
  const { bg, text, colorValue } = getEventColors(event.color || 'blue');
  const hasSaldo = event.saldo > 0;
  const missingStaff = event.dj.length === 0 || event.animadoras.length === 0;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      style={{ borderLeftColor: colorValue.includes('var') ? `var(${colorValue.replace('var(', '').replace(')', '')})` : colorValue }}
      className={cn(
        "relative flex w-full min-w-0 flex-col gap-2 rounded-xl border border-slate-200 border-l-[6px] p-4 text-left shadow-sm",
        "bg-white",
        "cursor-pointer transition-all duration-200 ease-[var(--ease-juse-smooth)] hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5"
      )}
    >
      {/* Content Container */}
      <div className="flex w-full flex-col gap-1.5">
        {/* Top Row: Title & Time Pill */}
        <div className="flex w-full items-start justify-between gap-3">
        <span className="font-display text-lg font-bold text-slate-900 line-clamp-1">
          {event.eventType}
        </span>
        <div className={cn("shrink-0 rounded-full px-3 py-0.5 text-sm font-semibold", bg, text)}>
          {event.startTime} - {event.endTime}
        </div>
      </div>

      {/* Description / Location */}
      <div className="flex w-full flex-col gap-1.5">
        {event.observacion && (
          <p className="text-[15px] text-slate-500 line-clamp-2 leading-snug">
            {event.observacion}
          </p>
        )}
        <div className="flex items-center gap-1.5 text-slate-400 mt-0.5">
          <MapPin className="size-4" />
          <span className="text-sm font-medium">{event.location}</span>
        </div>
      </div>

      {/* Badges / Warnings */}
      {(hasSaldo || missingStaff) && (
        <div className="flex shrink-0 items-center gap-2 pt-3 mt-1 border-t border-black/5 w-full">
          {hasSaldo && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">
              Saldo pendiente
            </div>
          )}
          {missingStaff && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-white bg-amber-500 px-2 py-0.5 rounded-full">
              <AlertTriangle className="size-3" />
              Personal incompleto
            </div>
          )}
        </div>
      )}
      </div>
    </motion.button>
  );
}
