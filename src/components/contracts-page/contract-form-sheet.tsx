import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { generateContractNumber } from "@/context/contracts-context";
import { useContracts } from "@/hooks/use-contracts";
import { usePackages } from "@/hooks/use-packages";
import { cn } from "@/lib/utils";
import type { ContractFormValues, JuseContract } from "@/types/contract";
import { EVENT_TYPES } from "@/types/event";
import { format, isValid, parse } from "date-fns";
import { es } from "date-fns/locale";
import {
  Baby,
  Calendar as CalendarIcon,
  CircleDollarSign,
  Save,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { sileo } from "sileo";

import {
  Drawer,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";

interface ContractFormSheetProps {
  open: boolean;
  onClose: () => void;
  initialData?: JuseContract;
}

export function ContractFormSheet({
  open,
  onClose,
  initialData,
}: ContractFormSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { contracts, addContract, updateContract } = useContracts();
  const { packages } = usePackages();

  const [packagePopoverOpen, setPackagePopoverOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<ContractFormValues>({
    defaultValues: {
      contratoNumber: "",
      fechaEmision: format(new Date(), "yyyy-MM-dd"),
      clienteNombre: "",
      clienteDni: "",
      clienteDireccion: "",
      clienteCelular: "",
      tipoEvento: EVENT_TYPES[0],
      fechaEvento: format(new Date(), "yyyy-MM-dd"),
      horaEvento: "16:00",
      paqueteId: "",
      paqueteNombre: "",
      paqueteDetalle: "",
      movilidad: "",
      precio: "",
      aCuenta: "",
      formaPago: "YAPE",
      nombresPapitos: "",
      nombreBebe: "",
      nombreCumpleanero: "",
      informacionAdicional: "",
      pagoPersonal: "",
      tipoComprobante: "",
    },
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
          fechaEvento: initialData.fechaEvento,
          horaEvento: initialData.horaEvento,
          paqueteId: initialData?.paqueteId || "",
          paqueteNombre: initialData?.paqueteNombre || "",
          paqueteDetalle: initialData?.paqueteDetalle || "",
          movilidad: initialData?.movilidad || "",
          precio: initialData.precio.toString(),
          aCuenta: initialData.aCuenta.toString(),
          formaPago: initialData.formaPago,
          nombresPapitos: initialData.nombresPapitos,
          nombreBebe: initialData.nombreBebe,
          nombreCumpleanero: initialData.nombreCumpleanero,
          informacionAdicional: initialData.informacionAdicional || "",
          pagoPersonal: initialData.pagoPersonal?.toString() || "",
          tipoComprobante: initialData.tipoComprobante || "",
        });
      } else {
        reset({
          contratoNumber: generateContractNumber(
            contracts,
            new Date().getFullYear(),
          ),
          fechaEmision: format(new Date(), "yyyy-MM-dd"),
          clienteNombre: "",
          clienteDni: "",
          clienteDireccion: "",
          clienteCelular: "",
          tipoEvento: "",
          fechaEvento: format(new Date(), "yyyy-MM-dd"),
          horaEvento: "16:00",
          paqueteNombre: "",
          paqueteDetalle: "",
          movilidad: "",
          precio: "",
          aCuenta: "",
          formaPago: "YAPE",
          nombresPapitos: "",
          nombreBebe: "",
          nombreCumpleanero: "",
          informacionAdicional: "",
          pagoPersonal: "",
          tipoComprobante: "",
        });
      }
    }
  }, [open, initialData, reset, contracts]);

  const onSubmit = (data: ContractFormValues) => {
    const isDuplicate = contracts.some(
      (c) =>
        c.contratoNumber === data.contratoNumber && c.id !== initialData?.id,
    );
    if (isDuplicate) {
      alert(`El número de contrato ${data.contratoNumber} ya existe.`);
      return;
    }

    const precioNum = Number(parseFloat(data.precio || "0").toFixed(2));
    const aCuentaNum = Number(parseFloat(data.aCuenta || "0").toFixed(2));
    const saldoNum = Number((precioNum - aCuentaNum).toFixed(2));

    const contractData = {
      contratoNumber: data.contratoNumber,
      fechaEmision: data.fechaEmision,
      clienteNombre: data.clienteNombre,
      clienteDni: data.clienteDni,
      clienteDireccion: data.clienteDireccion,
      clienteCelular: data.clienteCelular,
      tipoEvento: data.tipoEvento,
      fechaEvento: data.fechaEvento,
      horaEvento: data.horaEvento,
      paqueteNombre: data.paqueteNombre,
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
      pagoPersonal: Number(parseFloat(data.pagoPersonal || "0").toFixed(2)),
      tipoComprobante: data.tipoComprobante || "",
    };

    if (initialData) {
      updateContract(initialData.id, contractData);
      sileo.success({
        title: "Contrato actualizado",
        description: `Los cambios del contrato ${data.contratoNumber} se han guardado correctamente`,
      });
    } else {
      addContract(contractData);
      sileo.success({
        title: "Contrato creado",
        description: `El contrato ${data.contratoNumber} ha sido registrado exitosamente`,
      });
    }
    onClose();
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      position={isDesktop ? "right" : "bottom"}>
      <DrawerPopup
        variant='inset'
        showBar
        className='h-[85vh] sm:h-auto flex flex-col'>
        <DrawerHeader className='pb-2 shrink-0'>
          <DrawerTitle className='font-display text-xl'>
            {initialData
              ? `Editar Contrato N° ${initialData.contratoNumber}`
              : "Nuevo Contrato"}
          </DrawerTitle>
          <DrawerDescription>
            Completa los datos del contrato y del evento.
          </DrawerDescription>
        </DrawerHeader>

        <DrawerPanel>
          <form
            id='contract-form'
            onSubmit={handleSubmit(onSubmit)}
            className='space-y-6'>
            <section className='space-y-5'>
              <div className='flex items-center gap-2 border-b border-border pb-2'>
                <CalendarIcon className='w-5 h-5 text-(--color-juse-blue)' />
                <h3 className='font-semibold text-foreground'>
                  Detalles del Contrato
                </h3>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                <div className='space-y-1.5'>
                  <label className='text-sm font-medium text-foreground'>
                    N° de Contrato <span className='text-red-500'>*</span>
                  </label>
                  <Input
                    {...register("contratoNumber", { required: "Requerido" })}
                    className={cn(
                      errors.contratoNumber &&
                        "border-red-500 focus-visible:ring-red-500",
                    )}
                  />
                  {errors.contratoNumber && (
                    <span className='text-[11px] text-red-500 font-medium block'>
                      {errors.contratoNumber.message}
                    </span>
                  )}
                </div>
                <div className='space-y-1.5'>
                  <label className='text-sm font-medium text-foreground'>
                    Fecha de Contrato <span className='text-red-500'>*</span>
                  </label>
                  <Controller
                    name='fechaEmision'
                    control={control}
                    rules={{ required: "Requerido" }}
                    render={({ field }) => {
                      let dateObj = undefined;
                      if (field.value) {
                        const parsed = parse(
                          field.value,
                          "yyyy-MM-dd",
                          new Date(),
                        );
                        if (isValid(parsed)) {
                          dateObj = parsed;
                        }
                      }

                      return (
                        <div className='relative flex items-center'>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                type='button'
                                className='absolute left-0 top-0 h-full px-3 flex items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none z-10 cursor-pointer'>
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
                                    date ? format(date, "yyyy-MM-dd") : "",
                                  );
                                }}
                                locale={es}
                              />
                            </PopoverContent>
                          </Popover>
                          <Input
                            {...field}
                            type='date'
                            value={field.value}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                            }}
                            className={cn(
                              "pl-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0",
                              errors.fechaEmision &&
                                "border-red-500 focus-visible:ring-red-500",
                            )}
                          />
                        </div>
                      );
                    }}
                  />
                  {errors.fechaEmision && (
                    <span className='text-[11px] text-red-500 font-medium block'>
                      {errors.fechaEmision.message}
                    </span>
                  )}
                </div>
              </div>
            </section>

            <section className='space-y-5'>
              <div className='flex items-center gap-2 border-b border-border pb-2'>
                <User className='w-5 h-5 text-(--color-juse-blue)' />
                <h3 className='font-semibold text-foreground'>
                  Datos del Cliente
                </h3>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                <div className='space-y-1.5 sm:col-span-2'>
                  <label className='text-sm font-medium text-foreground'>
                    Nombres y Apellidos <span className='text-red-500'>*</span>
                  </label>
                  <Input
                    {...register("clienteNombre", { required: "Requerido" })}
                    className={cn(
                      errors.clienteNombre &&
                        "border-red-500 focus-visible:ring-red-500",
                    )}
                  />
                  {errors.clienteNombre && (
                    <span className='text-[11px] text-red-500 font-medium block'>
                      {errors.clienteNombre.message}
                    </span>
                  )}
                </div>
                <div className='space-y-1.5'>
                  <label className='text-sm font-medium text-foreground'>
                    DNI
                  </label>
                  <Input {...register("clienteDni")} />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-sm font-medium text-foreground'>
                    Celular
                  </label>
                  <Input {...register("clienteCelular")} />
                </div>
                <div className='space-y-1.5 sm:col-span-2'>
                  <label className='text-sm font-medium text-foreground'>
                    Dirección
                  </label>
                  <Input {...register("clienteDireccion")} />
                </div>
              </div>
            </section>

            <section className='space-y-5'>
              <div className='flex items-center gap-2 border-b border-border pb-2'>
                <CalendarIcon className='w-5 h-5 text-(--color-juse-blue)' />
                <h3 className='font-semibold text-foreground'>
                  Datos del Evento y Paquete
                </h3>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                <div className='space-y-1.5 sm:col-span-2'>
                  <label className='text-sm font-medium text-foreground'>
                    Tipo de Evento <span className='text-red-500'>*</span>
                  </label>
                  <Input
                    {...register("tipoEvento", { required: "Requerido" })}
                    placeholder='Ej. INFANTIL'
                    className={cn(
                      errors.tipoEvento &&
                        "border-red-500 focus-visible:ring-red-500",
                    )}
                  />
                  {errors.tipoEvento && (
                    <span className='text-[11px] text-red-500 font-medium block'>
                      {errors.tipoEvento.message}
                    </span>
                  )}
                </div>
                <div className='space-y-1.5'>
                  <label className='text-sm font-medium text-foreground'>
                    Fecha del Evento <span className='text-red-500'>*</span>
                  </label>
                  <Controller
                    name='fechaEvento'
                    control={control}
                    rules={{ required: "Requerido" }}
                    render={({ field }) => {
                      let dateObj = undefined;
                      if (field.value) {
                        const parsed = parse(
                          field.value,
                          "yyyy-MM-dd",
                          new Date(),
                        );
                        if (isValid(parsed)) {
                          dateObj = parsed;
                        }
                      }

                      return (
                        <div className='relative flex items-center'>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                type='button'
                                className='absolute left-0 top-0 h-full px-3 flex items-center justify-center text-slate-400 hover:text-slate-600 focus-visible:outline-none z-10 cursor-pointer'>
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
                                    date ? format(date, "yyyy-MM-dd") : "",
                                  );
                                }}
                                locale={es}
                              />
                            </PopoverContent>
                          </Popover>
                          <Input
                            {...field}
                            type='date'
                            value={field.value}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                            }}
                            className={cn(
                              "pl-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0",
                              errors.fechaEvento &&
                                "border-red-500 focus-visible:ring-red-500",
                            )}
                          />
                        </div>
                      );
                    }}
                  />
                  {errors.fechaEvento && (
                    <span className='text-[11px] text-red-500 font-medium block'>
                      {errors.fechaEvento.message}
                    </span>
                  )}
                </div>
                <div className='space-y-1.5'>
                  <label className='text-sm font-medium text-foreground'>
                    Hora <span className='text-red-500'>*</span>
                  </label>
                  <Input
                    type='time'
                    {...register("horaEvento", { required: "Requerido" })}
                    className={cn(
                      errors.horaEvento &&
                        "border-red-500 focus-visible:ring-red-500",
                    )}
                  />
                  {errors.horaEvento && (
                    <span className='text-[11px] text-red-500 font-medium block'>
                      {errors.horaEvento.message}
                    </span>
                  )}
                </div>
              </div>

              <div className='space-y-1.5'>
                <div className='flex items-center justify-between'>
                  <label className='text-sm font-medium text-foreground'>
                    Nombre del Paquete <span className='text-red-500'>*</span>
                  </label>
                  <Popover
                    open={packagePopoverOpen}
                    onOpenChange={setPackagePopoverOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type='button'
                        className='h-7 px-2.5 text-xs font-medium border bg-secondary/50 rounded-md cursor-pointer hover:bg-secondary w-auto transition-colors'>
                        Cargar Plantilla
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className='w-48 p-1 shadow-md rounded-lg'
                      align='end'>
                      {packages.length === 0 ? (
                        <div className='p-2 text-xs text-muted-foreground text-center'>
                          No hay paquetes
                        </div>
                      ) : (
                        <div className='max-h-50 overflow-y-auto'>
                          {packages.map((pkg) => (
                            <button
                              key={pkg.id}
                              type='button'
                              onClick={() => {
                                setValue("paqueteNombre", pkg.nroPaquete, {
                                  shouldValidate: true,
                                });
                                setValue(
                                  "paqueteDetalle",
                                  pkg.especificaciones || "",
                                  { shouldValidate: true },
                                );
                                setValue("precio", pkg.precio.toString(), {
                                  shouldValidate: true,
                                });
                                if (pkg.movilidad)
                                  setValue("movilidad", pkg.movilidad, {
                                    shouldValidate: true,
                                  });
                                if (pkg.tipoEvento)
                                  setValue("tipoEvento", pkg.tipoEvento, {
                                    shouldValidate: true,
                                  });
                                setPackagePopoverOpen(false);
                              }}
                              className='w-full text-left px-2 py-1.5 text-xs rounded-sm hover:bg-muted transition-colors truncate'>
                              <span className='font-medium'>
                                {pkg.nroPaquete}
                              </span>{" "}
                              <span className='text-muted-foreground'>
                                - S/ {pkg.precio}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
                <Input
                  {...register("paqueteNombre", { required: "Requerido" })}
                  placeholder='Ej. PAQUETE BÁSICO'
                  className={cn(
                    errors.paqueteNombre &&
                      "border-red-500 focus-visible:ring-red-500",
                  )}
                />
                {errors.paqueteNombre && (
                  <span className='text-[11px] text-red-500 font-medium block'>
                    {errors.paqueteNombre.message}
                  </span>
                )}
              </div>

              <div className='space-y-1.5'>
                <label className='text-sm font-medium text-foreground'>
                  Detalle del Paquete / Especificaciones{" "}
                  <span className='text-red-500'>*</span>
                </label>
                <textarea
                  {...register("paqueteDetalle", { required: "Requerido" })}
                  placeholder='Ingresa las especificaciones del paquete...'
                  className={cn(
                    "flex min-h-30 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    errors.paqueteDetalle &&
                      "border-red-500 focus-visible:ring-red-500",
                  )}
                />
                {errors.paqueteDetalle && (
                  <span className='text-[11px] text-red-500 font-medium block'>
                    {errors.paqueteDetalle.message}
                  </span>
                )}
              </div>
            </section>

            <section className='space-y-5'>
              <div className='flex items-center gap-2 border-b border-border pb-2'>
                <Baby className='w-5 h-5 text-(--color-juse-blue)' />
                <h3 className='font-semibold text-foreground'>
                  Nombres de Festejados (Opcional)
                </h3>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                <div className='space-y-1.5 sm:col-span-2'>
                  <label className='text-sm font-medium text-foreground'>
                    Nombre del Cumpleañero/a
                  </label>
                  <Input {...register("nombreCumpleanero")} />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-sm font-medium text-foreground'>
                    Nombre de Papitos
                  </label>
                  <Input {...register("nombresPapitos")} />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-sm font-medium text-foreground'>
                    Nombre del Bebé
                  </label>
                  <Input {...register("nombreBebe")} />
                </div>
                <div className='space-y-1.5 sm:col-span-2'>
                  <label className='text-sm font-medium text-foreground'>
                    Información Adicional
                  </label>
                  <Input
                    {...register("informacionAdicional")}
                    placeholder='Detalles extra, notas, etc.'
                  />
                </div>
              </div>
            </section>

            <section className='space-y-5'>
              <div className='flex items-center gap-2 border-b border-border pb-2'>
                <CircleDollarSign className='w-5 h-5 text-(--color-juse-blue)' />
                <h3 className='font-semibold text-foreground'>Finanzas</h3>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                <div className='space-y-1.5'>
                  <label className='text-sm font-medium text-foreground'>
                    Precio Total <span className='text-red-500'>*</span>
                  </label>
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground'>
                      S/
                    </span>
                    <Input
                      type='number'
                      step='0.01'
                      {...register("precio", { required: "Requerido" })}
                      className={cn(
                        "pl-8",
                        errors.precio &&
                          "border-red-500 focus-visible:ring-red-500",
                      )}
                    />
                  </div>
                  {errors.precio && (
                    <span className='text-[11px] text-red-500 font-medium block'>
                      {errors.precio.message}
                    </span>
                  )}
                </div>
                <div className='space-y-1.5'>
                  <label className='text-sm font-medium text-foreground'>
                    Adelanto
                  </label>
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground'>
                      S/
                    </span>
                    <Input
                      type='number'
                      step='0.01'
                      {...register("aCuenta")}
                      className='pl-8'
                    />
                  </div>
                  {errors.aCuenta && (
                    <span className='text-[11px] text-red-500 font-medium block'>
                      {errors.aCuenta.message}
                    </span>
                  )}
                </div>
                <div className='space-y-1.5'>
                  <label className='text-sm font-medium text-foreground'>
                    Forma de Pago
                  </label>
                  <Input
                    {...register("formaPago")}
                    placeholder='Ej. YAPE, BCP, Efectivo'
                  />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-sm font-medium text-foreground'>
                    Tipo de Comprobante
                  </label>
                  <Input
                    {...register("tipoComprobante")}
                    placeholder='Ej. Boleta, Factura...'
                  />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-sm font-medium text-foreground'>
                    Movilidad
                  </label>
                  <Input {...register("movilidad")} />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-sm font-medium text-foreground'>
                    Pago de Personal
                  </label>
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground'>
                      S/
                    </span>
                    <Input
                      type='number'
                      step='0.01'
                      {...register("pagoPersonal")}
                      className='pl-8'
                    />
                  </div>
                </div>
              </div>
            </section>
          </form>
        </DrawerPanel>

        <DrawerFooter
          variant='bare'
          className='shrink-0 flex gap-3 flex-row pt-4 px-4 sm:px-6'>
          <button
            type='button'
            onClick={onClose}
            className='flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors cursor-pointer'>
            <X className='size-4' />
            Cancelar
          </button>
          <button
            type='submit'
            form='contract-form'
            className='flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-(--color-juse-blue) hover:brightness-110 rounded-lg transition-all shadow-sm cursor-pointer'>
            <Save className='size-4' />
            Guardar Contrato
          </button>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  );
}
