import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { usePackages } from '@/hooks/use-packages';
import { ContextMenu, ContextMenuTrigger, ContextMenuPopup, ContextMenuItem, ContextMenuSeparator, ContextMenuGroup, ContextMenuGroupLabel } from "@/components/ui/context-menu";
import type { JusePackage } from '@/types/package';
import { PackageFormSheet } from './package-form-sheet';
import { sileo } from 'sileo';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export function PackagesTable() {
  const { packages, deletePackage } = usePackages();
  const [formOpen, setFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<JusePackage | undefined>(undefined);
  const [packageToDelete, setPackageToDelete] = useState<JusePackage | null>(null);

  const confirmDelete = () => {
    if (packageToDelete) {
      deletePackage(packageToDelete.id);
      sileo.success({ title: 'Paquete eliminado', description: `El paquete "${packageToDelete.nombre}" se ha eliminado exitosamente` });
      setPackageToDelete(null);
    }
  };

  const handleEdit = (pkg: JusePackage) => {
    setEditingPackage(pkg);
    setFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingPackage(undefined);
    setFormOpen(true);
  };

  return (
    <>
    <ContextMenu>
      <ContextMenuTrigger className="flex flex-col gap-4 h-full relative" style={{ display: 'flex' }}>
        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">Paquetes</h2>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-[var(--color-juse-blue)] text-white px-4 py-2 rounded-lg hover:brightness-110 transition-all shadow-sm text-sm font-medium cursor-pointer"
          >
            <Plus className="size-4" />
            Nuevo Paquete
          </button>
        </div>

        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 text-xs uppercase font-semibold sticky top-0 border-b border-slate-200 z-10">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Nro Paquete</th>
                <th className="px-4 py-3 min-w-[300px]">Especificaciones</th>
                <th className="px-4 py-3 whitespace-nowrap text-right">Precio (S/)</th>
                <th className="px-4 py-3 whitespace-nowrap">Movilidad</th>
                <th className="px-4 py-3 whitespace-nowrap">Tipo Evento</th>
                <th className="px-4 py-3 whitespace-nowrap text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {packages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No hay paquetes registrados. Crea uno nuevo para comenzar.
                  </td>
                </tr>
              ) : (
                packages.map((pkg) => (
                  <ContextMenu key={pkg.id}>
                    <ContextMenuTrigger render={<tr className="hover:bg-slate-50/50 transition-colors" />}>
                      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{pkg.nroPaquete}</td>
                      <td className="px-4 py-3 text-xs leading-relaxed">
                        {Array.isArray(pkg.especificaciones) 
                          ? pkg.especificaciones.reduce((acc: string, curr: any, idx: number, arr: any[]) => {
                              if (idx === 0) return typeof curr === 'string' ? curr : curr.value;
                              const isSpecial = typeof curr === 'string' ? false : curr.isSpecial;
                              const prevWasSpecial = typeof arr[idx - 1] === 'string' ? false : arr[idx - 1].isSpecial;
                              const separator = (isSpecial || prevWasSpecial) ? ' --- ' : ' / ';
                              return acc + separator + (typeof curr === 'string' ? curr : curr.value);
                            }, '')
                          : pkg.especificaciones}
                      </td>
                      <td className="px-4 py-3 text-right font-medium whitespace-nowrap">{pkg.precio.toFixed(2)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs">{pkg.movilidad}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800">
                          {pkg.tipoEvento}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(pkg)}
                            className="p-1.5 text-slate-400 hover:text-[var(--color-juse-blue)] hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button
                            onClick={() => setPackageToDelete(pkg)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </ContextMenuTrigger>
                    <ContextMenuPopup>
                      <ContextMenuGroup>
                        <ContextMenuGroupLabel>Paquete</ContextMenuGroupLabel>
                        <ContextMenuItem onClick={() => handleEdit(pkg)} className="cursor-pointer">
                          <Edit2 className="mr-2 size-4" /> Editar
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem onClick={() => setPackageToDelete(pkg)} className="text-red-600 cursor-pointer">
                          <Trash2 className="mr-2 size-4" /> Eliminar
                        </ContextMenuItem>
                      </ContextMenuGroup>
                    </ContextMenuPopup>
                  </ContextMenu>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </ContextMenuTrigger>
      <ContextMenuPopup>
        <ContextMenuGroup>
          <ContextMenuGroupLabel>Acciones</ContextMenuGroupLabel>
          <ContextMenuItem onClick={handleAddNew} className="cursor-pointer">
            <Plus className="mr-2 size-4" /> Nuevo Paquete
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuPopup>
    </ContextMenu>

      <PackageFormSheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialData={editingPackage}
      />

      <Dialog open={!!packageToDelete} onOpenChange={(open) => !open && setPackageToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar paquete</DialogTitle>
            <DialogDescription>
                ¿Estás seguro de que deseas eliminar el paquete "{packageToDelete?.nombre}"? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-0 mt-2">
            <button
              type="button"
              onClick={() => setPackageToDelete(null)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-juse-red)] hover:brightness-110 rounded-lg transition-all shadow-sm cursor-pointer"
            >
              <Trash2 className="size-4" />
              Eliminar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
