import {
  ContextMenu,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuItem,
  ContextMenuPopup,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { getEventColors } from "@/lib/calendar-utils";
import { cn } from "@/lib/utils";
import type { JuseEvent } from "@/types/event";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  Edit2,
  MapPin,
  Trash2,
} from "lucide-react";

interface MobileAgendaItemProps {
  event: JuseEvent;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function MobileAgendaItem({
  event,
  onClick,
  onEdit,
  onDelete,
}: MobileAgendaItemProps) {
  const { bg, text, colorValue } = getEventColors(event.color || "blue");
  const hasSaldo = event.saldo > 0;
  const missingStaff = event.dj.length === 0 || event.animadoras.length === 0;

  return (
    <ContextMenu>
      <ContextMenuTrigger className='w-full'>
        <motion.button
          type='button'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClick}
          style={{
            borderLeftColor: colorValue.includes("var")
              ? `var(${colorValue.replace("var(", "").replace(")", "")})`
              : colorValue,
          }}
          className={cn(
            "relative flex w-full min-w-0 flex-col gap-2 rounded-xl border border-border border-l-[6px] p-4 text-left shadow-sm",
            "bg-card",
            "transition-all duration-200 ease-(--ease-juse-smooth) hover:shadow-md hover:border-muted-foreground/30 hover:-translate-y-0.5 cursor-pointer",
          )}>
          <div className='flex w-full flex-col gap-1.5'>
            <div className='flex w-full items-start justify-between gap-3'>
              <span className='font-display text-lg font-bold text-foreground line-clamp-1'>
                {event.eventType}
              </span>
              <div
                className={cn(
                  "shrink-0 rounded-full px-3 py-0.5 text-sm font-semibold",
                  bg,
                  text,
                )}>
                {event.startTime} - {event.endTime}
              </div>
            </div>

            <div className='flex w-full flex-col gap-1.5'>
              {event.observacion && (
                <p className='text-[15px] text-muted-foreground line-clamp-2 leading-snug'>
                  {event.observacion}
                </p>
              )}
              <div className='flex items-center gap-1.5 text-muted-foreground mt-0.5'>
                <MapPin className='size-4' />
                <span className='text-sm font-medium'>{event.location}</span>
              </div>
            </div>

            {(hasSaldo || missingStaff) && (
              <div className='flex shrink-0 items-center gap-2 pt-3 mt-1 border-t border-border w-full'>
                {hasSaldo && (
                  <div className='flex items-center gap-1 text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full'>
                    Saldo pendiente
                  </div>
                )}
                {missingStaff && (
                  <div className='flex items-center gap-1 text-[10px] font-bold text-white bg-amber-500 px-2 py-0.5 rounded-full'>
                    <AlertTriangle className='size-3' />
                    Personal incompleto
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.button>
      </ContextMenuTrigger>
      <ContextMenuPopup>
        <ContextMenuGroup>
          <ContextMenuGroupLabel>Evento</ContextMenuGroupLabel>
          <ContextMenuItem onClick={onClick} className='cursor-pointer'>
            <CalendarIcon className='mr-2 size-4' /> Ver Detalles
          </ContextMenuItem>
          {(onEdit || onDelete) && <ContextMenuSeparator />}
          {onEdit && (
            <ContextMenuItem onClick={onEdit} className='cursor-pointer'>
              <Edit2 className='mr-2 size-4' /> Editar Evento
            </ContextMenuItem>
          )}
          {onDelete && (
            <ContextMenuItem
              onClick={onDelete}
              variant='destructive'
              className='cursor-pointer text-red-600'>
              <Trash2 className='mr-2 size-4' /> Eliminar Evento
            </ContextMenuItem>
          )}
        </ContextMenuGroup>
      </ContextMenuPopup>
    </ContextMenu>
  );
}
