import { format, isValid, parse, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarIcon, Clock, MapPin } from "lucide-react";
import * as React from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { EVENT_PALETTE } from "@/lib/calendar-utils";
import {
  calculateDuration,
  cn,
  formatDuration,
  parseCurrency,
} from "@/lib/utils";
import type { EventFormValues, JuseEvent } from "@/types/event";

import { CurrencyInput } from "@/components/event/currency-input";
import { StaffTagInput } from "@/components/event/staff-tag-input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EventFormProps {
  formId?: string;
  activeTab: string;
  initialData?: JuseEvent;
  initialDate?: string;
  onSubmit: (
    data: Omit<JuseEvent, "id" | "duration" | "createdAt" | "updatedAt">,
  ) => void;
  onCancel: () => void;
}

function eventToFormValues(event: JuseEvent): EventFormValues {
  return {
    date: event.date ? format(parseISO(event.date), "dd/MM/yyyy") : "",
    startTime: event.startTime,
    endTime: event.endTime,
    eventType: event.eventType,
    color: event.color || "blue",
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
  date: "",
  startTime: "",
  endTime: "",
  eventType: "",
  color: "blue",
  location: "",
  animadoras: [],
  bailarinas: [],
  dj: [],
  staffAdicional: [],
  munecos: [],
  totalEvento: "",
  movilidad: "",
  adelanto: "",
  saldo: "",
  pagoPersonal: "",
  ganancia: "",
  observacion: "",
};

export function EventForm({
  formId,
  activeTab,
  initialData,
  initialDate,
  onSubmit,
}: EventFormProps) {
  const { register, handleSubmit, control, setValue } =
    useForm<EventFormValues>({
      defaultValues: initialData
        ? eventToFormValues(initialData)
        : initialDate
          ? {
              ...defaultFormValues,
              date: format(parseISO(initialDate), "dd/MM/yyyy"),
            }
          : defaultFormValues,
    });

  const [startTime, endTime, totalEventoStr, adelantoStr] = useWatch({
    control,
    name: ["startTime", "endTime", "totalEvento", "adelanto"],
  });

  const durationMinutes = calculateDuration(startTime, endTime);
  const durationDisplay = formatDuration(durationMinutes);

  React.useEffect(() => {
    const total = parseCurrency(totalEventoStr);
    const adelanto = parseCurrency(adelantoStr);
    const calculatedSaldo = total - adelanto;
    setValue("saldo", calculatedSaldo.toFixed(2), { shouldDirty: true });
  }, [totalEventoStr, adelantoStr, setValue]);

  const processSubmit = (data: EventFormValues) => {
    const parsedDate = parse(data.date, "dd/MM/yyyy", new Date());
    const isoDate = isValid(parsedDate)
      ? format(parsedDate, "yyyy-MM-dd")
      : data.date;

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
    <form
      id={formId}
      onSubmit={handleSubmit(processSubmit)}
      className='flex flex-col h-full'>
      <div className='flex-1 relative'>
        <AnimatePresence mode='wait'>
          {activeTab === "general" && (
            <motion.div
              key='general'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className='space-y-4 pt-4 px-1 pb-1'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div className='space-y-1.5'>
                  <Label htmlFor='date'>
                    Fecha <span className='text-red-500'>*</span>
                  </Label>
                  <Controller
                    name='date'
                    control={control}
                    rules={{ required: true }}
                    render={({ field, fieldState: { error } }) => {
                      let isoValue = "";
                      let dateObj = undefined;
                      if (field.value) {
                        const parsed = parse(
                          field.value,
                          "dd/MM/yyyy",
                          new Date(),
                        );
                        if (isValid(parsed)) {
                          isoValue = format(parsed, "yyyy-MM-dd");
                          dateObj = parsed;
                        }
                      }

                      return (
                        <div className='relative flex items-center'>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                type='button'
                                className='absolute left-0 top-0 h-full px-3 flex items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none z-10'>
                                <CalendarIcon className='h-4 w-4' />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              className='w-auto p-0 z-100'
                              align='start'>
                              <Calendar
                                mode='single'
                                selected={dateObj}
                                onSelect={(date) => {
                                  field.onChange(
                                    date ? format(date, "dd/MM/yyyy") : "",
                                  );
                                }}
                                locale={es}
                              />
                            </PopoverContent>
                          </Popover>
                          <Input
                            {...field}
                            type='date'
                            value={isoValue}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!val) {
                                field.onChange("");
                                return;
                              }
                              const p = parse(val, "yyyy-MM-dd", new Date());
                              if (isValid(p))
                                field.onChange(format(p, "dd/MM/yyyy"));
                            }}
                            className={cn(
                              "pl-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0",
                              error &&
                                "border-red-500 focus-visible:ring-red-500",
                            )}
                          />
                        </div>
                      );
                    }}
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='startTime'>Hora Inicio</Label>
                  <Input
                    id='startTime'
                    type='time'
                    className='w-full font-mono text-sm scheme-light'
                    {...register("startTime", { required: true })}
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='endTime'>Hora Fin</Label>
                  <Input
                    id='endTime'
                    type='time'
                    className='w-full font-mono text-sm scheme-light'
                    {...register("endTime", { required: true })}
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label>Duración</Label>
                  <div className='flex h-10.5 sm:h-10.5 w-full min-w-0 items-center gap-2 rounded-lg border border-border bg-background opacity-50 px-3 py-2.5 text-sm text-muted-foreground shadow-sm transition-colors cursor-not-allowed'>
                    <Clock className='size-4 shrink-0' />
                    <span className='truncate'>{durationDisplay}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className='space-y-1.5'>
                <Label htmlFor='eventType'>Tipo de Evento</Label>
                <Input
                  id='eventType'
                  placeholder='Ej: Cumpleaños infantil, Boda, etc.'
                  {...register("eventType", { required: true })}
                />
              </div>

              <div className='space-y-1.5 pt-1'>
                <Label>Color de la Tarjeta</Label>
                <Controller
                  name='color'
                  control={control}
                  render={({ field }) => (
                    <div className='flex flex-wrap gap-2'>
                      {EVENT_PALETTE.map((colorDef) => (
                        <button
                          key={colorDef.id}
                          type='button'
                          onClick={() => field.onChange(colorDef.id)}
                          className={cn(
                            "size-8 rounded-full border-2 transition-all duration-200",
                            colorDef.pickerBg,
                            field.value === colorDef.id
                              ? "border-foreground scale-110 shadow-sm"
                              : "border-transparent hover:scale-105 opacity-80 hover:opacity-100",
                          )}
                          aria-label={`Seleccionar color ${colorDef.id}`}
                        />
                      ))}
                    </div>
                  )}
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='location'>Ubicación</Label>
                <div className='relative'>
                  <MapPin className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    id='location'
                    placeholder='Dirección o lugar del evento'
                    className='pl-9'
                    {...register("location", { required: true })}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "staff" && (
            <motion.div
              key='staff'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className='space-y-4 pt-4 px-1 pb-1'>
              <Controller
                name='animadoras'
                control={control}
                render={({ field }) => (
                  <StaffTagInput
                    id='animadoras'
                    label='Animadora(s)'
                    value={field.value}
                    onChange={field.onChange}
                    placeholder='Nombre de animadora'
                  />
                )}
              />

              <Controller
                name='bailarinas'
                control={control}
                render={({ field }) => (
                  <StaffTagInput
                    id='bailarinas'
                    label='Bailarinas / Staff Lúdico'
                    value={field.value}
                    onChange={field.onChange}
                    placeholder='Nombre de bailarina o staff'
                  />
                )}
              />

              <Controller
                name='dj'
                control={control}
                render={({ field }) => (
                  <StaffTagInput
                    id='dj'
                    label='DJ'
                    value={field.value}
                    onChange={field.onChange}
                    placeholder='Nombre del DJ'
                  />
                )}
              />

              <Controller
                name='staffAdicional'
                control={control}
                render={({ field }) => (
                  <StaffTagInput
                    id='staffAdicional'
                    label='Staff'
                    value={field.value}
                    onChange={field.onChange}
                    placeholder='Staff'
                  />
                )}
              />

              <Controller
                name='munecos'
                control={control}
                render={({ field }) => (
                  <StaffTagInput
                    id='munecos'
                    label='Muñecos'
                    value={field.value}
                    onChange={field.onChange}
                    placeholder='Nombre del muñeco o personaje'
                  />
                )}
              />
            </motion.div>
          )}

          {activeTab === "finanzas" && (
            <motion.div
              key='finanzas'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className='space-y-4 pt-4 px-1 pb-1'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <Controller
                  name='totalEvento'
                  control={control}
                  render={({ field }) => (
                    <CurrencyInput
                      id='totalEvento'
                      label='Total Evento'
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />

                <Controller
                  name='movilidad'
                  control={control}
                  render={({ field }) => (
                    <CurrencyInput
                      id='movilidad'
                      label='Movilidad'
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />

                <Controller
                  name='adelanto'
                  control={control}
                  render={({ field }) => (
                    <CurrencyInput
                      id='adelanto'
                      label='Adelanto'
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />

                <Controller
                  name='saldo'
                  control={control}
                  render={({ field }) => (
                    <CurrencyInput
                      id='saldo'
                      label='Saldo'
                      value={field.value}
                      onChange={field.onChange}
                      readOnly
                      className={cn(
                        "opacity-80 pointer-events-none",
                        parseCurrency(field.value) > 0 &&
                          "[&_input]:text-red-600 [&_input]:font-medium",
                      )}
                    />
                  )}
                />

                <Controller
                  name='pagoPersonal'
                  control={control}
                  render={({ field }) => (
                    <CurrencyInput
                      id='pagoPersonal'
                      label='Pago Personal'
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />

                <Controller
                  name='ganancia'
                  control={control}
                  render={({ field }) => (
                    <CurrencyInput
                      id='ganancia'
                      label='Ganancia'
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <Separator />

              <div className='space-y-1.5'>
                <Label htmlFor='observacionTexto'>Observación</Label>
                <textarea
                  id='observacionTexto'
                  {...register("observacion")}
                  placeholder='Factura, Recibo, u observaciones adicionales...'
                  rows={3}
                  className='w-full min-h-20 rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-(--color-juse-blue) focus-visible:ring-2 focus-visible:ring-(--color-juse-blue)/20'
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}

export default EventForm;
