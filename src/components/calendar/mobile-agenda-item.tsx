import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import type { JuseEvent } from '@/types/event';
import { cn } from '@/lib/utils';
import {
  getEventTypeColor,
  getEventTypeDotColor,
} from '@/lib/calendar-utils';

interface MobileAgendaItemProps {
  event: JuseEvent;
  onClick: () => void;
}

export function MobileAgendaItem({ event, onClick }: MobileAgendaItemProps) {
  const colorClasses = getEventTypeColor(event.eventType);
  const dotColor = getEventTypeDotColor(event.eventType);
  const hasSaldo = event.saldo > 0;
  const missingStaff = event.dj.length === 0 || event.animadoras.length === 0;

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      onClick={onClick}
      className={cn(
        "flex w-full min-w-0 items-start gap-3 rounded-lg border p-3 text-left",
        "cursor-pointer transition-shadow hover:shadow-sm",
        colorClasses
      )}
    >
      {/* Time column */}
      <div className="flex w-14 shrink-0 flex-col items-end font-sans text-xs leading-snug opacity-70">
        <span>{event.startTime}</span>
        <span>{event.endTime}</span>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={cn("h-2 w-2 shrink-0 rounded-full", dotColor)} />
          <span className="truncate font-display text-sm font-semibold leading-tight">
            {event.eventType}
          </span>
        </div>
        <p className="mt-0.5 truncate font-sans text-xs opacity-70">
          {event.location}
        </p>
      </div>

      {/* Badges */}
      <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
        {hasSaldo && (
          <span
            className="h-2 w-2 rounded-full bg-red-500"
            title="Saldo pendiente"
            aria-label="Saldo pendiente"
          />
        )}
        {missingStaff && (
          <AlertTriangle
            className="h-3.5 w-3.5 text-amber-500"
            aria-label="Personal incompleto"
          />
        )}
      </div>
    </motion.button>
  );
}
