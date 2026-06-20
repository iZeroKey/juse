import * as React from 'react';
import {
  Clock,
  MapPin,
  Pencil,
  Trash2,
  FileText,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn, formatCurrency, formatDuration } from '@/lib/utils';
import type { JuseEvent } from '@/types/event';
import { getEventTypeColor } from '@/lib/calendar-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Drawer,
  DrawerPopup,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerPanel,
  DrawerFooter,
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface EventSheetProps {
  event: JuseEvent | null;
  open: boolean;
  onClose: () => void;
  onEdit: (event: JuseEvent) => void;
  onDelete: (id: string) => void;
  children?: React.ReactNode;
}

function formatFullDate(dateStr: string): string {
  const date = parse(dateStr, 'yyyy-MM-dd', new Date());
  return format(date, "EEEE d 'de' MMMM, yyyy", { locale: es });
}

function formatTimeRange(start: string, end: string): string {
  return `${start} — ${end}`;
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
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {warn && people.length === 0 && (
          <AlertTriangle className="size-3.5 text-amber-500" />
        )}
      </div>
      {people.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {people.map((person) => (
            <Badge
              key={person}
              variant="secondary"
              className="bg-accent-soft text-accent"
            >
              {person}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">Sin asignar</span>
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
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn('text-sm font-medium text-right tabular-nums', className)}>
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
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const handleDelete = () => {
    if (!event) return;
    onDelete(event.id);
    setConfirmOpen(false);
    onClose();
  };

  const handleReceipt = () => {
    toast('Función de recibo en desarrollo', {
      description: 'Pronto podrás generar recibos y contratos desde aquí.',
    });
  };

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}
        position={isDesktop ? 'right' : 'bottom'}
      >
        <DrawerPopup variant="inset" showBar={!isDesktop} showCloseButton>
          {event && (
            <>
              {/* Header */}
              <DrawerHeader>
                <div className="flex items-start gap-3 pr-8">
                  <div className="flex-1 space-y-1">
                    <DrawerTitle className="font-display text-lg">
                      {event.eventType}
                    </DrawerTitle>
                    <DrawerDescription className="flex items-center gap-1.5">
                      <MapPin className="size-3.5" />
                      {event.location || 'Sin ubicación'}
                    </DrawerDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'shrink-0 border text-xs',
                      getEventTypeColor(event.eventType)
                    )}
                  >
                    {event.eventType}
                  </Badge>
                </div>
                {/* Warning badges */}
                {(event.dj.length === 0 || event.animadoras.length === 0) && (
                  <div className="flex items-center gap-1.5 pt-2">
                    <AlertTriangle className="size-3.5 text-amber-500" />
                    <span className="text-xs text-amber-600">
                      {event.dj.length === 0 && event.animadoras.length === 0
                        ? 'Sin DJ ni animadora asignados'
                        : event.dj.length === 0
                          ? 'Sin DJ asignado'
                          : 'Sin animadora asignada'}
                    </span>
                  </div>
                )}
                {event.saldo > 0 && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="size-2 rounded-full bg-red-500" />
                    <span className="text-xs text-red-600">
                      Saldo pendiente: {formatCurrency(event.saldo)}
                    </span>
                  </div>
                )}
              </DrawerHeader>

              {/* Scrollable content */}
              <DrawerPanel>
                <div className="space-y-6">
                  {/* ── Información General ─────────────── */}
                  <section className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Información General
                    </h3>

                    <div className="space-y-2.5">
                      {/* Date */}
                      <div className="flex items-center gap-3">
                        <Calendar className="size-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm capitalize">
                          {formatFullDate(event.date)}
                        </span>
                      </div>

                      {/* Time range */}
                      <div className="flex items-center gap-3">
                        <Clock className="size-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm">
                          {formatTimeRange(event.startTime, event.endTime)}
                        </span>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {formatDuration(event.duration)}
                        </Badge>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-3">
                        <MapPin className="size-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm">
                          {event.location || 'Sin ubicación'}
                        </span>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  {/* ── Staff ───────────────────────────── */}
                  <section className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Staff
                    </h3>

                    <div className="space-y-3">
                      <StaffSection
                        label="Animadora(s)"
                        people={event.animadoras}
                        warn
                      />
                      <StaffSection
                        label="Bailarinas / Staff Lúdico"
                        people={event.bailarinas}
                      />
                      <StaffSection label="DJ" people={event.dj} warn />
                      <StaffSection
                        label="Staff Adicional"
                        people={event.staffAdicional}
                      />
                      <StaffSection
                        label="Muñecos"
                        people={event.munecos}
                      />
                    </div>
                  </section>

                  <Separator />

                  {/* ── Finanzas ────────────────────────── */}
                  <section className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Finanzas
                    </h3>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <FinanceRow
                        label="Total Evento"
                        value={formatCurrency(event.totalEvento)}
                        className="text-base font-semibold"
                      />
                      <FinanceRow
                        label="Movilidad"
                        value={formatCurrency(event.movilidad)}
                      />
                      <FinanceRow
                        label="Adelanto"
                        value={formatCurrency(event.adelanto)}
                      />
                      <FinanceRow
                        label="Saldo"
                        value={formatCurrency(event.saldo)}
                        className={cn(
                          event.saldo > 0
                            ? 'text-red-600 font-semibold'
                            : 'text-emerald-600 font-semibold'
                        )}
                      />
                      <FinanceRow
                        label="Pago Personal"
                        value={formatCurrency(event.pagoPersonal)}
                      />
                      <FinanceRow
                        label="Ganancia"
                        value={formatCurrency(event.ganancia)}
                      />
                    </div>

                    {event.observacion && (
                      <div className="mt-2 rounded-md bg-slate-50 p-3">
                        <span className="text-xs font-medium text-muted-foreground">
                          Observación
                        </span>
                        <p className="mt-1 text-sm text-foreground">
                          {event.observacion}
                        </p>
                      </div>
                    )}
                  </section>
                </div>
              </DrawerPanel>

              {/* Footer actions */}
              <DrawerFooter variant="bare" className="flex-row justify-end border-none px-6 pb-6 pt-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Editar evento"
                  onClick={() => event && onEdit(event)}
                >
                  <Pencil className="size-4" />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setConfirmOpen(true)}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  aria-label="Eliminar evento"
                >
                  <Trash2 className="size-4" />
                </Button>
                <Button
                  type="button"
                  onClick={handleReceipt}
                  className="ml-auto bg-accent text-white hover:bg-accent-hover"
                >
                  <FileText className="size-4" />
                  Generar Recibo
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerPopup>
        {children}
      </Drawer>

      {/* ── Delete confirmation dialog ─────────────────── */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar evento</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este evento? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { EventSheet };
export default EventSheet;
