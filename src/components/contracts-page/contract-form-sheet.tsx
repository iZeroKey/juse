import { useContracts } from '@/hooks/use-contracts';
import { generateContractNumber } from '@/context/contracts-context';
import { usePackages } from '@/hooks/use-packages';
import type { ContractFormValues, JuseContract } from '@/types/contract';
import { EVENT_TYPES } from '@/types/event';
import { format, parseISO, parse, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect, useRef } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { User, Calendar as CalendarIcon, Baby, CircleDollarSign, X, Save } from 'lucide-react';
import { sileo } from 'sileo';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@/components/ui/combobox";
import {
  Drawer,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';

interface ContractFormSheetProps {
  open: boolean;
  onClose: () => void;
  initialData?: JuseContract;
}

export function ContractFormSheet({ open, onClose, initialData }: ContractFormSheetProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { contracts, addContract, updateContract } = useContracts();
  const { packages } = usePackages();
  
  const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm<ContractFormValues>({
    defaultValues: {
      contratoNumber: '',
      fechaEmision: format(new Date(), 'dd/MM/yyyy'),
      clienteNombre: '',
      clienteDni: '',
      clienteDireccion: '',
      clienteCelular: '',
      tipoEvento: EVENT_TYPES[0],
      fechaEvento: format(new Date(), 'dd/MM/yyyy'),
      horaEvento: '16:00',
      paqueteId: '',
      paqueteDetalle: '',
      movilidad: '',
      precio: '',
      aCuenta: '',
      formaPago: 'YAPE',
      nombresPapitos: '',
      nombreBebe: '',
      nombreCumpleanero: '',
      informacionAdicional: '',
    }
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          contratoNumber: initialData.contratoNumber,
          fechaEmision: initialData.fechaEmision,
          clienteNombre: initialData.clienteNombre,
          clienteDni: initialData.clienteDni,
          clienteDireccion: initialData.clienteDireccion,
          clienteCelular: initialData.clienteCelular,
          tipoEvento: initialData.tipoEvento,
          fechaEvento: initialData.fechaEvento ? format(parseISO(initialData.fechaEvento), 'dd/MM/yyyy') : '',
          horaEvento: initialData.horaEvento,
          paqueteId: initialData.paqueteId || '',
          paqueteDetalle: initialData.paqueteDetalle,
          movilidad: initialData.movilidad,
          precio: initialData.precio.toString(),
          aCuenta: initialData.aCuenta.toString(),
          formaPago: initialData.formaPago,
          nombresPapitos: initialData.nombresPapitos,
          nombreBebe: initialData.nombreBebe,
          nombreCumpleanero: initialData.nombreCumpleanero,
          informacionAdicional: initialData.informacionAdicional || '',
        });
      } else {
        reset({
          contratoNumber: generateContractNumber(contracts, new Date().getFullYear()),
          fechaEmision: format(new Date(), 'dd/MM/yyyy'),
          clienteNombre: '',
          clienteDni: '',
          clienteDireccion: '',
          clienteCelular: '',
          tipoEvento: '',
          fechaEvento: format(new Date(), 'dd/MM/yyyy'),
          horaEvento: '16:00',
          paqueteId: '',
          paqueteDetalle: '',
          movilidad: '',
          precio: '',
          aCuenta: '',
          formaPago: 'YAPE',
          nombresPapitos: '',
          nombreBebe: '',
          nombreCumpleanero: '',
          informacionAdicional: '',
        });
      }
    }
  }, [open, initialData, reset, contracts]);

  // Handle auto-fill from package selection
  const selectedPackageId = useWatch({ control, name: 'paqueteId' });
  const paqueteDetalleValue = useWatch({ control, name: 'paqueteDetalle' });

  const prevPackageId = useRef<string | null>(null);

  useEffect(() => {
    if (open) {
      prevPackageId.current = initialData ? (initialData.paqueteId || '') : '';
    }
  }, [open, initialData]);

  useEffect(() => {
    // Solo autocompletar si hay un paquete seleccionado y es diferente al anterior (cambio real del usuario)
    if (selectedPackageId && selectedPackageId !== prevPackageId.current) {
      prevPackageId.current = selectedPackageId;
      
      const pkg = packages.find(p => p.id === selectedPackageId);
      if (pkg) {
        setValue('paqueteDetalle', Array.isArray(pkg.especificaciones) 
          ? pkg.especificaciones.reduce((acc: string, curr: any, idx: number, arr: any[]) => {
              if (idx === 0) return typeof curr === 'string' ? curr : curr.value;
              const isSpecial = typeof curr === 'string' ? false : curr.isSpecial;
              const prevWasSpecial = typeof arr[idx - 1] === 'string' ? false : arr[idx - 1].isSpecial;
              const separator = (isSpecial || prevWasSpecial) ? ' --- ' : ' / ';
              return acc + separator + (typeof curr === 'string' ? curr : curr.value);
            }, '')
          : pkg.especificaciones, { shouldValidate: true });
        setValue('precio', pkg.precio.toString(), { shouldValidate: true });
        setValue('movilidad', pkg.movilidad || '', { shouldValidate: true });
        setValue('tipoEvento', pkg.tipoEvento, { shouldValidate: true });
      }
    }
  }, [selectedPackageId, packages, setValue]);

  const onSubmit = (data: ContractFormValues) => {
    // Validate uniqueness of contratoNumber
    const isDuplicate = contracts.some(c => c.contratoNumber === data.contratoNumber && c.id !== initialData?.id);
    if (isDuplicate) {
      alert(`El número de contrato ${data.contratoNumber} ya existe.`);
      return;
    }

    const precioNum = Number(parseFloat(data.precio || '0').toFixed(2));
    const aCuentaNum = Number(parseFloat(data.aCuenta || '0').toFixed(2));
    const saldoNum = Number((precioNum - aCuentaNum).toFixed(2));

    const parsedFechaEvento = parse(data.fechaEvento, 'dd/MM/yyyy', new Date());
    const isoFechaEvento = isValid(parsedFechaEvento) ? format(parsedFechaEvento, 'yyyy-MM-dd') : data.fechaEvento;

    const contractData = {
      contratoNumber: data.contratoNumber,
      fechaEmision: data.fechaEmision,
      clienteNombre: data.clienteNombre,
      clienteDni: data.clienteDni,
      clienteDireccion: data.clienteDireccion,
      clienteCelular: data.clienteCelular,
      tipoEvento: data.tipoEvento,
      fechaEvento: isoFechaEvento,
      horaEvento: data.horaEvento,
      paqueteId: data.paqueteId,
      paqueteDetalle: data.paqueteDetalle,
      movilidad: data.movilidad,
      precio: precioNum,
      aCuenta: aCuentaNum,
      saldo: saldoNum,
      formaPago: data.formaPago,
      nombresPapitos: data.nombresPapitos,
      nombreBebe: data.nombreBebe,
      nombreCumpleanero: data.nombreCumpleanero,
      informacionAdicional: data.informacionAdicional,
    };

    if (initialData) {
      updateContract(initialData.id, contractData);
      sileo.success({ title: 'Contrato actualizado', description: `Los cambios del contrato ${data.contratoNumber} se han guardado correctamente` });
    } else {
      addContract(contractData);
      sileo.success({ title: 'Contrato creado', description: `El contrato ${data.contratoNumber} ha sido registrado exitosamente` });
    }
    onClose();
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}
      position={isDesktop ? 'right' : 'bottom'}
    >
      <DrawerPopup variant="inset" showBar className="h-[85vh] sm:h-auto flex flex-col">
        <DrawerHeader className="pb-2 shrink-0">
          <DrawerTitle className="font-display text-xl">
            {initialData ? `Editar Contrato N° ${initialData.contratoNumber}` : 'Nuevo Contrato'}
          </DrawerTitle>
          <DrawerDescription>
            Completa los datos del contrato y del evento.
          </DrawerDescription>
        </DrawerHeader>

        <DrawerPanel>
          <form id="contract-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* ── SECCIÓN 0: DETALLES DEL CONTRATO ── */}
            <section className="space-y-5">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <CalendarIcon className="w-5 h-5 text-[var(--color-juse-blue)]" />
                <h3 className="font-semibold text-foreground">Detalles del Contrato</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">N° de Contrato <span className="text-red-500">*</span></label>
                  <Input
                    {...register('contratoNumber', { required: 'Requerido' })}
                    className={cn(errors.contratoNumber && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {errors.contratoNumber && <span className="text-[11px] text-red-500 font-medium block">{errors.contratoNumber.message}</span>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Fecha de Contrato <span className="text-red-500">*</span></label>
                  <Controller
                    name="fechaEmision"
                    control={control}
                    rules={{ required: 'Requerido' }}
                    render={({ field }) => {
                      // Attempt to parse the dd/MM/yyyy string for the calendar
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
                                className="absolute left-0 top-0 h-full px-3 flex items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none z-10 cursor-pointer"
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
                            placeholder="Ej. 13/02/2025"
                            className={cn("pl-10", errors.fechaEmision && "border-red-500 focus-visible:ring-red-500")}
                          />
                        </div>
                      );
                    }}
                  />
                  {errors.fechaEmision && <span className="text-[11px] text-red-500 font-medium block">{errors.fechaEmision.message}</span>}
                </div>
              </div>
            </section>

            {/* ── SECCIÓN 1: DATOS DEL CLIENTE ── */}
            <section className="space-y-5">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <User className="w-5 h-5 text-[var(--color-juse-blue)]" />
                <h3 className="font-semibold text-foreground">Datos del Cliente</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Nombres y Apellidos <span className="text-red-500">*</span></label>
                  <Input
                    {...register('clienteNombre', { required: 'Requerido' })}
                    className={cn(errors.clienteNombre && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {errors.clienteNombre && <span className="text-[11px] text-red-500 font-medium block">{errors.clienteNombre.message}</span>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">DNI</label>
                  <Input
                    {...register('clienteDni')}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Celular</label>
                  <Input
                    {...register('clienteCelular')}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Dirección</label>
                  <Input
                    {...register('clienteDireccion')}
                  />
                </div>
              </div>
            </section>

            {/* ── SECCIÓN 2: DATOS DEL EVENTO Y PAQUETE ── */}
            <section className="space-y-5">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <CalendarIcon className="w-5 h-5 text-[var(--color-juse-blue)]" />
                <h3 className="font-semibold text-foreground">Datos del Evento y Paquete</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Tipo de Evento <span className="text-red-500">*</span></label>
                  <Input
                    {...register('tipoEvento', { required: 'Requerido' })}
                    placeholder="Ej. INFANTIL"
                    className={cn(errors.tipoEvento && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {errors.tipoEvento && <span className="text-[11px] text-red-500 font-medium block">{errors.tipoEvento.message}</span>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Fecha del Evento <span className="text-red-500">*</span></label>
                  <Controller
                    name="fechaEvento"
                    control={control}
                    rules={{ required: 'Requerido' }}
                    render={({ field }) => {
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
                                className="absolute left-0 top-0 h-full px-3 flex items-center justify-center text-slate-400 hover:text-slate-600 focus-visible:outline-none z-10 cursor-pointer"
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
                            className={cn("pl-10", errors.fechaEvento && "border-red-500 focus-visible:ring-red-500")}
                          />
                        </div>
                      );
                    }}
                  />
                  {errors.fechaEvento && <span className="text-[11px] text-red-500 font-medium block">{errors.fechaEvento.message}</span>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Hora <span className="text-red-500">*</span></label>
                  <Input
                    type="time"
                    {...register('horaEvento', { required: 'Requerido' })}
                    className={cn(errors.horaEvento && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {errors.horaEvento && <span className="text-[11px] text-red-500 font-medium block">{errors.horaEvento.message}</span>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Seleccionar Paquete <span className="text-red-500">*</span></label>
                <Controller
                  name="paqueteId"
                  control={control}
                  rules={{ required: 'Requerido' }}
                  render={({ field }) => {
                    const packageOptions = packages.map(pkg => ({
                      value: pkg.id,
                      label: `${pkg.nroPaquete} - S/ ${pkg.precio}`,
                      original: pkg
                    }));
                    const selectedItem = packageOptions.find(p => p.value === field.value) || null;

                    return (
                      <Combobox
                        items={packageOptions}
                        value={selectedItem}
                        onValueChange={(val) => {
                          field.onChange(val?.value || '');
                        }}
                      >
                        <ComboboxInput 
                          placeholder="Buscar paquete..." 
                          showClear 
                          className={cn("w-full bg-transparent border-transparent focus-visible:ring-0 focus-visible:border-transparent h-[40px]", errors.paqueteId && "border-red-500 focus-visible:ring-red-500")}
                        />
                        <ComboboxPopup className="z-[100]">
                          <ComboboxEmpty>No se encontraron paquetes.</ComboboxEmpty>
                          <ComboboxList>
                            {(item) => (
                              <ComboboxItem key={item.value} value={item}>
                                {item.label}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxPopup>
                      </Combobox>
                    );
                  }}
                />
                {errors.paqueteId && <span className="text-[11px] text-red-500 font-medium block">{errors.paqueteId.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Detalle del Paquete / Especificaciones</label>
                <div className="w-full min-h-[42px] rounded-lg border border-border bg-muted px-3 py-2 text-sm shadow-sm text-muted-foreground cursor-not-allowed whitespace-pre-wrap break-words">
                  {paqueteDetalleValue || <span className="opacity-50">Seleccione un paquete para ver los detalles...</span>}
                </div>
                <input type="hidden" {...register('paqueteDetalle')} />
              </div>
            </section>

            {/* ── SECCIÓN 3: NOMBRES (OPCIONAL) ── */}
            <section className="space-y-5">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <Baby className="w-5 h-5 text-[var(--color-juse-blue)]" />
                <h3 className="font-semibold text-foreground">Nombres de Festejados (Opcional)</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Nombre del Cumpleañero/a</label>
                  <Input
                    {...register('nombreCumpleanero')}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Nombre de Papitos</label>
                  <Input
                    {...register('nombresPapitos')}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Nombre del Bebé</label>
                  <Input
                    {...register('nombreBebe')}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Información Adicional</label>
                  <Input
                    {...register('informacionAdicional')}
                    placeholder="Detalles extra, notas, etc."
                  />
                </div>
              </div>
            </section>

            {/* ── SECCIÓN 4: FINANZAS ── */}
            <section className="space-y-5">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <CircleDollarSign className="w-5 h-5 text-[var(--color-juse-blue)]" />
                <h3 className="font-semibold text-foreground">Finanzas</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Precio Total <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">S/</span>
                    <Input
                      type="number"
                      step="0.01"
                      {...register('precio', { required: 'Requerido' })}
                      className={cn("pl-8", errors.precio && "border-red-500 focus-visible:ring-red-500")}
                    />
                  </div>
                  {errors.precio && <span className="text-[11px] text-red-500 font-medium block">{errors.precio.message}</span>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">A Cuenta</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">S/</span>
                    <Input
                      type="number"
                      step="0.01"
                      {...register('aCuenta')}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Forma de Pago</label>
                  <Input
                    {...register('formaPago')}
                    placeholder="Ej. YAPE, BCP, Efectivo"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Movilidad</label>
                  <Input
                    {...register('movilidad')}
                  />
                </div>
              </div>
            </section>

            </form>
        </DrawerPanel>

        <DrawerFooter variant="bare" className="shrink-0 flex gap-3 flex-row pt-4 px-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors cursor-pointer"
          >
            <X className="size-4" />
            Cancelar
          </button>
          <button
            type="submit"
            form="contract-form"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-juse-blue)] hover:brightness-110 rounded-lg transition-all shadow-sm cursor-pointer"
          >
            <Save className="size-4" />
            Guardar Contrato
          </button>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  );
}
