import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Clock, MapPin, CalendarIcon } from 'lucide-react';
import { format, parseISO, parse, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

import { EVENT_PALETTE } from '@/lib/calendar-utils';
import { cn, parseCurrency, calculateDuration, formatDuration } from '@/lib/utils';
import type { JuseEvent, EventFormValues } from '@/types/event';
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
    data: Omit<JuseEvent, 'id' | 'duration' | 'createdAt' | 'updatedAt'>
  ) => void;
  onCancel: () => void;
}

function eventToFormValues(event: JuseEvent): EventFormValues {
  return {
    date: event.date ? format(parseISO(event.date), 'dd/MM/yyyy') : '',
    startTime: event.startTime,
    endTime: event.endTime,
    eventType: event.eventType,
    color: event.color || 'blue',
    location: event.location,
    animadoras: event.animadoras,
    bailarinas: event.bailarinas,
    dj: event.dj,
    staffAdicional: event.staffAdicional,
    munecos: event.munecos,
    totalEvento: event.totalEvento.toFixed(2),
    movilidad: event.movilidad.toFixed(2),
    adelanto: event.adelanto.toFixed(2),
    saldo: event.saldo.toFixed(2),
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
  color: 'blue',
  location: '',
  animadoras: [],
  bailarinas: [],
  dj: [],
  staffAdicional: [],
  munecos: [],
  totalEvento: '',
  movilidad: '',
  adelanto: '',
  saldo: '',
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
}: EventFormProps) {
  const { register, handleSubmit, control, watch, setValue } =
    useForm<EventFormValues>({
      defaultValues: initialData
        ? eventToFormValues(initialData)
        : initialDate
        ? { ...defaultFormValues, date: format(parseISO(initialDate), 'dd/MM/yyyy') }
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

  // Auto-calculate saldo when total or adelanto changes
  React.useEffect(() => {
    const total = parseCurrency(totalEventoStr);
    const adelanto = parseCurrency(adelantoStr);
    const calculatedSaldo = Math.max(0, total - adelanto);
    setValue('saldo', calculatedSaldo > 0 ? calculatedSaldo.toFixed(2) : '0.00', { shouldDirty: true });
  }, [totalEventoStr, adelantoStr, setValue]);

  const processSubmit = (data: EventFormValues) => {
    // Convert dd/MM/yyyy back to yyyy-MM-dd for backend storage
    const parsedDate = parse(data.date, 'dd/MM/yyyy', new Date());
    const isoDate = isValid(parsedDate) ? format(parsedDate, 'yyyy-MM-dd') : data.date;

    onSubmit({
      date: isoDate,
      startTime: data.startTime,
      endTime: data.endTime,
      eventType: data.eventType,
      color: data.color,
      location: data.location,
      animadoras: data.animadoras,
      bailarinas: data.bailarinas,
      dj: data.dj,
      staffAdicional: data.staffAdicional,
      munecos: data.munecos,
      totalEvento: parseCurrency(data.totalEvento),
      movilidad: parseCurrency(data.movilidad),
      adelanto: parseCurrency(data.adelanto),
      saldo: parseCurrency(data.saldo),
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
              <Label htmlFor="date">Fecha <span className="text-red-500">*</span></Label>
              <Controller
                name="date"
                control={control}
                rules={{ required: true }}
                render={({ field, fieldState: { error } }) => {
                  let dateObj = undefined;
                  if (field.value) {
                    const parsed = parse(field.value, 'dd/MM/yyyy', new Date());
                    if (isValid(parsed)) dateObj = parsed;
                  }

                  return (
                    <div className="relative flex items-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="absolute left-0 top-0 h-full px-3 flex items-center justify-center text-slate-400 hover:text-slate-600 focus-visible:outline-none z-10"
                          >
                            <CalendarIcon className="h-4 w-4" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 z-[100]" align="start">
                          <Calendar
                            mode="single"
                            selected={dateObj}
                            onSelect={(date) => {
                              field.onChange(date ? format(date, "dd/MM/yyyy") : "");
                            }}
                            locale={es}
                          />
                        </PopoverContent>
                      </Popover>
                      <Input
                        {...field}
                        type="text"
                        placeholder="dd/mm/aaaa"
                        className={cn("pl-10", error && "border-red-500 focus-visible:ring-red-500")}
                      />
                    </div>
                  );
                }}
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
              <div className="flex h-[42px] sm:h-[42px] w-full min-w-0 items-center gap-2 rounded-lg border border-slate-300 bg-white opacity-50 px-3 py-2.5 text-sm text-slate-500 shadow-sm transition-colors cursor-not-allowed">
                <Clock className="size-4 shrink-0" />
                <span className="truncate">{durationDisplay}</span>
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

          {/* Color del Evento */}
          <div className="space-y-1.5 pt-1">
            <Label>Color de la Tarjeta</Label>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {EVENT_PALETTE.map((colorDef) => (
                    <button
                      key={colorDef.id}
                      type="button"
                      onClick={() => field.onChange(colorDef.id)}
                      className={cn(
                        "size-8 rounded-full border-2 transition-all duration-200",
                        colorDef.pickerBg,
                        field.value === colorDef.id
                          ? "border-slate-800 scale-110 shadow-sm"
                          : "border-transparent hover:scale-105 opacity-80 hover:opacity-100"
                      )}
                      aria-label={`Seleccionar color ${colorDef.id}`}
                    />
                  ))}
                </div>
              )}
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
                label="Staff"
                value={field.value}
                onChange={field.onChange}
                placeholder="Staff"
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

            <Controller
              name="saldo"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  id="saldo"
                  label="Saldo"
                  value={field.value}
                  onChange={field.onChange}
                  readOnly
                  className={cn(
                    'opacity-80 pointer-events-none',
                    parseCurrency(field.value) > 0 && '[&_input]:text-red-600 [&_input]:font-medium'
                  )}
                />
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
            <Label htmlFor="observacionTexto">Observación</Label>
            <textarea
              id="observacionTexto"
              {...register('observacion')}
              placeholder="Factura, Recibo, u observaciones adicionales..."
              rows={3}
              className="w-full min-h-[80px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-slate-400 focus-visible:border-[var(--color-juse-blue)] focus-visible:ring-2 focus-visible:ring-[var(--color-juse-blue)]/20"
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
