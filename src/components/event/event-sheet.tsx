import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { useMediaQuery } from "@/hooks/use-media-query";
import { generateEventMessage } from "@/lib/message-template";
import {
  calculateDuration,
  cn,
  formatCurrency,
  formatDuration,
  formatHora,
} from "@/lib/utils";
import type { JuseEvent } from "@/types/event";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertTriangle,
  Calendar,
  Check,
  Clock,
  Copy,
  MapPin,
  Palette,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";
import * as React from "react";
import { EventMessageDrawer } from "./event-message-drawer";

interface EventSheetProps {
  event: JuseEvent | null;
  open: boolean;
  onClose: () => void;
  onEdit: (event: JuseEvent) => void;
  onDelete: (id: string) => void;
  children?: React.ReactNode;
}

function formatFullDate(dateStr: string): string {
  const date = parse(dateStr, "yyyy-MM-dd", new Date());
  return format(date, "EEEE d 'de' MMMM, yyyy", { locale: es });
}

function formatTimeRange(start: string, end: string): string {
  return `${formatHora(start)} — ${formatHora(end)}`;
}

function StaffSection({
  label,
  people,
  warn = false,
}: {
  label: string;
  people: string[];
  warn?: boolean;
}) {
  return (
    <div className='flex flex-col gap-1.5'>
      <div className='flex items-center gap-2'>
        <span className='text-sm font-medium text-foreground'>{label}</span>
        {warn && people.length === 0 && (
          <AlertTriangle className='size-3.5 text-amber-500' />
        )}
      </div>
      {people.length > 0 ? (
        <div className='flex flex-wrap gap-1.5'>
          {people.map((person) => (
            <Badge
              key={person}
              variant='secondary'
              className='bg-accent-soft text-accent'>
              {person}
            </Badge>
          ))}
        </div>
      ) : (
        <span className='text-sm text-muted-foreground'>Sin asignar</span>
      )}
    </div>
  );
}

function FinanceRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <>
      <span className='text-sm text-muted-foreground'>{label}</span>
      <span
        className={cn(
          "text-sm font-medium text-right tabular-nums",
          className,
        )}>
        {value}
      </span>
    </>
  );
}

function EventSheet({
  event,
  open,
  onClose,
  onEdit,
  onDelete,
  children,
}: EventSheetProps) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [messageDrawerOpen, setMessageDrawerOpen] = React.useState(false);
  const [copiedMessage, setCopiedMessage] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleDelete = () => {
    if (!event) return;
    onDelete(event.id);
    setConfirmOpen(false);
    onClose();
  };

  const handleCopyMessage = async () => {
    if (!event) return;
    try {
      const msg = generateEventMessage(event);
      await navigator.clipboard.writeText(msg);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) onClose();
        }}
        position={isDesktop ? "right" : "bottom"}>
        <DrawerPopup variant='inset' showBar>
          {event && (
            <>
              <DrawerHeader>
                <div className='flex items-start gap-3 pr-8'>
                  <div className='flex-1 space-y-1'>
                    <DrawerTitle className='font-display text-lg'>
                      {event.eventType}
                    </DrawerTitle>
                    <DrawerDescription className='flex items-center gap-1.5'>
                      <MapPin className='size-3.5' />
                      {event.location || "Sin ubicación"}
                    </DrawerDescription>
                  </div>
                </div>

                {(event.dj.length === 0 || event.animadores.length === 0) && (
                  <div className='flex items-center gap-1.5 pt-2'>
                    <AlertTriangle className='size-3.5 text-amber-500' />
                    <span className='text-xs text-amber-600'>
                      {event.dj.length === 0 && event.animadores.length === 0
                        ? "Sin DJ ni animador(a) asignados"
                        : event.dj.length === 0
                          ? "Sin DJ asignado"
                          : "Sin animador(a) asignado(a)"}
                    </span>
                  </div>
                )}
                {event.saldo > 0 && (
                  <div className='flex items-center gap-1.5 pt-1'>
                    <span className='size-2 rounded-full bg-red-500' />
                    <span className='text-xs text-red-600'>
                      Saldo pendiente: {formatCurrency(event.saldo)}
                    </span>
                  </div>
                )}
              </DrawerHeader>

              <DrawerPanel>
                <div className='space-y-6'>
                  <section className='space-y-3'>
                    <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                      Información General
                    </h3>

                    <div className='space-y-2.5'>
                      <div className='flex items-center gap-3'>
                        <Calendar className='size-4 shrink-0 text-muted-foreground' />
                        <span className='text-sm capitalize'>
                          {formatFullDate(event.date)}
                        </span>
                      </div>

                      <div className='flex items-center gap-3'>
                        <Clock className='size-4 shrink-0 text-muted-foreground' />
                        <span className='text-sm'>
                          {formatTimeRange(event.startTime, event.endTime)}
                        </span>
                        <Badge variant='secondary' className='ml-auto text-xs'>
                          {formatDuration(
                            calculateDuration(event.startTime, event.endTime),
                          )}
                        </Badge>
                      </div>

                      <div className='flex items-center gap-3'>
                        <MapPin className='size-4 shrink-0 text-muted-foreground' />
                        <span className='text-sm'>
                          {event.location || "Sin ubicación"}
                        </span>
                      </div>

                      {event.tematica && (
                        <div className='flex items-center gap-3'>
                          <Palette className='size-4 shrink-0 text-muted-foreground' />
                          <span className='text-sm text-foreground'>
                            {event.tematica}
                          </span>
                        </div>
                      )}

                      {(event.contactoNombre || event.contactoNumero) && (
                        <div className='flex items-center gap-3'>
                          <Phone className='size-4 shrink-0 text-muted-foreground' />
                          <span className='text-sm text-foreground'>
                            {event.contactoNombre}{" "}
                            {event.contactoNombre && event.contactoNumero
                              ? "—"
                              : ""}{" "}
                            {event.contactoNumero}
                          </span>
                        </div>
                      )}
                    </div>
                  </section>

                  <Separator />

                  <section className='space-y-3'>
                    <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                      Staff
                    </h3>

                    <div className='space-y-3'>
                      <StaffSection
                        label='Animador(a)(es)'
                        people={event.animadores}
                        warn
                      />
                      <StaffSection
                        label='Bailarín(a)(es)'
                        people={event.bailarines}
                      />
                      <StaffSection
                        label='Staff Lúdico'
                        people={event.staffLucido}
                      />
                      <StaffSection label='DJ' people={event.dj} warn />
                      <StaffSection
                        label='Staff de Apoyo'
                        people={event.staffApoyo}
                      />
                      <StaffSection label='Muñeco' people={event.muneco} />
                      <StaffSection
                        label='Video y Fotografía'
                        people={event.videoFotografia}
                      />
                      <StaffSection label='Payaso' people={event.payaso} />
                      <StaffSection
                        label='Show de Magia'
                        people={event.showMagia}
                      />
                    </div>
                  </section>

                  <Separator />

                  <section className='space-y-3'>
                    <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                      Finanzas
                    </h3>

                    <div className='grid grid-cols-2 gap-x-4 gap-y-2'>
                      <FinanceRow
                        label='Total Evento'
                        value={formatCurrency(event.totalEvento)}
                        className='text-base font-semibold'
                      />
                      <FinanceRow
                        label='Movilidad'
                        value={formatCurrency(event.movilidad)}
                      />
                      <FinanceRow
                        label='Adelanto'
                        value={formatCurrency(event.adelanto)}
                      />
                      <FinanceRow
                        label='Saldo'
                        value={formatCurrency(event.saldo)}
                        className={cn(
                          event.saldo > 0
                            ? "text-red-600 font-semibold"
                            : "text-emerald-600 font-semibold",
                        )}
                      />
                      <FinanceRow
                        label='Pago Personal'
                        value={formatCurrency(event.pagoPersonal)}
                      />
                      <FinanceRow
                        label='Ganancia'
                        value={formatCurrency(event.ganancia)}
                      />
                    </div>

                    {event.observacion && (
                      <div className='mt-2 rounded-lg bg-muted p-3'>
                        <span className='text-xs font-medium text-muted-foreground'>
                          Observación
                        </span>
                        <p className='mt-1 text-sm text-foreground'>
                          {event.observacion}
                        </p>
                      </div>
                    )}
                  </section>

                  <Separator />

                  <section className='space-y-3'>
                    <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                      Mensaje
                    </h3>
                    <div className='flex gap-3'>
                      <button
                        type='button'
                        onClick={handleCopyMessage}
                        className='flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors cursor-pointer'>
                        {copiedMessage ? (
                          <Check className='size-4' />
                        ) : (
                          <Copy className='size-4' />
                        )}
                        {copiedMessage ? "¡Copiado!" : "Copiar mensaje"}
                      </button>
                      <button
                        type='button'
                        onClick={() => setMessageDrawerOpen(true)}
                        className='flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors cursor-pointer'>
                        <Pencil className='size-4' />
                        Editar mensaje
                      </button>
                    </div>
                  </section>
                </div>
              </DrawerPanel>

              <DrawerFooter
                variant='bare'
                className='shrink-0 flex gap-3 flex-row pt-4 px-4 sm:px-6'>
                <button
                  type='button'
                  onClick={() => setConfirmOpen(true)}
                  className='flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors cursor-pointer'>
                  <Trash2 className='size-4' />
                  Eliminar
                </button>
                <button
                  type='button'
                  onClick={() => event && onEdit(event)}
                  className='flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-(--color-juse-blue) hover:brightness-110 rounded-lg transition-all shadow-sm cursor-pointer'>
                  <Pencil className='size-4' />
                  Editar Evento
                </button>
              </DrawerFooter>
            </>
          )}
        </DrawerPopup>

        <EventMessageDrawer
          event={event}
          open={messageDrawerOpen}
          onClose={() => setMessageDrawerOpen(false)}
        />
        {children}
      </Drawer>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar evento</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el evento "{event?.eventType}
              "? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-3 sm:gap-3 mt-2'>
            <button
              type='button'
              onClick={() => setConfirmOpen(false)}
              className='flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors cursor-pointer'>
              Cancelar
            </button>
            <button
              type='button'
              onClick={handleDelete}
              className='flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-(--color-juse-red) hover:brightness-110 rounded-lg transition-all shadow-sm cursor-pointer'>
              <Trash2 className='size-4' />
              Eliminar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { EventSheet };
export default EventSheet;
