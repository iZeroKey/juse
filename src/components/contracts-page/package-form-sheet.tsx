import { usePackages } from '@/hooks/use-packages';

import type { JusePackage, PackageFormValues } from '@/types/package';
import { Plus, Trash2, Star, X, Save } from 'lucide-react';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
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

import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { sileo } from 'sileo';

interface PackageFormSheetProps {
  open: boolean;
  onClose: () => void;
  initialData?: JusePackage;
}

export function PackageFormSheet({ open, onClose, initialData }: PackageFormSheetProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { addPackage, updatePackage } = usePackages();
  
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<PackageFormValues>({
    defaultValues: {
      nroPaquete: '',
      especificaciones: [{ value: '' }],
      precio: '',
      movilidad: '',
      tipoEvento: '',
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'especificaciones',
  });

  const specs = useWatch({ control, name: 'especificaciones' });
  const hasEmptySpec = specs?.some(s => !s.value?.trim());

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          nroPaquete: initialData.nroPaquete,
          especificaciones: Array.isArray(initialData.especificaciones) 
            ? initialData.especificaciones.map(e => typeof e === 'object' ? e : { value: String(e) }) 
            : [{ value: String(initialData.especificaciones || '') }],
          precio: initialData.precio.toString(),
          movilidad: initialData.movilidad,
          tipoEvento: initialData.tipoEvento,
        });
      } else {
        reset({
          nroPaquete: '',
          especificaciones: [{ value: '' }],
          precio: '',
          movilidad: 'MAS MOVILIDAD',
          tipoEvento: '',
        });
      }
    }
  }, [open, initialData, reset]);

  const onSubmit = (data: PackageFormValues) => {
    const pkgData = {
      nroPaquete: data.nroPaquete,
      especificaciones: data.especificaciones.filter(e => e.value?.trim()),
      precio: parseFloat(data.precio) || 0,
      movilidad: data.movilidad,
      tipoEvento: data.tipoEvento,
    };

    if (initialData) {
      updatePackage(initialData.id, pkgData);
      sileo.success({ title: 'Paquete actualizado', description: `Los cambios del paquete "${data.nombre}" se han guardado` });
    } else {
      addPackage(pkgData);
      sileo.success({ title: 'Paquete creado', description: `El paquete "${data.nombre}" ha sido registrado exitosamente` });
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
            {initialData ? 'Editar Paquete' : 'Nuevo Paquete'}
          </DrawerTitle>
          <DrawerDescription>
            {initialData
              ? 'Modifica los datos del paquete.'
              : 'Completa la información para crear un nuevo paquete.'}
          </DrawerDescription>
        </DrawerHeader>

        <DrawerPanel>
          <form id="package-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Nro Paquete</label>
              <Input
                {...register('nroPaquete', { required: 'Requerido' })}
                placeholder="Ej. I-PAQ001"
              />
              {errors.nroPaquete && <span className="text-xs text-red-500">{errors.nroPaquete.message}</span>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Tipo de Evento</label>
              <Input
                {...register('tipoEvento', { required: 'Requerido' })}
                placeholder="Ej. INFANTIL, BABY SHOWER..."
              />
              {errors.tipoEvento && <span className="text-xs text-red-500">{errors.tipoEvento.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Especificaciones</label>
              <div className="flex flex-col">
                <AnimatePresence initial={false}>
                  {fields.map((field, index) => (
                      <motion.div 
                        key={field.id} 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden px-1 -mx-1 pt-1 -mt-1"
                      >
                      <div className="relative w-full pb-2 group flex items-center">
                        <Input
                          {...register(`especificaciones.${index}.value` as const, { required: 'Requerido' })}
                          placeholder="Ej. ANIMADOR, DJ, MICROFONOS..."
                          className={cn(
                            "pr-[5rem]",
                            specs?.[index]?.isSpecial && "bg-amber-50 border-amber-300 text-amber-900 placeholder:text-amber-300 focus-visible:border-amber-400 focus-visible:ring-amber-400/20"
                          )}
                        />
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 -mt-1 flex items-center gap-1">
                          <label 
                            className={`p-1.5 rounded-md cursor-pointer transition-colors ${specs?.[index]?.isSpecial ? 'text-amber-500 hover:bg-amber-100' : 'text-slate-300 hover:text-amber-400 hover:bg-slate-50'}`}
                            title="Marcar como nota especial"
                          >
                            <input 
                              type="checkbox" 
                              {...register(`especificaciones.${index}.isSpecial` as const)}
                              className="sr-only"
                            />
                            <Star className="size-4" fill={specs?.[index]?.isSpecial ? 'currentColor' : 'none'} />
                          </label>
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (!hasEmptySpec) append({ value: '' });
                    }}
                    disabled={hasEmptySpec}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-4 border-2 border-dashed rounded-lg transition-colors text-sm font-medium
                      ${hasEmptySpec 
                        ? 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed' 
                        : 'border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:bg-slate-50 cursor-pointer'
                      }`}
                  >
                    <Plus className="size-4" />
                    Agregar Especificación
                  </button>
                </div>
              </div>
              {errors.especificaciones && <span className="text-xs text-red-500">Revisa las especificaciones</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Precio (S/)</label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('precio', { required: 'Requerido' })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Movilidad</label>
                <Input
                  {...register('movilidad')}
                  placeholder="Ej. MAS MOVILIDAD"
                />
              </div>
            </div>
            </form>
        </DrawerPanel>

        <DrawerFooter variant="bare" className="shrink-0 flex gap-3 flex-row pt-4 px-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="size-4" />
            Cancelar
          </button>
          <button
            type="submit"
            form="package-form"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-juse-blue)] hover:brightness-110 rounded-lg transition-all shadow-sm"
          >
            <Save className="size-4" />
            Guardar Paquete
          </button>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  );
}
