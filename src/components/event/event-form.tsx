import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Clock, MapPin, CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { cn, calculateDuration, formatDuration, parseCurrency } from '@/lib/utils';
import type { JuseEvent, EventFormValues } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CurrencyInput } from '@/components/event/currency-input';
import { StaffTagInput } from '@/components/event/staff-tag-input';

interface EventFormProps {
  formId?: string;
  activeTab: string;
  initialData?: JuseEvent;
  initialDate?: string;
  onSubmit: (
    data: Omit<JuseEvent, 'id' | 'duration' | 'saldo' | 'createdAt' | 'updatedAt'>
  ) => void;
  onCancel: () => void;
}

function eventToFormValues(event: JuseEvent): EventFormValues {
  return {
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    eventType: event.eventType,
    location: event.location,
    animadoras: event.animadoras,
    bailarinas: event.bailarinas,
    dj: event.dj,
    staffAdicional: event.staffAdicional,
    munecos: event.munecos,
    totalEvento: event.totalEvento.toFixed(2),
    movilidad: event.movilidad.toFixed(2),
    adelanto: event.adelanto.toFixed(2),
    pagoPersonal: event.pagoPersonal.toFixed(2),
    ganancia: event.ganancia.toFixed(2),
    observacion: event.observacion,
  };
}

const defaultFormValues: EventFormValues = {
  date: '',
  startTime: '',
  endTime: '',
  eventType: '',
  location: '',
  animadoras: [],
  bailarinas: [],
  dj: [],
  staffAdicional: [],
  munecos: [],
  totalEvento: '',
  movilidad: '',
  adelanto: '',
  pagoPersonal: '',
  ganancia: '',
  observacion: '',
};

export function EventForm({
  formId,
  activeTab,
  initialData,
  initialDate,
  onSubmit,
  onCancel,
}: EventFormProps) {
  const isEditing = !!initialData;

  const { register, handleSubmit, control, watch } =
    useForm<EventFormValues>({
      defaultValues: initialData
        ? eventToFormValues(initialData)
        : initialDate
        ? { ...defaultFormValues, date: initialDate }
        : defaultFormValues,
    });

  // Watch fields for reactive calculations
  const startTime = watch('startTime');
  const endTime = watch('endTime');
  const totalEventoStr = watch('totalEvento');
  const adelantoStr = watch('adelanto');

  // Derived: duration
  const durationMinutes = calculateDuration(startTime, endTime);
  const durationDisplay = formatDuration(durationMinutes);

  // Derived: saldo
  const saldoValue = React.useMemo(() => {
    const total = parseCurrency(totalEventoStr);
    const adelanto = parseCurrency(adelantoStr);
    return Math.max(0, total - adelanto);
  }, [totalEventoStr, adelantoStr]);

  const saldoDisplay = saldoValue.toFixed(2);

  const processSubmit = (data: EventFormValues) => {
    onSubmit({
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      eventType: data.eventType,
      location: data.location,
      animadoras: data.animadoras,
      bailarinas: data.bailarinas,
      dj: data.dj,
      staffAdicional: data.staffAdicional,
      munecos: data.munecos,
      totalEvento: parseCurrency(data.totalEvento),
      movilidad: parseCurrency(data.movilidad),
      adelanto: parseCurrency(data.adelanto),
      pagoPersonal: parseCurrency(data.pagoPersonal),
      ganancia: parseCurrency(data.ganancia),
      observacion: data.observacion,
    });
  };

  return (
    <form id={formId} onSubmit={handleSubmit(processSubmit)} className="flex flex-col h-full">
      <div className="flex-1">
        <div className="flex flex-col gap-6 pb-6 pt-2 h-full">
          <Tabs value={activeTab} className="w-full h-full flex flex-col">
        {/* ── Tab 1: General ─────────────────────────────── */}
        <TabsContent value="general" className="space-y-4 pt-4 px-1 pb-1 flex-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Fecha */}
            <div className="space-y-1.5">
              <Label htmlFor="date">Fecha</Label>
              <Controller
                name="date"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal px-3 relative overflow-hidden h-10 bg-transparent hover:bg-transparent",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <span className="truncate block w-full">
                          {field.value ? (
                            format(parseISO(field.value), "PPP", { locale: es })
                          ) : (
                            "dd/mm/aaaa"
                          )}
                        </span>
                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 shrink-0 bg-background" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[100]" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? parseISO(field.value) : undefined}
                        onSelect={(date) => {
                          field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                        }}
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>

            {/* Hora Inicio */}
            <div className="space-y-1.5">
              <Label htmlFor="startTime">Hora Inicio</Label>
              <Input
                id="startTime"
                type="time"
                className="w-full font-mono text-sm [color-scheme:light]"
                {...register('startTime', { required: true })}
              />
            </div>

            {/* Hora Fin */}
            <div className="space-y-1.5">
              <Label htmlFor="endTime">Hora Fin</Label>
              <Input
                id="endTime"
                type="time"
                className="w-full font-mono text-sm [color-scheme:light]"
                {...register('endTime', { required: true })}
              />
            </div>

            {/* Duración (read-only) */}
            <div className="space-y-1.5">
              <Label>Duración</Label>
              <div className="flex h-10 items-center gap-2 rounded-md border border-input bg-slate-50 px-3 text-sm text-muted-foreground">
                <Clock className="size-4 shrink-0" />
                <span>{durationDisplay}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tipo de Evento */}
          <div className="space-y-1.5">
            <Label htmlFor="eventType">Tipo de Evento</Label>
            <Input
              id="eventType"
              placeholder="Ej: Cumpleaños infantil, Boda, etc."
              {...register('eventType', { required: true })}
            />
          </div>

          {/* Ubicación */}
          <div className="space-y-1.5">
            <Label htmlFor="location">Ubicación</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="location"
                placeholder="Dirección o lugar del evento"
                className="pl-9"
                {...register('location', { required: true })}
              />
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 2: Staff ───────────────────────────────── */}
        <TabsContent value="staff" className="space-y-4 pt-4 px-1 pb-1">
          <Controller
            name="animadoras"
            control={control}
            render={({ field }) => (
              <StaffTagInput
                id="animadoras"
                label="Animadora(s)"
                value={field.value}
                onChange={field.onChange}
                placeholder="Nombre de animadora"
              />
            )}
          />

          <Controller
            name="bailarinas"
            control={control}
            render={({ field }) => (
              <StaffTagInput
                id="bailarinas"
                label="Bailarinas / Staff Lúdico"
                value={field.value}
                onChange={field.onChange}
                placeholder="Nombre de bailarina o staff"
              />
            )}
          />

          <Controller
            name="dj"
            control={control}
            render={({ field }) => (
              <StaffTagInput
                id="dj"
                label="DJ"
                value={field.value}
                onChange={field.onChange}
                placeholder="Nombre del DJ"
              />
            )}
          />

          <Controller
            name="staffAdicional"
            control={control}
            render={({ field }) => (
              <StaffTagInput
                id="staffAdicional"
                label="Staff Adicional"
                value={field.value}
                onChange={field.onChange}
                placeholder="Staff adicional"
              />
            )}
          />

          <Controller
            name="munecos"
            control={control}
            render={({ field }) => (
              <StaffTagInput
                id="munecos"
                label="Muñecos"
                value={field.value}
                onChange={field.onChange}
                placeholder="Nombre del muñeco o personaje"
              />
            )}
          />
        </TabsContent>

        {/* ── Tab 3: Finanzas ────────────────────────────── */}
        <TabsContent value="finanzas" className="space-y-4 pt-4 px-1 pb-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="totalEvento"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  id="totalEvento"
                  label="Total Evento"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="movilidad"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  id="movilidad"
                  label="Movilidad"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="adelanto"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  id="adelanto"
                  label="Adelanto"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            {/* Saldo — read-only, auto-calculated */}
            <CurrencyInput
              id="saldo"
              label="Saldo"
              value={saldoDisplay}
              onChange={() => {}}
              readOnly
              className={cn(
                saldoValue > 0 && '[&_input]:text-red-600 [&_input]:font-medium'
              )}
            />

            <Controller
              name="pagoPersonal"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  id="pagoPersonal"
                  label="Pago Personal"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="ganancia"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  id="ganancia"
                  label="Ganancia"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <Separator />

          {/* Observación / Documento */}
          <div className="space-y-1.5">
            <Label htmlFor="observacionTexto">Tipo de Documento / Observación</Label>
            <textarea
              id="observacionTexto"
              {...register('observacion')}
              placeholder="Factura, Recibo, u observaciones adicionales..."
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
        </TabsContent>
      </Tabs>
      </div>
      </div>
    </form>
  );
}

export default EventForm;
