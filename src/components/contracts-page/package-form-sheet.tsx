import { usePackages } from "@/hooks/use-packages";

import {
  Drawer,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import type { JusePackage, PackageFormValues } from "@/types/package";
import { Save, X } from "lucide-react";
import { useEffect } from "react";

import { useForm } from "react-hook-form";
import { sileo } from "sileo";

interface PackageFormSheetProps {
  open: boolean;
  onClose: () => void;
  initialData?: JusePackage;
}

export function PackageFormSheet({
  open,
  onClose,
  initialData,
}: PackageFormSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { addPackage, updatePackage } = usePackages();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PackageFormValues>({
    defaultValues: {
      nroPaquete: "",
      especificaciones: "",
      precio: "",
      movilidad: "",
      tipoEvento: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          nroPaquete: initialData.nroPaquete,
          especificaciones: String(initialData.especificaciones || ""),
          precio: initialData.precio.toString(),
          movilidad: initialData.movilidad,
          tipoEvento: initialData.tipoEvento,
        });
      } else {
        reset({
          nroPaquete: "",
          especificaciones: "",
          precio: "",
          movilidad: "MAS MOVILIDAD",
          tipoEvento: "",
        });
      }
    }
  }, [open, initialData, reset]);

  const onSubmit = (data: PackageFormValues) => {
    const pkgData = {
      nombre: "",
      nroPaquete: data.nroPaquete,
      especificaciones: data.especificaciones.trim(),
      precio: parseFloat(data.precio) || 0,
      movilidad: data.movilidad,
      tipoEvento: data.tipoEvento,
    };

    if (initialData) {
      updatePackage(initialData.id, pkgData);
      sileo.success({
        title: "Paquete actualizado",
        description: `Los cambios del paquete "${data.nroPaquete}" se han guardado`,
      });
    } else {
      addPackage(pkgData);
      sileo.success({
        title: "Paquete creado",
        description: `El paquete "${data.nroPaquete}" ha sido registrado exitosamente`,
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
            {initialData ? "Editar Paquete" : "Nuevo Paquete"}
          </DrawerTitle>
          <DrawerDescription>
            {initialData
              ? "Modifica los datos del paquete."
              : "Completa la información para crear un nuevo paquete."}
          </DrawerDescription>
        </DrawerHeader>

        <DrawerPanel>
          <form
            id='package-form'
            onSubmit={handleSubmit(onSubmit)}
            className='space-y-6'>
            <div className='space-y-1'>
              <label className='text-xs font-semibold text-muted-foreground'>
                Nro Paquete
              </label>
              <Input
                {...register("nroPaquete", { required: "Requerido" })}
                placeholder='Ej. I-PAQ001'
              />
              {errors.nroPaquete && (
                <span className='text-xs text-red-500'>
                  {errors.nroPaquete.message}
                </span>
              )}
            </div>

            <div className='space-y-1'>
              <label className='text-xs font-semibold text-muted-foreground'>
                Tipo de Evento
              </label>
              <Input
                {...register("tipoEvento", { required: "Requerido" })}
                placeholder='Ej. INFANTIL, BABY SHOWER...'
              />
              {errors.tipoEvento && (
                <span className='text-xs text-red-500'>
                  {errors.tipoEvento.message}
                </span>
              )}
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-muted-foreground'>
                Especificaciones
              </label>
              <textarea
                {...register("especificaciones", { required: "Requerido" })}
                placeholder='Ej. ANIMADOR / DJ / MICROFONOS'
                className={cn(
                  "flex min-h-30 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                  errors.especificaciones &&
                    "border-red-500 focus-visible:ring-red-500",
                )}
              />
              {errors.especificaciones && (
                <span className='text-[11px] text-red-500 font-medium block'>
                  {errors.especificaciones.message}
                </span>
              )}
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <label className='text-xs font-semibold text-muted-foreground'>
                  Precio (S/)
                </label>
                <Input
                  type='number'
                  step='0.01'
                  {...register("precio", { required: "Requerido" })}
                  placeholder='0.00'
                />
              </div>
              <div className='space-y-1'>
                <label className='text-xs font-semibold text-muted-foreground'>
                  Movilidad
                </label>
                <Input
                  {...register("movilidad")}
                  placeholder='Ej. MAS MOVILIDAD'
                />
              </div>
            </div>
          </form>
        </DrawerPanel>

        <DrawerFooter
          variant='bare'
          className='shrink-0 flex gap-3 flex-row pt-4 px-4'>
          <button
            type='button'
            onClick={onClose}
            className='flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors'>
            <X className='size-4' />
            Cancelar
          </button>
          <button
            type='submit'
            form='package-form'
            className='flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-(--color-juse-blue) hover:brightness-110 rounded-lg transition-all shadow-sm'>
            <Save className='size-4' />
            Guardar Paquete
          </button>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  );
}
